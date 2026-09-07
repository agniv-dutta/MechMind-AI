export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MechMind AI';
export const ENABLE_DARK_MODE = (import.meta.env.VITE_ENABLE_DARK_MODE ?? 'true') !== 'false';

export const EQUIPMENT_TYPES = ['Pump', 'Motor', 'Valve', 'Compressor', 'Turbine', 'PLC', 'Electrical', 'Hydraulic'];
export const DOCUMENT_CATEGORIES = ['Manual', 'Procedure', 'Wiring Diagram', 'P&ID', 'Technical Drawing', 'Report'];
export const SEARCH_MODES = ['semantic', 'keyword', 'hybrid'];

export const QUICK_QUERIES = [
  'How do I troubleshoot pump cavitation?',
  "What's the maintenance schedule for this equipment?",
  'Safety procedures for electrical systems',
];

export const WIZARD_EQUIPMENT = [
  { id: 'pump', title: 'Pump System', subtitle: 'Centrifugal, Positive Displacement' },
  { id: 'motor', title: 'Industrial Motor', subtitle: 'AC/DC, Servo, Stepper' },
  { id: 'valve', title: 'Control Valve', subtitle: 'Pneumatic, Hydraulic, Manual' },
  { id: 'compressor', title: 'Compressor', subtitle: 'Rotary Screw, Reciprocating' },
  { id: 'plc', title: 'PLC / Controller', subtitle: 'Logic, I/O Modules, Comm' },
  { id: 'electrical', title: 'Electrical Panel', subtitle: 'Breakers, Relays, Wiring' },
];

export const SEVERITY_LEVELS = [
  { id: 'critical', label: 'Critical', description: 'Safety risk or full outage' },
  { id: 'high', label: 'High', description: 'Major degradation, act now' },
  { id: 'medium', label: 'Medium', description: 'Degraded but operable' },
  { id: 'low', label: 'Low', description: 'Cosmetic / monitor' },
];
