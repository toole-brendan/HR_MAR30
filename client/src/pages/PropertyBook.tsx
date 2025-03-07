import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { inventory } from "@/lib/mockData";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  FileText,
  Clipboard,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Plus,
  Sliders,
  Search,
  Clock,
  Info,
  HelpCircle,
  ShieldCheck,
  Users,
  Truck,
  Shield,
  Wrench,
  Radio,
  Inbox,
  Package,
  BarChart2,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
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

// Extended mock data for property book
const myPropertyItems = [
  {
    id: "p1",
    name: "M4A1 Carbine",
    serialNumber: "M4-10045874",
    category: "Weapon",
    assignedDate: "01/15/2023",
    status: "FMC", // Fully Mission Capable
    location: "Arms Room",
    value: 1200,
    lastServiced: "11/02/2022"
  },
  {
    id: "p2",
    name: "ACOG Scope",
    serialNumber: "AC-5874126",
    category: "Optics",
    assignedDate: "01/15/2023",
    status: "FMC",
    location: "Arms Room",
    value: 950,
    lastServiced: "12/15/2022"
  },
  {
    id: "p3",
    name: "Night Vision Goggles",
    serialNumber: "NVG-45782",
    category: "Optics",
    assignedDate: "02/20/2023",
    status: "NMC", // Not Mission Capable
    location: "Maintenance",
    value: 3500,
    lastServiced: "01/10/2023"
  },
  {
    id: "p4",
    name: "Tactical Radio",
    serialNumber: "TR-874521",
    category: "Communications",
    assignedDate: "03/05/2023",
    status: "PMC", // Partially Mission Capable
    location: "Comms Room",
    value: 2800,
    lastServiced: "02/28/2023"
  },
  {
    id: "p5",
    name: "Ballistic Vest",
    serialNumber: "BV-102458",
    category: "Protective Gear",
    assignedDate: "01/10/2023",
    status: "FMC",
    location: "Supply Room",
    value: 1600,
    lastServiced: "12/05/2022"
  }
];

const unitInventoryItems = [
  {
    id: "u1",
    name: "HMMWV",
    serialNumber: "HV-45874",
    category: "Vehicle",
    assignedTo: "1SG Miller",
    status: "FMC",
    location: "Motor Pool",
    value: 150000,
    lastServiced: "01/15/2023"
  },
  {
    id: "u2",
    name: "JLTV",
    serialNumber: "JL-78452",
    category: "Vehicle",
    assignedTo: "SSG Roberts",
    status: "PMC",
    location: "Motor Pool",
    value: 250000,
    lastServiced: "02/10/2023"
  },
  {
    id: "u3",
    name: "50 Cal Machine Gun",
    serialNumber: "50MG-1245",
    category: "Weapon",
    assignedTo: "SGT Davis",
    status: "FMC",
    location: "Arms Room",
    value: 14000,
    lastServiced: "02/01/2023"
  },
  {
    id: "u4",
    name: "Field Medical Kit",
    serialNumber: "MK-7845",
    category: "Medical",
    assignedTo: "SPC Lee",
    status: "FMC",
    location: "Medical Bay",
    value: 5000,
    lastServiced: "01/20/2023"
  },
  {
    id: "u5",
    name: "Command Tent",
    serialNumber: "CT-4587",
    category: "Field Equipment",
    assignedTo: "SSG Johnson",
    status: "NMC",
    location: "Storage",
    value: 8500,
    lastServiced: "12/10/2022"
  },
  {
    id: "u6",
    name: "Long Range Radio",
    serialNumber: "LRR-5478",
    category: "Communications",
    assignedTo: "SPC Williams",
    status: "PMC",
    location: "Comms Room",
    value: 12000,
    lastServiced: "02/15/2023"
  }
];

