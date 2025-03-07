import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { inventory, transfers, activities } from "@/lib/mockData";
import { PageWrapper } from "@/components/ui/page-wrapper";
import QRScannerModal from "@/components/shared/QRScannerModal";
import NotificationPanel from "@/components/modals/NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import { ChartConfig } from "@/components/ui/chart";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";
import { 
  FileText, 
  AlertTriangle, 
  Calendar, 
  ChevronDown, 
  Plus, 
  Sliders,
  Search,
  Clock,
  Info,
  HelpCircle,
  MoreVertical
} from "lucide-react";

// Color scheme based on military style dark theme UI
const colors = {
  background: '#141414',
  cardBg: '#1C1C1C',
  cardHeader: '#222222',
  border: '#2A2A2A',
  text: {
    primary: '#E0E0E0',
    secondary: '#A0A0A0',
    accent: '#FFFFFF'
  },
  status: {
    success: '#4CAF50',
    pending: '#FFC107',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#2196F3',
  }
};

const Dashboard: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("platoon");
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for charts
  const readinessTrendData = useMemo(() => [
    { month: 'JAN', percentage: 88 },
    { month: 'FEB', percentage: 87 },
    { month: 'MAR', percentage: 89 },
    { month: 'APR', percentage: 93 },
    { month: 'MAY', percentage: 90 },
    { month: 'JUN', percentage: 92 },
  ], []);

  const propertyDistributionData = useMemo(() => {
    return {
      vehicles: {
        '1st PLT': 10,
        '2nd PLT': 15,
        '3rd PLT': 20,
        'HQ PLT': 5
      },
      weapons: {
        '1st PLT': 30,
        '2nd PLT': 35,
        '3rd PLT': 40,
        'HQ PLT': 25
      },
      comms: {
        '1st PLT': 15,
        '2nd PLT': 20,
        '3rd PLT': 25,
        'HQ PLT': 15
      },
      fieldEquipment: {
        '1st PLT': 40,
        '2nd PLT': 45,
        '3rd PLT': 55,
        'HQ PLT': 35
      }
    };
  }, []);

  const criticalEquipmentData = useMemo(() => [
    {
      equipment: "HMMWV",
      serialNumber: "HQ-237",
      status: "PMC",
      statusColor: "#FFC107",
      location: "Motor Pool",
      issue: "Brake system",
      action: "Maintenance Request",
      due: "28FEB"
    },
    {
      equipment: "JLTV",
      serialNumber: "Pending",
      status: "In Process",
      statusColor: "#2196F3",
      location: "Brigade 54",
      issue: "New receipt",
      action: "Command Signature",
      due: "TODAY"
    },
    {
      equipment: "SINC6ARS",
      serialNumber: "RC-987-2441",
      status: "NMC",
      statusColor: "#F44336",
      location: "Maintenance",
      issue: "Missing components",
      action: "FLIPL Initiation",
      due: "OVERDUE"
    },
    {
      equipment: "M240B",
      serialNumber: "M2405689",
      status: "FMC",
      statusColor: "#4CAF50",
      location: "Arms Room",
      issue: "None",
      action: "Weekly Verification",
      due: "28FEB"
    }
  ], []);

  const accountabilityRequirements = useMemo(() => [
    {
      title: "Sensitive Items Inventory",
      due: "27FEB",
      timeframe: "1-3 days"
    },
    {
      title: "Weapons Count Verification",
      due: "28FEB",
      timeframe: "1-3 days"
    },
    {
      title: "CSDP Monthly Review",
      due: "01MAR",
      timeframe: "1-3 days"
    }
  ], []);

  const monthlyRequirements = useMemo(() => [
    {
      title: "10% Cyclic Inventory (Vehicles)",
      due: "28FEB",
      timeframe: "1-5 days",
      status: "60% Complete"
    }
  ], []);

  const accountabilityActivities = useMemo(() => [
    {
      date: "25FEB",
      time: "0730",
      activity: "Sensitive Item Inventory",
      personnel: "1LT Chen",
      details: "Completed daily verification",
      status: "Complete"
    },
    {
      date: "24FEB",
      time: "1645",
      activity: "Equipment Transfer",
      personnel: "CW2 Patel",
      details: "4x M249 SAW to Range",
      status: "Temporary"
    }
  ], []);

  const convertToChartData = (category: string) => {
    const data = propertyDistributionData[category as keyof typeof propertyDistributionData];
    return [
      { name: '1st PLT', value: data['1st PLT'], color: '#5B9BD5' },
      { name: '2nd PLT', value: data['2nd PLT'], color: '#4CAF50' },
      { name: '3rd PLT', value: data['3rd PLT'], color: '#FFC107' },
      { name: 'HQ PLT', value: data['HQ PLT'], color: '#F44336' }
    ];
  };

  const COLORS = ['#5B9BD5', '#4CAF50', '#FFC107', '#F44336'];

  const renderBarChart = () => {
    const data = [
      { name: 'Vehicles', '1st PLT': 10, '2nd PLT': 15, '3rd PLT': 20, 'HQ PLT': 5 },
      { name: 'Weapons', '1st PLT': 30, '2nd PLT': 35, '3rd PLT': 40, 'HQ PLT': 25 },
      { name: 'Comms', '1st PLT': 15, '2nd PLT': 20, '3rd PLT': 25, 'HQ PLT': 15 },
      { name: 'Field Equipment', '1st PLT': 40, '2nd PLT': 45, '3rd PLT': 55, 'HQ PLT': 35 }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={0} barCategoryGap={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="name" stroke="#CCCCCC" />
          <YAxis stroke="#CCCCCC" domain={[0, 200]} />
          <Tooltip 
            contentStyle={{backgroundColor: '#222', border: 'none'}}
            itemStyle={{color: '#EEE'}}
          />
          <Legend wrapperStyle={{bottom: 0, left: 25}} />
          <Bar dataKey="1st PLT" stackId="a" fill="#5B9BD5" />
          <Bar dataKey="2nd PLT" stackId="a" fill="#4CAF50" />
          <Bar dataKey="3rd PLT" stackId="a" fill="#FFC107" />
          <Bar dataKey="HQ PLT" stackId="a" fill="#F44336" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={readinessTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="month" stroke="#CCCCCC" />
          <YAxis stroke="#CCCCCC" domain={[60, 100]} />
          <Tooltip 
            contentStyle={{backgroundColor: '#222', border: 'none'}}
            itemStyle={{color: '#EEE'}}
          />
          <Legend wrapperStyle={{bottom: 0}} />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#4CAF50" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#FFC107" 
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen w-full px-4 pb-4 pt-2 dashboard-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* Empty div to maintain layout structure */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs">
            <FileText className="h-4 w-4 mr-2" /> Generate Reports
          </Button>
          <Button variant="outline" className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs">
            <Sliders className="h-4 w-4 mr-2" /> Unit Status
          </Button>
        </div>
      </div>

      {/* DASHBOARD INFO ROW */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Dashboard</h2>
          <p className="text-sm text-gray-400">CPT Rodriguez</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          Last updated: 25FEB2025 0842
        </div>
      </div>
      
      {/* TOP INFO CARDS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-blue-900/40 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-blue-300 mb-1">Total Value</div>
          <div className="text-xl font-bold">$4</div>
        </div>
        <div className="bg-green-900/30 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-green-300 mb-1">Equipment Items</div>
          <div className="text-xl font-bold">721</div>
        </div>
        <div className="bg-green-900/20 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-green-300 mb-1">Sensitive Items 100% Verified</div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* TOTAL PROPERTY VALUE */}
        <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden dashboard-card">
          <div className="p-3 bg-blue-900/30 flex items-center space-x-2">
            <div className="p-2 bg-blue-800/50 rounded-none">
              <FileText className="h-5 w-5 text-blue-300" />
            </div>
            <div className="uppercase text-xs tracking-wider text-gray-300">Total Property Value</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-400 mb-2">$4.2M</div>
            <div className="text-xs text-gray-400">Combined value of all accountable equipment</div>
            <div className="mt-4 text-right">
              <button className="text-xs text-blue-400 flex items-center justify-end btn-sharp">
                VIEW DETAILS 
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* EQUIPMENT ITEMS */}
        <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden dashboard-card">
          <div className="p-3 bg-gray-800 flex items-center space-x-2">
            <div className="p-2 bg-gray-700 rounded-none">
              <FileText className="h-5 w-5 text-gray-300" />
            </div>
            <div className="uppercase text-xs tracking-wider text-gray-300">EQUIPMENT ITEMS</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-gray-300 mb-2">721</div>
            <div className="text-xs text-gray-400">Total accountable equipment line items</div>
            <div className="mt-4 text-right">
              <button className="text-xs text-gray-400 flex items-center justify-end btn-sharp">
                VIEW DETAILS 
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* SENSITIVE ITEMS */}
        <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden dashboard-card">
          <div className="p-3 bg-green-900/30 flex items-center space-x-2">
            <div className="p-2 bg-green-800/50 rounded-none">
              <AlertTriangle className="h-5 w-5 text-green-300" />
            </div>
            <div className="uppercase text-xs tracking-wider text-gray-300">SENSITIVE ITEMS</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-xs text-gray-400">All items verified and accounted for</div>
            <div className="mt-4 text-right">
              <button className="text-xs text-green-400 flex items-center justify-end btn-sharp">
                VIEW DETAILS 
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* CURRENT DATE/TIME */}
        <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden dashboard-card">
          <div className="p-3 bg-gray-800 flex items-center space-x-2">
            <div className="p-2 bg-gray-700 rounded-none">
              <Calendar className="h-5 w-5 text-gray-300" />
            </div>
            <div className="uppercase text-xs tracking-wider text-gray-300">CURRENT DATE/TIME</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-gray-300 mb-2">25FEB2025</div>
            <div className="text-xs text-gray-400">0842 local time</div>
            <div className="mt-4 text-right">
              <button className="text-xs text-gray-400 flex items-center justify-end btn-sharp">
                VIEW DETAILS 
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION - MULTI-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* ACCOUNTABILITY STATUS */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider flex justify-between items-center">
            ACCOUNTABILITY STATUS
            <button className="p-1 hover:bg-gray-800 rounded-none btn-sharp">
              <HelpCircle className="h-4 w-4 text-gray-500" />
            </button>
          </h3>
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-200">
                99.4%
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#333" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#4CAF50" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="1.5" 
                  transform="rotate(-90 50 50)" 
                />
              </svg>
            </div>
            <div className="text-xs text-gray-400 mt-2">OVERALL ACCOUNTABILITY</div>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-2">
            <h4 className="text-sm text-gray-300 mb-2">SENSITIVE ITEMS</h4>
            <div className="mb-1 text-sm flex justify-between">
              <span>210/210</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Last: 23FEB2025 0830  Next: 27FEB2025
            </div>
            <button className="w-full text-center bg-blue-800/50 text-blue-300 py-2 px-4 rounded-none text-xs btn-sharp">
              CONDUCT SENSITIVE ITEM INVENTORY
            </button>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-sm text-gray-300 mb-3">EQUIPMENT CATEGORIES</h4>
            
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-sm flex justify-between">
                  <span>Weapons: 143/143 (100%)</span>
                </div>
                <div className="text-xs text-gray-500">Last verified 25FEB2025</div>
              </div>
              
              <div>
                <div className="mb-1 text-sm flex justify-between">
                  <span>Vehicles: 71/72 (98.61111111111111%)</span>
                  <span className="text-yellow-500 text-xs">Needs attention</span>
                </div>
                <div className="text-xs text-gray-500">Last verified 27FEB2025</div>
              </div>
              
              <div>
                <div className="mb-1 text-sm flex justify-between">
                  <span>Communications: 95/95 (100%)</span>
                </div>
                <div className="text-xs text-gray-500">Last verified 20FEB2025</div>
              </div>
              
              <div>
                <div className="mb-1 text-sm flex justify-between">
                  <span>Optics/NVGs: 63/63 (100%)</span>
                </div>
                <div className="text-xs text-gray-500">Last verified 23FEB2025</div>
              </div>
            </div>
          </div>
        </div>

        {/* REQUIRES YOUR ACTION */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-300 uppercase font-medium tracking-wider flex items-center">
              REQUIRES YOUR ACTION (3)
              <button className="ml-1 p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </h3>
            
            <div className="flex items-center">
              <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs">
                3
              </span>
              <button className="ml-1 p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="grid grid-cols-3 mb-2 text-xs uppercase text-gray-500 border-b border-gray-800 pb-2">
              <div>PRIORITY</div>
              <div>ITEM</div>
              <div>TYPE</div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 border-b border-gray-800 py-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-500">HIGH</span>
                </div>
                <div className="text-sm">New JLTV Receipt</div>
                <div className="text-xs text-gray-400">ACQUISITION</div>
              </div>

              <div className="grid grid-cols-3 border-b border-gray-800 py-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-500">HIGH</span>
                </div>
                <div className="text-sm">SINCGARS (SN: RC-987-2441)</div>
                <div className="text-xs text-gray-400">MAINTENANCE</div>
              </div>

              <div className="grid grid-cols-3 border-b border-gray-800 py-2">
                <div className="flex items-center text-orange-400">
                  <span className="text-xs inline-block px-1 border border-orange-400 mr-1">MEDIUM</span>
                </div>
                <div className="text-sm">3rd PLT Hand Receipt</div>
                <div className="text-xs text-gray-400">TRANSFER</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full text-center bg-blue-800/50 text-blue-300 py-2 px-4 rounded-none text-xs btn-sharp">
              View All Pending Actions
            </button>
          </div>
        </div>

        {/* NTC ROTATION */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider">
            NTC ROTATION 25-08 PREPARATION
          </h3>

          <div className="bg-yellow-900/30 border border-yellow-900/50 p-4 rounded-none mb-4 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-1">T-121</div>
            <div className="text-xs text-gray-400">DAYS TO DEPLOYMENT</div>
          </div>

          <h4 className="text-sm text-gray-300 mb-3">EQUIPMENT STATUS</h4>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Equipment On-Hand</span>
              <span>342/383 (89%)</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '89%' }}></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Critical Shortages:</span>
              <span className="text-yellow-500">27</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Serviceability Rate:</span>
              <span>84%</span>
            </div>
          </div>

          <h4 className="text-sm text-gray-300 mb-3 mt-6">KEY MILESTONES</h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-sm">
              <div className="col-span-2">Equipment Identification Complete</div>
              <div className="text-green-500">Complete</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm">
              <div className="col-span-2">
                <div>Initial Sourcing Plan</div>
                <div className="text-xs text-gray-500">01MAR (4 days)</div>
              </div>
              <div className="text-yellow-500">Pending<br/>T-4 days</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm">
              <div className="col-span-2">
                <div>Maintenance Completion</div>
                <div className="text-xs text-gray-500">15MAY</div>
              </div>
              <div className="text-blue-500">Delayed<br/>T-4 days</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm">
              <div className="col-span-2">
                <div>Load Plans Due</div>
                <div className="text-xs text-gray-500">01JUN</div>
              </div>
              <div className="text-blue-500">Delayed<br/>T-4 days</div>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full text-center bg-blue-800/50 text-blue-300 py-2 px-4 rounded-none text-xs btn-sharp">
              View NTC Preparation Plan
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS AND GRAPHS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PROPERTY DISTRIBUTION VISUALIZATION */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-300 uppercase font-medium tracking-wider flex items-center">
              PROPERTY DISTRIBUTION VISUALIZATION
              <button className="ml-1 p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </h3>
            
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 text-xs rounded-none btn-sharp ${selectedTab === 'platoon' ? 'bg-blue-800 text-blue-300' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setSelectedTab('platoon')}
              >
                By Platoon
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded-none btn-sharp ${selectedTab === 'status' ? 'bg-blue-800 text-blue-300' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setSelectedTab('status')}
              >
                By Status
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded-none btn-sharp ${selectedTab === 'location' ? 'bg-blue-800 text-blue-300' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setSelectedTab('location')}
              >
                By Location
              </button>
            </div>
          </div>

          {renderBarChart()}

          <div className="mt-4 text-xs text-gray-500 text-center">
            Click on a bar to select a category. Click on a legend item to toggle its visibility.
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Current View: Equipment distribution by platoon shows how assets are allocated across different units.
          </div>
        </div>

        {/* EQUIPMENT READINESS TREND */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-300 uppercase font-medium tracking-wider flex items-center">
              EQUIPMENT READINESS TREND
              <button className="ml-1 p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </h3>
            
            <button className="p-1 hover:bg-gray-800 rounded-none btn-sharp">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="mb-2 text-sm text-gray-400">
            Operational readiness over time
          </div>

          {renderLineChart()}

          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              Showing last 6 months data
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Target (90%+)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span>Acceptable (70-90%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Critical (&lt;70%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL EQUIPMENT STATUS SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-none p-4 mb-6 dashboard-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm text-gray-300 uppercase font-medium tracking-wider flex items-center">
            CRITICAL EQUIPMENT STATUS
            <button className="ml-1 p-1 hover:bg-gray-800 rounded-none btn-sharp">
              <Info className="h-4 w-4 text-gray-500" />
            </button>
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input 
                placeholder="Search equipment..." 
                className="pl-8 py-1 h-8 text-xs bg-gray-800 border-gray-700 text-gray-300"
              />
            </div>
            <div className="flex">
              <button className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-l">All Items</button>
              <button className="px-3 py-1 bg-gray-900 text-gray-500 text-xs border border-gray-700 rounded-r">Issues Only</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 font-medium text-gray-400">Equipment</th>
                <th className="text-left py-2 font-medium text-gray-400">Serial/Bumper#</th>
                <th className="text-left py-2 font-medium text-gray-400">Status</th>
                <th className="text-left py-2 font-medium text-gray-400">Location</th>
                <th className="text-left py-2 font-medium text-gray-400">Issue</th>
                <th className="text-left py-2 font-medium text-gray-400">Action Required</th>
                <th className="text-left py-2 font-medium text-gray-400">Due</th>
              </tr>
            </thead>
            <tbody>
              {criticalEquipmentData.map((item, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-3">{item.equipment}</td>
                  <td className="py-3">{item.serialNumber}</td>
                  <td className="py-3">
                    <span 
                      className="px-2 py-1 rounded text-xs" 
                      style={{ 
                        backgroundColor: `${item.statusColor}20`, 
                        color: item.statusColor 
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">{item.location}</td>
                  <td className="py-3">{item.issue}</td>
                  <td className="py-3">
                    <button 
                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded text-xs"
                    >
                      {item.action}
                    </button>
                  </td>
                  <td className={`py-3 ${item.due === 'OVERDUE' ? 'text-red-500' : item.due === 'TODAY' ? 'text-yellow-500' : ''}`}>
                    {item.due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <div>Showing 4 of 4 equipment items</div>
          <div>Click on a row to select it</div>
        </div>
      </div>

      {/* BOTTOM SECTION - REQUIREMENTS AND ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UPCOMING ACCOUNTABILITY REQUIREMENTS */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider">
            UPCOMING ACCOUNTABILITY REQUIREMENTS
          </h3>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-yellow-500 mr-1" />
              <h4 className="text-sm font-medium text-yellow-500">WEEKLY REQUIREMENTS</h4>
            </div>
            
            <div className="space-y-3">
              {accountabilityRequirements.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">Due: {item.due}</p>
                  </div>
                  <div className="text-yellow-500 text-sm">{item.timeframe}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-blue-500 mr-1" />
              <h4 className="text-sm font-medium text-blue-500">MONTHLY REQUIREMENTS</h4>
            </div>
            
            <div className="space-y-3">
              {monthlyRequirements.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">Due: {item.due}</p>
                  </div>
                  <div>
                    <p className="text-yellow-500 text-sm">{item.timeframe}</p>
                    <p className="text-xs text-yellow-700 text-right">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROPERTY ACCOUNTABILITY ACTIVITY */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider">
            PROPERTY ACCOUNTABILITY ACTIVITY
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 font-medium text-gray-400">Date</th>
                  <th className="text-left py-2 font-medium text-gray-400">Time</th>
                  <th className="text-left py-2 font-medium text-gray-400">Activity</th>
                  <th className="text-left py-2 font-medium text-gray-400">Personnel</th>
                  <th className="text-left py-2 font-medium text-gray-400">Details</th>
                  <th className="text-left py-2 font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {accountabilityActivities.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-2">{item.date}</td>
                    <td className="py-2">{item.time}</td>
                    <td className="py-2">{item.activity}</td>
                    <td className="py-2">{item.personnel}</td>
                    <td className="py-2">{item.details}</td>
                    <td className="py-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          item.status === 'Complete' 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-blue-900/30 text-blue-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="p-3 bg-blue-800 hover:bg-blue-700 text-white rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      <QRScannerModal 
        isOpen={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;