import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Users, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut,
  Wrench,
  X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useStore();
  
  const menuItems = [
    { to: '/', icon: Home, label: t('dashboard') },
    { to: '/properties', icon: Building, label: t('properties') },
    { to: '/tenants', icon: Users, label: t('tenants') },
    { to: '/payments', icon: DollarSign, label: t('payments') },
    { to: '/maintenance', icon: Wrench, label: t('maintenance') },
    { to: '/reports', icon: FileText, label: t('reports') },
    { to: '/complaints', icon: MessageSquare, label: t('complaints') },
    { to: '/notifications', icon: Bell, label: t('notifications') },
    { to: '/settings', icon: Settings, label: t('settings') }
  ];
  
  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:fixed
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('rentManager')}</h1>
                  <p className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-medium">{t('pro')}</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Navigation - Scrollable if needed */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto min-h-0 scrollbar-thin">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 group text-sm sm:text-base
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 dark:from-primary-900/20 dark:to-primary-800/20 dark:text-primary-400 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 hover:shadow-sm'
                  }
                `}
              >
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                  location.pathname === item.to ? 'text-primary-600 dark:text-primary-400' : ''
                }`} />
                <span className="font-medium truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          {/* User Profile - Fixed at bottom */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group text-sm"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-medium truncate">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;