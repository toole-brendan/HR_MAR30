import { 
  User, 
  InventoryItem, 
  Transfer, 
  Activity, 
  Notification 
} from "@/types";

// Mock User
export const user: User = {
  id: "8675309",
  username: "john.doe",
  name: "CPT John Doe",
  rank: "Captain",
  position: "Company Commander",
  unit: "Alpha Company, 1-509th Infantry Regiment",
  yearsOfService: 8,
  commandTime: "11 months",
  responsibility: "Line Infantry Company",
  valueManaged: "$4.2M Equipment Value",
  upcomingEvents: [
    { title: "BN Command & Staff", date: "12 JUL 0900" },
    { title: "Range Density", date: "15-20 JUL" },
    { title: "JRTC Rotation", date: "10-25 AUG" }
  ],
  equipmentSummary: {
    vehicles: 12,
    weapons: 134,
    communications: 28,
    opticalSystems: 45,
    sensitiveItems: 75
  }
};

// Mock Inventory Items
export const inventory: InventoryItem[] = [
  {
    id: "1",
    name: "ACH",
    serialNumber: "ACH-45678123",
    assignedDate: "01/15/2023",
    status: "active",
  },
  {
    id: "2",
    name: "MOLLE II Rucksack",
    serialNumber: "MOLLE-98745632",
    assignedDate: "03/22/2023",
    status: "active",
    components: [
      {
        id: 'comp-ruck-1',
        name: 'Sustainment Pouch',
        quantity: 2,
        required: true,
        status: 'present',
        nsn: '8465-01-524-7226'
      },
      {
        id: 'comp-ruck-2',
        name: 'Waist Belt',
        quantity: 1,
        required: true,
        status: 'present'
      }
    ]
  },
  {
    id: "3",
    name: "IFAK",
    serialNumber: "IFAK-32165487",
    assignedDate: "02/10/2023",
    status: "active",
  },
  {
    id: "4",
    name: "IOTV",
    serialNumber: "IOTV-78912345",
    assignedDate: "04/05/2023",
    status: "active",
    components: [
      {
        id: 'comp-iotv-1',
        name: 'Side Plate Pouch (Left)',
        quantity: 1,
        required: true,
        status: 'present'
      },
      {
        id: 'comp-iotv-2',
        name: 'Side Plate Pouch (Right)',
        quantity: 1,
        required: true,
        status: 'missing',
        notes: 'Reported missing 07/10/2023'
      },
       {
        id: 'comp-iotv-3',
        name: 'Shoulder Pads (Pair)',
        quantity: 1,
        required: true,
        status: 'present'
      }
    ]
  },
  {
    id: "5",
    name: "HGU-56/P Helmet",
    serialNumber: "HGU-45612378",
    assignedDate: "01/20/2023",
    status: "active",
  },
  {
    id: "6",
    name: "M11 Pistol",
    serialNumber: "M11-67812345",
    assignedDate: "01/05/2023",
    status: "active",
  },
  {
    id: "7",
    name: "JLTV",
    serialNumber: "JLTV-56781234",
    assignedDate: "02/15/2023",
    status: "active",
  },
  {
    id: "8",
    name: "M256 Kit",
    serialNumber: "CBRN-45123789",
    assignedDate: "03/10/2023",
    status: "active",
  },
  {
    id: "9",
    name: "PEQ-15",
    serialNumber: "PEQ-78123456",
    assignedDate: "12/22/2022",
    status: "active",
    requiresCalibration: true,
    calibrationInfo: {
      lastCalibrationDate: "2024-03-15",
      nextCalibrationDueDate: "2025-03-15",
      calibrationIntervalDays: 365,
      status: 'current',
      notes: "Calibrated by Unit TMDE support.",
      history: [
         { date: "2024-03-15", performedBy: "TMDE Lab", notes: "Annual calibration performed." },
         { date: "2023-03-10", performedBy: "TMDE Lab", notes: "Initial calibration." },
      ]
    }
  },
  {
    id: "10",
    name: "FILBE Pack",
    serialNumber: "FILBE-56123789",
    assignedDate: "05/18/2023",
    status: "active",
  },
  {
    id: "11",
    name: "Fluke 87V Multimeter",
    serialNumber: "FLK-11223344",
    assignedDate: "01/10/2024",
    status: "active",
    requiresCalibration: true,
    calibrationInfo: {
       lastCalibrationDate: "2024-01-15",
       nextCalibrationDueDate: "2024-07-15",
       calibrationIntervalDays: 180,
       status: 'due-soon',
       notes: "Precision measurement tool."
    }
  }
];

