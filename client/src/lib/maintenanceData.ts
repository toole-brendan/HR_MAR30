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
    itemName: "M4A1 Carbine",
    serialNumber: "M4-12345-AR",
    category: "weapon",
    maintenanceType: "scheduled",
    status: "in-progress",
    priority: "high",
    description: "Annual inspection and maintenance",
    reportedBy: "CPT Rodriguez",
    assignedTo: "SPC Johnson",
    reportedDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    estimatedCompletionTime: "4 hours",
    notes: "Firing pin and extractor spring replacement needed",
    partsRequired: [
      {
        id: "p1",
        name: "Firing Pin",
        partNumber: "M4-FP-001",
        quantity: 1,
        available: true
      },
      {
        id: "p2",
        name: "Extractor Spring",
        partNumber: "M4-ES-002",
        quantity: 2,
        available: true
      }
    ]
  },
  {
    id: "m2",
    itemId: "i2",
    itemName: "HMMWV (Humvee)",
    serialNumber: "HMV-87654-MV",
    category: "vehicle",
    maintenanceType: "corrective",
    status: "scheduled",
    priority: "critical",
    description: "Engine overheating and power loss",
    reportedBy: "SSG Wilson",
    assignedTo: "SPC Martinez",
    reportedDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    estimatedCompletionTime: "8 hours",
    notes: "Suspected radiator failure. Requires immediate attention before field exercise.",
    partsRequired: [
      {
        id: "p3",
        name: "Radiator Assembly",
        partNumber: "HMV-RA-103",
        quantity: 1,
        available: false,
        estimatedArrival: format(addDays(new Date(), 2), 'yyyy-MM-dd')
      },
      {
        id: "p4",
        name: "Coolant",
        partNumber: "GEN-CL-001",
        quantity: 4,
        available: true
      }
    ]
  },
  {
    id: "m3",
    itemId: "i3",
    itemName: "SINCGARS Radio",
    serialNumber: "SC-78901-CR",
    category: "communication",
    maintenanceType: "preventive",
    status: "completed",
    priority: "medium",
    description: "Routine frequency calibration",
    reportedBy: "LT Garcia",
    assignedTo: "SGT Davis",
    reportedDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    completedDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    estimatedCompletionTime: "2 hours",
    notes: "Successfully calibrated and tested. All functions operating within specifications."
  },
  {
    id: "m4",
    itemId: "i4",
    itemName: "Night Vision Goggles",
    serialNumber: "NVG-56789-OP",
    category: "optics",
    maintenanceType: "corrective",
    status: "scheduled",
    priority: "high",
    description: "Distorted image and battery issues",
    reportedBy: "SSG Thompson",
    reportedDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    estimatedCompletionTime: "3 hours",
    notes: "Suspected internal lens misalignment and power management circuit issues"
  },
  {
    id: "m5",
    itemId: "i5",
    itemName: "M240B Machine Gun",
    serialNumber: "M240-34567-MG",
    category: "weapon",
    maintenanceType: "scheduled",
    status: "scheduled",
    priority: "medium",
    description: "500-round inspection and barrel replacement",
    reportedBy: "SSG Parker",
    assignedTo: "SPC Chen",
    reportedDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    scheduledDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedCompletionTime: "3 hours",
    partsRequired: [
      {
        id: "p5",
        name: "Barrel Assembly",
        partNumber: "M240-BA-021",
        quantity: 1,
        available: true
      }
    ]
  },
  {
    id: "m6",
    itemId: "i6",
    itemName: "Tactical Drone",
    serialNumber: "UAV-12378-DR",
    category: "other",
    maintenanceType: "emergency",
    status: "completed",
    priority: "critical",
    description: "Control system failure during mission",
    reportedBy: "CPT Miller",
    assignedTo: "SFC Wright",
    reportedDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    completedDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    estimatedCompletionTime: "6 hours",
    notes: "Firmware updated and control board replaced. Full functionality restored and verified."
  },
  {
    id: "m7",
    itemId: "i7",
    itemName: "ACOG Rifle Scope",
    serialNumber: "ACG-98765-OP",
    category: "optics",
    maintenanceType: "corrective",
    status: "in-progress",
    priority: "low",
    description: "Reticle illumination failure",
    reportedBy: "SGT Nelson",
    assignedTo: "SPC Adams",
    reportedDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedCompletionTime: "1 hour",
    notes: "Battery replacement and illumination circuit testing in progress"
  },
  {
    id: "m8",
    itemId: "i8",
    itemName: "Mobile Command Post Generator",
    serialNumber: "GEN-54321-PW",
    category: "other",
    maintenanceType: "preventive",
    status: "cancelled",
    priority: "medium",
    description: "Quarterly service and filter replacement",
    reportedBy: "1SG Robinson",
    reportedDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    scheduledDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    notes: "Maintenance cancelled due to deployment. Rescheduled for return."
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
    notes: "Initial maintenance request submitted"
  },
  {
    id: "log2",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "MAJ Turner",
    notes: "Request approved and scheduled"
  },
  {
    id: "log3",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
    action: "parts-ordered",
    performedBy: "SPC Johnson",
    notes: "Parts ordered: Firing Pin, Extractor Spring"
  },
  {
    id: "log4",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    action: "parts-received",
    performedBy: "SPC Johnson",
    notes: "All required parts received"
  },
  {
    id: "log5",
    maintenanceId: "m1",
    timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "SPC Johnson",
    notes: "Maintenance started"
  },
  {
    id: "log6",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
    action: "created",
    performedBy: "LT Garcia",
    notes: "Scheduled preventive maintenance"
  },
  {
    id: "log7",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 7), 'yyyy-MM-dd HH:mm:ss'),
    action: "status-change",
    performedBy: "SGT Davis",
    notes: "Maintenance started"
  },
  {
    id: "log8",
    maintenanceId: "m3",
    timestamp: format(subDays(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
    action: "completed",
    performedBy: "SGT Davis",
    notes: "Frequency calibration completed and verified"
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