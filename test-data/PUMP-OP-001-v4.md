# Centrifugal Pump Operations & Maintenance Manual v4.0
**Revision Date**: October 2023
**Model**: FlowServe Mark III Series
**Document ID**: PUMP-OP-001-v4

## Table of Contents
1. Introduction & Safety
2. Equipment Overview
3. Operating Procedures
4. Troubleshooting Guide
5. Maintenance Schedule
6. Technical Specifications

## 1. Introduction & Safety

### 1.1 Safety Warnings
⚠️ **CRITICAL**: Never operate pump without complete discharge line. Pump cavitation can cause:
- Impeller damage
- Seal failure
- Loss of prime
- Complete system shutdown

⚠️ **ELECTRICAL**: 480V 3-phase power. All maintenance must be performed with:
- Pump completely isolated from power source
- Lockout/Tagout (LOTO) procedures applied
- Permit-to-work issued

⚠️ **THERMAL**: Bearing housings can exceed 150°C (302°F) during operation. Allow 30 minutes cool-down before inspection.

### 1.2 Equipment ID
This manual applies to all FlowServe Mark III centrifugal pumps manufactured between 2018-2023.

**Standard Configurations**:
- Single-stage centrifugal
- Bearing types: Journal/Thrust Ball Bearings
- Seal: Mechanical single seal with backup plan
- Motor coupling: Flexible disc coupling

## 2. Equipment Overview

### 2.1 Pump Components

The centrifugal pump consists of the following major assemblies:

| Component | Material | Tolerance | Critical? |
|-----------|----------|-----------|-----------|
| Impeller | Ductile Iron | ±0.5mm | YES |
| Casing | Ductile Iron | ±1mm | YES |
| Shaft | Steel 4140 | ±0.2mm | YES |
| Bearings | Ball Bearing | ±0.1mm | YES |
| Mechanical Seal | Silicon Carbide | ±0.05mm | YES |
| Coupling | Steel | ±0.5mm | NO |

### 2.2 Pump Curve Characteristics

**Performance Matrix** (at 1800 RPM, 50Hz):

| Flow Rate (GPM) | Head (ft) | Efficiency (%) | NPSH Required (ft) | Power (kW) |
|-----------------|-----------|----------------|--------------------|-----------|
| 0 | 125 | 0 | 3.5 | 18.5 |
| 100 | 120 | 42 | 3.8 | 19.2 |
| 250 | 110 | 68 | 4.2 | 21.5 |
| 500 | 95 | 82 | 5.1 | 25.8 |
| 750 | 75 | 78 | 6.5 | 28.3 |
| 1000 | 50 | 65 | 8.2 | 29.1 |

### 2.3 NPSH Analysis

**Definition**: Net Positive Suction Head (NPSH) is the absolute pressure at pump inlet minus vapor pressure of the fluid.

**NPSH Required (NPSHr)**: Minimum of 3.5 ft absolute
**NPSH Available (NPSHa)**: Must exceed NPSHr at all operating points

**Cavitation Indicators**:
1. Audible noise (crackling/grinding sound)
2. Vibration increase (>0.3 inches/second)
3. Flow rate drop without pressure increase
4. Impeller pitting visible upon inspection

**Cavitation Prevention**:
- Ensure suction pressure remains > 0 psig
- Keep inlet piping diameter ≥ 2 inches
- Minimize suction line length
- Ensure inlet strainer pressure drop < 3 psi
- Maintain operating point > minimum flow (200 GPM)

## 3. Operating Procedures

### 3.1 Startup Procedure

**Pre-startup Checks** (daily):
1. Visual inspection for leaks
2. Verify coupling guard in place
3. Check bearing temperature (ambient + 10°C)
4. Inspect mechanical seal for weeping (< 5 drops/minute acceptable)

**Startup Sequence**:
1. Prime pump by opening suction isolation valve
2. Open discharge isolation valve
3. Start motor at 50% speed (ramp start recommended)
4. Allow 2 minutes for vibration stabilization
5. Gradually increase to 100% speed over 5 minutes
6. Monitor discharge pressure (should reach design point within 5 minutes)

