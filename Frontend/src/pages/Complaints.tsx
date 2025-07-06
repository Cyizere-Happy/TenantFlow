import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  User,
  Building,
  MapPin,
  FileText,
  Download,
  Filter as FilterIcon,
  X,
  Reply
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Complaint } from '../types';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Complaints: React.FC = () => {
  const { complaints, tenants, properties, addComplaint, updateComplaint, deleteComplaint, loadComplaints, loadTenants, loadProperties } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadComplaints();
    loadTenants();
    loadProperties();
  }, []);
  
  const filteredComplaints = complaints.filter(complaint => {
    const tenant = tenants.find(t => t.id === complaint.tenantId);
    const property = properties.find(p => p.id === tenant?.propertyId);
    
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || complaint.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesCategory;
  }).sort((a, b) => {
    let aValue: any = a[sortBy as keyof Complaint];
    let bValue: any = b[sortBy as keyof Complaint];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'resolvedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const complaintData = {
      tenantId: formData.get('tenantId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      urgency: formData.get('urgency') as 'low' | 'medium' | 'high',
      status: formData.get('status') as 'open' | 'in_progress' | 'resolved' | 'closed',
      adminReply: formData.get('adminReply') as string || undefined
    };
    
    if (editingComplaint) {
      try {
        setIsSubmitting(true);
        await updateComplaint(editingComplaint.id, complaintData);
        toast.success(t('complaintUpdatedSuccessfully'));
      } catch (error) {
        setError(t('errorUpdatingComplaint'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        setIsSubmitting(true);
        await addComplaint({ ...complaintData, status: 'open' });
        toast.success(t('complaintAddedSuccessfully'));
      } catch (error) {
        setError(t('errorAddingComplaint'));
      } finally {
        setIsSubmitting(false);
      }
    }
    
    setShowForm(false);
    setEditingComplaint(null);
  };
  
  const handleEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeleteComplaint'))) {
      try {
        await deleteComplaint(id);
        toast.success(t('complaintDeleted'));
      } catch (error) {
        toast.error(t('errorDeletingComplaint'));
      }
    }
  };
  
  const handleStatusChange = (id: string, status: Complaint['status']) => {
    updateComplaint(id, { status });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  const stats = {
    totalComplaints: complaints.length,
    openComplaints: complaints.filter(c => c.status === 'open').length,
    inProgressComplaints: complaints.filter(c => c.status === 'in_progress').length,
    resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
    emergencyComplaints: complaints.filter(c => c.urgency === 'emergency').length,
    averageResolutionTime: complaints.filter(c => c.resolvedAt).length > 0 
      ? complaints.filter(c => c.resolvedAt).reduce((sum, c) => {
          const created = new Date(c.createdAt);
          const resolved = new Date(c.resolvedAt!);
          return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / complaints.filter(c => c.resolvedAt).length
      : 0
  };
  
  const handleExportPDF = () => {
    exportToPDF.complaints(complaints, tenants, 'Complaints Report');
  };

  const handleExportExcel = () => {
    exportToExcel.complaints(complaints, tenants, 'complaints-report.xlsx');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints</h1>
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
            <span>Add Complaint</span>
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Issues</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalComplaints}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All reported issues</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Issues</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.openComplaints}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Awaiting response</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved Issues</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.resolvedComplaints}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Successfully handled</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">High Priority</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.emergencyComplaints}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Urgent attention needed</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'in_progress' | 'resolved' | 'closed')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => {
          const tenant = tenants.find(t => t.id === complaint.tenantId);
          const property = properties.find(p => p.id === tenant?.propertyId);
          
          return (
            <div key={complaint.id} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{complaint.title}</h3>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getUrgencyColor(complaint.urgency)}`}>
                      {complaint.urgency === 'high' ? 'Critical' : complaint.urgency === 'medium' ? 'Important' : 'Standard'} Priority
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{tenant?.name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{property?.name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-4 mb-3 border border-slate-200 dark:border-slate-600">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{complaint.description}</p>
                  </div>
                  
                  {complaint.adminReply && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Management Response
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{complaint.adminReply}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusChange(complaint.id, e.target.value as Complaint['status'])}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <button
                    onClick={() => handleEdit(complaint)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(complaint.id)}
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
      
      {/* Add/Edit Complaint Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingComplaint ? t('editComplaint') : t('addComplaint')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingComplaint(null);
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
                {/* Tenant Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('tenant')}
                  </label>
                  <select
                    name="tenantId"
                    required
                    defaultValue={editingComplaint?.tenantId}
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
                
                {/* Complaint Details */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('complaintTitle')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingComplaint?.title}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Brief description of the complaint"
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
                    defaultValue={editingComplaint?.description}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder="Detailed description of the complaint"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('category')}
                    </label>
                    <select
                      name="category"
                      required
                      defaultValue={editingComplaint?.category}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="">{t('selectCategory')}</option>
                      <option value="noise">{t('noise')}</option>
                      <option value="maintenance">{t('maintenance')}</option>
                      <option value="neighbor">{t('neighbor')}</option>
                      <option value="facility">{t('facility')}</option>
                      <option value="billing">{t('billing')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('priority')}
                    </label>
                    <select
                      name="priority"
                      required
                      defaultValue={editingComplaint?.priority}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="">{t('selectPriority')}</option>
                      <option value="low">{t('low')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="high">{t('high')}</option>
                      <option value="urgent">{t('urgent')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('status')}
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingComplaint?.status}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="">{t('selectStatus')}</option>
                    <option value="open">{t('open')}</option>
                    <option value="in_progress">{t('inProgress')}</option>
                    <option value="resolved">{t('resolved')}</option>
                    <option value="closed">{t('closed')}</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('reportedDate')}
                  </label>
                  <input
                    type="date"
                    name="reportedDate"
                    required
                    defaultValue={editingComplaint?.reportedDate}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('resolution')}
                  </label>
                  <textarea
                    name="resolution"
                    rows={3}
                    defaultValue={editingComplaint?.resolution}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    placeholder="Resolution details or notes"
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
                      editingComplaint ? t('update') : t('add')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingComplaint(null);
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

export default Complaints;