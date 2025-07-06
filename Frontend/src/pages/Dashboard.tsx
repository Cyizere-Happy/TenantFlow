import React, { useEffect } from 'react';
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  FileText,
  Wrench,
  PieChart,
  Activity,
  Home,
  CreditCard,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import { t } from '../utils/i18n';
import { notificationService } from '../services/notificationService';

const Dashboard: React.FC = () => {
  const { getDashboardStats, tenants, payments, complaints, properties, maintenanceRecords, settings, loadProperties, loadTenants, loadPayments, loadComplaints, loadMaintenanceRecords } = useStore();
  const stats = getDashboardStats();
  
  const recentPayments = payments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentComplaints = complaints
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  const recentMaintenance = maintenanceRecords
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  
  const upcomingMaintenance = maintenanceRecords
    .filter(r => r.status === 'pending' || r.status === 'in_progress')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);
  
  // Get smart notifications
  const smartNotifications = notificationService.generateSmartNotifications();
  const urgentNotifications = smartNotifications.filter(n => n.priority === 'urgent').slice(0, 3);
  const highPriorityNotifications = smartNotifications.filter(n => n.priority === 'high').slice(0, 3);
  
  const statCards = [
    {
      title: t('totalIncome'),
      value: formatCurrency(stats.totalIncome, settings.currency),
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: t('totalExpenses'),
      value: formatCurrency(stats.totalExpenses, settings.currency),
      icon: TrendingDown,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      change: '+8.2%',
      changeType: 'negative'
    },
    {
      title: t('netIncome'),
      value: formatCurrency(stats.netIncome, settings.currency),
      icon: TrendingUp,
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      title: t('occupancyRate'),
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: Home,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: t('activeProperties'),
      value: stats.activeProperties,
      icon: Building,
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: t('activeTenants'),
      value: stats.activeTenants,
      icon: Users,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      change: '+5',
      changeType: 'positive'
    },
    {
      title: t('overdueRent'),
      value: formatCurrency(stats.overdueRent, settings.currency),
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      change: '-1,200',
      changeType: 'positive'
    },
    {
      title: t('pendingMaintenance'),
      value: stats.pendingMaintenance,
      icon: Wrench,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      change: '-3',
      changeType: 'positive'
    }
  ];
  
  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  useEffect(() => {
    loadProperties();
    loadTenants();
    loadPayments();
    loadComplaints();
    loadMaintenanceRecords();
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('welcomeBackDashboard')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
            <Calendar className="h-4 w-4 mr-2 inline" />
            {t('monthlyReport')}
          </button>
        </div>
      </div>
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`${stat.iconBg} p-2 rounded-lg`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                
                <div className="flex items-center">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{t('vsLastMonth')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Smart Notifications Alert */}
      {(urgentNotifications.length > 0 || highPriorityNotifications.length > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t('urgentNotifications')}
            </h2>
            <a href="/notifications" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
              {t('viewAll')}
            </a>
          </div>
          
          <div className="space-y-3">
            {urgentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-100">{notification.title}</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{notification.message}</p>
                </div>
                {notification.actionUrl && (
                  <a 
                    href={notification.actionUrl}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    {t('takeAction')}
                  </a>
                )}
              </div>
            ))}
            
            {highPriorityNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">{notification.title}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">{notification.message}</p>
                </div>
                {notification.actionUrl && (
                  <a 
                    href={notification.actionUrl}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                  >
                    {t('takeAction')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Monthly Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary-600" />
            {t('monthlyOverview')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">{t('monthlyIncome')}</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">{formatCurrency(stats.monthlyIncome, settings.currency)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{t('monthlyExpenses')}</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">{formatCurrency(stats.monthlyExpenses, settings.currency)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-400">{t('netProfit')}</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300">{formatCurrency(stats.monthlyIncome - stats.monthlyExpenses, settings.currency)}</p>
              </div>
              <Activity className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              {t('recentPayments')}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
              {t('viewAll')}
            </button>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map((payment) => {
              const tenant = tenants.find(t => t._id === payment.tenantId);
              const property = properties.find(p => p._id === tenant?.propertyId);
              
              return (
                <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{property?.name} • Unit {tenant?.unitNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount, settings.currency)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(payment.date), 'MMM dd')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-orange-600" />
              {t('recentMaintenance')}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
              {t('viewAll')}
            </button>
          </div>
          
          <div className="space-y-4">
            {recentMaintenance.map((maintenance) => {
              const property = properties.find(p => p._id === maintenance.propertyId);
              
              return (
                <div key={maintenance._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">{maintenance.title}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getMaintenanceStatusColor(maintenance.status)}`}>
                          {maintenance.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{property?.name} {maintenance.unitNumber && `• Unit ${maintenance.unitNumber}`}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{maintenance.vendor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(maintenance.cost, settings.currency)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriorityColor(maintenance.priority)}`}>
                        {maintenance.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              {t('upcomingMaintenance')}
            </h2>
          </div>
          
          <div className="space-y-4">
            {upcomingMaintenance.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('noUpcomingMaintenance')}</p>
              </div>
            ) : (
              upcomingMaintenance.map((maintenance) => {
                const property = properties.find(p => p._id === maintenance.propertyId);
                
                return (
                  <div key={maintenance._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">{maintenance.title}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(maintenance.priority)}`}>
                            {maintenance.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property?.name} {maintenance.unitNumber && `• Unit ${maintenance.unitNumber}`}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled: {format(new Date(maintenance.scheduledDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(maintenance.cost, settings.currency)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Recent Complaints */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-red-600" />
              {t('recentComplaints')}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
              {t('viewAll')}
            </button>
          </div>
          
          <div className="space-y-4">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('noRecentComplaints')}</p>
              </div>
            ) : (
              recentComplaints.map((complaint) => {
                const tenant = tenants.find(t => t._id === complaint.tenantId);
                const urgencyColors = {
                  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                };
                
                return (
                  <div key={complaint._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">{complaint.title}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${urgencyColors[complaint.urgency]}`}>
                            {complaint.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{tenant?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <Bell className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-purple-600" />
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 transition-all duration-200 group">
            <Building className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-primary-900 dark:text-primary-100">{t('addProperty')}</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group">
            <Users className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-green-900 dark:text-green-100">{t('addTenant')}</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 transition-all duration-200 group">
            <Wrench className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-orange-900 dark:text-orange-100">{t('scheduleMaintenance')}</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/30 transition-all duration-200 group">
            <FileText className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-purple-900 dark:text-purple-100">{t('generateReport')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;