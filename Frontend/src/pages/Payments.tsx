import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Filter as FilterIcon,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Payment } from '../types';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import { toast } from 'react-toastify';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Payments: React.FC = () => {
  const { payments, tenants, properties, settings, addPayment, updatePayment, deletePayment, loadPayments } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'bank_transfer' | 'card' | 'check'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadPayments();
  }, []);
  
  const filteredPayments = payments.filter(payment => {
    const tenant = tenants.find(t => t._id === payment.tenantId);
    const property = properties.find(p => p._id === tenant?.propertyId);
    
    const matchesSearch = tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.amount.toString().includes(searchTerm);
    const matchesFilter = filterMethod === 'all' || payment.method === filterMethod;
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week':
          matchesDate = paymentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          matchesDate = paymentDate >= thirtyDaysAgo;
          break;
        case 'quarter':
          matchesDate = paymentDate >= ninetyDaysAgo;
          break;
      }
    }
    return matchesSearch && matchesFilter && matchesDate;
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = new Date(formData.get('date') as string);
    
    const paymentData = {
      tenantId: formData.get('tenantId') as string,
      amount: parseFloat(formData.get('amount') as string),
      method: formData.get('method') as 'cash' | 'bank_transfer' | 'card' | 'check',
      date: date,
      month: format(date, 'yyyy-MM'),
      year: date.getFullYear(),
      isPartial: formData.get('isPartial') === 'on',
      notes: formData.get('notes') as string,
      receiptGenerated: false
    };
    
    if (editingPayment) {
      updatePayment(editingPayment._id, paymentData);
    } else {
      addPayment(paymentData);
    }
    
    setShowForm(false);
    setEditingPayment(null);
  };
  
  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeletePayment'))) {
      try {
        await deletePayment(id);
        toast.success(t('paymentDeleted'));
      } catch (error) {
        toast.error(t('errorDeletingPayment'));
      }
    }
  };
  
  const handleGenerateReceipt = (payment: Payment) => {
    const tenant = tenants.find(t => t._id === payment.tenantId);
    toast.success(`${t('receiptGeneratedFor')} ${tenant?.name} - ${formatCurrency(payment.amount, settings.currency)}`);
  };
  
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'check': return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'card': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      case 'bank_transfer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'check': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
    monthlyTotal: payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return paymentDate >= thirtyDaysAgo && p.status === 'paid';
      })
      .reduce((sum, p) => sum + p.amount, 0)
  };
  
  const handleExportPDF = () => {
    exportToPDF.payments(payments, tenants, properties, 'Payments Report');
  };

  const handleExportExcel = () => {
    exportToExcel.payments(payments, tenants, properties, 'payments-report.xlsx');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('payments')}</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Export to PDF"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Export to Excel"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addPayment')}</span>
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalPayments')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPayments}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalAmount')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalAmount, 'RWF')}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('monthlyTotal')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyTotal, 'RWF')}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('averagePayment')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averagePayment, 'RWF')}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
                placeholder={t('searchPayments')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <FilterIcon className="h-4 w-4" />
              <span>{t('filters')}</span>
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="date">{t('sortByDate')}</option>
              <option value="amount">{t('sortByAmount')}</option>
              <option value="status">{t('sortByStatus')}</option>
              <option value="method">{t('sortByMethod')}</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('status')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="paid">{t('paid')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="overdue">{t('overdue')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('paymentMethod')}</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t('allMethods')}</option>
                  <option value="cash">{t('cash')}</option>
                  <option value="bank_transfer">{t('bankTransfer')}</option>
                  <option value="card">{t('card')}</option>
                  <option value="check">{t('check')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dateRange')}</label>
          <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t('allTime')}</option>
                  <option value="today">{t('today')}</option>
                  <option value="week">{t('thisWeek')}</option>
                  <option value="month">{t('thisMonth')}</option>
                  <option value="quarter">{t('thisQuarter')}</option>
          </select>
        </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setMethodFilter('all');
                    setDateFilter('all');
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('clearFilters')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Payments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('receiptNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('method')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => {
                const tenant = tenants.find(t => t._id === payment.tenantId);
                const property = properties.find(p => p._id === payment.propertyId);
                
                return (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.receiptNumber}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{payment.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{property?.name} • {t('unit')} {tenant?.unitNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount, 'RWF')}</div>
                      {payment.lateFees > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">+{formatCurrency(payment.lateFees, 'RWF')} {t('lateFees')}</div>
                      )}
                      {payment.discount > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400">-{formatCurrency(payment.discount, 'RWF')} {t('discount')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getMethodColor(payment.method)}`}>
                        {payment.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noPaymentsFound')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('noPaymentsMatchFilters')}</p>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('paymentDetails')}</h2>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="h-6 w-6 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('paymentInformation')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('receiptNumber')}:</span>
                      <span className="text-gray-900 dark:text-white">{selectedPayment.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('amount')}:</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount, 'RWF')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('date')}:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(selectedPayment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('method')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(selectedPayment.method)}`}>
                        {selectedPayment.method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('status')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
              </div>
              
              <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tenantInformation')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('tenant')}:</span>
                      <span className="text-gray-900 dark:text-white">{tenants.find(t => t._id === selectedPayment.tenantId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('property')}:</span>
                      <span className="text-gray-900 dark:text-white">{properties.find(p => p._id === selectedPayment.propertyId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('description')}:</span>
                      <span className="text-gray-900 dark:text-white">{selectedPayment.description}</span>
                    </div>
                    {selectedPayment.lateFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('lateFees')}:</span>
                        <span className="text-red-600 dark:text-red-400">{formatCurrency(selectedPayment.lateFees, 'RWF')}</span>
                      </div>
                    )}
                    {selectedPayment.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('discount')}:</span>
                        <span className="text-green-600 dark:text-green-400">-{formatCurrency(selectedPayment.discount, 'RWF')}</span>
              </div>
                    )}
              </div>
              </div>
              </div>
              </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPayment ? t('editPayment') : t('addPayment')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPayment(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Details */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('tenant')}
                  </label>
                  <select
                    name="tenantId"
                    required
                    defaultValue={editingPayment?.tenantId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectTenant')}</option>
                    {tenants.map((tenant) => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.firstName} {tenant.lastName} - {tenant.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('amount')}
                    </label>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      defaultValue={editingPayment?.amount}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Payment amount"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('paymentDate')}
                    </label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      defaultValue={editingPayment?.paymentDate}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('paymentMethod')}
                  </label>
                  <select
                    name="paymentMethod"
                    required
                    defaultValue={editingPayment?.paymentMethod}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectPaymentMethod')}</option>
                    <option value="cash">{t('cash')}</option>
                    <option value="bank_transfer">{t('bankTransfer')}</option>
                    <option value="check">{t('check')}</option>
                    <option value="online">{t('online')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('status')}
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingPayment?.status}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectStatus')}</option>
                    <option value="paid">{t('paid')}</option>
                    <option value="pending">{t('pending')}</option>
                    <option value="overdue">{t('overdue')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('notes')}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingPayment?.notes}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder="Add any additional notes about this payment"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      editingPayment ? t('update') : t('add')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPayment(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;