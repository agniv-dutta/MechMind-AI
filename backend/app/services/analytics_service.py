from typing import Dict, List, Any
from datetime import datetime, timedelta

# Deterministic sample payloads shown when the workspace has no real activity,
# mirroring the SAMPLE_GRAPH fallback used by the knowledge graph view.
SAMPLE_DATA_THRESHOLD = 3

SAMPLE_DOCUMENTS: Dict[str, int] = {
    "total": 24,
    "this_month": 6,
    "pending": 3,
    "processing": 2,
    "completed": 18,
    "errors": 1,
}

SAMPLE_CHATS: Dict[str, int] = {"total_sessions": 18, "active": 3}

SAMPLE_PROCESSING_MINUTES: float = 2.4

SAMPLE_EQUIPMENT: List[Dict[str, Any]] = [
    {"type": "Centrifugal Pump", "count": 12},
    {"type": "Electric Motor", "count": 8},
    {"type": "Reciprocating Compressor", "count": 4},
    {"type": "Steam Turbine", "count": 3},
    {"type": "Air Compressor", "count": 2},
]


def _build_sample_timeline(days: int) -> List[Dict[str, Any]]:
    """Generate a believable 30-day upload timeline with weekdays and an upward trend."""
    today = datetime.utcnow().date()
    entries = []
    for offset in range(days - 1, -1, -1):
        day = today - timedelta(days=offset)
        weekday = day.weekday()
        if weekday >= 5:  # weekend
            base = 0
        else:
            base = 2 + (offset % 3)  # 2..4 documents on weekdays
        if (days - offset) % 9 == 0:  # periodic batch-ingestion peaks
            base += 3
        entries.append({"date": day.isoformat(), "count": base})
    return entries


class AnalyticsService:
    """Compute dashboard metrics from the database and knowledge graph."""

    def __init__(self, db):
        self.db = db

    def _is_sample_mode(self) -> bool:
        """True when the workspace has barely any activity — show sample data."""
        from app.models.database import Document, ChatSession

        total_docs = self.db.query(Document).count()
        total_sessions = self.db.query(ChatSession).count()
        return total_docs < SAMPLE_DATA_THRESHOLD and total_sessions == 0

    async def get_dashboard_metrics(self, kg_service=None) -> Dict[str, Any]:
        """Get comprehensive dashboard metrics."""
        from app.models.database import Document, ChatSession

        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)

        total_docs = self.db.query(Document).count()
        docs_this_month = self.db.query(Document).filter(
            Document.uploaded_at >= thirty_days_ago
        ).count()
        processing = self.db.query(Document).filter(Document.processing_status == 'processing').count()
        completed = self.db.query(Document).filter(Document.processing_status == 'complete').count()
        errors = self.db.query(Document).filter(Document.processing_status == 'error').count()
        pending = self.db.query(Document).filter(Document.processing_status == 'queued').count()

        total_sessions = self.db.query(ChatSession).count()
        active_sessions = self.db.query(ChatSession).filter(
            ChatSession.updated_at >= (now - timedelta(hours=1))
        ).count()

        # Knowledge graph stats always reflect the real shared service
        entities = 0
        relationships = 0
        if kg_service:
            try:
                stats = kg_service.get_graph_statistics()
                entities = stats.total_entities
                relationships = stats.total_relationships
            except Exception:
                pass

        avg_processing = self._avg_processing_time()

        # Fill sparse/demo workspace areas with sample data so the dashboard
        # never renders as an empty grid. Flagged so the UI can annotate it.
        is_sample = self._is_sample_mode()
        if is_sample:
            total_docs, docs_this_month, pending, processing, completed, errors = (
                SAMPLE_DOCUMENTS["total"],
                SAMPLE_DOCUMENTS["this_month"],
                SAMPLE_DOCUMENTS["pending"],
                SAMPLE_DOCUMENTS["processing"],
                SAMPLE_DOCUMENTS["completed"],
                SAMPLE_DOCUMENTS["errors"],
            )
            total_sessions = SAMPLE_CHATS["total_sessions"]
            active_sessions = SAMPLE_CHATS["active"]
            avg_processing = SAMPLE_PROCESSING_MINUTES

        return {
            "documents": {
                "total": total_docs,
                "this_month": docs_this_month,
                "pending": pending,
                "processing": processing,
                "completed": completed,
                "errors": errors,
            },
            "knowledge_graph": {"entities": entities, "relationships": relationships},
            "chats": {"total_sessions": total_sessions, "active": active_sessions},
            "performance": {"avg_processing_time_minutes": avg_processing},
            "is_sample": is_sample,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_documents_timeline(self, days: int = 30) -> List[Dict[str, Any]]:
        """Documents uploaded per day over the last N days."""
        from app.models.database import Document
        from sqlalchemy import func

        if self._is_sample_mode():
            return _build_sample_timeline(days)

        cutoff = datetime.utcnow() - timedelta(days=days)
        rows = (
            self.db.query(
                func.date(Document.uploaded_at).label("date"),
                func.count(Document.id).label("count"),
            )
            .filter(Document.uploaded_at >= cutoff)
            .group_by(func.date(Document.uploaded_at))
            .order_by("date")
            .all()
        )
        return [{"date": str(r.date), "count": r.count} for r in rows]

    async def get_equipment_types(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Most common equipment types across documents."""
        from app.models.database import Document
        from sqlalchemy import func

        if self._is_sample_mode():
            return list(SAMPLE_EQUIPMENT)

        rows = (
            self.db.query(Document.equipment_type, func.count(Document.id).label("count"))
            .filter(Document.equipment_type.isnot(None))
            .group_by(Document.equipment_type)
            .order_by(func.count(Document.id).desc())
            .limit(limit)
            .all()
        )
        return [{"type": r.equipment_type, "count": r.count} for r in rows]

    def _avg_processing_time(self) -> float:
        """Average processing time in minutes for completed documents."""
        from app.models.database import Document

        completed = (
            self.db.query(Document)
            .filter(
                Document.processing_status == "complete",
                Document.processed_at.isnot(None),
                Document.uploaded_at.isnot(None),
            )
            .all()
        )
        if not completed:
            return 0
        total = sum(
            (doc.processed_at - doc.uploaded_at).total_seconds() / 60
            for doc in completed
        )
        return round(total / len(completed), 2)
