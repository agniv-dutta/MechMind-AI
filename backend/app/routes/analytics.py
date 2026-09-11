from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.services.analytics_service import AnalyticsService
from app.models.database import get_db

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_metrics(request: Request, db: Session = Depends(get_db)):
    """Get dashboard metrics."""
    kg_service = getattr(request.app.state, "knowledge_graph", None)
    service = AnalyticsService(db)
    metrics = await service.get_dashboard_metrics(kg_service=kg_service)
    return {"success": True, "data": metrics}


@router.get("/timeline")
async def get_timeline(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get documents upload timeline."""
    service = AnalyticsService(db)
    timeline = await service.get_documents_timeline(days)
    return {"success": True, "data": timeline}


@router.get("/equipment-types")
async def get_equipment_breakdown(db: Session = Depends(get_db)):
    """Get equipment type distribution."""
    service = AnalyticsService(db)
    data = await service.get_equipment_types()
    return {"success": True, "data": data}