const equipmentReadiness = [
  {
    id: "e1",
    category: "Vehicles",
    totalCount: 12,
    fmcCount: 8,
    pmcCount: 3,
    nmcCount: 1,
    readinessRate: 66.7,
    trend: "stable"
  },
  {
    id: "e2",
    category: "Weapons",
    totalCount: 45,
    fmcCount: 42,
    pmcCount: 2,
    nmcCount: 1,
    readinessRate: 93.3,
    trend: "improving"
  },
  {
    id: "e3",
    category: "Communications",
    totalCount: 28,
    fmcCount: 22,
    pmcCount: 4,
    nmcCount: 2,
    readinessRate: 78.6,
    trend: "declining"
  },
  {
    id: "e4",
    category: "Medical",
    totalCount: 15,
    fmcCount: 15,
    pmcCount: 0,
    nmcCount: 0,
    readinessRate: 100.0,
    trend: "stable"
  },
  {
    id: "e5",
    category: "Field Equipment",
    totalCount: 35,
    fmcCount: 30,
    pmcCount: 3,
    nmcCount: 2,
    readinessRate: 85.7,
    trend: "stable"
  }
];

const PropertyBook: React.FC = () => {
  const [selectedInventoryTab, setSelectedInventoryTab] = useState("myProperty");
  const [selectedReadinessTab, setSelectedReadinessTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter property items based on search query
  const filteredMyProperty = useMemo(() => {
    if (!searchQuery) return myPropertyItems;
    return myPropertyItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, myPropertyItems]);

  const filteredUnitInventory = useMemo(() => {
    if (!searchQuery) return unitInventoryItems;
    return unitInventoryItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, unitInventoryItems]);

  // Calculate equipment readiness statistics
  const readinessStats = useMemo(() => {
    const totalEquipment = equipmentReadiness.reduce((sum, category) => sum + category.totalCount, 0);
    const totalFMC = equipmentReadiness.reduce((sum, category) => sum + category.fmcCount, 0);
    const totalPMC = equipmentReadiness.reduce((sum, category) => sum + category.pmcCount, 0);
    const totalNMC = equipmentReadiness.reduce((sum, category) => sum + category.nmcCount, 0);
    
    const overallReadiness = totalEquipment > 0 
      ? parseFloat(((totalFMC / totalEquipment) * 100).toFixed(1)) 
      : 0;
    
    return {
      totalEquipment,
      totalFMC,
      totalPMC,
      totalNMC,
      overallReadiness
    };
  }, [equipmentReadiness]);

  // Create data for charts
  const categoryReadinessData = useMemo(() => {
    return equipmentReadiness.map(category => ({
      name: category.category,
      FMC: category.fmcCount,
      PMC: category.pmcCount,
      NMC: category.nmcCount,
      readinessRate: category.readinessRate
    }));
  }, [equipmentReadiness]);

  const handleAddItem = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The ability to add new property items will be available in the next update.",
      duration: 3000,
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your property book report is being generated.",
      duration: 3000,
    });
  };

  const handlePrintQRCodes = () => {
    toast({
      title: "Print QR Codes",
      description: "Preparing QR codes for selected items.",
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FMC': return colors.status.success;
      case 'PMC': return colors.status.warning;
      case 'NMC': return colors.status.danger;
      default: return colors.status.info;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ChevronDown className="h-4 w-4 text-green-500 transform rotate-180" />;
      case 'declining': return <ChevronDown className="h-4 w-4 text-red-500" />;
      default: return <ArrowUpDown className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Render bar chart for equipment readiness
  const renderReadinessBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryReadinessData} barGap={2} barCategoryGap={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="name" stroke="#CCCCCC" />
          <YAxis stroke="#CCCCCC" />
          <Tooltip 
            contentStyle={{backgroundColor: '#222', border: 'none'}}
            itemStyle={{color: '#EEE'}}
          />
          <Legend wrapperStyle={{bottom: 0, left: 25}} />
          <Bar dataKey="FMC" stackId="a" fill="#4CAF50" name="Fully Mission Capable" />
          <Bar dataKey="PMC" stackId="a" fill="#FFC107" name="Partially Mission Capable" />
          <Bar dataKey="NMC" stackId="a" fill="#F44336" name="Not Mission Capable" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render pie chart for readiness percentage
  const renderReadinessPieChart = () => {
    const data = [
      { name: 'FMC', value: readinessStats.totalFMC, color: '#4CAF50' },
      { name: 'PMC', value: readinessStats.totalPMC, color: '#FFC107' },
      { name: 'NMC', value: readinessStats.totalNMC, color: '#F44336' }
    ];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{backgroundColor: '#222', border: 'none'}}
            itemStyle={{color: '#EEE'}}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen w-full px-4 pb-4 pt-2 dashboard-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
            onClick={handleGenerateReport}
          >
            <FileText className="h-4 w-4 mr-2" /> Generate Reports
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
            onClick={handlePrintQRCodes}
          >
            <Printer className="h-4 w-4 mr-2" /> Print QR Codes
          </Button>
        </div>
      </div>

      {/* PAGE INFO ROW */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Property Book</h2>
          <p className="text-sm text-gray-400">Hand Receipt Management</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          Last updated: 25FEB2025 0842
        </div>
      </div>
      
      {/* TOP INFO CARDS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-blue-900/40 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-blue-300 mb-1">Total Assigned Items</div>
          <div className="text-xl font-bold">{myPropertyItems.length}</div>
        </div>
        <div className="bg-green-900/30 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-green-300 mb-1">Equipment Value</div>
          <div className="text-xl font-bold">${myPropertyItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</div>
        </div>
        <div className="bg-yellow-900/40 p-3 rounded-none flex-1 text-center dashboard-card">
          <div className="text-xs text-yellow-300 mb-1">Overall Readiness</div>
          <div className="text-xl font-bold">{readinessStats.overallReadiness}%</div>
        </div>
      </div>

      {/* PROPERTY BOOK MAIN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* LEFT COLUMN - MY PROPERTY */}
        <div className="md:col-span-2">
          {/* MY PROPERTY CARD */}
          <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden dashboard-card mb-6">
            <div className="p-3 bg-blue-900/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-800/50 rounded-none">
                  <Clipboard className="h-5 w-5 text-blue-300" />
                </div>
                <div className="uppercase text-xs tracking-wider text-gray-300">INVENTORY MANAGEMENT</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/50 p-1 h-auto"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/50 p-1 h-auto"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Tab Selection */}
            <div className="flex border-b border-gray-800">
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  selectedInventoryTab === "myProperty" 
                    ? "bg-blue-900/20 text-blue-300 border-b-2 border-blue-500"
                    : "text-gray-400 hover:bg-gray-800/50"
                }`}
                onClick={() => setSelectedInventoryTab("myProperty")}
              >
                My Property
              </button>
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  selectedInventoryTab === "unitInventory" 
                    ? "bg-blue-900/20 text-blue-300 border-b-2 border-blue-500"
                    : "text-gray-400 hover:bg-gray-800/50"
                }`}
                onClick={() => setSelectedInventoryTab("unitInventory")}
              >
                Unit Inventory
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-800 bg-gray-900/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="w-full bg-gray-800 border-gray-700 text-gray-300 pl-10 focus:ring-1 focus:ring-blue-500"
                  placeholder={`Search ${selectedInventoryTab === "myProperty" ? "my property" : "unit inventory"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Content Based on Selected Tab */}
            <div className="p-0">
              {selectedInventoryTab === "myProperty" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Serial #</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Last Serviced</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMyProperty.map((item) => (
                        <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="px-4 py-3 font-medium text-blue-300">{item.name}</td>
                          <td className="px-4 py-3">{item.serialNumber}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium"
                              style={{ backgroundColor: `${getStatusColor(item.status)}30`, color: getStatusColor(item.status) }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{item.location}</td>
                          <td className="px-4 py-3">${item.value.toLocaleString()}</td>
                          <td className="px-4 py-3">{item.lastServiced}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Serial #</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnitInventory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="px-4 py-3 font-medium text-blue-300">{item.name}</td>
                          <td className="px-4 py-3">{item.serialNumber}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3">{item.assignedTo}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium"
                              style={{ backgroundColor: `${getStatusColor(item.status)}30`, color: getStatusColor(item.status) }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{item.location}</td>
                          <td className="px-4 py-3">${item.value.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - EQUIPMENT READINESS */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card mb-6">
            <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider flex justify-between items-center">
              EQUIPMENT READINESS
              <button className="p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </h3>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-bold text-green-500">{readinessStats.overallReadiness}%</span>
                <span className="text-xs text-gray-400">Overall FMC Rate</span>
              </div>
              
              <div className="w-full bg-gray-700 h-2 mb-4">
                <div 
                  className="bg-green-500 h-2" 
                  style={{width: `${readinessStats.overallReadiness}%`}}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-green-900/20 p-2">
                  <div className="text-xs text-green-300 mb-1">FMC</div>
                  <div className="text-sm font-bold">{readinessStats.totalFMC}</div>
                </div>
                <div className="bg-yellow-900/20 p-2">
                  <div className="text-xs text-yellow-300 mb-1">PMC</div>
                  <div className="text-sm font-bold">{readinessStats.totalPMC}</div>
                </div>
                <div className="bg-red-900/20 p-2">
                  <div className="text-xs text-red-300 mb-1">NMC</div>
                  <div className="text-sm font-bold">{readinessStats.totalNMC}</div>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="mt-4">
              <h4 className="text-xs text-gray-400 uppercase mb-3 font-medium tracking-wider">CATEGORY BREAKDOWN</h4>
              <div className="space-y-3">
                {equipmentReadiness.map((category) => (
                  <div key={category.id} className="bg-gray-800/50 p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold">{category.readinessRate}%</span>
                        {getTrendIcon(category.trend)}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{category.fmcCount}/{category.totalCount} FMC</span>
                      <div className="ml-auto flex space-x-2">
                        <span className="text-yellow-300">{category.pmcCount} PMC</span>
                        <span className="text-red-300">{category.nmcCount} NMC</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduled Services */}
          <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
            <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider flex justify-between items-center">
              UPCOMING SERVICES
              <button className="p-1 hover:bg-gray-800 rounded-none btn-sharp">
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </h3>

            <div className="space-y-3">
              <div className="bg-gray-800/50 p-3 border-l-2 border-yellow-500">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">Night Vision Goggles</span>
                  <span className="text-xs text-yellow-300">28FEB</span>
                </div>
                <div className="text-xs text-gray-400">Annual Calibration</div>
              </div>
              <div className="bg-gray-800/50 p-3 border-l-2 border-red-500">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">Tactical Radio</span>
                  <span className="text-xs text-red-300">OVERDUE</span>
                </div>
                <div className="text-xs text-gray-400">Maintenance Request</div>
              </div>
              <div className="bg-gray-800/50 p-3 border-l-2 border-blue-500">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">M4A1 Carbine</span>
                  <span className="text-xs text-blue-300">15MAR</span>
                </div>
                <div className="text-xs text-gray-400">90-Day Inspection</div>
              </div>
            </div>

            <button className="w-full text-center bg-blue-800/50 text-blue-300 py-2 px-4 rounded-none text-xs btn-sharp mt-4">
              VIEW ALL SCHEDULED SERVICES
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Equipment Readiness Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider flex justify-between items-center">
            EQUIPMENT READINESS BY CATEGORY
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-800 rounded-none">
                <Download className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-800 rounded-none">
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </h3>
          {renderReadinessBarChart()}
        </div>

        {/* Equipment Status Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-none p-4 dashboard-card">
          <h3 className="text-sm text-gray-300 uppercase mb-4 font-medium tracking-wider flex justify-between items-center">
            EQUIPMENT STATUS DISTRIBUTION
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-800 rounded-none">
                <Download className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-800 rounded-none">
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </h3>
          <div className="flex flex-col items-center">
            {renderReadinessPieChart()}
            <div className="flex justify-center space-x-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: '#4CAF50' }}></div>
                <span className="text-xs">FMC ({readinessStats.totalFMC})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: '#FFC107' }}></div>
                <span className="text-xs">PMC ({readinessStats.totalPMC})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: '#F44336' }}></div>
                <span className="text-xs">NMC ({readinessStats.totalNMC})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button 
          className="bg-blue-800/50 hover:bg-blue-700/50 text-blue-300 rounded-none btn-sharp"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
        <Button 
          className="bg-green-800/50 hover:bg-green-700/50 text-green-300 rounded-none btn-sharp"
          onClick={handleGenerateReport}
        >
          <FileText className="h-4 w-4 mr-2" /> Generate FLIPL Report
        </Button>
        <Button 
          className="bg-purple-800/50 hover:bg-purple-700/50 text-purple-300 rounded-none btn-sharp"
          onClick={handlePrintQRCodes}
        >
          <Printer className="h-4 w-4 mr-2" /> Print QR Codes
        </Button>
      </div>
    </div>
  );
};

export default PropertyBook;