// Mock Transfer Requests
export const transfers: Transfer[] = [
  {
    id: "1",
    name: "M4A1 w/ ACOG",
    serialNumber: "M4A1-88574921",
    from: "SFC Martinez",
    to: "CPT John Doe",
    date: "07/15/2023",
    status: "pending",
  },
  {
    id: "2",
    name: "PVS-14",
    serialNumber: "PVS14-74835621",
    from: "1LT Parker",
    to: "CPT John Doe",
    date: "07/14/2023",
    status: "pending",
  },
  {
    id: "3",
    name: "PRC-152",
    serialNumber: "PRC152-32165498",
    from: "SSG Rodriguez",
    to: "CPT John Doe",
    date: "07/13/2023",
    status: "pending",
  },
  {
    id: "4",
    name: "Nomex Gloves",
    serialNumber: "NFG-65432198",
    from: "CPT John Doe",
    to: "PFC Williams",
    date: "07/10/2023",
    status: "approved",
  },
  {
    id: "5",
    name: "M9 Bayonet",
    serialNumber: "M9B-87654321",
    from: "CPT John Doe",
    to: "PFC Williams",
    date: "07/09/2023",
    status: "rejected",
  },
  {
    id: "6",
    name: "M240B",
    serialNumber: "M240B-23574921",
    from: "1SG Johnson",
    to: "CPT John Doe",
    date: "07/08/2023",
    status: "approved",
  },
  {
    id: "7",
    name: "DAGR",
    serialNumber: "DAGR-56784321",
    from: "CPT John Doe",
    to: "2LT Adams",
    date: "07/06/2023",
    status: "approved",
  },
  {
    id: "8",
    name: "M2 .50 Cal",
    serialNumber: "M2-87542198",
    from: "MAJ Wilson",
    to: "CPT John Doe",
    date: "07/05/2023",
    status: "pending",
  },
  {
    id: "9",
    name: "ASIP Radio",
    serialNumber: "ASIP-12354876",
    from: "CPT John Doe",
    to: "SFC Martinez",
    date: "07/03/2023",
    status: "approved",
  },
  {
    id: "10",
    name: "MK19",
    serialNumber: "MK19-87456213",
    from: "CPT John Doe",
    to: "SSG Brown",
    date: "07/01/2023",
    status: "pending",
  },
];

// Mock Activities
export const activities: Activity[] = [
  {
    id: "act-1",
    type: "transfer-approved",
    description: "Transfer approved: IOTV",
    user: "From: 1SG Johnson",
    timeAgo: "2 hours ago",
  },
  {
    id: "act-2",
    type: "transfer-rejected",
    description: "Transfer rejected: M9 Bayonet",
    user: "To: PFC Williams",
    timeAgo: "4 hours ago",
  },
  {
    id: "act-3",
    type: "inventory-updated",
    description: "Inventory updated: +5 IFAK",
    user: "By: 1LT Parker",
    timeAgo: "Yesterday",
  },
  {
    id: "act-4",
    type: "transfer-approved",
    description: "Transfer approved: Nomex Gloves",
    user: "To: PFC Williams",
    timeAgo: "2 days ago",
  },
  {
    id: "act-5",
    type: "inventory-updated",
    description: "Inventory updated: -2 PRC-152",
    user: "By: SFC Martinez",
    timeAgo: "3 days ago",
  },
  {
    id: "act-6",
    type: "transfer-approved",
    description: "Transfer approved: M240B",
    user: "From: 1SG Johnson",
    timeAgo: "3 days ago",
  },
  {
    id: "act-7",
    type: "inventory-updated",
    description: "Inventory updated: +4 SAPI Plates",
    user: "By: CPT Smith",
    timeAgo: "4 days ago",
  },
  {
    id: "act-8",
    type: "transfer-approved",
    description: "Transfer approved: ASIP Radio",
    user: "To: SFC Martinez",
    timeAgo: "5 days ago",
  },
  {
    id: "act-9",
    type: "inventory-updated",
    description: "Inventory updated: +2 CLS Bags",
    user: "By: SFC Wilson",
    timeAgo: "1 week ago",
  },
  {
    id: "act-10",
    type: "transfer-rejected",
    description: "Transfer rejected: AT4",
    user: "To: SSG Brown",
    timeAgo: "1 week ago",
  },
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: "not-1",
    type: "transfer-request",
    title: "Transfer Request",
    message: "SFC Martinez is requesting to transfer an M4A1 to you.",
    timeAgo: "10 minutes ago",
    read: false,
  },
  {
    id: "not-2",
    type: "transfer-approved",
    title: "Transfer Approved",
    message: "Your request to transfer PVS-14 has been approved.",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "not-3",
    type: "system-alert",
    title: "System Alert",
    message: "Scheduled PMCS will occur tonight from 0200-0400 hours.",
    timeAgo: "3 hours ago",
    read: false,
  },
  {
    id: "not-4",
    type: "transfer-request",
    title: "Transfer Request",
    message: "SSG Rodriguez is requesting to transfer a PRC-152 to you.",
    timeAgo: "5 hours ago",
    read: false,
  },
  {
    id: "not-5",
    type: "transfer-request",
    title: "Transfer Request",
    message: "1LT Parker is requesting to transfer TCCC supplies to you.",
    timeAgo: "1 day ago",
    read: true,
  },
  {
    id: "not-6",
    type: "system-alert",
    title: "BN FRAGO",
    message: "Battalion FRAGO 12 published to SIPR. See S3 for details.",
    timeAgo: "1 day ago",
    read: false,
  },
  {
    id: "not-7",
    type: "transfer-request",
    title: "Transfer Request",
    message: "MAJ Wilson is requesting to transfer M2 .50 Cal to you.",
    timeAgo: "2 days ago",
    read: false,
  },
  {
    id: "not-8",
    type: "system-alert",
    title: "Arms Room Alert",
    message: "Monthly weapons maintenance scheduled for 15 JUL 0900.",
    timeAgo: "2 days ago",
    read: true,
  },
  {
    id: "not-9",
    type: "transfer-approved",
    title: "Transfer Approved",
    message: "Your request to transfer ASIP Radio has been approved.",
    timeAgo: "4 days ago",
    read: true,
  },
  {
    id: "not-10",
    type: "system-alert",
    title: "Supply Alert",
    message: "Monthly sensitive items inventory on 20 JUL 0800.",
    timeAgo: "1 week ago",
    read: true,
  },
];
