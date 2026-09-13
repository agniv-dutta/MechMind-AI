import glob
import json
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.models.database import Document, get_db
from app.services.diagram_analyzer import AdvancedDiagramAnalyzer

router = APIRouter(prefix="/api/diagrams", tags=["diagrams"])

_analyzer = AdvancedDiagramAnalyzer()
_DIAGRAMS_DIR = os.path.join(
    os.path.dirname(settings.PAGE_CONTENT_PATH), "diagrams"
)
_UPLOAD_DIR = settings.resolve_upload_dir()

IMAGE_EXT = {"png", "jpg", "jpeg", "bmp", "tiff", "webp"}


def _ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


@router.post("/analyze")
async def analyze_diagram(file: UploadFile = File(...)):
    """Analyze an uploaded diagram image (multipart upload)."""
    ext = (file.filename or "").split(".")[-1].lower()
    if ext not in IMAGE_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {ext}. Use {', '.join(sorted(IMAGE_EXT))}",
        )

    save_dir = _ensure_dir(os.path.join(_UPLOAD_DIR, "diagrams"))
    image_path = os.path.join(save_dir, f"{uuid.uuid4().hex}_{file.filename}")
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        analysis = await _analyzer.analyze_diagram(image_path)
    except Exception as exc:
        try:
            os.remove(image_path)
        except OSError:
            pass
        raise HTTPException(status_code=500, detail=f"Diagram analysis failed: {exc}")

    return {"success": True, "image_path": image_path, "diagram": analysis}


@router.post("/analyze-document/{document_id}")
async def analyze_stored_document(document_id: str, db: Session = Depends(get_db)):
    """Analyze a previously uploaded document's image, caching the result."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.file_type not in IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Document is not an image")

    matches = glob.glob(os.path.join(_UPLOAD_DIR, f"{document_id}_*"))
    if not matches:
        raise HTTPException(status_code=404, detail="Original image not on server")
    image_path = matches[0]

    try:
        analysis = await _analyzer.analyze_diagram(image_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Diagram analysis failed: {exc}")

    record = {
        "document_id": document_id,
        "filename": doc.filename,
        "equipment_type": doc.equipment_type,
        "category": doc.category,
        "diagram": analysis,
    }
    out_dir = _ensure_dir(_DIAGRAMS_DIR)
    record_path = os.path.join(out_dir, f"{document_id}.json")
    with open(record_path, "w", encoding="utf-8") as f:
        json.dump(record, f, ensure_ascii=False)

    return {"success": True, "document_id": document_id, "diagram": analysis}


@router.get("/analyses")
async def list_analyses():
    """List cached diagram analyses for documents."""
    results = []
    pattern = os.path.join(_DIAGRAMS_DIR, "*.json")
    for path in glob.glob(pattern):
        try:
            with open(path, "r", encoding="utf-8") as f:
                result = json.load(f)
            diag = result.get("diagram", {})
            results.append({
                "document_id": result.get("document_id"),
                "filename": result.get("filename"),
                "equipment_type": result.get("equipment_type"),
                "category": result.get("category"),
                "diagram_type": diag.get("type"),
                "component_count": len(diag.get("components", [])),
                "connection_count": len(diag.get("connections", [])),
                "symbols": diag.get("symbols", {}),
            })
        except (OSError, ValueError):
            continue

    results.sort(key=lambda r: (r.get("filename") or ""))
    return {"results": results, "count": len(results)}


@router.get("/search")
async def search_diagrams(
    component_type: str = None, diagram_type: str = None
):
    """Search cached diagram analyses by component or diagram type."""
    results = []
    for path in glob.glob(os.path.join(_DIAGRAMS_DIR, "*.json")):
        try:
            with open(path, "r", encoding="utf-8") as f:
                result = json.load(f)
        except (OSError, ValueError):
            continue

        diag = result.get("diagram", {})
        symbols = diag.get("symbols", {})
        if component_type and component_type not in symbols:
            continue
        if diagram_type and diag.get("type") != diagram_type:
            continue

        results.append({
            "document_id": result.get("document_id"),
            "filename": result.get("filename"),
            "diagram_type": diag.get("type"),
            "symbols": symbols,
            "components": diag.get("components", []),
            "connections": diag.get("connections", []),
        })

    return {"results": results, "count": len(results)}