import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Calendar, Tag, Award, Truck, Radio, Eye, AlertTriangle, Star, FileText } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { PageHeader } from '@/components/ui/page-header';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageWrapper withPadding={true}>
        <PageHeader title="Profile" className="mb-4 sm:mb-5 md:mb-6" />
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <PageWrapper withPadding={true}>
      <PageHeader 
        title="Personnel Profile" 
        description="View and manage your military personnel information"
        className="mb-4 sm:mb-5 md:mb-6"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Personnel Information</CardTitle>
            <Badge className="bg-green-600">{user.rank}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4 pt-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <p className="text-muted-foreground">{user.position}</p>
                <p className="text-sm text-muted-foreground">{user.unit}</p>
              </div>
              
              <Separator />
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Years of Service
                  </span>
                  <span className="font-semibold">{user.yearsOfService} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Time in Command
                  </span>
                  <span className="font-semibold">{user.commandTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" /> ID Number
                  </span>
                  <span className="font-semibold">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" /> Responsibility
                  </span>
                  <span className="font-semibold">Primary Hand Receipt Holder</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Property Management Overview</CardTitle>
              <CardDescription>Current property value: {user.valueManaged}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PropertyCard 
                  icon={<Truck className="h-5 w-5" />}
                  title="Vehicles"
                  count={user.equipmentSummary?.vehicles || 0}
                  color="bg-blue-500"
                />
                <PropertyCard 
                  icon={<Shield className="h-5 w-5" />}
                  title="Weapons"
                  count={user.equipmentSummary?.weapons || 0}
                  color="bg-red-500"
                />
                <PropertyCard 
                  icon={<Radio className="h-5 w-5" />}
                  title="Comms"
                  count={user.equipmentSummary?.communications || 0}
                  color="bg-green-500"
                />
                <PropertyCard 
                  icon={<Eye className="h-5 w-5" />}
                  title="Optics"
                  count={user.equipmentSummary?.opticalSystems || 0}
                  color="bg-purple-500"
                />
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> 
                    Sensitive Items Accountability
                  </h4>
                  <span className="text-sm font-medium">{user.equipmentSummary?.sensitiveItems || 0} items</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Last 100% sensitive items inventory: 6 hours ago
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="upcoming">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="career">Career Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="p-0 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Key Accountability Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {user.upcomingEvents?.map((event, i) => (
                      <li key={i} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                        <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">Timeline: {event.date}</p>
                        </div>
                      </li>
                    ))}
                    <li className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Monthly Sensitive Items Inventory</p>
                        <p className="text-sm text-muted-foreground">Due: 15 days</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <Calendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Quarterly Hand Receipt Reconciliation</p>
                        <p className="text-sm text-muted-foreground">Due: 37 days</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="career" className="p-0 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Career Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Property Accountability Score</span>
                        <span className="text-sm font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Transfer Completion Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Supply Requisition Efficiency</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Total Transfers Completed</h4>
                        <p className="text-2xl font-bold">287</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Equipment Status Rate</h4>
                        <p className="text-2xl font-bold">93%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}

// Helper component for property cards
function PropertyCard({ 
  icon, 
  title, 
  count, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  count: number; 
  color: string;
}) {
  return (
    <div className="border rounded-lg p-4 flex items-center space-x-4">
      <div className={`${color} p-2 rounded-full text-white`}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  );
}