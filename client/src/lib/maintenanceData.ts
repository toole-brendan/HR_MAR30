import { format, addDays, subDays } from 'date-fns';

export interface MaintenanceItem {
  id: string;
  itemId: string;
  itemName: string;
  serialNumber: string;
  category: 'weapon' | 'vehicle' | 'communication' | 'optics' | 'other';
  maintenanceType: 'scheduled' | 'corrective' | 'preventive' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  assignedTo?: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCompletionTime?: string;
  notes?: string;
  partsRequired?: MaintenancePart[];
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  available: boolean;
  estimatedArrival?: string;
}

export interface MaintenanceLog {
  id: string;
  maintenanceId: string;
  timestamp: string;
  action: 'created' | 'updated' | 'status-change' | 'parts-ordered' | 'parts-received' | 'completed';
  performedBy: string;
  notes?: string;
}

export interface MaintenanceStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  criticalPending: number;
  overdue: number;
  completedThisMonth: number;
  averageCompletionTime: string;
}

// Generate mock maintenance items
export const maintenanceItems: MaintenanceItem[] = [
  {
    id: "m1",
    itemId: "i1",
    itemName: "M4A1 Carbine w/ SOPMOD Block II",
    serialNumber: "M4A1-12345-AR",
    category: "weapon",
    maintenanceType: "scheduled",
    status: "in-progress",
    priority: "high",
    description: "TM 9-1005-319-10 10/20 PMCS Service",
    reportedBy: "CPT Rodriguez",
    assignedTo: "SPC Johnson",
    reportedDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    estimatedCompletionTime: "4 hours",
    notes: "NSN 1005-01-231-0973 parts replacement needed. Complete field strip and reassembly.",
    partsRequired: [
      {
        id: "p1",
        name: "Firing Pin Assembly",
        partNumber: "5-1005-01-231-0973",
        quantity: 1,
        available: true
      },
      {
        id: "p2",
        name: "Extractor Spring Assembly",
        partNumber: "5315-01-231-0974",
        quantity: 2,
        available: true
      }
    ]
  },
  {
    id: "m2",
    itemId: "i2",
    itemName: "M1151A1 Up-Armored HMMWV",
    serialNumber: "HMV-87654-MV",
    category: "vehicle",
    maintenanceType: "corrective",
    status: "scheduled",
    priority: "critical",
    description: "Engine overheating IAW TM 9-2320-387-10",
    reportedBy: "SSG Wilson",
    assignedTo: "SPC Martinez",
    reportedDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    estimatedCompletionTime: "8 hours",
    notes: "DA Form 2404 shows cooling system failure. AOAP results indicate contamination. Requires Level 2 maintenance.",
    partsRequired: [
      {
        id: "p3",
        name: "Radiator Assembly",
        partNumber: "2930-01-461-2783",
        quantity: 1,
        available: false,
        estimatedArrival: format(addDays(new Date(), 2), 'yyyy-MM-dd')
      },
      {
        id: "p4",
        name: "Extended Life Coolant (ELC)",
        partNumber: "6850-01-619-2849",
        quantity: 4,
        available: true
      }
    ]
  },
  {
    id: "m3",
    itemId: "i3",
    itemName: "AN/VRC-12 SINCGARS RT-1523 Radio",
    serialNumber: "SINCGARS-78901-CR",
    category: "communication",
    maintenanceType: "preventive",
    status: "completed",
    priority: "medium",
    description: "Semi-annual frequency calibration",
    reportedBy: "LT Garcia",
    assignedTo: "SGT Davis",
    reportedDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    completedDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    estimatedCompletionTime: "2 hours",
    notes: "Successfully calibrated IAW TM 11-5820-890-10-8. COMSEC updated per FRAGO 12."
  },
  {
    id: "m4",
    itemId: "i4",
    itemName: "AN/PVS-14 Night Vision Monocular",
    serialNumber: "PVS14-56789-OP",
    category: "optics",
    maintenanceType: "corrective",
    status: "scheduled",
    priority: "high",
    description: "Distorted image gain and AUTO-GATED function failure",
    reportedBy: "SSG Thompson",
    reportedDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    estimatedCompletionTime: "3 hours",
    notes: "Suspected tube degradation and power circuit issues. Send to DS maintenance facility."
  },
  {
    id: "m5",
    itemId: "i5",
    itemName: "M240B 7.62mm Machine Gun",
    serialNumber: "M240B-34567-MG",
    category: "weapon",
    maintenanceType: "scheduled",
    status: "scheduled",
    priority: "medium",
    description: "Barrel replacement and headspace/timing validation",
    reportedBy: "SSG Parker",
    assignedTo: "SPC Chen",
    reportedDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedCompletionTime: "3 hours",
    partsRequired: [
      {
        id: "p5",
        name: "Barrel Assembly, 7.62mm",
        partNumber: "1005-01-412-3129",
        quantity: 1,
        available: true
      }
    ]
  },
  {
    id: "m6",
    itemId: "i6",
    itemName: "RQ-11B Raven sUAS",
    serialNumber: "RAVEN-12378-DR",
    category: "other",
    maintenanceType: "emergency",
    status: "completed",
    priority: "critical",
    description: "Ground Control Station link failure during operation",
    reportedBy: "CPT Miller",
    assignedTo: "SFC Wright",
    reportedDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    completedDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    estimatedCompletionTime: "6 hours",
    notes: "Firmware updated to v4.2.1 and GCS module replaced. Full mission capability restored."
  },
  {
    id: "m7",
    itemId: "i7",
    itemName: "Trijicon ACOG TA31RCO-M150CP",
    serialNumber: "ACOG-98765-OP",
    category: "optics",
    maintenanceType: "corrective",
    status: "in-progress",
    priority: "low",
    description: "Tritium illumination degradation",
    reportedBy: "SGT Nelson",
    assignedTo: "SPC Adams",
    reportedDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedCompletionTime: "1 hour",
    notes: "Illumination verification testing in progress. May require manufacturer RMA."
  },
  {
    id: "m8",
    itemId: "i8",
    itemName: "MEP-803A 10kW Tactical Quiet Generator",
    serialNumber: "TQG-54321-PW",
    category: "other",
    maintenanceType: "preventive",
    status: "cancelled",
    priority: "medium",
    description: "250-hour service IAW TM 9-6115-642-10",
    reportedBy: "1SG Robinson",
    reportedDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    notes: "PMCS cancelled due to JRTC rotation. Rescheduled for return to home station."
  }
];

