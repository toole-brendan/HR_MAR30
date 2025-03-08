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
  name: "SSgt. John Doe",
  rank: "Staff Sergeant",
};

// Mock Inventory Items
export const inventory: InventoryItem[] = [
  {
    id: "1",
    name: "ACH (Advanced Combat Helmet)",
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
  },
  {
    id: "3",
    name: "IFAK (Individual First Aid Kit)",
    serialNumber: "IFAK-32165487",
    assignedDate: "02/10/2023",
    status: "active",
  },
  {
    id: "4",
    name: "IOTV (Improved Outer Tactical Vest)",
    serialNumber: "IOTV-78912345",
    assignedDate: "04/05/2023",
    status: "active",
  },
  {
    id: "5",
    name: "HGU-56/P Flight Helmet",
    serialNumber: "HGU-45612378",
    assignedDate: "01/20/2023",
    status: "active",
  },
];

// Mock Transfer Requests
export const transfers: Transfer[] = [
  {
    id: "1",
    name: "M4A1 Carbine w/ ACOG",
    serialNumber: "M4A1-88574921",
    from: "Sgt. Martinez",
    to: "SSgt. John Doe",
    date: "07/15/2023",
    status: "pending",
  },
  {
    id: "2",
    name: "AN/PVS-14 Night Vision Device",
    serialNumber: "PVS14-74835621",
    from: "Lt. Parker",
    to: "SSgt. John Doe",
    date: "07/14/2023",
    status: "pending",
  },
  {
    id: "3",
    name: "AN/PRC-152 Multiband Radio",
    serialNumber: "PRC152-32165498",
    from: "Cpl. Rodriguez",
    to: "SSgt. John Doe",
    date: "07/13/2023",
    status: "pending",
  },
  {
    id: "4",
    name: "Nomex Flight Gloves",
    serialNumber: "NFG-65432198",
    from: "SSgt. John Doe",
    to: "Pvt. Williams",
    date: "07/10/2023",
    status: "approved",
  },
  {
    id: "5",
    name: "M9 Bayonet",
    serialNumber: "M9B-87654321",
    from: "SSgt. John Doe",
    to: "Pvt. Williams",
    date: "07/09/2023",
    status: "rejected",
  },
];

// Mock Activities
export const activities: Activity[] = [
  {
    id: "act-1",
    type: "transfer-approved",
    description: "Transfer approved: IOTV Gen IV Plate Carrier",
    user: "From: Cpt. Johnson",
    timeAgo: "2 hours ago",
  },
  {
    id: "act-2",
    type: "transfer-rejected",
    description: "Transfer rejected: M9 Bayonet",
    user: "To: Pvt. Williams",
    timeAgo: "4 hours ago",
  },
  {
    id: "act-3",
    type: "inventory-updated",
    description: "Inventory updated: +5 IFAK II Combat Casualty Kits",
    user: "By: Lt. Parker",
    timeAgo: "Yesterday",
  },
  {
    id: "act-4",
    type: "transfer-approved",
    description: "Transfer approved: Nomex Flight Gloves",
    user: "To: Pvt. Williams",
    timeAgo: "2 days ago",
  },
  {
    id: "act-5",
    type: "inventory-updated",
    description: "Inventory updated: -2 AN/PRC-152 Multiband Radios",
    user: "By: Sgt. Martinez",
    timeAgo: "3 days ago",
  },
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: "not-1",
    type: "transfer-request",
    title: "Transfer Request",
    message: "Sgt. Martinez is requesting to transfer an M4A1 Carbine w/ ACOG to you.",
    timeAgo: "10 minutes ago",
    read: false,
  },
  {
    id: "not-2",
    type: "transfer-approved",
    title: "Transfer Approved",
    message: "Your request to transfer AN/PVS-14 Night Vision Device has been approved.",
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
    message: "Cpl. Rodriguez is requesting to transfer an AN/PRC-152 Multiband Radio to you.",
    timeAgo: "5 hours ago",
    read: false,
  },
  {
    id: "not-5",
    type: "transfer-request",
    title: "Transfer Request",
    message: "Lt. Parker is requesting to transfer TCCC Medical Supplies to you.",
    timeAgo: "1 day ago",
    read: true,
  },
];
