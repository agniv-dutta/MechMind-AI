from fastapi import APIRouter, HTTPException, Body, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.services.predictive_service import PredictiveMaintenanceService, EQUIPMENT_LIMITS, seed_synthetic_readings
from app.models.database import get_db, SensorReading, FailurePrediction

router = APIRouter()
service = PredictiveMaintenanceService()


class SensorSample(BaseModel):
    timestamp: Optional[datetime] = None
    vibration: Optional[float] = None
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    current: Optional[float] = None
    noise_level: Optional[float] = None
    operating_hours: Optional[float] = None
    maintenance_age_days: Optional[float] = None
    remaining_days: Optional[float] = None


class SensorIngestRequest(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    equipment_name: Optional[str] = None
    readings: List[SensorSample] = Field(..., min_length=1)


class PredictFailureRequest(BaseModel):
    equipment_id: str = Field(..., min_length=1)


def _reading_to_dict(r: SensorReading) -> Dict[str, Any]:
    return {
        "id": r.id,
        "equipment_id": r.equipment_id,
        "equipment_name": r.equipment_name,
        "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        "vibration": r.vibration,
        "temperature": r.temperature,
        "pressure": r.pressure,
        "current": r.current,
        "noise_level": r.noise_level,
        "operating_hours": r.operating_hours,
        "maintenance_age_days": r.maintenance_age_days,
        "remaining_days": r.remaining_days,
        "is_synthetic": r.is_synthetic,
    }


@router.post("/predict")
async def predict_failure_risk(payload: Dict[str, Any] = Body(...)):
    """Predict equipment failure risk from sensor readings (rule-based)."""
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
    return {"success": True, "data": EQUIPMENT_LIMITS}


@router.get("/equipment-status")
async def equipment_status(db=Depends(get_db)):
    """Run an ML prediction for every tracked equipment instance."""
    try:
        tracked = db.query(
            SensorReading.equipment_id,
            SensorReading.equipment_name,
        ).distinct().all()

        statuses = []
        for eq_id, eq_name in tracked:
            readings = db.query(SensorReading).filter(
                SensorReading.equipment_id == eq_id
            ).order_by(SensorReading.timestamp.asc()).limit(100).all()

            result = await service.predict_equipment_failure(
                eq_id,
                [_reading_to_dict(r) for r in readings],
            )
            result["equipment_name"] = eq_name
            result["data_points"] = len(readings)
            statuses.append(result)

        return {
            "success": True,
            "data": sorted(
                statuses,
                key=lambda s: _risk_rank(s.get("risk_level", "LOW")),
                reverse=True,
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Equipment status failed: {str(e)}")


@router.post("/predict-failure")
async def predict_failure(payload: PredictFailureRequest, db=Depends(get_db)):
    """Predict RUL for an equipment using its stored sensor history and save the result."""
    try:
        readings = db.query(SensorReading).filter(
            SensorReading.equipment_id == payload.equipment_id
        ).order_by(SensorReading.timestamp.asc()).limit(100).all()

        if not readings:
            raise HTTPException(
                status_code=404,
                detail=f"No sensor history found for equipment '{payload.equipment_id}'",
            )

        result = await service.predict_equipment_failure(
            payload.equipment_id,
            [_reading_to_dict(r) for r in readings],
        )
        result["equipment_id"] = payload.equipment_id
        result["equipment_name"] = readings[-1].equipment_name

        if result.get("status") == "prediction_available":
            prediction = FailurePrediction(
                equipment_id=payload.equipment_id,
                equipment_name=readings[-1].equipment_name,
                predicted_days=result.get("predicted_failure_days"),
                confidence=result.get("confidence"),
                risk_level=result.get("risk_level"),
                anomalies_detected=result.get("anomalies_detected", 0),
                recommended_action=result.get("recommended_action"),
                model=result.get("model", "random_forest"),
                is_synthetic=readings[-1].is_synthetic or False,
            )
            db.add(prediction)
            db.commit()

        return {"success": True, "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/predictions")
async def list_predictions(
    equipment_id: Optional[str] = None,
    limit: int = Query(20, ge=1, le=200),
    db=Depends(get_db),
):
    """Return saved prediction history, optionally filtered by equipment."""
    query = db.query(FailurePrediction)
    if equipment_id:
        query = query.filter(FailurePrediction.equipment_id == equipment_id)
    rows = query.order_by(FailurePrediction.created_at.desc()).limit(limit).all()
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "equipment_id": p.equipment_id,
                "equipment_name": p.equipment_name,
                "predicted_days": p.predicted_days,
                "confidence": p.confidence,
                "risk_level": p.risk_level,
                "anomalies_detected": p.anomalies_detected,
                "recommended_action": p.recommended_action,
                "model": p.model,
                "is_synthetic": p.is_synthetic,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in rows
        ],
    }


@router.post("/sensor-readings")
async def ingest_sensor_readings(payload: SensorIngestRequest, db=Depends(get_db)):
    """Bulk-ingest sensor readings for an equipment instance."""
    try:
        added = 0
        for sample in payload.readings:
            db.add(SensorReading(
                equipment_id=payload.equipment_id,
                equipment_name=payload.equipment_name,
                timestamp=sample.timestamp or datetime.utcnow(),
                vibration=sample.vibration,
                temperature=sample.temperature,
                pressure=sample.pressure,
                current=sample.current,
                noise_level=sample.noise_level,
                operating_hours=sample.operating_hours,
                maintenance_age_days=sample.maintenance_age_days,
                remaining_days=sample.remaining_days,
                is_synthetic=False,
            ))
            added += 1
        db.commit()
        return {"success": True, "data": {"ingested": added, "equipment_id": payload.equipment_id}}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ingest failed: {str(e)}")


@router.get("/sensors")
async def list_sensors(db=Depends(get_db)):
    """List tracked equipment with latest reading summary and sample count."""
    tracked = db.query(
        SensorReading.equipment_id,
        SensorReading.equipment_name,
    ).distinct().all()

    sensors = []
    for eq_id, eq_name in tracked:
        latest = db.query(SensorReading).filter(
            SensorReading.equipment_id == eq_id
        ).order_by(SensorReading.timestamp.desc()).first()
        count = db.query(SensorReading).filter(
            SensorReading.equipment_id == eq_id
        ).count()
        sensors.append({
            "equipment_id": eq_id,
            "equipment_name": eq_name,
            "reading_count": count,
            "latest_timestamp": latest.timestamp.isoformat() if latest and latest.timestamp else None,
            "latest": {
                "vibration": latest.vibration if latest else None,
                "temperature": latest.temperature if latest else None,
                "pressure": latest.pressure if latest else None,
                "current": latest.current if latest else None,
                "noise_level": latest.noise_level if latest else None,
            } if latest else None,
        })

    return {"success": True, "data": sensors}


@router.get("/sensors/{equipment_id}/readings")
async def get_equipment_readings(
    equipment_id: str,
    limit: int = Query(50, ge=1, le=500),
    db=Depends(get_db),
):
    """Return recent readings for a single equipment instance."""
    rows = db.query(SensorReading).filter(
        SensorReading.equipment_id == equipment_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No sensor history for '{equipment_id}'")

    return {
        "success": True,
        "data": {
            "equipment_id": equipment_id,
            "equipment_name": rows[0].equipment_name,
            "readings": [_reading_to_dict(r) for r in rows],
        },
    }


@router.post("/seed")
async def seed_synthetic_fleet(db=Depends(get_db)):
    """Seed the demo sensor fleet (idempotent)."""
    try:
        count = seed_synthetic_readings(db)
        return {"success": True, "data": {"seeded": count}}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


def _risk_rank(level: Optional[str]) -> int:
    return {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1, "NORMAL": 1}.get(
        level or "", 0
    )