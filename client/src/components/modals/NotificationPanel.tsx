import { useState } from "react";
import { notifications } from "@/lib/mockData";
import NotificationItem from "../common/NotificationItem";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notificationsList, setNotificationsList] = useState(notifications);

  const markAllAsRead = () => {
    setNotificationsList(
      notificationsList.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl">
          <div className="flex flex-col h-full">
            <div className="p-4 bg-[#1C2541] text-white flex justify-between items-center">
              <h3 className="font-bold">Notifications</h3>
              <button 
                type="button" 
                className="text-gray-200 hover:text-white"
                onClick={onClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {notificationsList.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button 
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
