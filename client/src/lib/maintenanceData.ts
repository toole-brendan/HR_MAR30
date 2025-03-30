import { format, addDays, subDays } from 'date-fns';

export interface MaintenanceItem {
  id: string;
  itemId: string;
  itemName: string;
  serialNumber: string;
  category: 'weapon' | 'vehicle' | 'communication' | 'optics' | 'other';
  maintenanceType: 'scheduled' | 'corrective' | 'preventive' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'awaiting-parts' | 'bn-level';
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

const today = new Date();
const CPT_NAME = "CPT Rodriguez, Michael";
const LT_1_NAME = "LT Jenkins, Sarah";
const SFC_SUPPLY_NAME = "SFC Bell, Marcus";
const SGT_ARMS_ROOM_NAME = "SGT Miller, Kevin";
const SPC_MECH_1 = "SPC Davis, Robert";
const SPC_MECH_2 = "SPC Chen, Wei";
const BN_MAINT_POC = "BN Maintenance WO";

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
const formatDateTime = (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss');

// Generate mock maintenance items reflecting Bravo Company
export const maintenanceItems: MaintenanceItem[] = [
  {
    id: "m1",
    itemId: "wpn-m4-001", // Match inventory ID if possible, adjust as needed
    itemName: "M4A1 Carbine",
    serialNumber: "WPN-B1234567", // Example serial
    category: "weapon",
    maintenanceType: "scheduled",
    status: "in-progress",
    priority: "medium",
    description: "Annual service and gauging (Post-Deployment Reset)",
    reportedBy: SGT_ARMS_ROOM_NAME,
    assignedTo: "Unit Armorer",
    reportedDate: formatDate(subDays(today, 5)),
    scheduledDate: formatDate(subDays(today, 1)),
    estimatedCompletionTime: "4 hours",
    notes: "TM 9-1005-319-23&P check. Requires full cleaning and function check for NTC.",
  },
  {
    id: "m2",
    itemId: "veh-hmmwv-001", // Match inventory ID
    itemName: "M1151A1 HMMWV (B-12)", // Specific vehicle ID
    serialNumber: "VEH-BCO12345",
    category: "vehicle",
    maintenanceType: "corrective",
    status: "awaiting-parts",
    priority: "high",
    description: "Transmission slipping under load - DA Form 5988E initiated",
    reportedBy: LT_1_NAME, // Reported by 1st Platoon Leader
    assignedTo: BN_MAINT_POC,
    reportedDate: formatDate(subDays(today, 7)),
    scheduledDate: formatDate(subDays(today, 3)), // Scheduled for BN Maintenance shop
    estimatedCompletionTime: "2 days (post parts arrival)",
    notes: "Requires transmission rebuild kit. Submitted to GCSS-Army. Vehicle NMC.",
    partsRequired: [
      {
        id: "p3",
        name: "Transmission Rebuild Kit, HMMWV",
        partNumber: "2520-01-555-1234",
        quantity: 1,
        available: false,
        estimatedArrival: formatDate(addDays(today, 5))
      }
    ]
  },
  {
    id: "m3",
    itemId: "com-prc152-001", // Match inventory ID
    itemName: "AN/PRC-152 Radio",
    serialNumber: "COM-B5678901",
    category: "communication",
    maintenanceType: "preventive",
    status: "completed",
    priority: "medium",
    description: "Semi-annual COMSEC/Firmware Update & Check",
    reportedBy: "Commo SGT",
    assignedTo: "Commo SGT",
    reportedDate: formatDate(subDays(today, 15)),
    scheduledDate: formatDate(subDays(today, 10)),
    completedDate: formatDate(subDays(today, 9)),
    estimatedCompletionTime: "1 hour per radio",
    notes: "Firmware v5.x installed. SKL load successful. Ready for NTC.",
  },
  {
    id: "m4",
    itemId: "opt-pvs14-001", // Match inventory ID
    itemName: "AN/PVS-14 NVG",
    serialNumber: "NVG-B9876543",
    category: "optics",
    maintenanceType: "corrective",
    status: "bn-level", // Sent to Battalion / Higher
    priority: "high",
    description: "Black spots observed in tube during PMCS",
    reportedBy: SGT_ARMS_ROOM_NAME,
    assignedTo: "BN TMDE Support",
    reportedDate: formatDate(subDays(today, 3)),
    scheduledDate: formatDate(subDays(today, 1)), // Date sent up
    estimatedCompletionTime: "5-7 Business Days",
    notes: "Turned into BN S4 for higher-level maintenance eval / repair.",
  },
  {
    id: "m5",
    itemId: "wpn-m240b-001", // Match inventory ID
    itemName: "M240B Machine Gun",
    serialNumber: "WPN-B240B111",
    category: "weapon",
    maintenanceType: "scheduled",
    status: "scheduled",
    priority: "medium",
    description: "Pre-NTC Headspace & Timing Check / Barrel Inspection",
    reportedBy: SGT_ARMS_ROOM_NAME,
    assignedTo: "Unit Armorer",
    reportedDate: formatDate(subDays(today, 4)),
    scheduledDate: formatDate(addDays(today, 2)),
    estimatedCompletionTime: "2 hours per weapon",
    partsRequired: [
      {
        id: "p5",
        name: "Barrel Assembly, M240",
        partNumber: "1005-01-412-3129",
        quantity: 1, // Spare on hand
        available: true
      }
    ]
  },
  {
    id: "m6",
    itemId: "veh-lmtv-001", // Match inventory ID
    itemName: "M1083 LMTV (B-31)",
    serialNumber: "VEH-BCO67890",
    category: "vehicle",
    maintenanceType: "preventive",
    status: "completed",
    priority: "medium",
    description: "Quarterly PMCS (-10 Level)",
    reportedBy: "Motor Sergeant",
    assignedTo: SPC_MECH_1, // Assigned to a specific mechanic
    reportedDate: formatDate(subDays(today, 20)),
    scheduledDate: formatDate(subDays(today, 18)),
    completedDate: formatDate(subDays(today, 17)),
    estimatedCompletionTime: "4 hours",
    notes: "All checks complete per TM 9-2320-365-10. Fluids topped off. Ready.",
  },
  {
    id: "m7",
    itemId: "opt-acog-001", // Example ACOG
    itemName: "M150 C.O.W.S.", // Match name
    serialNumber: "OPT-B150A123",
    category: "optics",
    maintenanceType: "corrective",
    status: "in-progress",
    priority: "low",
    description: "Zero retention issue reported after range",
    reportedBy: LT_1_NAME,
    assignedTo: SGT_ARMS_ROOM_NAME, // Armorer handles first look
    reportedDate: formatDate(subDays(today, 2)),
    scheduledDate: formatDate(subDays(today, 1)),
    estimatedCompletionTime: "1 hour",
    notes: "Checking mounting screws and rail interface. May need re-zero.",
  },
  {
    id: "m8",
    itemId: "oth-gen-001", // Example Generator
    itemName: "MEP-803A Generator",
    serialNumber: "GEN-B803A005",
    category: "other",
    maintenanceType: "preventive",
    status: "scheduled", // Scheduled for upcoming week
    priority: "medium",
    description: "100-hour Service (Post-Reset Task)",
    reportedBy: "Motor Sergeant",
    assignedTo: SPC_MECH_2,
    reportedDate: formatDate(subDays(today, 10)),
    scheduledDate: formatDate(addDays(today, 3)),
    estimatedCompletionTime: "3 hours",
    notes: "Oil change, filter replacement required."
  }
];

// Generate mock maintenance logs aligned with items above
export const maintenanceLogs: MaintenanceLog[] = [
  // Logs for m1 (M4A1 Service)
  {
    id: "log1",
    maintenanceId: "m1",
    timestamp: formatDateTime(subDays(today, 5)),
    action: "created",
    performedBy: SGT_ARMS_ROOM_NAME,
    notes: "Work order created for annual service."
  },
  {
    id: "log2",
    maintenanceId: "m1",
    timestamp: formatDateTime(subDays(today, 1)),
    action: "status-change",
    performedBy: "Unit Armorer",
    notes: "Maintenance started. Initial inspection complete."
  },
  // Logs for m2 (HMMWV Transmission)
  {
    id: "log3",
    maintenanceId: "m2",
    timestamp: formatDateTime(subDays(today, 7)),
    action: "created",
    performedBy: LT_1_NAME,
    notes: "Reported transmission issue via 5988E."
  },
  {
    id: "log4",
    maintenanceId: "m2",
    timestamp: formatDateTime(subDays(today, 6)),
    action: "status-change",
    performedBy: "Motor Sergeant",
    notes: "Diagnosed transmission failure. Tasked to BN Maintenance."
  },
   {
    id: "log5",
    maintenanceId: "m2",
    timestamp: formatDateTime(subDays(today, 5)),
    action: "parts-ordered",
    performedBy: BN_MAINT_POC,
    notes: "Transmission rebuild kit ordered via GCSS-Army. Status changed to Awaiting Parts."
  },
  // Logs for m3 (PRC-152 Update)
  {
    id: "log6",
    maintenanceId: "m3",
    timestamp: formatDateTime(subDays(today, 9)),
    action: "completed",
    performedBy: "Commo SGT",
    notes: "Firmware updated and COMSEC loaded successfully."
  },
  // Logs for m4 (PVS-14 Repair)
   {
    id: "log7",
    maintenanceId: "m4",
    timestamp: formatDateTime(subDays(today, 3)),
    action: "created",
    performedBy: SGT_ARMS_ROOM_NAME,
    notes: "NVG shows black spots. Initiated turn-in."
  },
  {
    id: "log8",
    maintenanceId: "m4",
    timestamp: formatDateTime(subDays(today, 1)),
    action: "status-change",
    performedBy: SFC_SUPPLY_NAME, // Supply handles turn-in to higher
    notes: "Item transferred to BN S4 custody for TMDE evaluation. Status changed to BN-Level."
  },
];

// Calculate Maintenance Stats based on the updated items
const total = maintenanceItems.length;
const scheduled = maintenanceItems.filter(item => item.status === 'scheduled').length;
const inProgress = maintenanceItems.filter(item => item.status === 'in-progress').length;
const completed = maintenanceItems.filter(item => item.status === 'completed').length;
const cancelled = maintenanceItems.filter(item => item.status === 'cancelled').length;
const awaitingParts = maintenanceItems.filter(item => item.status === 'awaiting-parts').length;
const bnLevel = maintenanceItems.filter(item => item.status === 'bn-level').length;

const criticalPending = maintenanceItems.filter(item => item.priority === 'critical' && item.status !== 'completed' && item.status !== 'cancelled').length;

const overdue = maintenanceItems.filter(item =>
  item.scheduledDate && item.status !== 'completed' && item.status !== 'cancelled' &&
  new Date(item.scheduledDate) < subDays(today, 1) // Define 'overdue' as scheduled date is yesterday or earlier
).length;

const completedThisMonth = maintenanceItems.filter(item =>
  item.completedDate && new Date(item.completedDate).getMonth() === today.getMonth() && new Date(item.completedDate).getFullYear() === today.getFullYear()
).length;

export const maintenanceStats: MaintenanceStats = {
  total: total,
  scheduled: scheduled,
  inProgress: inProgress + awaitingParts + bnLevel, // Combine active non-completed states
  completed: completed,
  cancelled: cancelled,
  criticalPending: criticalPending,
  overdue: overdue, // Using calculated overdue count
  completedThisMonth: completedThisMonth,
  averageCompletionTime: "6 hours" // Keep as placeholder or calculate if needed
};