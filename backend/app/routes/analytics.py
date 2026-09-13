from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.cache import cache
from app.services.analytics_service import AnalyticsService
from app.models.database import get_db

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_metrics(request: Request, db: Session = Depends(get_db)):
    """Get dashboard metrics (cached for 10s)."""
    cache_key = "analytics:dashboard"

    async def _build():
        kg_service = getattr(request.app.state, "knowledge_graph", None)
        service = AnalyticsService(db)
        metrics = await service.get_dashboard_metrics(kg_service=kg_service)
        payload = {"success": True, "data": metrics}
        await cache.set(cache_key, payload, ttl=10)
        return payload

    cached = await cache.get(cache_key)
    if cached is not None:
        return cached
    return await _build()


@router.get("/timeline")
async def get_timeline(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get documents upload timeline (cached for 30s)."""
    cache_key = f"analytics:timeline:{days}"

    async def _build():
        service = AnalyticsService(db)
        timeline = await service.get_documents_timeline(days)
        payload = {"success": True, "data": timeline}
        await cache.set(cache_key, payload, ttl=30)
        return payload

    cached = await cache.get(cache_key)
    if cached is not None:
        return cached
    return await _build()


@router.get("/equipment-types")
async def get_equipment_breakdown(db: Session = Depends(get_db)):
    """Get equipment type distribution (cached for 30s)."""
    cache_key = "analytics:equipment"

    async def _build():
        service = AnalyticsService(db)
        data = await service.get_equipment_types()
        payload = {"success": True, "data": data}
        await cache.set(cache_key, payload, ttl=30)
        return payload

    cached = await cache.get(cache_key)
    if cached is not None:
        return cached
    return await _build()