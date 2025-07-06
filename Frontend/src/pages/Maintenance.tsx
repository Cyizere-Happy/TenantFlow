import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Building,
  MapPin,
  FileText,
  Download,
  Filter as FilterIcon,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MaintenanceRecord } from '../types';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import { toast } from 'react-toastify';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Maintenance: React.FC = () => {
  const { maintenanceRecords, properties, tenants, loadMaintenanceRecords, loadProperties, loadTenants, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadMaintenanceRecords();
    loadProperties();
    loadTenants();
  }, []);
  
  const filteredRecords = maintenanceRecords
    .filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter;
      const matchesProperty = propertyFilter === 'all' || record.propertyId === propertyFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesProperty;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof MaintenanceRecord];
      let bValue: any = b[sortBy as keyof MaintenanceRecord];
      
      if (sortBy === 'cost') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortBy === 'createdAt' || sortBy === 'scheduledDate' || sortBy === 'completedDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const recordData = {
      propertyId: formData.get('propertyId') as string,
      unitNumber: formData.get('unitNumber') as string || undefined,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as MaintenanceRecord['category'],
      cost: parseFloat(formData.get('cost') as string),
      vendor: formData.get('vendor') as string,
      contactPerson: formData.get('contactPerson') as string,
      contactPhone: formData.get('contactPhone') as string,
      status: formData.get('status') as MaintenanceRecord['status'],
      priority: formData.get('priority') as MaintenanceRecord['priority'],
      scheduledDate: new Date(formData.get('scheduledDate') as string),
      completedDate: formData.get('completedDate') ? new Date(formData.get('completedDate') as string) : undefined,
      notes: formData.get('notes') as string || undefined,
      receipts: []
    };
    
    setIsSubmitting(true);
    setError(null);
    
    addMaintenanceRecord(recordData)
      .then(() => {
        toast.success(t('maintenanceRecordAdded'));
        setShowForm(false);
        setEditingRecord(null);
      })
      .catch((err) => {
        toast.error(t('errorAddingMaintenance'));
        setError(err.message || t('anErrorOccurred'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  const handleEdit = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setEditingRecord(record);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeleteMaintenance'))) {
      try {
        await deleteMaintenanceRecord(id);
        toast.success(t('maintenanceDeleted'));
      } catch (error) {
        toast.error(t('errorDeletingMaintenance'));
      }
    }
  };
  
  const handleExportPDF = () => {
    exportToPDF.maintenance(maintenanceRecords, properties, 'Maintenance Report');
  };
  
  const handleExportExcel = () => {
    exportToExcel.maintenance(maintenanceRecords, properties, 'maintenance-report.xlsx');
  };
  
  const getStatusColor = (status: string) => {
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const stats = {
    totalRecords: maintenanceRecords.length,
    pendingRecords: maintenanceRecords.filter(r => r.status === 'pending').length,
    inProgressRecords: maintenanceRecords.filter(r => r.status === 'in_progress').length,
    completedRecords: maintenanceRecords.filter(r => r.status === 'completed').length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + r.cost, 0),
    averageCost: maintenanceRecords.length > 0 ? maintenanceRecords.reduce((sum, r) => sum + r.cost, 0) / maintenanceRecords.length : 0,
    emergencyRecords: maintenanceRecords.filter(r => r.priority === 'emergency').length
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('maintenance')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('manageYourMaintenance')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button 
            onClick={handleExportPDF}
            className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            title="Export to PDF"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            title="Export to Excel"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => {
              setSelectedRecord(null);
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addMaintenance')}</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalRecords')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecords}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 sm:p-3 rounded-lg">
              <Wrench className="h-4 w-4 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('pendingRecords')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingRecords}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-lg">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalCost')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalCost, 'RWF')}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('emergencyRecords')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.emergencyRecords}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchMaintenance')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          />
        </div>
        
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center space-x-2 text-sm"
          >
            <FilterIcon className="h-4 w-4" />
            <span>{t('filter')}</span>
          </button>
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden sm:flex items-center space-x-2">
          <FilterIcon className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('inProgress')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="emergency">{t('emergency')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>
          
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">{t('allProperties')}</option>
            {properties.map(property => (
              <option key={property._id} value={property._id}>{property.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Mobile Filters */}
      {showFilters && (
        <div className="sm:hidden space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="in_progress">{t('inProgress')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="emergency">{t('emergency')}</option>
              <option value="high">{t('high')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="low">{t('low')}</option>
            </select>
            
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">{t('allProperties')}</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>{property.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Maintenance Records */}
      <div className="space-y-3 sm:space-y-4">
        {filteredRecords.map((record) => {
          const property = properties.find(p => p._id === record.propertyId);
          
          return (
            <div key={record._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{record.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(record.priority)}`}>
                        {record.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{property?.name} {record.unitNumber && `• Unit ${record.unitNumber}`}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{record.vendor}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{record.contactPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatCurrency(record.cost, 'RWF')}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{record.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span>Scheduled: {format(new Date(record.scheduledDate), 'MMM dd, yyyy')}</span>
                    {record.completedDate && (
                      <span>Completed: {format(new Date(record.completedDate), 'MMM dd, yyyy')}</span>
                    )}
                    <span className="capitalize">{record.category}</span>
                  </div>
                  
                  {record.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end sm:justify-start space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Add/Edit Maintenance Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingRecord ? t('editMaintenance') : t('addMaintenance')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
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
                {/* Property Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('property')}
                  </label>
                  <select
                    name="propertyId"
                    required
                    defaultValue={editingRecord?.propertyId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectProperty')}</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.name} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Number */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('unitNumber')} (Optional)
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    defaultValue={editingRecord?.unitNumber}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Unit number (if applicable)"
                  />
                </div>
                
                {/* Issue Details */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('issueTitle')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingRecord?.title}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('description')}
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    defaultValue={editingRecord?.description}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder="Detailed description of the maintenance issue"
                  />
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('category')}
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingRecord?.category}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectCategory')}</option>
                    <option value="plumbing">{t('plumbing')}</option>
                    <option value="electrical">{t('electrical')}</option>
                    <option value="hvac">{t('hvac')}</option>
                    <option value="appliances">{t('appliances')}</option>
                    <option value="structural">{t('structural')}</option>
                    <option value="cleaning">{t('cleaning')}</option>
                    <option value="landscaping">{t('landscaping')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('priority')}
                    </label>
                    <select
                      name="priority"
                      required
                      defaultValue={editingRecord?.priority}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="">{t('selectPriority')}</option>
                      <option value="low">{t('low')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="high">{t('high')}</option>
                      <option value="emergency">{t('emergency')}</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('status')}
                    </label>
                    <select
                      name="status"
                      required
                      defaultValue={editingRecord?.status}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="">{t('selectStatus')}</option>
                      <option value="pending">{t('pending')}</option>
                      <option value="in_progress">{t('inProgress')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('scheduledDate')}
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      required
                      defaultValue={editingRecord?.scheduledDate ? new Date(editingRecord.scheduledDate).toISOString().split('T')[0] : ''}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('cost')}
                    </label>
                    <input
                      type="number"
                      name="cost"
                      min="0"
                      step="0.01"
                      required
                      defaultValue={editingRecord?.cost}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Cost in RWF"
                    />
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('vendor')}
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    required
                    defaultValue={editingRecord?.vendor}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Vendor or service provider name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contactPerson')}
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      defaultValue={editingRecord?.contactPerson}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contactPhone')}
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      defaultValue={editingRecord?.contactPhone}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Contact phone number"
                    />
                  </div>
                </div>

                {/* Completed Date (Optional) */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('completedDate')} (Optional)
                  </label>
                  <input
                    type="date"
                    name="completedDate"
                    defaultValue={editingRecord?.completedDate ? new Date(editingRecord.completedDate).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('notes')}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingRecord?.notes}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder="Additional notes or comments"
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
                      editingRecord ? t('update') : t('add')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
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

export default Maintenance;