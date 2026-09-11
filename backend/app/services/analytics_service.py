from typing import Dict, List, Any
from datetime import datetime, timedelta


class AnalyticsService:
    """Compute dashboard metrics from the database and knowledge graph."""

    def __init__(self, db):
        self.db = db

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

        # Knowledge graph stats (from shared service)
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
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_documents_timeline(self, days: int = 30) -> List[Dict[str, Any]]:
        """Documents uploaded per day over the last N days."""
        from app.models.database import Document
        from sqlalchemy import func

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
