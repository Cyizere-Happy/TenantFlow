import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  User,
  Building,
  DollarSign, 
  Wrench,
  MessageSquare, 
  FileText,
  Download,
  Filter as FilterIcon,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Sparkles,
  Zap,
  Target,
  Shield,
  Star,
  Heart,
  ArrowRight,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { t } from '../utils/i18n';
import { SmartNotification } from '../services/notificationService';

const Notifications: React.FC = () => {
  const { 
    getSmartNotifications, 
    getNotificationSummary, 
    markSmartNotificationAsRead,
    clearAllSmartNotifications,
    properties, 
    tenants,
    payments,
    complaints,
    maintenanceRecords,
    loadProperties, 
    loadTenants,
    loadPayments,
    loadComplaints,
    loadMaintenanceRecords
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedNotification, setSelectedNotification] = useState<SmartNotification | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [summary, setSummary] = useState({ total: 0, urgent: 0, high: 0, actionRequired: 0, unread: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          loadProperties(),
          loadTenants(),
          loadPayments(),
          loadComplaints(),
          loadMaintenanceRecords()
        ]);
        refreshNotifications();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadAllData();
  }, [loadProperties, loadTenants, loadPayments, loadComplaints, loadMaintenanceRecords]);

  const refreshNotifications = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const smartNotifications = getSmartNotifications();
      const notificationSummary = getNotificationSummary();
      setNotifications(smartNotifications);
      setSummary(notificationSummary);
      setIsRefreshing(false);
    }, 500);
  };

  const filteredNotifications = notifications
    .filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof SmartNotification];
      let bValue: any = b[sortBy as keyof SmartNotification];
      
      if (sortBy === 'createdAt' || sortBy === 'readAt' || sortBy === 'expiresAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'read': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'archived': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Bell className="h-4 w-4" />;
      case 'read': return <CheckCircle className="h-4 w-4" />;
      case 'archived': return <XCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-50 text-green-700 border-green-200';
      case 'maintenance': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'complaint': return 'bg-red-50 text-red-700 border-red-200';
      case 'system': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reminder': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'alert': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'property': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'tenant': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'complaint': return <MessageSquare className="h-4 w-4" />;
      case 'system': return <Info className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'property': return <Building className="h-4 w-4" />;
      case 'tenant': return <User className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      markSmartNotificationAsRead(notificationId);
      // The notifications will be regenerated on next render
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleMarkAllAsRead = () => {
    const allNotifications = getSmartNotifications();
    allNotifications.forEach(notification => {
      if (notification.status === 'unread') {
        markSmartNotificationAsRead(notification.id);
      }
    });
    refreshNotifications();
  };

  const handleActionClick = (notification: SmartNotification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getTabNotifications = (tab: string) => {
    switch (tab) {
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent');
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      case 'action':
        return notifications.filter(n => n.actionRequired);
      case 'unread':
        return notifications.filter(n => n.status === 'unread');
      default:
        return notifications;
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length, icon: Bell },
    { id: 'urgent', label: 'Urgent', count: summary.urgent, icon: Zap },
    { id: 'high', label: 'High Priority', count: summary.high, icon: Target },
    { id: 'action', label: 'Action Required', count: summary.actionRequired, icon: Shield },
    { id: 'unread', label: 'Unread', count: summary.unread, icon: Eye }
  ];
  
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('notifications')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('smartNotificationsForAdmin')}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={handleRefresh}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('refresh')}</span>
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('markAllAsRead')}</span>
          </button>
        </div>
      </div>
      
      {/* Responsive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        {[
          { title: 'Total', value: summary.total, icon: Bell, color: 'text-blue-600' },
          { title: 'Urgent', value: summary.urgent, icon: Zap, color: 'text-red-600' },
          { title: 'High Priority', value: summary.high, icon: Target, color: 'text-orange-600' },
          { title: 'Action Required', value: summary.actionRequired, icon: Shield, color: 'text-purple-600' },
          { title: 'Unread', value: summary.unread, icon: Eye, color: 'text-gray-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
              <div className={`p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
            </div>
            </div>
          </div>
        ))}
        </div>

      {/* Responsive Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-none sm:rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border-b-2 border-primary-500 sm:border-b-0'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm sm:text-base">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  activeTab === tab.id 
                    ? 'bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t('searchNotifications')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('filters')}</span>
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
            >
              <option value="createdAt">{t('sortByDate')}</option>
              <option value="priority">{t('sortByPriority')}</option>
              <option value="type">{t('sortByType')}</option>
              <option value="status">{t('sortByStatus')}</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('status')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="unread">{t('unread')}</option>
                  <option value="read">{t('read')}</option>
                  <option value="archived">{t('archived')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('type')}</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="payment">{t('payment')}</option>
                  <option value="maintenance">{t('maintenance')}</option>
                  <option value="complaint">{t('complaint')}</option>
                  <option value="system">{t('system')}</option>
                  <option value="reminder">{t('reminder')}</option>
                  <option value="alert">{t('alert')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('priority')}</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">{t('allPriorities')}</option>
                  <option value="urgent">{t('urgent')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="low">{t('low')}</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setPriorityFilter('all');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  {t('clearFilters')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Notifications List */}
      <div className="space-y-3 sm:space-y-4">
        {getTabNotifications(activeTab).map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200 ${
              notification.status === 'unread' 
                ? 'border-l-4 border-l-primary-500' 
                : ''
            } ${notification.actionRequired ? 'ring-1 ring-orange-200 dark:ring-orange-800' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`p-2 rounded-lg border flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{notification.title}</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                        {getStatusIcon(notification.status)}
                        <span className="ml-1 hidden sm:inline">{notification.status}</span>
                      </span>
                      {notification.actionRequired && (
                        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          {t('actionRequired')}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{notification.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                {notification.status === 'unread' && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title={t('markAsRead')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={() => setSelectedNotification(notification)}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {notification.actionUrl && (
                <button 
                    onClick={() => handleActionClick(notification)}
                    className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
                >
                    {t('takeAction')}
                </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {getTabNotifications(activeTab).length === 0 && (
          <div className="text-center py-8 sm:py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noNotificationsFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{t('noNotificationsMatchFilters')}</p>
        </div>
      )}
      </div>

      {/* Responsive Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-4">{selectedNotification.title}</h2>
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <XCircle className="h-6 w-6 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('notificationDetails')}</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('message')}:</span>
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">{selectedNotification.message}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('type')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(selectedNotification.type)}`}>
                        {selectedNotification.type}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('priority')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('status')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedNotification.status)}`}>
                        {selectedNotification.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('timeline')}</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('createdAt')}:</span>
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">{new Date(selectedNotification.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedNotification.readAt && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('readAt')}:</span>
                        <span className="text-gray-900 dark:text-white text-sm sm:text-base">{new Date(selectedNotification.readAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedNotification.expiresAt && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('expiresAt')}:</span>
                        <span className="text-gray-900 dark:text-white text-sm sm:text-base">{new Date(selectedNotification.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('actionRequired')}:</span>
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">{selectedNotification.actionRequired ? t('yes') : t('no')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedNotification.actionUrl && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('actions')}</h3>
                  <a 
                    href={selectedNotification.actionUrl}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t('takeAction')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;