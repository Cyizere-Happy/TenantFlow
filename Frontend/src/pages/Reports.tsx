import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Building,
  Users,
  AlertTriangle,
  Wrench,
  PieChart,
  BarChart3,
  LineChart,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, subMonths, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'react-toastify';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Reports: React.FC = () => {
  const { 
    payments, 
    tenants, 
    properties, 
    maintenanceRecords, 
    settings,
    user,
    isAuthenticated,
    loadPayments, 
    loadTenants, 
    loadProperties, 
    loadMaintenanceRecords 
  } = useStore();
  
  const [dateRange, setDateRange] = useState<{startDate: Date, endDate: Date}>({
    startDate: subMonths(new Date(), 6),
    endDate: new Date()
  });
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Reports: Loading data...');
    setIsLoading(true);
    Promise.all([
      loadPayments(),
      loadTenants(),
      loadProperties(),
      loadMaintenanceRecords()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Debug data loading
  useEffect(() => {
    console.log('Reports: Data loaded:', {
      payments: payments.length,
      tenants: tenants.length,
      properties: properties.length,
      maintenanceRecords: maintenanceRecords.length
    });
    
    // Log any errors from the store
    const { error } = useStore.getState();
    if (error) {
      console.error('Store error:', error);
    }
  }, [payments, tenants, properties, maintenanceRecords]);

  // Calculate comprehensive financial metrics
  const financialMetrics = React.useMemo(() => {
    const filteredPayments = payments.filter(p => 
      new Date(p.date) >= dateRange.startDate && new Date(p.date) <= dateRange.endDate
    );
    const filteredMaintenance = maintenanceRecords.filter(m => 
      new Date(m.createdAt) >= dateRange.startDate && new Date(m.createdAt) <= dateRange.endDate
    );

    const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalMaintenanceCost = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const netProfit = totalIncome - totalMaintenanceCost;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const overdueTenants = tenants.filter(t => {
      const lastPayment = payments
        .filter(p => p.tenantId === t.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (!lastPayment) return true;
      const monthsSincePayment = (new Date().getTime() - new Date(lastPayment.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSincePayment > 1;
    }).length;

    const currentMonth = format(new Date(), 'yyyy-MM');
    const currentMonthPayments = payments.filter(p => 
      format(new Date(p.date), 'yyyy-MM') === currentMonth
    );
    const currentMonthIncome = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
    const previousMonthPayments = payments.filter(p => 
      format(new Date(p.date), 'yyyy-MM') === previousMonth
    );
    const previousMonthIncome = previousMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const incomeGrowth = previousMonthIncome > 0 ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0;

    return {
      totalIncome,
      totalMaintenanceCost,
      netProfit,
      totalProperties: properties.length,
      activeTenants,
      overdueTenants,
      currentMonthIncome,
      previousMonthIncome,
      incomeGrowth,
      averageRent: activeTenants > 0 ? totalIncome / activeTenants : 0,
      occupancyRate: properties.length > 0 ? (activeTenants / properties.reduce((sum, p) => sum + p.units, 0)) * 100 : 0
    };
  }, [payments, maintenanceRecords, properties, tenants, dateRange]);

  // Monthly income chart data
  const monthlyIncomeData = React.useMemo(() => {
    const months = eachMonthOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    });

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthPayments = payments.filter(p => 
        format(new Date(p.date), 'yyyy-MM') === monthStr
      );
      const monthMaintenance = maintenanceRecords.filter(m => 
        format(new Date(m.createdAt), 'yyyy-MM') === monthStr
      );

      return {
        month: format(month, 'MMM yyyy'),
        income: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        maintenance: monthMaintenance.reduce((sum, m) => sum + m.cost, 0),
        netProfit: monthPayments.reduce((sum, p) => sum + p.amount, 0) - monthMaintenance.reduce((sum, m) => sum + m.cost, 0)
      };
    });
  }, [payments, maintenanceRecords, dateRange]);

  // Property performance data
  const propertyPerformance = React.useMemo(() => {
    return properties.map(property => {
      const propertyTenants = tenants.filter(t => t.propertyId === property.id);
      const propertyPayments = payments.filter(p => 
        propertyTenants.some(t => t.id === p.tenantId) &&
        new Date(p.date) >= dateRange.startDate && 
        new Date(p.date) <= dateRange.endDate
      );
      const propertyMaintenance = maintenanceRecords.filter(m => 
        m.propertyId === property.id &&
        new Date(m.createdAt) >= dateRange.startDate && 
        new Date(m.createdAt) <= dateRange.endDate
      );

      const totalIncome = propertyPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalMaintenanceCost = propertyMaintenance.reduce((sum, m) => sum + m.cost, 0);
      const netProfit = totalIncome - totalMaintenanceCost;
      const occupancyRate = (propertyTenants.filter(t => t.status === 'active').length / property.units) * 100;
      const monthlyPotential = property.units * property.rentPerUnit;
      const roi = totalIncome > 0 ? ((totalIncome - totalMaintenanceCost) / totalIncome) * 100 : 0;

      return {
        property,
        totalIncome,
        totalMaintenanceCost,
        netProfit,
        activeTenants: propertyTenants.filter(t => t.status === 'active').length,
        occupancyRate,
        monthlyPotential,
        roi
      };
    });
  }, [properties, tenants, payments, maintenanceRecords, dateRange]);

  // Per-tenant detailed reports
  const tenantReports = React.useMemo(() => {
    return tenants.map(tenant => {
      const tenantPayments = payments.filter(p => 
        p.tenantId === tenant.id &&
        new Date(p.date) >= dateRange.startDate && 
        new Date(p.date) <= dateRange.endDate
      );
      const property = properties.find(p => p.id === tenant.propertyId);
      const tenantMaintenance = maintenanceRecords.filter(m => 
        m.propertyId === tenant.propertyId && 
        m.unitNumber === tenant.unitNumber &&
        new Date(m.createdAt) >= dateRange.startDate && 
        new Date(m.createdAt) <= dateRange.endDate
      );

      const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalMaintenanceCost = tenantMaintenance.reduce((sum, m) => sum + m.cost, 0);
      const expectedRent = tenant.monthlyRent * ((dateRange.endDate.getFullYear() - dateRange.startDate.getFullYear()) * 12 + (dateRange.endDate.getMonth() - dateRange.startDate.getMonth() + 1));
      const arrears = Math.max(0, expectedRent - totalPaid);
      const advancePayment = tenant.monthlyRent * 2;
      const currentMonth = format(new Date(), 'yyyy-MM');
      const hasCurrentMonthPayment = tenantPayments.some(p => 
        format(new Date(p.date), 'yyyy-MM') === currentMonth
      );

      const lastPayment = tenantPayments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      return {
        tenant,
        property,
        totalPaid,
        totalMaintenanceCost,
        netContribution: totalPaid - totalMaintenanceCost,
        expectedRent,
        arrears,
        advancePayment,
        advancePaid: totalPaid >= advancePayment,
        currentMonthPaid: hasCurrentMonthPayment,
        overdueAmount: hasCurrentMonthPayment ? 0 : tenant.monthlyRent,
        lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'MMM dd, yyyy') : 'Never',
        paymentsCount: tenantPayments.length,
        maintenanceCount: tenantMaintenance.length,
        averageMonthlyPayment: tenantPayments.length > 0 ? totalPaid / tenantPayments.length : 0,
        paymentStatus: arrears > 0 ? 'overdue' : hasCurrentMonthPayment ? 'current' : 'partial'
      };
    });
  }, [tenants, payments, properties, maintenanceRecords, dateRange]);

  // Filtered data based on filters
  const filteredTenantReports = React.useMemo(() => {
    return tenantReports.filter(report => {
      if (filterTenant !== 'all' && report.tenant.id !== filterTenant) return false;
      if (filterProperty !== 'all' && report.tenant.propertyId !== filterProperty) return false;
      if (filterLocation !== 'all') {
        const property = properties.find(p => p.id === report.tenant.propertyId);
        if (!property || !property.address.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      }
      if (filterStatus !== 'all' && report.paymentStatus !== filterStatus) return false;
      return true;
    });
  }, [tenantReports, filterTenant, filterProperty, filterLocation, filterStatus, properties]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExportPDF = () => {
    console.log('Reports PDF export clicked');
    try {
      // Export comprehensive reports
      exportToPDF.properties(properties, 'Properties Report');
      exportToPDF.tenants(tenants, properties, 'Tenants Report');
      exportToPDF.payments(payments, tenants, properties, 'Payments Report');
      exportToPDF.maintenance(maintenanceRecords, properties, 'Maintenance Report');
      toast.success('Reports exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting reports to PDF:', error);
      toast.error('Error exporting reports to PDF');
    }
  };

  const handleExportExcel = () => {
    console.log('Reports Excel export clicked');
    try {
      // Export comprehensive reports
      exportToExcel.properties(properties, 'properties-report.xlsx');
      exportToExcel.tenants(tenants, properties, 'tenants-report.xlsx');
      exportToExcel.payments(payments, tenants, properties, 'payments-report.xlsx');
      exportToExcel.maintenance(maintenanceRecords, properties, 'maintenance-report.xlsx');
      toast.success('Reports exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting reports to Excel:', error);
      toast.error('Error exporting reports to Excel');
    }
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to view reports.</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  // Check if we have any data
  const hasData = payments.length > 0 || tenants.length > 0 || properties.length > 0 || maintenanceRecords.length > 0;
  
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No data found. Please ensure you have:</p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Properties added to the system</li>
            <li>• Tenants assigned to properties</li>
            <li>• Payment records created</li>
            <li>• Maintenance records logged</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Data loaded: {payments.length} payments, {tenants.length} tenants, {properties.length} properties, {maintenanceRecords.length} maintenance records
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive financial and operational insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h2>
          <Filter className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  startDate: new Date(e.target.value)
                })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
              />
              <span className="text-gray-500 dark:text-gray-400 self-center">to</span>
              <input
                type="date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  endDate: new Date(e.target.value)
                })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
              />
            </div>
          </div>

          {/* Tenant Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tenant</label>
            <select
              value={filterTenant}
              onChange={e => setFilterTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option key="all-tenants" value="all">All Tenants</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property</label>
            <select
              value={filterProperty}
              onChange={e => setFilterProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option key="all-properties" value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option key="all-locations" value="all">All Locations</option>
              {[...new Set(properties.map(p => p.address.split(',')[1]?.trim() || ''))].filter(Boolean).map((loc, index) => (
                <option key={`location-${index}-${loc}`} value={loc}>{loc}</option>
              ))}
            </select>
                </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
            >
              <option key="all-status" value="all">All Status</option>
              <option key="current-status" value="current">Current</option>
              <option key="overdue-status" value="overdue">Overdue</option>
              <option key="partial-status" value="partial">Partial</option>
            </select>
                </div>
              </div>
            </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'financial', label: 'Financial Summary', icon: DollarSign },
              { id: 'tenants', label: 'Tenant Analysis', icon: Users },
              { id: 'properties', label: 'Property Performance', icon: Building },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Income</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(financialMetrics.totalIncome, settings.currency)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {isNaN(financialMetrics.incomeGrowth) ? '0.0' : (financialMetrics.incomeGrowth > 0 ? '+' : '') + financialMetrics.incomeGrowth.toFixed(1)}% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Net Profit</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(financialMetrics.netProfit, settings.currency)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {financialMetrics.totalIncome > 0 ? (financialMetrics.netProfit > 0 ? '+' : '') + ((financialMetrics.netProfit / financialMetrics.totalIncome) * 100).toFixed(1) : '0.0'}% margin
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Active Tenants</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{financialMetrics.activeTenants}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {financialMetrics.occupancyRate.toFixed(1)}% occupancy rate
                      </p>
                </div>
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Properties</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{financialMetrics.totalProperties}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {properties.reduce((sum, p) => sum + p.units, 0)} total units
                      </p>
                </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <Building className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Income Chart */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Income Trend</h3>
                <div className="h-80">
                  {monthlyIncomeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyIncomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value), settings.currency)}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                      />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
            </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available for chart
                  </div>
                )}
                </div>
          </div>
        </div>
      )}

          {/* Financial Summary Tab */}
          {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Income</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(financialMetrics.totalIncome, settings.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Maintenance Costs</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(financialMetrics.totalMaintenanceCost, settings.currency)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-white font-semibold">Net Profit</span>
                        <span className={`font-bold text-lg ${financialMetrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(financialMetrics.netProfit, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit Margin Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit Margin</h3>
                  <div className="h-64">
                    {financialMetrics.totalIncome > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                  <Pie
                    data={[
                            { name: 'Net Profit', value: Math.max(0, financialMetrics.netProfit), color: '#10B981' },
                            { name: 'Maintenance', value: financialMetrics.totalMaintenanceCost, color: '#F59E0B' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                          {[
                            { name: 'Net Profit', value: Math.max(0, financialMetrics.netProfit), color: '#10B981' },
                            { name: 'Maintenance', value: financialMetrics.totalMaintenanceCost, color: '#F59E0B' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value), settings.currency)}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                        />
                                              </PieChart>
              </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        No data available for chart
                      </div>
                    )}
                  </div>
                </div>
            </div>
            </div>
          )}

          {/* Tenant Analysis Tab */}
          {activeTab === 'tenants' && (
            <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tenant</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Property</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Unit</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Total Paid</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Expected</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Arrears</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Last Payment</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredTenantReports.map((report) => (
                      <tr key={report.tenant.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{report.tenant.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{report.tenant.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {report.property?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {report.tenant.unitNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.paymentStatus === 'current' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : report.paymentStatus === 'overdue'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {report.paymentStatus === 'current' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {report.paymentStatus === 'overdue' && <XCircle className="h-3 w-3 mr-1" />}
                            {report.paymentStatus === 'partial' && <Clock className="h-3 w-3 mr-1" />}
                            {report.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(report.totalPaid, settings.currency)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {formatCurrency(report.expectedRent, settings.currency)}
                        </td>
                        <td className="py-3 px-4">
                          {report.arrears > 0 ? (
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {formatCurrency(report.arrears, settings.currency)}
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Paid</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {report.lastPaymentDate}
                    </td>
                        <td className="py-3 px-4">
                          <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            <Eye className="h-4 w-4" />
                          </button>
                    </td>
                  </tr>
                    ))}
                </tbody>
              </table>
          </div>
        </div>
      )}

          {/* Property Performance Tab */}
          {activeTab === 'properties' && (
        <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {propertyPerformance.map((performance) => (
                  <div key={performance.property.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{performance.property.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        performance.roi > 20 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        performance.roi > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {performance.roi.toFixed(1)}% ROI
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Income</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(performance.totalIncome, settings.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {formatCurrency(performance.totalMaintenanceCost, settings.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Net Profit</span>
                        <span className={`font-semibold ${performance.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(performance.netProfit, settings.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {performance.occupancyRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Active Tenants</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {performance.activeTenants}/{performance.property.units}
                          </span>
                      </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Maintenance Cost</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(financialMetrics.totalMaintenanceCost, settings.currency)}
                      </p>
                    </div>
                    <Wrench className="h-8 w-8 text-orange-500" />
                  </div>
                      </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                          <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance Records</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRecords.length}
                            </p>
                          </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Cost per Record</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maintenanceRecords.length > 0 ? formatCurrency(financialMetrics.totalMaintenanceCost / maintenanceRecords.length, settings.currency) : 'N/A'}
                      </p>
                          </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Maintenance Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Property</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Unit</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Issue</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Cost</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                      {maintenanceRecords
                        .filter(m => new Date(m.createdAt) >= dateRange.startDate && new Date(m.createdAt) <= dateRange.endDate)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 10)
                        .map((record) => {
                          const property = properties.find(p => p.id === record.propertyId);
                      return (
                            <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {property?.name || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {record.unitNumber}
                              </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {record.description}
                              </td>
                          <td className="py-3 px-4">
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                  {formatCurrency(record.cost, settings.currency)}
                            </span>
                          </td>
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.status === 'completed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : record.status === 'in-progress'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
    </div>
  );
};

export default Reports;