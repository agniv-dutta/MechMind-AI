"""Seed script: create a realistic industrial troubleshooting manual and ingest it
through the same pipeline the upload endpoint uses (extract -> chunk -> vector
store -> knowledge graph -> DB), so the app is useful end-to-end out of the box.

Usage (from the backend directory):
    python -m seed          # seed if DB is empty
    python -m seed --force  # always (re)build sample data
"""

import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.models.database import init_db, get_db, Document
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import VectorStore
from app.services.knowledge_graph_service import KnowledgeGraphService

SAMPLE_FILENAME = "B_Series_Centrifugal_Pump_Maintenance_Manual.docx"
SAMPLE_EQUIPMENT = "Centrifugal Pump"
SAMPLE_CATEGORY = "manual"
SAMPLE_VERSION = "1.2"
SAMPLE_TAGS = "B-Series,Pump,Maintenance,Seals,Bearings"

SAMPLE_PAGES = [
    (
        "B-Series Centrifugal Pump Maintenance and Troubleshooting Manual",
        "1. INTRODUCTION",
        "This manual provides maintenance and troubleshooting guidance for the B-Series "
        "centrifugal pump. The pump is driven by an electric motor and moves fluid through "
        "the hydraulic system at controlled pressure. Proper inspection of the pump, motor, "
        "and valves prevents premature bearing and seal failure. Always follow the safety "
        "procedures in section 2 before servicing the pump."
    ),
    (
        "B-Series Centrifugal Pump",
        "2. SAFETY PROCEDURES",
        "Lock out the motor drive and disconnect the electrical supply before any work begins. "
        "Release all pressure from the hydraulic system and drain the fluid from the pump "
        "housing and suction line. Wear rated personal protective equipment. Never work on a "
        "rotating shaft or impeller. Verify zero voltage with a meter at the switchgear before "
        "accessing the starter circuit."
    ),
    (
        "B-Series Centrifugal Pump",
        "3. NORMAL OPERATING CONDITIONS",
        "The pump operates with a nominal flow rate of 400 GPM and discharge pressure of 90 psi. "
        "Bearing temperature should remain below 75 degrees Celsius. Motor current should not "
        "exceed 32 amps at rated voltage. Imbalance or noise from the rotor usually indicates a "
        "worn bearing. Seal leakage of more than a few drops per minute is abnormal. Monitor "
        "vibration on the pump housing and motor feet."
    ),
    (
        "B-Series Centrifugal Pump",
        "4. STARTUP AND SHUTDOWN",
        "Open the suction valve fully and vent the pump casing before starting the motor. "
        "Start the motor and slowly open the discharge valve to avoid cavitation. Check for "
        "excessive vibration, temperature rise, and current draw during the first hour. On "
        "shutdown, close the discharge valve first, stop the motor, then close the suction "
        "valve. Never run the pump dry or with the suction valve closed."
    ),
    (
        "B-Series Centrifugal Pump",
        "5. COMMON FAILURES - LOSS OF PRESSURE",
        "If discharge pressure is low, verify the suction line is not clogged, check for air "
        "ingestion, and confirm the impeller is not worn or damaged. A torn gasket on the "
        "casing or a failed shaft seal can admit air and reduce pressure. Inspect the wear "
        "rings for excessive clearance. Re-pressurize the system slowly and watch for "
        "pressure spikes that indicate a blocked discharge valve."
    ),
    (
        "B-Series Centrifugal Pump",
        "6. COMMON FAILURES - EXCESSIVE VIBRATION",
        "High vibration is usually caused by bearing wear, shaft misalignment, rotor "
        "imbalance, or cavitation. Perform a vibration analysis at the pump housing and "
        "motor bearing. Compare readings across pumps of the same type. Replace the bearing "
        "if vibration exceeds 0.25 inches per second. Check the coupling and shaft alignment "
        "with a dial indicator after any bearing replacement."
    ),
    (
        "B-Series Centrifugal Pump",
        "7. SEAL AND BEARING MAINTENANCE",
        "Replace the mechanical seal if leakage exceeds 10 drops per minute. Flush the seal "
        "chamber with clean fluid. Grease the bearings with the specified premium grease and "
        "look for contamination in the oil. Water ingress through the housing destroys the "
        "bearing quickly. Keep spare seals, gaskets, and bearings in stock for the most common "
        "pump sizes in the plant."
    ),
    (
        "B-Series Centrifugal Pump",
        "8. TROUBLESHOOTING QUICK REFERENCE",
        "Low flow: check suction valve, strainer, and impeller. High vibration: check bearing "
        "and alignment. Seal leak: replace mechanical seal. Motor overload: reduce pump speed "
        "or check discharge pressure. Unusual noise: inspect for cavitation at the suction. "
        "Use the sensor readings from the local control panel to compare temperature, "
        "pressure, and current before and after the repair."
    ),
]


