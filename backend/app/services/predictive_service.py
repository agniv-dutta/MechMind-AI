from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import uuid

try:
    import numpy as np
except ImportError:
    np = None


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

# ML feature bounds used by the regression wrapper when a sensor is unavailable.
FEATURE_BOUNDS: Dict[str, Dict[str, float]] = {
    "vibration": {"base": 0.15, "critical": 0.45},
    "temperature": {"base": 65.0, "critical": 100.0},
    "pressure": {"base": 60.0, "critical": 1500.0},
    "current": {"base": 70.0, "critical": 150.0},
    "noise_level": {"base": 75.0, "critical": 95.0},
}

# Synthetic equipment fleet used to seed a learnable sensor history.
SYNTHETIC_EQUIPMENT: Dict[str, Dict[str, Any]] = {
    "CENTRIFUGAL-PUMP-101": {
        "name": "P-101 Centrifugal Pump",
        "equipment_type": "centrifugal pump",
        "degradation": 0.002,       # progress/day toward critical
        "initial_fraction": 0.35,   # current position on healthy->critical curve
        "maintenance_age_days": 320.0,
        "base_hours": 4800.0,
        "limits": {
            "vibration": {"base": 0.16, "critical": 0.45},
            "temperature": {"base": 60.0, "critical": 95.0},
            "pressure": {"base": 52.0, "critical": 90.0},
            "current": {"base": 66.0, "critical": 150.0},
            "noise_level": {"base": 71.0, "critical": 95.0},
        },
    },
    "MOTOR-207": {
        "name": "M-207 Drive Motor",
        "equipment_type": "motor",
        "degradation": 0.001,
        "initial_fraction": 0.10,
        "maintenance_age_days": 150.0,
        "base_hours": 9200.0,
        "limits": {
            "vibration": {"base": 0.11, "critical": 0.4},
            "temperature": {"base": 56.0, "critical": 100.0},
            "pressure": {"base": 0.0, "critical": 20.0},
            "current": {"base": 54.0, "critical": 140.0},
            "noise_level": {"base": 67.0, "critical": 90.0},
        },
    },
    "COMPRESSOR-C-102": {
        "name": "C-102 Compressor",
        "equipment_type": "compressor",
        "degradation": 0.003,
        "initial_fraction": 0.95,
        "maintenance_age_days": 480.0,
        "base_hours": 15700.0,
        "limits": {
            "vibration": {"base": 0.19, "critical": 0.5},
            "temperature": {"base": 68.0, "critical": 105.0},
            "pressure": {"base": 820.0, "critical": 1500.0},
            "current": {"base": 76.0, "critical": 160.0},
            "noise_level": {"base": 78.0, "critical": 100.0},
        },
    },
    "STEAM-TURBINE-301": {
        "name": "T-301 Steam Turbine",
        "equipment_type": "turbine",
        "degradation": 0.0025,
        "initial_fraction": 0.62,
        "maintenance_age_days": 210.0,
        "base_hours": 11300.0,
        "limits": {
            "vibration": {"base": 0.14, "critical": 0.45},
            "temperature": {"base": 64.0, "critical": 105.0},
            "pressure": {"base": 900.0, "critical": 1800.0},
            "current": {"base": 86.0, "critical": 170.0},
            "noise_level": {"base": 84.0, "critical": 105.0},
        },
    },
    "VALVE-V-112": {
        "name": "V-112 Control Valve",
        "equipment_type": "valve",
        "degradation": 0.001,
        "initial_fraction": 0.89,
        "maintenance_age_days": 120.0,
        "base_hours": 3100.0,
        "limits": {
            "vibration": {"base": 0.09, "critical": 0.35},
            "temperature": {"base": 52.0, "critical": 90.0},
            "pressure": {"base": 42.0, "critical": 85.0},
            "current": {"base": 11.0, "critical": 40.0},
            "noise_level": {"base": 59.0, "critical": 85.0},
        },
    },
    "GENERATOR-G-220": {
        "name": "G-220 Generator",
        "equipment_type": "motor",
        "degradation": 0.0008,
        "initial_fraction": 0.20,
        "maintenance_age_days": 90.0,
        "base_hours": 7600.0,
        "limits": {
            "vibration": {"base": 0.10, "critical": 0.4},
            "temperature": {"base": 58.0, "critical": 100.0},
            "pressure": {"base": 4.0, "critical": 20.0},
            "current": {"base": 68.0, "critical": 150.0},
            "noise_level": {"base": 73.0, "critical": 92.0},
        },
    },
}

SYNTHETIC_DAYS = 90


