import io
import os
import zipfile
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.responses import StreamingResponse

from app.config import settings
from app.models.database import Document, get_db
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.vector_store import VectorStore
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/quick-fix")
async def quick_fix(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Generate a field-ready troubleshooting chain for an equipment symptom"""
    equipment = (payload.get("equipment_type") or payload.get("equipment") or "").strip()
    symptom = (payload.get("symptom") or "").strip()
    if not symptom:
        raise HTTPException(status_code=422, detail="A symptom description is required")

    query = f"{equipment} {symptom}" if equipment else symptom

    try:
        vector_store = VectorStore()
        await vector_store.initialize()
        rag_service = RAGService(vector_store)

        rag_context = rag_service.retrieve_context(
            query=query,
            k=5,
            search_mode="hybrid"
        )

        context_text = rag_service.format_context_for_llm(rag_context) if rag_context.retrieved_chunks else (
            "No matching documentation found. Provide general troubleshooting guidance."
        )

        ai_service = AIService()
        chain = ai_service.generate_troubleshooting_chain(
            problem=f"Equipment: {equipment or 'Unknown'}\nSymptom: {symptom}",
            context=context_text
        )

        steps = chain.get("steps", [])
        if not isinstance(steps, list):
            steps = []
        normalized_steps = []
        for idx, s in enumerate(steps, start=1):
            if isinstance(s, dict):
                normalized_steps.append({
                    "step": int(s.get("step", idx)),
                    "action": s.get("action", ""),
                    "expected": s.get("expected", "Verify completion")
                })
            else:
                normalized_steps.append({"step": idx, "action": str(s), "expected": "Verify completion"})

        return {
            "problem": chain.get("problem", symptom),
            "root_causes": chain.get("root_causes", []),
            "steps": normalized_steps,
            "citations": chain.get("citations", []),
            "sources_used": rag_context.sources,
            "matched_documents": len(rag_context.sources)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quick fix: {str(e)}")


@router.get("/offline-pack")
async def offline_pack(db: Session = Depends(get_db)):
    """Bundle all uploaded manuals into a downloadable zip for offline field use"""
    documents = db.query(Document).all()
    upload_dir = settings.resolve_upload_dir()

    in_memory = io.BytesIO()
    with zipfile.ZipFile(in_memory, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        bundled = 0
        for doc in documents:
            for filename in os.listdir(upload_dir):
                if filename.startswith(doc.id):
                    file_path = os.path.join(upload_dir, filename)
                    if os.path.exists(file_path):
                        # Strip UUID prefix to restore original-ish name
                        safe_name = filename.split("_", 1)[-1]
                        zf.write(file_path, arcname=safe_name)
                        bundled += 1
                        break
        # Add a manifest of what's included
        manifest = "\n".join(
            f"{d.filename} | {d.file_type} | {d.total_pages} pages | {d.equipment_type or 'n/a'}"
            for d in documents
        )
        zf.writestr("MANIFEST.txt", manifest)

    in_memory.seek(0)
    headers = {"Content-Disposition": "attachment; filename=mechmind_offline_pack.zip"}
    return StreamingResponse(
        in_memory,
        media_type="application/zip",
        headers=headers
    )