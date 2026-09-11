from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from app.services.predictive_service import PredictiveMaintenanceService

router = APIRouter()
service = PredictiveMaintenanceService()


@router.post("/predict")
async def predict_failure_risk(payload: Dict[str, Any] = Body(...)):
    """Predict equipment failure risk from sensor readings."""
    try:
        result = await service.predict_failure_risk(
            equipment_id=payload.get("equipment_id"),
            equipment_type=payload.get("equipment_type"),
            sensor_data=payload.get("sensor_data"),
            maintenance_age_days=payload.get("maintenance_age_days"),
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/limits")
async def get_reference_limits():
    """Return the reference thresholds used for risk scoring."""
    from app.services.predictive_service import EQUIPMENT_LIMITS
    return {"success": True, "data": EQUIPMENT_LIMITS}