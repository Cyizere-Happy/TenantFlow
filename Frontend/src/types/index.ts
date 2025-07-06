export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'assistant';
  avatar?: string;
}

export interface Property {
  _id: string;
  name: string;
  type: 'house' | 'apartment' | 'commercial' | 'land';
  address: string;
  units: number;
  occupiedUnits: number;
  rentPerUnit: number;
  monthlyRent: number;
  totalValue: number;
  status: 'active' | 'inactive' | 'maintenance';
  image?: string; // Main property image
  images: string[]; // Additional images
  yearBuilt?: number;
  propertyManager?: string;
  insuranceExpiry?: Date;
  taxRate: number;
  amenities: string[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  _id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  unitNumber: string;
  monthlyRent: number;
  leaseStart: Date;
  leaseEnd: Date;
  status: 'active' | 'pending' | 'evicted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  tenantId: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'card' | 'check';
  date: Date;
  month: string;
  year: number;
  isPartial: boolean;
  notes?: string;
  receiptGenerated: boolean;
  createdAt: Date;
}

export interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  unitNumber?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliances' | 'structural' | 'cleaning' | 'landscaping' | 'other';
  cost: number;
  vendor: string;
  contactPerson: string;
  contactPhone: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  scheduledDate: Date;
  completedDate?: Date;
  notes?: string;
  receipts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Complaint {
  _id: string;
  tenantId: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  type: 'payment_due' | 'complaint' | 'maintenance' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Settings {
  currency: string;
  timezone: string;
  rentReminderFrequency: number;
  darkMode: boolean;
  emailNotifications: boolean;
  language: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  overdueRent: number;
  activeProperties: number;
  activeTenants: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingComplaints: number;
  pendingMaintenance: number;
  occupancyRate: number;
}