import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { notifications } from '@/lib/mockData';
import { Notification } from '@/types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const transferRequests = notifications.filter(n => n.type === 'transfer-request');
  const systemNotifications = notifications.filter(n => n.type !== 'transfer-request');
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-md sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Mark all as read
            </Button>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {notifications.length === 0 ? (
              <EmptyState />
            ) : (
              notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="transfers" className="space-y-4">
            {transferRequests.length === 0 ? (
              <EmptyState />
            ) : (
              transferRequests.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            {systemNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              systemNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// NotificationItem component
const NotificationItem = ({ notification }: { notification: Notification }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'transfer-request':
        return <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">↔</div>;
      case 'transfer-approved':
        return <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">✓</div>;
      case 'system-alert':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">!</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center"><Bell className="h-4 w-4" /></div>;
    }
  };
  
  return (
    <div className={`p-3 rounded-lg border ${notification.read ? 'border-gray-200 dark:border-gray-800 bg-transparent' : 'border-blue-100 dark:border-blue-900/20 bg-blue-50 dark:bg-blue-900/5'}`}>
      <div className="flex items-start space-x-3">
        {getIcon(notification.type)}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.timeAgo}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
          
          {notification.type === 'transfer-request' && (
            <div className="flex items-center justify-end mt-2 space-x-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
                Approve
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                Reject
              </Button>
            </div>
          )}
          
          {(notification.type === 'system-alert' || notification.type === 'other') && (
            <div className="flex items-center mt-2">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary">
                View Details <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Bell className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="font-medium mb-1">No notifications</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
    </div>
  );
};

export default NotificationPanel;