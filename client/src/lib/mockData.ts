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
    name: "Combat Helmet",
    serialNumber: "45678123",
    assignedDate: "01/15/2023",
    status: "active",
  },
  {
    id: "2",
    name: "Tactical Backpack",
    serialNumber: "98745632",
    assignedDate: "03/22/2023",
    status: "active",
  },
  {
    id: "3",
    name: "First Aid Kit",
    serialNumber: "32165487",
    assignedDate: "02/10/2023",
    status: "active",
  },
  {
    id: "4",
    name: "Tactical Vest",
    serialNumber: "78912345",
    assignedDate: "04/05/2023",
    status: "active",
  },
  {
    id: "5",
    name: "Combat Boots",
    serialNumber: "45612378",
    assignedDate: "01/20/2023",
    status: "active",
  },
];

// Mock Transfer Requests
export const transfers: Transfer[] = [
  {
    id: "1",
    name: "M4A1 Carbine",
    serialNumber: "88574921",
    from: "Sgt. Martinez",
    to: "SSgt. John Doe",
    date: "07/15/2023",
    status: "pending",
  },
  {
    id: "2",
    name: "Night Vision Goggles",
    serialNumber: "74835621",
    from: "Lt. Parker",
    to: "SSgt. John Doe",
    date: "07/14/2023",
    status: "pending",
  },
  {
    id: "3",
    name: "Tactical Radio",
    serialNumber: "32165498",
    from: "Cpl. Rodriguez",
    to: "SSgt. John Doe",
    date: "07/13/2023",
    status: "pending",
  },
  {
    id: "4",
    name: "Tactical Gloves",
    serialNumber: "65432198",
    from: "SSgt. John Doe",
    to: "Pvt. Williams",
    date: "07/10/2023",
    status: "approved",
  },
  {
    id: "5",
    name: "Combat Knife",
    serialNumber: "87654321",
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
    description: "Transfer approved: Tactical Vest",
    user: "From: Cpt. Johnson",
    timeAgo: "2 hours ago",
  },
  {
    id: "act-2",
    type: "transfer-rejected",
    description: "Transfer rejected: Combat Knife",
    user: "To: Pvt. Williams",
    timeAgo: "4 hours ago",
  },
  {
    id: "act-3",
    type: "inventory-updated",
    description: "Inventory updated: +5 Medical Kits",
    user: "By: Lt. Parker",
    timeAgo: "Yesterday",
  },
  {
    id: "act-4",
    type: "transfer-approved",
    description: "Transfer approved: Tactical Gloves",
    user: "To: Pvt. Williams",
    timeAgo: "2 days ago",
  },
  {
    id: "act-5",
    type: "inventory-updated",
    description: "Inventory updated: -2 Tactical Radios",
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
    message: "Sgt. Martinez is requesting to transfer an M4A1 Carbine to you.",
    timeAgo: "10 minutes ago",
    read: false,
  },
  {
    id: "not-2",
    type: "transfer-approved",
    title: "Transfer Approved",
    message: "Your request to transfer Night Vision Goggles has been approved.",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "not-3",
    type: "system-alert",
    title: "System Alert",
    message: "Scheduled maintenance will occur tonight from 0200-0400.",
    timeAgo: "3 hours ago",
    read: false,
  },
  {
    id: "not-4",
    type: "transfer-request",
    title: "Transfer Request",
    message: "Cpl. Rodriguez is requesting to transfer a Tactical Radio to you.",
    timeAgo: "5 hours ago",
    read: false,
  },
  {
    id: "not-5",
    type: "transfer-request",
    title: "Transfer Request",
    message: "Lt. Parker is requesting to transfer Medical Supplies to you.",
    timeAgo: "1 day ago",
    read: true,
  },
];
