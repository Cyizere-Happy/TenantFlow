import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { User, Property, Tenant, Payment, Complaint, Notification, Settings, DashboardStats, MaintenanceRecord } from '../types';
import { notificationService, SmartNotification } from '../services/notificationService';

// Axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      useStore.setState({ isAuthenticated: false, error: 'Session expired. Please log in again.' });
    }
    return Promise.reject(error);
  }
);

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  complaints: Complaint[];
  notifications: Notification[];
  maintenanceRecords: MaintenanceRecord[];
  settings: Settings;
  
  // Smart notification read status tracking
  readSmartNotifications: Set<string>;
  
  // Loading and error states
  loading: { [key: string]: boolean };
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Properties
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  loadProperties: () => Promise<void>;
  
  // Tenants
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  loadTenants: () => Promise<void>;
  
  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  loadPayments: () => Promise<void>;
  
  // Maintenance
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => Promise<void>;
  deleteMaintenanceRecord: (id: string) => Promise<void>;
  loadMaintenanceRecords: () => Promise<void>;
  
  // Complaints
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  loadComplaints: () => Promise<void>;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  
  // Smart Notifications
  getSmartNotifications: () => SmartNotification[];
  getNotificationSummary: () => { total: number; urgent: number; high: number; actionRequired: number; unread: number };
  markSmartNotificationAsRead: (id: string) => void;
  clearAllSmartNotifications: () => void;
  
  // Settings
  updateSettings: (updates: Partial<Settings>) => void;
  
  // Utils
  getDashboardStats: () => DashboardStats;
  loadAll: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      properties: [],
      tenants: [],
      payments: [],
      complaints: [],
      maintenanceRecords: [],
      notifications: [],
      settings: {
        currency: 'RWF',
        timezone: 'UTC',
        rentReminderFrequency: 7,
        darkMode: false,
        emailNotifications: true,
        language: 'en',
      },
      readSmartNotifications: new Set(),
      loading: {
        properties: false,
        tenants: false,
        payments: false,
        complaints: false,
        maintenanceRecords: false,
        notifications: false,
      },
      error: null,

      // Auth actions
      login: async (email: string, password: string) => {
        try {
          set({ loading: { ...get().loading, auth: true }, error: null });
          const response = await axiosInstance.post('/users/login', { email, password });
          localStorage.setItem('token', response.data.token);
          set({ user: response.data.user, isAuthenticated: true, loading: { ...get().loading, auth: false } });
          await get().loadAll(); // Load all data after successful login
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            loading: { ...get().loading, auth: false },
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false,
          properties: [],
          tenants: [],
          payments: [],
          complaints: [],
          maintenanceRecords: [],
          notifications: [],
          error: null,
        });
      },

      // Load all data
      loadAll: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        set({
          loading: {
            properties: true,
            tenants: true,
            payments: true,
            complaints: true,
            maintenanceRecords: true,
            notifications: true,
          },
          error: null,
        });
        try {
          const [propertiesRes, tenantsRes, paymentsRes, complaintsRes, maintenanceRes, notificationsRes] =
            await Promise.all([
              axiosInstance.get('/properties'),
              axiosInstance.get('/tenants'),
              axiosInstance.get('/payments'),
              axiosInstance.get('/complaints'),
              axiosInstance.get('/maintenance'),
              axiosInstance.get('/notifications'),
            ]);
          set({
            properties: propertiesRes.data.properties || propertiesRes.data || [],
            tenants: tenantsRes.data.tenants || tenantsRes.data || [],
            payments: paymentsRes.data.payments || paymentsRes.data || [],
            complaints: complaintsRes.data.complaints || complaintsRes.data || [],
            maintenanceRecords: maintenanceRes.data.maintenanceRecords || maintenanceRes.data || [],
            notifications: notificationsRes.data.notifications || notificationsRes.data || [],
            loading: {
              properties: false,
              tenants: false,
              payments: false,
              complaints: false,
              maintenanceRecords: false,
              notifications: false,
            },
            error: null,
          });
        } catch (error) {
          set({
            loading: {
              properties: false,
              tenants: false,
              payments: false,
              complaints: false,
              maintenanceRecords: false,
              notifications: false,
            },
            error: error.response?.data?.message || 'Failed to load data',
          });
        }
      },

      // Property actions
      addProperty: async (property: any) => {
        const formData = new FormData();
        Object.keys(property).forEach((key) => {
          if (key !== 'image' && key !== 'images') {
            formData.append(key, property[key]);
          }
        });
        if (property.image && property.image instanceof File) {
          formData.append('image', property.image);
        }
        try {
          set({ loading: { ...get().loading, properties: true }, error: null });
          const response = await axiosInstance.post('/properties', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({
            properties: [...get().properties, response.data.property],
            loading: { ...get().loading, properties: false },
          });
          await get().loadProperties(); // Refresh properties
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add property',
            loading: { ...get().loading, properties: false },
          });
        }
      },

      updateProperty: async (id, updates: any) => {
        const formData = new FormData();
        Object.keys(updates).forEach((key) => {
          if (key !== 'image' && key !== 'images') {
            formData.append(key, updates[key]);
          }
        });
        if (updates.image && updates.image instanceof File) {
          formData.append('image', updates.image);
        }
        try {
          set({ loading: { ...get().loading, properties: true }, error: null });
          const response = await axiosInstance.put(`/properties/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({
            properties: get().properties.map((p) => (p._id === id ? response.data.property : p)),
            loading: { ...get().loading, properties: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update property',
            loading: { ...get().loading, properties: false },
          });
        }
      },

      deleteProperty: async (id) => {
        if (!id) {
          set({ error: 'Property ID is required' });
          return;
        }
        try {
          set({ loading: { ...get().loading, properties: true }, error: null });
          await axiosInstance.delete(`/properties/${id}`);
          set({
            properties: get().properties.filter((p) => p._id !== id),
            loading: { ...get().loading, properties: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete property',
            loading: { ...get().loading, properties: false },
          });
        }
      },

      loadProperties: async () => {
        console.log('loadProperties called');
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        if (!token) {
          console.log('No token found, setting error');
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          console.log('Making API call to /properties');
          set({ loading: { ...get().loading, properties: true }, error: null });
          const response = await axiosInstance.get('/properties');
          console.log('Properties response:', response.data);
          set({
            properties: response.data.properties || response.data || [],
            loading: { ...get().loading, properties: false },
          });
          console.log('Properties loaded successfully');
        } catch (error: any) {
          console.error('Error loading properties:', error);
          set({
            error: error.response?.data?.message || 'Failed to load properties',
            loading: { ...get().loading, properties: false },
          });
        }
      },

      // Tenant actions
      addTenant: async (tenant) => {
        try {
          console.log('Adding tenant with data:', tenant);
          console.log('Token exists:', !!localStorage.getItem('token'));
          
          set({ loading: { ...get().loading, tenants: true }, error: null });
          const response = await axiosInstance.post('/tenants', tenant);
          console.log('Tenant added successfully:', response.data);
          
          set({
            tenants: [...get().tenants, response.data],
            loading: { ...get().loading, tenants: false },
          });
          await get().loadTenants(); // Refresh tenants
        } catch (error: any) {
          console.error('Error adding tenant:', error);
          console.error('Error response:', error.response?.data);
          
          set({
            error: error.response?.data?.message || error.response?.data?.error || 'Failed to add tenant',
            loading: { ...get().loading, tenants: false },
          });
          throw error; // Re-throw to be caught by the component
        }
      },

      updateTenant: async (id, updates) => {
        try {
          set({ loading: { ...get().loading, tenants: true }, error: null });
          const response = await axiosInstance.put(`/tenants/${id}`, updates);
          set({
            tenants: get().tenants.map((t) => (t._id === id ? response.data : t)),
            loading: { ...get().loading, tenants: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update tenant',
            loading: { ...get().loading, tenants: false },
          });
        }
      },

      deleteTenant: async (id) => {
        try {
          set({ loading: { ...get().loading, tenants: true }, error: null });
          await axiosInstance.delete(`/tenants/${id}`);
          set({
            tenants: get().tenants.filter((t) => t._id !== id),
            loading: { ...get().loading, tenants: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete tenant',
            loading: { ...get().loading, tenants: false },
          });
        }
      },

      loadTenants: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          set({ loading: { ...get().loading, tenants: true }, error: null });
          const response = await axiosInstance.get('/tenants');
          set({
            tenants: response.data.tenants || response.data || [],
            loading: { ...get().loading, tenants: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to load tenants',
            loading: { ...get().loading, tenants: false },
          });
        }
      },

      // Payment actions
      addPayment: async (payment) => {
        try {
          set({ loading: { ...get().loading, payments: true }, error: null });
          const response = await axiosInstance.post('/payments', payment);
          set({
            payments: [...get().payments, response.data],
            loading: { ...get().loading, payments: false },
          });
          await get().loadPayments(); // Refresh payments
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add payment',
            loading: { ...get().loading, payments: false },
          });
        }
      },

      updatePayment: async (id, updates) => {
        try {
          set({ loading: { ...get().loading, payments: true }, error: null });
          const response = await axiosInstance.put(`/payments/${id}`, updates);
          set({
            payments: get().payments.map((p) => (p._id === id ? response.data : p)),
            loading: { ...get().loading, payments: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update payment',
            loading: { ...get().loading, payments: false },
          });
        }
      },

      deletePayment: async (id) => {
        try {
          console.log('Deleting payment with ID:', id);
          console.log('Token exists:', !!localStorage.getItem('token'));
          
          set({ loading: { ...get().loading, payments: true }, error: null });
          await axiosInstance.delete(`/payments/${id}`);
          console.log('Payment deleted successfully');
          
          set({
            payments: get().payments.filter((p) => p._id !== id),
            loading: { ...get().loading, payments: false },
          });
        } catch (error: any) {
          console.error('Error deleting payment:', error);
          console.error('Error response:', error.response?.data);
          
          set({
            error: error.response?.data?.message || error.response?.data?.error || 'Failed to delete payment',
            loading: { ...get().loading, payments: false },
          });
        }
      },

      loadPayments: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          set({ loading: { ...get().loading, payments: true }, error: null });
          const response = await axiosInstance.get('/payments');
          set({
            payments: response.data.payments || response.data || [],
            loading: { ...get().loading, payments: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to load payments',
            loading: { ...get().loading, payments: false },
          });
        }
      },

      // Maintenance actions
      addMaintenanceRecord: async (record) => {
        try {
          set({ loading: { ...get().loading, maintenanceRecords: true }, error: null });
          const response = await axiosInstance.post('/maintenance', record);
          set({
            maintenanceRecords: [...get().maintenanceRecords, response.data],
            loading: { ...get().loading, maintenanceRecords: false },
          });
          await get().loadMaintenanceRecords(); // Refresh maintenance records
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add maintenance record',
            loading: { ...get().loading, maintenanceRecords: false },
          });
        }
      },

      updateMaintenanceRecord: async (id, updates) => {
        try {
          set({ loading: { ...get().loading, maintenanceRecords: true }, error: null });
          const response = await axiosInstance.put(`/maintenance/${id}`, updates);
          set({
            maintenanceRecords: get().maintenanceRecords.map((r) => (r._id === id ? response.data : r)),
            loading: { ...get().loading, maintenanceRecords: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update maintenance record',
            loading: { ...get().loading, maintenanceRecords: false },
          });
        }
      },

      deleteMaintenanceRecord: async (id) => {
        try {
          set({ loading: { ...get().loading, maintenanceRecords: true }, error: null });
          await axiosInstance.delete(`/maintenance/${id}`);
          set({
            maintenanceRecords: get().maintenanceRecords.filter((r) => r._id !== id),
            loading: { ...get().loading, maintenanceRecords: false },
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete maintenance record',
            loading: { ...get().loading, maintenanceRecords: false },
          });
        }
      },

      loadMaintenanceRecords: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          set({ loading: { ...get().loading, maintenanceRecords: true }, error: null });
          const response = await axiosInstance.get('/maintenance');
          set({
            maintenanceRecords: response.data.maintenanceRecords || response.data || [],
            loading: { ...get().loading, maintenanceRecords: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to load maintenance records',
            loading: { ...get().loading, maintenanceRecords: false },
          });
        }
      },

      // Complaint actions
      addComplaint: async (complaint) => {
        try {
          set({ loading: { ...get().loading, complaints: true }, error: null });
          const response = await axiosInstance.post('/complaints', complaint);
          set({
            complaints: [...get().complaints, response.data],
            loading: { ...get().loading, complaints: false },
          });
          await get().loadComplaints(); // Refresh complaints
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add complaint',
            loading: { ...get().loading, complaints: false },
          });
        }
      },
   updateComplaint: async (id, updates) => {
try {
    set({ loading: { ...get().loading, complaints: true }, error: null });
    const response = await axiosInstance.put(`/complaints/${id}`, updates);
    set({
      complaints: get().complaints.map((c) => (c._id === id ? response.data : c)),
      loading: { ...get().loading, complaints: false },
    });
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Failed to update complaint',
      loading: { ...get().loading, complaints: false },
    });
  }
},

      deleteComplaint: async (id) => {
        try {
          set({ loading: { ...get().loading, complaints: true }, error: null });
          await axiosInstance.delete(`/complaints/${id}`);
          set({
            complaints: get().complaints.filter((c) => c._id !== id),
            loading: { ...get().loading, complaints: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to delete complaint',
            loading: { ...get().loading, complaints: false },
          });
        }
      },

      loadComplaints: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          set({ loading: { ...get().loading, complaints: true }, error: null });
          const response = await axiosInstance.get('/complaints');
          set({
            complaints: response.data.complaints || response.data || [],
            loading: { ...get().loading, complaints: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to load complaints',
            loading: { ...get().loading, complaints: false },
          });
        }
      },

      // Notification actions
      addNotification: async (notification) => {
        try {
          set({ loading: { ...get().loading, notifications: true }, error: null });
          const response = await axiosInstance.post('/notifications', notification);
          set({
            notifications: [...get().notifications, response.data],
            loading: { ...get().loading, notifications: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add notification',
            loading: { ...get().loading, notifications: false },
          });
        }
      },

      markNotificationAsRead: async (id) => {
        try {
          set({ loading: { ...get().loading, notifications: true }, error: null });
          await axiosInstance.put(`/notifications/${id}`, { isRead: true });
          set({
            notifications: get().notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
            loading: { ...get().loading, notifications: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to mark notification as read',
            loading: { ...get().loading, notifications: false },
          });
        }
      },

      clearAllNotifications: async () => {
        try {
          set({ loading: { ...get().loading, notifications: true }, error: null });
          await axiosInstance.delete('/notifications');
          set({
            notifications: [],
            loading: { ...get().loading, notifications: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to clear notifications',
            loading: { ...get().loading, notifications: false },
          });
        }
      },

      loadNotifications: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ error: 'Authentication required', isAuthenticated: false });
          return;
        }
        try {
          set({ loading: { ...get().loading, notifications: true }, error: null });
          const response = await axiosInstance.get('/notifications');
          set({
            notifications: response.data.notifications || response.data || [],
            loading: { ...get().loading, notifications: false },
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to load notifications',
            loading: { ...get().loading, notifications: false },
          });
        }
      },

      // Smart Notification actions
      getSmartNotifications: () => {
        const state = get();
        const smartNotifications = notificationService.generateSmartNotifications();
        
        return smartNotifications.map((notification) => ({
          ...notification,
          status: state.readSmartNotifications.has(notification.id) ? 'read' : 'unread',
          readAt: state.readSmartNotifications.has(notification.id) ? new Date().toISOString() : undefined,
        }));
      },

      getNotificationSummary: () => {
        const state = get();
        const smartNotifications = notificationService.generateSmartNotifications();
        const notificationsWithReadStatus = smartNotifications.map((notification) => ({
          ...notification,
          status: state.readSmartNotifications.has(notification.id) ? 'read' : 'unread',
        }));
        return {
          total: notificationsWithReadStatus.length,
          urgent: notificationsWithReadStatus.filter((n) => n.priority === 'urgent').length,
          high: notificationsWithReadStatus.filter((n) => n.priority === 'high').length,
          actionRequired: notificationsWithReadStatus.filter((n) => n.actionRequired).length,
          unread: notificationsWithReadStatus.filter((n) => n.status === 'unread').length,
        };
      },

      markSmartNotificationAsRead: (id) => {
        set({ readSmartNotifications: new Set([...get().readSmartNotifications, id]) });
      },

      clearAllSmartNotifications: () => {
        set({ readSmartNotifications: new Set() });
      },

      // Settings actions
      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },

      // Utils
      getDashboardStats: () => {
        const state = get();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalIncome = state.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = state.maintenanceRecords
          .filter((r) => r.status === 'completed')
          .reduce((sum, record) => sum + record.cost, 0);

        const monthlyIncome = state.payments
          .filter(
            (p) =>
              new Date(p.date).getMonth() === currentMonth && new Date(p.date).getFullYear() === currentYear
          )
          .reduce((sum, payment) => sum + payment.amount, 0);

        const monthlyExpenses = state.maintenanceRecords
          .filter(
            (r) =>
              r.status === 'completed' &&
              r.completedDate &&
              new Date(r.completedDate).getMonth() === currentMonth &&
              new Date(r.completedDate).getFullYear() === currentYear
          )
          .reduce((sum, record) => sum + record.cost, 0);

        const overdueRent = state.tenants
          .filter((t) => t.status === 'active')
          .reduce((sum, tenant) => {
            const hasPayment = state.payments.some(
              (p) =>
                p.tenantId === tenant._id &&
                p.month === `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
            );
            return hasPayment ? sum : sum + tenant.monthlyRent;
          }, 0);

        const totalUnits = state.properties.reduce((sum, property) => sum + property.units, 0);
        const occupiedUnits = state.tenants.filter((t) => t.status === 'active').length;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        return {
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          overdueRent,
          activeProperties: state.properties.length,
          activeTenants: state.tenants.filter((t) => t.status === 'active').length,
          monthlyIncome,
          monthlyExpenses,
          pendingComplaints: state.complaints.filter((c) => c.status === 'open').length,
          pendingMaintenance: state.maintenanceRecords.filter(
            (r) => r.status === 'pending' || r.status === 'in_progress'
          ).length,
          occupancyRate,
        };
      },
    }),
    {
      name: 'rent-management-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        properties: state.properties,
        tenants: state.tenants,
        payments: state.payments,
        complaints: state.complaints,
        maintenanceRecords: state.maintenanceRecords,
        notifications: state.notifications,
        settings: state.settings,
        readSmartNotifications: Array.from(state.readSmartNotifications),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.readSmartNotifications && Array.isArray(state.readSmartNotifications)) {
          state.readSmartNotifications = new Set(state.readSmartNotifications);
        }
      },
    }
  )
);