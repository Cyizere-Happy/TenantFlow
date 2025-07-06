import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  Building,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Tenant } from '../types';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Tenants: React.FC = () => {
  const { tenants, properties, addTenant, updateTenant, deleteTenant, loadTenants } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'evicted'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadTenants();
  }, []);
  
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const name = `${firstName} ${lastName}`.trim();
    
    const tenantData = {
      name,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      propertyId: formData.get('propertyId') as string,
      unitNumber: formData.get('unitNumber') as string,
      monthlyRent: parseFloat(formData.get('monthlyRent') as string),
      leaseStart: formData.get('leaseStart') as string, // Send as string, let backend parse
      leaseEnd: formData.get('leaseEnd') as string, // Send as string, let backend parse
      status: formData.get('status') as 'active' | 'pending' | 'evicted'
    };
    
    console.log('Sending tenant data:', tenantData);
    
    if (editingTenant) {
      setIsSubmitting(true);
      try {
        await updateTenant(editingTenant._id, tenantData);
        toast.success(t('tenantUpdatedSuccessfully'));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('anErrorOccurred'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await addTenant(tenantData);
        toast.success(t('tenantAddedSuccessfully'));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('anErrorOccurred'));
      } finally {
        setIsSubmitting(false);
      }
    }
    
    setShowForm(false);
    setEditingTenant(null);
  };
  
  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeleteTenant'))) {
      try {
        await deleteTenant(id);
        toast.success(t('tenantDeleted'));
      } catch (error) {
        toast.error(t('errorDeletingTenant'));
      }
    }
  };
  
  const handleExportPDF = () => {
    exportToPDF.tenants(tenants, properties, 'Tenants Report');
  };

  const handleExportExcel = () => {
    exportToExcel.tenants(tenants, properties, 'tenants-report.xlsx');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'evicted': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tenants')}</h1>
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
            <span>{t('addTenant')}</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchTenants')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'pending' | 'evicted')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="evicted">{t('evicted')}</option>
          </select>
        </div>
      </div>
      
      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const property = properties.find(p => p._id === tenant.propertyId);
          const isLeaseExpiringSoon = new Date(tenant.leaseEnd).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
          
          return (
            <div key={tenant._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tenant.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tenant._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {tenant.phone}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  {tenant.email}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property?.name} - Unit {tenant.unitNumber}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Lease: {format(new Date(tenant.leaseStart), 'MMM dd, yyyy')} - {format(new Date(tenant.leaseEnd), 'MMM dd, yyyy')}
                </div>
                
                {isLeaseExpiringSoon && (
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {t('leaseExpiresSoon')}
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('monthlyRent')}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${tenant.monthlyRent.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Add/Edit Tenant Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTenant ? t('editTenant') : t('addTenant')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTenant(null);
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
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      defaultValue={editingTenant?.firstName}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      defaultValue={editingTenant?.lastName}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingTenant?.email}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={editingTenant?.phone}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('property')}
                  </label>
                  <select
                    name="propertyId"
                    required
                    defaultValue={editingTenant?.propertyId}
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
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('unitNumber')}
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    required
                    defaultValue={editingTenant?.unitNumber}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter unit number"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('monthlyRent')}
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      required
                      min="0"
                      step="0.01"
                      defaultValue={editingTenant?.monthlyRent}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Monthly rent amount"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('leaseStart')}
                    </label>
                    <input
                      type="date"
                      name="leaseStart"
                      required
                      defaultValue={editingTenant?.leaseStart}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('leaseEnd')}
                  </label>
                  <input
                    type="date"
                    name="leaseEnd"
                    required
                    defaultValue={editingTenant?.leaseEnd}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('status')}
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingTenant?.status}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectStatus')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="pending">{t('pending')}</option>
                    <option value="evicted">{t('evicted')}</option>
                  </select>
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
                      editingTenant ? t('update') : t('add')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTenant(null);
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

export default Tenants;