class PredictiveMaintenanceService:
    """Predict equipment failure risk using rule-based scoring and ML."""

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

    async def predict_equipment_failure(
        self,
        equipment_id: str,
        historical_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Predict remaining useful life from a sensor reading history.

        Uses a RandomForest regressor (RUL) plus a rolling-baseline anomaly
        detector when ground-truth RUL labels exist (e.g. synthetic fleet
        data). Falls back to deterministic rule-based scoring otherwise.
        """
        if not historical_data or len(historical_data) < 10:
            return {
                "status": "insufficient_data",
                "equipment_id": equipment_id,
                "data_points": len(historical_data or []),
                "message": "At least 10 sensor readings are required for an ML prediction.",
            }

        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.preprocessing import StandardScaler
        except ImportError:
            return await self._rule_based_fallback(equipment_id, historical_data)

        if np is None:
            return await self._rule_based_fallback(equipment_id, historical_data)

        features = self._extract_features(historical_data)
        if len(features) < 2:
            return {
                "status": "insufficient_data",
                "equipment_id": equipment_id,
                "data_points": len(historical_data),
                "message": "Readings contained no usable feature values.",
            }

        X = np.asarray(features, dtype=float)
        labels = [
            d.get("remaining_days")
            if d.get("remaining_days") is not None
            else d.get("remaining_days_estimate")
            for d in historical_data
        ]
        has_labels = any(l is not None for l in labels)

        if not has_labels:
            return await self._rule_based_fallback(equipment_id, historical_data)

        y = np.asarray([float(l) if l is not None else 365.0 for l in labels])
        y = np.clip(y, 0, 3650)

        scaler = StandardScaler()
        X_s = scaler.fit_transform(X)

        anomaly_count = self._detect_anomalies(features)

        train_size = max(len(X_s) - 1, 1)
        X_train, y_train = X_s[:train_size], y[:train_size]
        last_sample = X_s[-1].reshape(1, -1)

        n_est = min(100, max(20, len(X_train)))
        regressor = RandomForestRegressor(n_estimators=n_est, random_state=42)
        regressor.fit(X_train, y_train)

        tree_preds = np.asarray([t.predict(last_sample)[0] for t in regressor.estimators_])
        predicted_rul = float(np.mean(tree_preds))

        confidence = await self._compute_confidence(
            tree_preds,
            X_s,
            equipment_id,
            historical_data[-1],
            predicted_rul,
        )
        risk_level = self._classify_rul(predicted_rul)
        action = self._get_rul_action(predicted_rul)

        return {
            "status": "prediction_available",
            "equipment_id": equipment_id,
            "predicted_failure_days": max(0, int(round(predicted_rul))),
            "confidence": float(round(np.clip(confidence, 0, 1), 3)),
            "risk_level": risk_level,
            "recommended_action": action,
            "anomalies_detected": anomaly_count,
            "model": "random_forest",
            "trained_samples": len(X_train),
            "data_points": len(historical_data),
            "assessment": {
                "risk_level": risk_level,
                "risk_score": round(float(np.clip(confidence, 0, 1)), 3),
                "action": action,
                "estimated_days_to_failure": max(0, int(round(predicted_rul))),
            },
            "predicted_at": datetime.utcnow().isoformat(),
        }

    async def _rule_based_fallback(
        self,
        equipment_id: str,
        historical_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        latest = historical_data[-1]
        sensor_data = {
            k: latest.get(k)
            for k in ("vibration", "temperature", "pressure", "current",
                      "noise_level", "operating_hours", "maintenance_age_days")
            if latest.get(k) is not None
        }
        assessment = await self.predict_failure_risk(
            equipment_id=equipment_id,
            sensor_data=sensor_data,
            maintenance_age_days=latest.get("maintenance_age_days"),
        )
        a = assessment["assessment"]
        return {
            "status": "prediction_available",
            "equipment_id": equipment_id,
            "predicted_failure_days": a["estimated_days_to_failure"],
            "confidence": round(a["risk_score"], 3),
            "risk_level": a["risk_level"],
            "recommended_action": a["action"],
            "anomalies_detected": 0,
            "model": "rule_based",
            "data_points": len(historical_data),
            "assessment": a,
            "predicted_at": datetime.utcnow().isoformat(),
        }

    def _extract_features(self, data: List[Dict[str, Any]]) -> List[List[float]]:
        features: List[List[float]] = []
        for reading in data:
            maintenance_age = (
                reading.get("maintenance_age_days")
                or reading.get("last_maintenance_days_ago")
                or 0
            )
            features.append([
                float(reading.get("vibration", 0) or 0),
                float(reading.get("temperature", 0) or 0),
                float(reading.get("pressure", 0) or 0),
                float(reading.get("current", 0) or 0),
                float(reading.get("noise_level", 0) or 0),
                float(reading.get("operating_hours", 0) or 0),
                float(maintenance_age),
            ])
        return features

    def _detect_anomalies(self, features: List[List[float]]) -> int:
        """Count readings that deviate strongly from the asset's own baseline."""
        arr = np.asarray(features, dtype=float)
        if arr.shape[0] < 5:
            return 0

        baseline = np.median(arr[: max(1, len(arr) // 4)], axis=0)
        deviations = np.abs(arr - baseline)
        mad = np.median(np.abs(arr - np.median(arr, axis=0)), axis=0)
        mad = np.where(mad < 1e-6, 1.0, mad)
        z_scores = deviations / mad

        flags = np.max(z_scores, axis=1) > 4.0
        return int(np.sum(flags))

    async def _compute_confidence(
        self,
        tree_preds,
        X_s,
        equipment_id: str,
        latest_reading: Dict[str, Any],
        predicted_rul: float,
    ) -> float:
        pred_spread = float(tree_preds.std())
        scale = max(abs(float(tree_preds.mean())), 1.0)
        spread_term = 1.0 / (1.0 + pred_spread / max(scale, 0.001))
        novelty_term = 1.0 / (1.0 + float(X_s.var(axis=0).mean()))

        rule_based = await self.predict_failure_risk(
            equipment_id=equipment_id,
            sensor_data={
                k: latest_reading.get(k)
                for k in ("vibration", "temperature", "pressure", "current",
                          "noise_level", "operating_hours")
                if latest_reading.get(k) is not None
            },
            maintenance_age_days=latest_reading.get("maintenance_age_days"),
        )
        agreement = (
            1.0
            if rule_based["assessment"]["risk_level"] == self._classify_rul(predicted_rul)
            else 0.5
        )

        return float(0.4 * spread_term + 0.35 * novelty_term + 0.25 * agreement)

    def _classify_rul(self, rul: float) -> str:
        if rul < 7:
            return "CRITICAL"
        if rul < 30:
            return "HIGH"
        if rul < 90:
            return "MEDIUM"
        return "LOW"

    def _get_rul_action(self, rul: float) -> str:
        if rul < 7:
            return "Schedule maintenance immediately"
        if rul < 30:
            return "Schedule maintenance within 30 days"
        if rul < 90:
            return "Schedule maintenance within the next quarter"
        return "Continue monitoring"

    def _classify(self, score: float):
        if score >= 0.7:
            return ("CRITICAL", "Schedule maintenance immediately", 7)
        if score >= 0.4:
            return ("HIGH", "Schedule maintenance within 30 days", 30)
        return ("NORMAL", "Continue monitoring", 120)


def generate_synthetic_readings() -> List[Dict[str, Any]]:
    """Generate a learnable synthetic sensor history for the demo fleet."""
    import random
    rng = random.Random(20260913)
    readings: List[Dict[str, Any]] = []
    start = datetime.utcnow() - timedelta(days=SYNTHETIC_DAYS)

    for eq_id, profile in SYNTHETIC_EQUIPMENT.items():
        degradation = profile["degradation"]
        fraction = profile["initial_fraction"]
        limits = profile["limits"]
        operating_hours = profile["base_hours"]

        for day in range(SYNTHETIC_DAYS):
            progress = min(fraction + degradation * day, 1.6)
            row: Dict[str, Any] = {
                "id": str(uuid.uuid4()),
                "equipment_id": eq_id,
                "equipment_name": profile["name"],
                "timestamp": start + timedelta(days=day),
                "operating_hours": round(operating_hours, 1),
                "maintenance_age_days": profile["maintenance_age_days"],
                "is_synthetic": True,
            }
            for metric, cfg in limits.items():
                span = cfg["critical"] - cfg["base"]
                value = cfg["base"] + span * progress
                noise = rng.uniform(-0.03, 0.03) * max(span, 1.0)
                row[metric] = round(max(value + noise, 0.0), 3)

            rows_to_critical = (1.0 - progress) / degradation if degradation > 0 else 365.0
            row["remaining_days"] = round(max(rows_to_critical, 0.0), 1)
            operating_hours += rng.uniform(20.0, 28.0)
            readings.append(row)

    return readings


def seed_synthetic_readings(db) -> int:
    """Idempotently populate the sensor_readings table with the synthetic fleet."""
    from app.models.database import SensorReading

    existing = db.query(SensorReading.id).filter(
        SensorReading.is_synthetic.is_(True)
    ).first()
    if existing:
        return 0

    rows = generate_synthetic_readings()
    for row in rows:
        db.add(SensorReading(**row))
    db.commit()
    return len(rows)