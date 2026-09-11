# Compressor Predictive Maintenance Implementation Playbook
**Product**: Motor-driven reciprocating compressor (API 618 compliant)
**Plant Unit**: Compressor Station C-101 → C-104
**Document ID**: COMP-PRED-003
**Version**: 1.0

## 1. Executive Summary

This playbook captures how condition-monitoring data, vibration analysis, and temperature trending drive the predictive maintenance program for the four reciprocating compressors. The failure modes described drive the preferred maintenance actions and expected remaining-life calculations.

## 2. Compressor Fleet Overview

| Compressor | Application | Cylinders | RPM | Discharge (psig) | Notes |
|------------|-------------|-----------|-----|-----------------|-------|
| C-101 | Stage 1 gas boost | 4 | 720 | 450 | Valve monitoring emphasis |
| C-102 | Stage 2 gas boost | 6 | 580 | 900 | Piston rod breakage risk |
| C-103 | Refrigerant (NH3) | 4 | 800 | 250 | Bearing wear emphasis |
| C-104 | Booster / recycle | 2 | 600 | 300 | Startup transient risk |

## 3. Failure Modes & Effects

### 3.1 Documented Failure Modes

| Failure Mode | Subclass | Detection Method | Severity |
|--------------|----------|------------------|----------|
| Valve deterioration | Seat/plate leakage | Acoustic & pressure pulse | HIGH |
| Piston rod fatigue | Rod thread crack | Non-invasive proximity probe | CRITICAL |
| Bearing wear | Journal/thrust | Temperature & vibration | MEDIUM |
| Packing seal degradation | Ring wear | Blow-by gas leak | MEDIUM |
| Short-stroke overload | Rod load excess | Motor current & pressure | HIGH |

### 3.2 Criticality Ranking

**Highest risk**: Piston rod fatigue (potential ASME failure)
- Typical rod freq: 6 x running speed
- Alarm threshold: 5 mils
- Trip threshold: 8 mils
- Time-to-failure window: 50-100 hours once crack initiated

## 4. Sensor & Data Collection

### 4.1 Sensor Placement

| Sensor | Location | Parameter | Normal | Alarm |
|--------|----------|-----------|--------|-------|
| Accelerometer | Cylinder valve | Vibration | < 0.3 in/s | > 0.6 in/s |
| Proximity probe | Rod extension | Rod runout | < 2 mils | > 5 mils |
| RTD | Bearing housing | Temp | < 75°C | > 85°C |
| Pressure transducer | Discharge | Discharge pressure | Within band | ±15% |
| Load cell | Frame | Rod load | Per calc | > 115% rated |

### 4.2 Data Acquisition Rate

- **Continuous monitoring** (every 5 min): vibration, temperature, oil pressure
- **Trending** (hourly): performance ratios, valve temperatures
- **Baseline** (weekly): full vibration signature capture

## 5. Machine-Learning Driven Predictions

### 5.1 Vibration Signature Analysis

Spectral analysis is performed on cylinder vibration signatures. Machine-learning classifiers are trained on historical fault signatures to detect:

- Valve leakage (valve-passing harmonics)
- Bearing fretting (non-integer harmonics)
- Rod-wandering (sub-synchronous content at 0.5x and 1.5x)

**Model performance targets**:
- Detection accuracy: > 85%
- False alarm rate: < 5%
- Prediction horizon: 7 days minimum

### 5.2 Remaining Useful Life (RUL) Estimation

**RUL Model Inputs**: trending of vibration velocity, temperature rise rates, and derived lubricant wear indexes.

**Decision Rules**:

| Condition | Action | Response Time |
|-----------|--------|---------------|
| RUL > 180 days | Continue monitoring | Routine |
| 90 < RUL ≤ 180 | Increase trend frequency to daily | 1 week |
| 30 < RUL ≤ 90 | Plan next available maintenance window | 2 weeks |
| RUL ≤ 30 days | Escalate to plant maintenance coordination | 1 week |
| RUL ≤ 7 days | Immediate shutdown & repair | 24 hours |

## 6. Prescriptive Maintenance Workflows

### 6.1 Valve Maintenance

**Trigger**: RUL estimate < 30 days, or continuous accumulator of leak events.

**Workflow**:
1. Isolate compressor and equalize pressure
2. Remove valve covers per LOTO
3. Inspect plates, seats, springs
4. Lap seats if within tolerance
5. Replace plates > 5 mils wear
6. Torque covers per vendor spec
7. Re-pressurize and leak test

**Expected benefits**:
- Reduce valve-related unplanned trips (currently 3/year) to ≤ 1/year
- Save ~1.5% production per unscheduled trip avoided

### 6.2 Piston Rod Replacement

**Trigger**: Proximity probe trend crossed 5 mils.

**Workflow**:
1. Verify signal with strobe observation
2. Schedule replacement within 48 hours
3. Order OEM rod assembly (stocked)
4. Perform rod end clearance check
5. Replace packing rings with new set
6. Monitor for 72 hours post replacement

## 7. Predictive Dashboard & Alerts

### 7.1 Key Performance Indicators (KPIs)

- **Fleet Availability**: ≥ 95% target
- **Mean Time Between Failures**: ≥ 4 months
- **Predictive Hit Rate**: correctly-predicted failures / total failures ≥ 70%
- **False Alarm Rate**: < 5%

### 7.2 Alerting Policy

| Priority | Channel | Time to Respond |
|----------|---------|-----------------|
| CRITICAL (RUL ≤ 7 days) | SMS + on-call rotation | 30 min |
| HIGH (RUL ≤ 30 days) | Email notification | 4 hours |
| MEDIUM (RUL ≤ 90 days) | Dashboard amber badge | 24 hours |
| LOW | Dashboard passive status | n/a |

### 7.3 Weekly Review Sample

The maintenance planner reviews rolling 30-day trends for:

1. Compressor C-102 rod runout (verify < 5 mils)
2. C-101 valve pass analysis (verify < 3 leak events/week)
3. C-103 bearing temperature (verify < 80°C)
4. Discharge delta-pressure performance ratios

## 8. Roles & Ownership

| Role | Responsibility |
|------|----------------|
| Predictive Maintenance Engineer | Model tuning, RUL interpretation |
| Reliability Technician | Sensor calibration, rule compliance |
| Shift Supervisor | Alert response, work order initiation |
| Maintenance Planner | Scheduling within response windows |
| OEM SME | Signature confirmation, special acceptance |

## 9. Benefit Tracking

- **Baseline run (6 months)**: validate models against actual failure events
- **Measurement**: count unplanned trips, cost of repair, downtime hours
- **Reporting**: quarterly reliability review with leadership