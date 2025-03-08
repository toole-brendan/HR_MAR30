import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Save, 
  LogOut, 
  Moon, 
  Sun, 
  RefreshCw, 
  Shield, 
  Bell, 
  QrCode, 
  Database, 
  Smartphone, 
  UserCircle, 
  Settings as SettingsIcon,
  Zap,
  Activity,
  Clock,
  Cloud,
  Loader2
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";

// Form schema for profile
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  rank: z.string().optional(),
  unit: z.string().optional(),
});

// Form schema for security settings
const securityFormSchema = z.object({
  requirePinForSensitive: z.boolean().default(true),
  showItemDetails: z.boolean().default(true),
  autoLogout: z.string().default("30"),
  pinTimeout: z.string().default("5"),
});

// Form schema for QR settings
const qrFormSchema = z.object({
  defaultPrintSize: z.string().default("medium"),
  autoRegenerate: z.boolean().default(false),
  includeName: z.boolean().default(true),
  includeSerialNumber: z.boolean().default(true),
  scanConfirmation: z.boolean().default(true),
});

// Form schema for notification settings
const notificationFormSchema = z.object({
  enableNotifications: z.boolean().default(true),
  transferRequests: z.boolean().default(true),
  statusUpdates: z.boolean().default(true),
  systemAlerts: z.boolean().default(true),
  dailyDigest: z.boolean().default(false),
});

// Form schema for sync settings
const syncFormSchema = z.object({
  autoSync: z.boolean().default(true),
  syncInterval: z.string().default("15"),
  syncOnWifiOnly: z.boolean().default(false),
  lastSynced: z.string().optional(),
});