// Generate mock maintenance logs
export const maintenanceLogs: MaintenanceLog[] = [
  {
    id: "log1",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
    action: "created",
    performedBy: "CPT Rodriguez",
    notes: "DA Form 5988E submitted for 10/20 level service maintenance"
  },
  {
    id: "log2",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "MAJ Turner",
    notes: "Service request approved via GCSS-Army, tasked to armorer"
  },
  {
    id: "log3",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
    action: "parts-ordered",
    performedBy: "SPC Johnson",
    notes: "Parts requisitioned via SARSS: NSN 1005-01-231-0973, 5315-01-231-0974"
  },
  {
    id: "log4",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    action: "parts-received",
    performedBy: "SPC Johnson",
    notes: "Parts received via Battalion SSA, ready for installation"
  },
  {
    id: "log5",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "SPC Johnson",
    notes: "Maintenance initiated IAW TM 9-1005-319-23&P"
  },
  {
    id: "log6",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
    action: "created",
    performedBy: "LT Garcia",
    notes: "Scheduled semi-annual calibration IAW COMSEC accountability SOP"
  },
  {
    id: "log7",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 7), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "SGT Davis",
    notes: "Maintenance initiated on RT-1523 with ANCD upload"
  },
  {
    id: "log8",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
    action: "completed",
    performedBy: "SGT Davis",
    notes: "Calibration and COMSEC fill completed. CIK updated and secured."
  }
];

// Generate mock maintenance statistics
export const maintenanceStats: MaintenanceStats = {
  total: 8,
  scheduled: 3,
  inProgress: 2,
  completed: 2,
  cancelled: 1,
  criticalPending: 1,
  overdue: 0,
  completedThisMonth: 2,
  averageCompletionTime: "5.2 hours"
};