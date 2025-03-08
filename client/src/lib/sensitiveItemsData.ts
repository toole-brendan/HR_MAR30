import { format } from 'date-fns';

// Types for sensitive items
export interface SensitiveItem {
  id: string;
  name: string;
  category: 'weapon' | 'communication' | 'optics' | 'crypto' | 'other';
  serialNumber: string;
  assignedDate: string;
  status: 'active' | 'pending' | 'transferred' | 'maintenance';
  lastVerified: string;
  nextVerification: string;
  securityLevel: 'routine' | 'controlled' | 'classified' | 'secret' | 'top-secret';
  location: string;
  assignedTo: string;
  notes?: string;
}

export interface VerificationLog {
  id: string;
  itemId: string;
  date: string;
  time: string;
  verifiedBy: string;
  status: 'verified' | 'missing' | 'damaged';
  notes?: string;
}

export interface SensitiveItemCategory {
  id: string;
  name: string;
  count: number;
  verificationFrequency: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
}

// Get today's date and some relative dates for the mock data
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Mock data for sensitive items
export const sensitiveItems: SensitiveItem[] = [
  {
    id: "si-001",
    name: "M4A1 Carbine",
    category: 'weapon',
    serialNumber: "M4-87654321",
    assignedDate: "01/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "SSgt. John Doe",
  },
  {
    id: "si-002",
    name: "M9 Pistol",
    category: 'weapon',
    serialNumber: "M9-12345678",
    assignedDate: "02/20/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "SSgt. John Doe",
  },
  {
    id: "si-003",
    name: "AN/PRC-152 Radio",
    category: 'communication',
    serialNumber: "PRC-98765432",
    assignedDate: "03/10/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "classified",
    location: "Comms Cage",
    assignedTo: "SSgt. John Doe",
  },
  {
    id: "si-004",
    name: "Night Vision Goggles PVS-14",
    category: 'optics',
    serialNumber: "PVS-23456789",
    assignedDate: "03/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Equipment Room",
    assignedTo: "SSgt. John Doe",
  },
  {
    id: "si-005",
    name: "KG-175D Taclane Encryptor",
    category: 'crypto',
    serialNumber: "KG-45678901",
    assignedDate: "04/05/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "secret",
    location: "Secure Room",
    assignedTo: "SSgt. John Doe",
    notes: "Requires two-person verification"
  },
  {
    id: "si-006",
    name: "AN/PVS-24 Night Vision Device",
    category: 'optics',
    serialNumber: "PVS-34567890",
    assignedDate: "04/12/2023",
    status: "maintenance",
    lastVerified: format(lastWeek, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Maintenance Shop",
    assignedTo: "SSgt. John Doe",
    notes: "Scheduled maintenance - battery issue"
  },
  {
    id: "si-007",
    name: "DAGR GPS Receiver",
    category: 'communication',
    serialNumber: "DAGR-76543210",
    assignedDate: "04/20/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Equipment Room",
    assignedTo: "SSgt. John Doe"
  },
  {
    id: "si-008",
    name: "SINCGARS Radio System",
    category: 'communication',
    serialNumber: "SINC-87654320",
    assignedDate: "05/01/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "classified",
    location: "Comms Cage",
    assignedTo: "SSgt. John Doe"
  },
  {
    id: "si-009",
    name: "M240B Machine Gun",
    category: 'weapon',
    serialNumber: "M240-12345670",
    assignedDate: "05/10/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "SSgt. John Doe"
  },
  {
    id: "si-010",
    name: "KIV-7M Encryptor",
    category: 'crypto',
    serialNumber: "KIV-23456780",
    assignedDate: "05/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "top-secret",
    location: "Secure Room",
    assignedTo: "SSgt. John Doe",
    notes: "Requires two-person verification"
  }
];

// Mock data for verification logs
export const verificationLogs: VerificationLog[] = [
  {
    id: "vl-001",
    itemId: "si-001",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0600",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-002",
    itemId: "si-002",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0605",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-003",
    itemId: "si-003",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0610",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-004",
    itemId: "si-004",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0615",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-005",
    itemId: "si-005",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0620",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification with secondary verification by Lt. Parker"
  },
  {
    id: "vl-006",
    itemId: "si-006",
    date: format(lastWeek, 'yyyy-MM-dd'),
    time: "0625",
    verifiedBy: "SSgt. John Doe",
    status: "damaged",
    notes: "Battery issue identified, sent to maintenance"
  },
  {
    id: "vl-007",
    itemId: "si-007",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0630",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-008",
    itemId: "si-008",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0635",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-009",
    itemId: "si-009",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0640",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification"
  },
  {
    id: "vl-010",
    itemId: "si-010",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0645",
    verifiedBy: "SSgt. John Doe",
    status: "verified",
    notes: "Standard morning verification with secondary verification by Lt. Parker"
  }
];

// Mock data for sensitive item categories
export const sensitiveItemCategories: SensitiveItemCategory[] = [
  {
    id: "cat-1",
    name: "Weapons",
    count: 3,
    verificationFrequency: "Twice Daily",
    riskLevel: "critical",
    icon: "gun"
  },
  {
    id: "cat-2",
    name: "Communication Devices",
    count: 3,
    verificationFrequency: "Daily",
    riskLevel: "high",
    icon: "radio"
  },
  {
    id: "cat-3",
    name: "Optical Systems",
    count: 2,
    verificationFrequency: "Daily",
    riskLevel: "high",
    icon: "eye"
  },
  {
    id: "cat-4",
    name: "Cryptographic Equipment",
    count: 2,
    verificationFrequency: "Daily",
    riskLevel: "critical",
    icon: "key"
  }
];

// Verification schedule for the next 7 days
export const verificationSchedule = [
  {
    date: format(today, 'dd MMM yyyy'),
    time: "0600",
    itemsToVerify: 10,
    status: "pending"
  },
  {
    date: format(today, 'dd MMM yyyy'),
    time: "1800",
    itemsToVerify: 10,
    status: "pending"
  },
  {
    date: format(new Date(today.setDate(today.getDate() + 1)), 'dd MMM yyyy'),
    time: "0600",
    itemsToVerify: 10,
    status: "scheduled"
  },
  {
    date: format(new Date(today.setDate(today.getDate())), 'dd MMM yyyy'),
    time: "1800",
    itemsToVerify: 10,
    status: "scheduled"
  },
  {
    date: format(new Date(today.setDate(today.getDate() + 1)), 'dd MMM yyyy'),
    time: "0600",
    itemsToVerify: 10,
    status: "scheduled"
  },
  {
    date: format(new Date(today.setDate(today.getDate())), 'dd MMM yyyy'),
    time: "1800",
    itemsToVerify: 10,
    status: "scheduled"
  },
];

// Summary statistics
export const sensitiveItemsStats = {
  totalItems: 10,
  verifiedToday: 9,
  pendingVerification: 1,
  inMaintenance: 1,
  highRiskItems: 7,
  lastFullVerification: format(yesterday, 'dd MMM yyyy'),
  verificationCompliance: "100%",
};