// Define types from schemas
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type QRFormValues = z.infer<typeof qrFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type SyncFormValues = z.infer<typeof syncFormSchema>;

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useApp();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: "john.doe@military.gov",
      phone: "555-123-4567",
      rank: user?.rank || "",
      unit: user?.unit || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      requirePinForSensitive: true,
      showItemDetails: true,
      autoLogout: "30",
      pinTimeout: "5",
    },
  });

  // QR settings form
  const qrForm = useForm<QRFormValues>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      defaultPrintSize: "medium",
      autoRegenerate: false,
      includeName: true,
      includeSerialNumber: true,
      scanConfirmation: true,
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      enableNotifications: true,
      transferRequests: true,
      statusUpdates: true,
      systemAlerts: true,
      dailyDigest: false,
    },
  });

  // Sync settings form
  const syncForm = useForm<SyncFormValues>({
    resolver: zodResolver(syncFormSchema),
    defaultValues: {
      autoSync: true,
      syncInterval: "15",
      syncOnWifiOnly: false,
      lastSynced: new Date().toISOString(),
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated",
    });
  };

  const onSecuritySubmit = (data: SecurityFormValues) => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved",
    });
  };

  const onQRSubmit = (data: QRFormValues) => {
    toast({
      title: "QR Code Settings Updated",
      description: "Your QR code preferences have been saved",
    });
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const onSyncSubmit = (data: SyncFormValues) => {
    toast({
      title: "Sync Settings Updated",
      description: "Your synchronization preferences have been saved",
    });
  };

  // Handle manual sync
  const handleManualSync = () => {
    setIsSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Sync Complete",
        description: "Your data has been successfully synchronized",
      });
      
      // Update last synced time
      syncForm.setValue('lastSynced', new Date().toISOString());
    }, 2000);
  };

  // Format the last synced date
  const formatLastSynced = (dateString?: string) => {
    if (!dateString) return "Never";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <StandardPageLayout 
      title="Settings" 
      description="Manage your account settings and preferences"
      size="lg"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="qr-codes" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">QR Codes</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Sync</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                          </FormControl>
                          <FormDescription>
                            Contact admin to update name
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="rank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rank</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Configure appearance preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark mode</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleTheme}
                      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                      {theme === 'light' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Device ID</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">DVC-{user?.id || "000000"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        toast({
                          title: "Device Reset",
                          description: "Device ID has been regenerated",
                        });
                      }}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-1"
                    onClick={() => {
                      toast({
                        title: "Account Preferences Reset",
                        description: "Your settings have been restored to defaults",
                      });
                    }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Reset Preferences</span>
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center gap-1"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure access and security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="requirePinForSensitive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">PIN for Sensitive Items</FormLabel>
                          <FormDescription>
                            Require PIN verification for sensitive item access
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="showItemDetails"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Item Details</FormLabel>
                          <FormDescription>
                            Display sensitive item details in listings
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <FormField
                    control={securityForm.control}
                    name="autoLogout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Logout (minutes)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeout" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Automatically log out after period of inactivity
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="pinTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Verification Timeout (minutes)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeout" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="0">Every time</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often to require PIN re-entry for sensitive items
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced">
                      <AccordionTrigger className="text-sm font-medium">
                        Advanced Security Options
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Biometric Authentication</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Use fingerprint or face ID when available</p>
                            </div>
                            <Switch disabled />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Secure Boot</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Verify app integrity on startup</p>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Security Log Cleared",
                                description: "Your login history has been cleared",
                              });
                            }}
                          >
                            Clear Security Log
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Button type="submit" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Save Security Settings</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* QR Code Settings */}
        <TabsContent value="qr-codes">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>Configure QR code generation and scanning preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...qrForm}>
                <form onSubmit={qrForm.handleSubmit(onQRSubmit)} className="space-y-6">
                  <FormField
                    control={qrForm.control}
                    name="defaultPrintSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default QR Code Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Small (1.5" x 1.5")</SelectItem>
                            <SelectItem value="medium">Medium (2" x 2")</SelectItem>
                            <SelectItem value="large">Large (3" x 3")</SelectItem>
                            <SelectItem value="xlarge">Extra Large (4" x 4")</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Standard size for printing QR codes
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={qrForm.control}
                    name="autoRegenerate"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Regenerate Damaged QR Codes</FormLabel>
                          <FormDescription>
                            Automatically generate replacement QR codes when damage is reported
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={qrForm.control}
                      name="includeName"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Item Name</FormLabel>
                            <FormDescription>
                              Print item name on QR code label
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={qrForm.control}
                      name="includeSerialNumber"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Serial Number</FormLabel>
                            <FormDescription>
                              Print serial number on QR code label
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={qrForm.control}
                    name="scanConfirmation"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Scan Confirmation</FormLabel>
                          <FormDescription>
                            Require confirmation after scanning before processing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">QR Code Format</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      HandReceipt uses a secure, blockchain-verified format for all QR codes
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Error Correction:</div>
                      <div>High (Level H)</div>
                      
                      <div className="font-medium">Encryption:</div>
                      <div>AES-256</div>
                      
                      <div className="font-medium">Verification:</div>
                      <div>SHA-256 hash</div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    <span>Save QR Settings</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alerts and notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Notifications</FormLabel>
                          <FormDescription>
                            Master toggle for all notification types
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className={notificationForm.watch("enableNotifications") ? "" : "opacity-50 pointer-events-none"}>
                    <h3 className="text-base font-medium mb-4">Notification Types</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="transferRequests"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Transfer Requests</FormLabel>
                              <FormDescription>
                                Notifications for incoming and outgoing transfers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("enableNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="statusUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Status Updates</FormLabel>
                              <FormDescription>
                                Notifications for inventory status changes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("enableNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="systemAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Alerts</FormLabel>
                              <FormDescription>
                                Notifications for sensitive item verifications and system events
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("enableNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="dailyDigest"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Daily Digest</FormLabel>
                              <FormDescription>
                                Daily summary of all activity and pending actions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("enableNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="flex items-center gap-1"
                    disabled={!notificationForm.watch("enableNotifications")}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Save Notification Settings</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sync Settings */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization</CardTitle>
              <CardDescription>Configure blockchain synchronization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...syncForm}>
                <form onSubmit={syncForm.handleSubmit(onSyncSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-medium">Blockchain Status</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last synchronized: {formatLastSynced(syncForm.watch("lastSynced"))}
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="h-4 w-4" />
                          <span>Sync Now</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <FormField
                    control={syncForm.control}
                    name="autoSync"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Synchronization</FormLabel>
                          <FormDescription>
                            Automatically sync data with blockchain ledger
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={syncForm.control}
                    name="syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sync Interval (minutes)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!syncForm.watch("autoSync")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="360">6 hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often to synchronize with the blockchain
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={syncForm.control}
                    name="syncOnWifiOnly"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sync on Wi-Fi Only</FormLabel>
                          <FormDescription>
                            Only perform automatic sync when connected to Wi-Fi
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!syncForm.watch("autoSync")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced">
                      <AccordionTrigger className="text-sm font-medium">
                        Advanced Sync Options
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Offline Mode</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Allow operation without blockchain connectivity</p>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Background Sync</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Sync when app is not in use</p>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Sync Cache Cleared",
                                description: "Your local cache has been cleared",
                              });
                            }}
                          >
                            Clear Sync Cache
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Button type="submit" className="flex items-center gap-1">
                    <Database className="h-4 w-4" />
                    <span>Save Sync Settings</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and synchronization statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">System Performance</h3>
                  </div>
                  <p className="text-2xl font-semibold">98.7%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uptime last 30 days</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Sync Speed</h3>
                  </div>
                  <p className="text-2xl font-semibold">1.2s</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average sync time</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Last Full Sync</h3>
                  </div>
                  <p className="text-2xl font-semibold">36m</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">36 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
};

export default Settings;
