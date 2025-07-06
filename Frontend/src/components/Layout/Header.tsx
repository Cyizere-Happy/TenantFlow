import React from 'react';
import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/i18n';
import { notificationService } from '../../services/notificationService';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { notifications, settings, updateSettings } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get smart notification count
  const smartNotifications = notificationService.generateSmartNotifications();
  const urgentCount = smartNotifications.filter(n => n.priority === 'urgent').length;
  const highPriorityCount = smartNotifications.filter(n => n.priority === 'high').length;
  const totalSmartNotifications = urgentCount + highPriorityCount;
  
  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    
    // Apply dark mode immediately to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Apply dark mode on component mount and when settings change
  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors duration-200"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPropertiesTenants')}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title={settings.darkMode ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {settings.darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <div className="relative group">
            <a 
              href="/notifications" 
              className="relative p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-colors duration-200 group-hover:text-primary-600" />
              
              {(unreadCount > 0 || totalSmartNotifications > 0) && (
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-red-500 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                      {totalSmartNotifications > 0 ? totalSmartNotifications : unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification indicator for urgent items */}
              {urgentCount > 0 && (
                <div className="absolute -bottom-1 -right-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                </div>
              )}
            </a>
            
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('notifications')}
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  {urgentCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        {t('urgent')}
                      </span>
                      <span className="font-medium">{urgentCount}</span>
                    </div>
                  )}
                  {highPriorityCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        {t('highPriority')}
                      </span>
                      <span className="font-medium">{highPriorityCount}</span>
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {t('unread')}
                      </span>
                      <span className="font-medium">{unreadCount}</span>
                    </div>
                  )}
                  {urgentCount === 0 && highPriorityCount === 0 && unreadCount === 0 && (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                      {t('noNewNotifications')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;