import { X, CheckCircle, Clock, Bell, AlertCircle } from "lucide-react";
import { notifications } from "@/lib/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop - close when clicked */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-hidden shadow-xl z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium",
              activeTab === 'all' 
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium",
              activeTab === 'unread' 
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </button>
        </div>
        
        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications to display
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredNotifications.map((notification) => {
                // Select icon based on notification type
                let Icon = Bell;
                let iconColor = "text-gray-400";
                
                if (notification.type === 'transfer-request') {
                  Icon = Clock;
                  iconColor = "text-yellow-500";
                } else if (notification.type === 'transfer-approved') {
                  Icon = CheckCircle;
                  iconColor = "text-green-500";
                } else if (notification.type === 'system-alert') {
                  Icon = AlertCircle;
                  iconColor = "text-red-500";
                }
                
                return (
                  <li 
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      !notification.read && "bg-blue-50 dark:bg-blue-900/10"
                    )}
                  >
                    <div className="flex">
                      <div className={cn("flex-shrink-0 mr-3", iconColor)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {notification.timeAgo}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-900 dark:text-white transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;