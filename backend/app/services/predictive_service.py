from typing import Dict, Any, Optional, List
from datetime import datetime


# Reference operating windows used for rule-based risk scoring.
# Values approximate typical industrial equipment; extend per equipment type.
EQUIPMENT_LIMITS: Dict[str, Dict[str, Dict[str, float]]] = {
    "centrifugal pump": {
        "vibration": {"limit": 0.3, "critical": 0.45},
        "temperature": {"limit": 80.0, "critical": 95.0},
        "bearing_temperature": {"limit": 75.0, "critical": 90.0},
    },
    "turbine": {
        "vibration": {"limit": 0.28, "critical": 0.45},
        "temperature": {"limit": 90.0, "critical": 105.0},
        "bearing_temperature": {"limit": 80.0, "critical": 95.0},
    },
    "motor": {
        "vibration": {"limit": 0.25, "critical": 0.4},
        "temperature": {"limit": 85.0, "critical": 100.0},
        "bearing_temperature": {"limit": 80.0, "critical": 95.0},
    },
    "compressor": {
        "vibration": {"limit": 0.3, "critical": 0.5},
        "temperature": {"limit": 90.0, "critical": 105.0},
        "bearing_temperature": {"limit": 80.0, "critical": 95.0},
    },
}


class PredictiveMaintenanceService:
    """Predict equipment failure risk from sensor readings and known limits."""

    async def predict_failure_risk(
        self,
        equipment_id: Optional[str] = None,
        equipment_type: Optional[str] = None,
        sensor_data: Optional[Dict[str, float]] = None,
        maintenance_age_days: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Return a failure-risk assessment for an equipment instance.

        sensor_data keys (mm/s vibration, deg C temperature/bearing_temperature,
        hours runtime, etc.) are scored against type-specific thresholds.
        """
        sensor_data = sensor_data or {}
        eq_type = (equipment_type or equipment_id or "").lower()
        limits = EQUIPMENT_LIMITS.get(eq_type, EQUIPMENT_LIMITS["centrifugal pump"])

        risk_factors: Dict[str, Dict[str, Any]] = {}
        scores: List[float] = []

        for metric, cfg in limits.items():
            if metric not in sensor_data:
                continue
            value = float(sensor_data[metric])
            limit = cfg["limit"]
            critical = cfg["critical"]
            ratio = value / critical if critical else 0
            if value >= critical:
                score = 1.0
            elif value >= limit:
                score = 0.6 + 0.4 * ((value - limit) / max(critical - limit, 0.001))
            else:
                score = 0.3 * (value / max(limit, 0.001))
            risk_factors[metric] = {
                "value": value,
                "threshold_normal": limit,
                "threshold_critical": critical,
                "risk_score": round(min(score, 1.0), 3),
            }
            scores.append(min(score, 1.0))

        if maintenance_age_days is not None:
            overdue_weeks = max(0.0, (float(maintenance_age_days) - 365) / 7.0)
            maint_score = min(overdue_weeks * 0.04, 0.6)
            risk_factors["maintenance_age_days"] = {
                "value": float(maintenance_age_days),
                "threshold_normal": 365.0,
                "threshold_critical": 730.0,
                "risk_score": round(maint_score, 3),
            }
            scores.append(maint_score)

        overall_risk = round(max(scores) if scores else 0.15, 3)
        risk_level, action, days = self._classify(overall_risk)

        return {
            "equipment_id": equipment_id,
            "equipment_type": equipment_type or ("unknown" if not equipment_id else None),
            "assessment": {
                "risk_level": risk_level,
                "risk_score": overall_risk,
                "action": action,
                "estimated_days_to_failure": days,
            },
            "risk_factors": risk_factors,
            "assessed_at": datetime.utcnow().isoformat(),
        }

    def _classify(self, score: float):
        if score >= 0.7:
            return ("CRITICAL", "Schedule maintenance immediately", 7)
        if score >= 0.4:
            return ("HIGH", "Schedule maintenance within 30 days", 30)
        return ("NORMAL", "Continue monitoring", 120)