def build_sample_docx(path: str) -> None:
    """Write a multi-paragraph DOCX used as the sample manual."""
    from docx import Document as DocxDocument

    doc = DocxDocument()
    for title, section, body in SAMPLE_PAGES:
        doc.add_heading(title, level=0)
        doc.add_heading(section, level=1)
        # Multiple paragraphs so page/chunk heuristics have real content
        for para in body.split(". "):
            doc.add_paragraph(para.strip() + ".")
        doc.add_paragraph("Please refer to Section 5 of the B-Series manual for "
                          "detailed troubleshooting of pump, motor, and valve faults.")
    doc.save(path)


def seed(force: bool = False):
    init_db()
    db = next(get_db())

    existing = db.query(Document).filter(Document.filename == SAMPLE_FILENAME).first()
    if existing is not None and not force:
        print(f"Sample document already present ({existing.id}). Use --force to rebuild.")
        db.close()
        return

    if existing is not None and force:
        db.delete(existing)
        db.commit()

    upload_dir = settings.resolve_upload_dir()
    file_path = os.path.join(upload_dir, f"{uuid.uuid4()}_{SAMPLE_FILENAME}")
    build_sample_docx(file_path)

    processor = DocumentProcessor()
    processed = processor.process_document(
        file_path,
        "docx",
        metadata={
            "category": SAMPLE_CATEGORY,
            "equipment_type": SAMPLE_EQUIPMENT,
            "version": SAMPLE_VERSION,
            "tags": SAMPLE_TAGS.split(",")
        }
    )

    # Persist per-page extracted content (mirrors upload route behavior)
    from app.routes.documents import _save_page_content
    _save_page_content(processed.document_id, processed.pages, processed.filename)

    document_id = processed.document_id
    db_document = Document(
        id=document_id,
        filename=SAMPLE_FILENAME,
        file_type="docx",
        file_size=os.path.getsize(file_path),
        file_hash=processed.content_hash,
        total_pages=processed.total_pages,
        extracted_text_length=processed.extracted_text_length,
        equipment_type=SAMPLE_EQUIPMENT,
        category=SAMPLE_CATEGORY,
        version=SAMPLE_VERSION,
        tags=SAMPLE_TAGS,
        processing_status="complete",
        chunks_count=len(processed.chunks),
        embedding_model="all-MiniLM-L6-v2"
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Ingest chunks into the vector store
    vector_store = VectorStore()
    import asyncio
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(vector_store.initialize())
        chunks_data = [
            {
                "chunk_id": f"{document_id}_{chunk.metadata['chunk_number']}",
                "content": chunk.content,
                "document_id": document_id,
                "filename": SAMPLE_FILENAME,
                "page_number": chunk.metadata["page_number"],
                "section_title": chunk.metadata["section_title"],
                "chunk_number": chunk.metadata["chunk_number"],
                "file_type": "docx"
            }
            for chunk in processed.chunks
        ]
        if chunks_data:
            vector_store.add_documents(chunks_data)

        # Build knowledge graph
        kg_service = KnowledgeGraphService()
        loop.run_until_complete(kg_service.initialize())
        all_text = " ".join(p.content for p in processed.pages)
        kg_service.build_graph_from_document(document_id, all_text)
    finally:
        loop.close()

    print(f"Seeded {SAMPLE_FILENAME}: {processed.total_pages} pages, "
          f"{len(processed.chunks)} chunks, doc id={document_id}")


if __name__ == "__main__":
    force = "--force" in sys.argv
    seed(force=force)