**Acceptance Criteria**:
- Discharge pressure = Design ±5%
- Vibration < 0.2 inches/second
- Motor current = Rated ±10%
- No unusual noise

### 3.2 Normal Operation

**Optimal Operating Range**:
- Flow: 400-800 GPM (75% to 100% of BEP)
- Discharge Pressure: 80-100 psig
- Inlet Pressure: 5-20 psig
- Bearing Temperature: 65-75°C
- Motor Current: 25-28 Amps

**Monitoring Points** (check every hour):
- Discharge pressure gauge
- Motor current ammeter
- Bearing temperature sensor
- Discharge temperature
- Pump vibration (use accelerometer)

### 3.3 Shutdown Procedure

1. Gradually reduce flow by closing discharge valve
2. Stop motor
3. Close isolation valves
4. Allow bearing cool-down (30 minutes minimum)
5. Log runtime hours
6. Record any abnormal conditions

## 4. Troubleshooting Guide

### 4.1 No Flow or Low Flow

| Symptom | Possible Cause | Solution | Urgency |
|---------|---|---|---|
| No flow, high discharge pressure | Suction line blocked | Clean inlet strainer, check suction isolation valve | IMMEDIATE |
| Low flow, cavitation noise | Insufficient inlet pressure | Check inlet conditions, reduce flow | HIGH |
| Gradual flow decrease over hours | Impeller wearing | Schedule replacement | MEDIUM |
| Low flow only during startup | Air in pump | Prime pump, check for suction leaks | MEDIUM |

### 4.2 High Vibration

Vibration > 0.3 in/sec requires immediate investigation:

**Diagnosis Protocol**:
1. Check for cavitation (listen for crackling sound)
2. Verify motor-pump alignment (use laser alignment tool, tolerance ±0.05mm)
3. Check bearing preload (thrust bearing end-play should be 0.1-0.3mm)
4. Inspect impeller for wear or damage
5. Measure unbalance (dynamic balancing if > 0.5 oz-in)

### 4.3 Bearing Overheating (> 80°C)

1. Check cooling water flow (if water-cooled bearing)
2. Inspect bearing for contamination
3. Verify bearing preload not excessive
4. Check motor load is appropriate
5. Allow 24-hour cool-down period before restart

## 5. Maintenance Schedule

### Preventive Maintenance Matrix

| Task | Interval | Time Required | Parts Needed |
|------|----------|---|---|
| Visual inspection | Daily | 5 min | None |
| Suction strainer cleaning | Weekly | 30 min | Gasket kit |
| Bearing temperature check | Daily | 2 min | Thermometer |
| Mechanical seal inspection | Monthly | 15 min | None |
| Lubricant sampling & analysis | Quarterly | 30 min | Sample bottle |
| Bearing replacement | 2 years | 8 hours | Bearing kit |
| Impeller inspection | 1 year | 4 hours | Inspection tools |
| Seal replacement | 2 years | 6 hours | Seal kit |
| Motor rewind | 5 years | 16 hours | Motor kit |

### Annual Service Procedure

**Required steps**:
1. Isolate pump (LOTO)
2. Drain and flush system
3. Remove pump from piping
4. Inspect impeller for wear/pitting
5. Measure clearances (tolerance stack-up)
6. Clean internal passages
7. Replace mechanical seal
8. Replace bearing lubricant
9. Perform alignment
10. Perform function test
11. Document findings

## 6. Technical Specifications

### 6.1 Dimensions & Weight

**Overall dimensions**: 48" L × 24" W × 28" H
**Dry weight**: 850 lbs
**Filled weight**: 920 lbs

**Pipe connections**:
- Suction: 3" NPT
- Discharge: 2" NPT

### 6.2 Electrical

- Motor: 30 kW (40 HP)
- Voltage: 480V 3-phase 60Hz
- Inrush current: 125 Amps
- Full load current: 28 Amps
- Enclosure: NEMA 4X (stainless steel)
- Thermal protection: Built-in overload relay

### 6.3 Bearing Specifications

- Bearing type: Deep groove ball bearing
- Size: 6309-2RS
- Lubrication: ISO VG 32 mineral oil
- Temperature sensor: RTD Pt100 (0-100°C range)
- Preload: 500 N axial