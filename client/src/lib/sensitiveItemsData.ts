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
    name: "M4A1",
    category: 'weapon',
    serialNumber: "M4-87654321",
    assignedDate: "01/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "CPT John Doe",
  },
  {
    id: "si-002",
    name: "M17 Pistol",
    category: 'weapon',
    serialNumber: "M17-12345678",
    assignedDate: "02/20/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "CPT John Doe",
  },
  {
    id: "si-003",
    name: "PRC-152",
    category: 'communication',
    serialNumber: "PRC-98765432",
    assignedDate: "03/10/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "classified",
    location: "Comms Cage",
    assignedTo: "CPT John Doe",
  },
  {
    id: "si-004",
    name: "PVS-14",
    category: 'optics',
    serialNumber: "PVS-23456789",
    assignedDate: "03/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Equipment Room",
    assignedTo: "CPT John Doe",
  },
  {
    id: "si-005",
    name: "KG-175D",
    category: 'crypto',
    serialNumber: "KG-45678901",
    assignedDate: "04/05/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "secret",
    location: "Secure Room",
    assignedTo: "CPT John Doe",
    notes: "Requires two-person verification"
  },
  {
    id: "si-006",
    name: "PVS-31",
    category: 'optics',
    serialNumber: "PVS-34567890",
    assignedDate: "04/12/2023",
    status: "maintenance",
    lastVerified: format(lastWeek, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Maintenance Shop",
    assignedTo: "CPT John Doe",
    notes: "Scheduled maintenance - battery issue"
  },
  {
    id: "si-007",
    name: "DAGR",
    category: 'communication',
    serialNumber: "DAGR-76543210",
    assignedDate: "04/20/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Equipment Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-008",
    name: "ASIP",
    category: 'communication',
    serialNumber: "ASIP-87654320",
    assignedDate: "05/01/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "classified",
    location: "Comms Cage",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-009",
    name: "M240B",
    category: 'weapon',
    serialNumber: "M240-12345670",
    assignedDate: "05/10/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-010",
    name: "KIV-7M",
    category: 'crypto',
    serialNumber: "KIV-23456780",
    assignedDate: "05/15/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "top-secret",
    location: "Secure Room",
    assignedTo: "CPT John Doe",
    notes: "Requires two-person verification"
  },
  {
    id: "si-011",
    name: "M2 .50 Cal",
    category: 'weapon',
    serialNumber: "M2-56781234",
    assignedDate: "05/20/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-012",
    name: "MK19",
    category: 'weapon',
    serialNumber: "MK19-87612345",
    assignedDate: "05/25/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Arms Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-013",
    name: "SOFLAM",
    category: 'optics',
    serialNumber: "SOFLAM-32176543",
    assignedDate: "06/01/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "classified",
    location: "Equipment Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-014",
    name: "IZLID",
    category: 'optics',
    serialNumber: "IZLID-98765432",
    assignedDate: "06/05/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "controlled",
    location: "Equipment Room",
    assignedTo: "CPT John Doe"
  },
  {
    id: "si-015",
    name: "CYZ-10",
    category: 'crypto',
    serialNumber: "CYZ-43218765",
    assignedDate: "06/10/2023",
    status: "active",
    lastVerified: format(yesterday, 'dd MMM yyyy'),
    nextVerification: format(nextWeek, 'dd MMM yyyy'),
    securityLevel: "top-secret",
    location: "Secure Room",
    assignedTo: "CPT John Doe",
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
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-002",
    itemId: "si-002",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0605",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-003",
    itemId: "si-003",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0610",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily COMSEC inventory"
  },
  {
    id: "vl-004",
    itemId: "si-004",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0615",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-005",
    itemId: "si-005",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0620",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for with secondary verification by 1LT Parker"
  },
  {
    id: "vl-006",
    itemId: "si-006",
    date: format(lastWeek, 'yyyy-MM-dd'),
    time: "0625",
    verifiedBy: "CPT John Doe",
    status: "damaged",
    notes: "Battery issue identified, submitted DA 2404 for repair"
  },
  {
    id: "vl-007",
    itemId: "si-007",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0630",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-008",
    itemId: "si-008",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0635",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily COMSEC inventory"
  },
  {
    id: "vl-009",
    itemId: "si-009",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0640",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during arms room inventory"
  },
  {
    id: "vl-010",
    itemId: "si-010",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0645",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for with secondary verification by 1LT Parker"
  },
  {
    id: "vl-011",
    itemId: "si-011",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0650",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during crew-served weapons inventory"
  },
  {
    id: "vl-012",
    itemId: "si-012",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0655",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during crew-served weapons inventory"
  },
  {
    id: "vl-013",
    itemId: "si-013",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0700",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-014",
    itemId: "si-014",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0705",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for during daily SI check"
  },
  {
    id: "vl-015",
    itemId: "si-015",
    date: format(yesterday, 'yyyy-MM-dd'),
    time: "0710",
    verifiedBy: "CPT John Doe",
    status: "verified",
    notes: "Accounted for with secondary verification by 1LT Parker"
  }
];

// Mock data for sensitive item categories
export const sensitiveItemCategories: SensitiveItemCategory[] = [
  {
    id: "cat-1",
    name: "Crew-Served Weapons",
    count: 5,
    verificationFrequency: "Twice Daily (0600/1800)",
    riskLevel: "critical",
    icon: "gun"
  },
  {
    id: "cat-2",
    name: "COMSEC Devices",
    count: 3,
    verificationFrequency: "Daily (0600)",
    riskLevel: "high",
    icon: "radio"
  },
  {
    id: "cat-3",
    name: "NVG Systems",
    count: 4,
    verificationFrequency: "Daily (0600)",
    riskLevel: "high",
    icon: "eye"
  },
  {
    id: "cat-4",
    name: "CCI Equipment",
    count: 3,
    verificationFrequency: "Daily (0600)",
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
  totalItems: 15,
  verifiedToday: 14,
  pendingVerification: 1,
  inMaintenance: 1,
  highRiskItems: 10,
  lastFullVerification: format(yesterday, 'dd MMM yyyy'),
  verificationCompliance: "100%",
};