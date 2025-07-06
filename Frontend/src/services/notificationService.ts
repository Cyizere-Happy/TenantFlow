import { useStore } from '../store/useStore';
import { Property, Tenant, Payment, Complaint, MaintenanceRecord } from '../types';

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'complaint' | 'system' | 'reminder' | 'alert' | 'property' | 'tenant';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'property' | 'tenant' | 'payment' | 'maintenance' | 'complaint';
}

class NotificationService {
  // Generate smart notifications based on current data
  generateSmartNotifications(): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    // Get store data dynamically
    const store = useStore.getState();
    const { properties, tenants, payments, complaints, maintenanceRecords } = store;

    // Check for unused/vacant properties
    this.checkUnusedProperties(properties, notifications);
    
    // Check for overdue payments
    this.checkOverduePayments(tenants, payments, notifications);
    
    // Check for expiring leases
    this.checkExpiringLeases(tenants, notifications);
    
    // Check for pending complaints
    this.checkPendingComplaints(complaints, notifications);
    
    // Check for overdue maintenance
    this.checkOverdueMaintenance(maintenanceRecords, notifications);
    
    // Check for low occupancy rates
    this.checkLowOccupancy(properties, tenants, notifications);
    
    // Check for upcoming maintenance
    this.checkUpcomingMaintenance(maintenanceRecords, notifications);
    
    // Check for payment reminders
    this.checkPaymentReminders(tenants, payments, notifications);
    
    // Check for property value opportunities
    this.checkPropertyValueOpportunities(properties, notifications);

    return notifications;
  }

  private checkUnusedProperties(properties: Property[], notifications: SmartNotification[]) {
    const unusedProperties = properties.filter(p => 
      p.status === 'active' && (p.occupiedUnits === 0 || p.occupiedUnits < p.units)
    );

    unusedProperties.forEach(property => {
      const vacancyRate = ((property.units - (property.occupiedUnits || 0)) / property.units) * 100;
      
      if (vacancyRate === 100) {
        notifications.push({
          id: `unused-${property._id}`,
          title: 'Unused Property Detected',
          message: `${property.name} is completely vacant. Consider marketing strategies or price adjustments to attract tenants.`,
          type: 'property',
          priority: 'high',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/properties/${property._id}`,
          relatedEntityId: property._id,
          relatedEntityType: 'property'
        });
      } else if (vacancyRate > 50) {
        notifications.push({
          id: `low-occupancy-${property._id}`,
          title: 'Low Occupancy Alert',
          message: `${property.name} has ${Math.round(vacancyRate)}% vacancy rate. Consider promotional offers or maintenance improvements.`,
          type: 'reminder',
          priority: 'medium',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: false,
          actionUrl: `/properties/${property._id}`,
          relatedEntityId: property._id,
          relatedEntityType: 'property'
        });
      }
    });
  }

  private checkOverduePayments(tenants: Tenant[], payments: Payment[], notifications: SmartNotification[]) {
    tenants.forEach(tenant => {
      const lastPayment = payments
        .filter(p => p.tenantId === tenant._id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastPayment) {
        notifications.push({
          id: `no-payment-${tenant._id}`,
          title: 'No Payment Record',
          message: `${tenant.name} has no payment records. Please verify payment status.`,
          type: 'payment',
          priority: 'urgent',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/tenants/${tenant._id}`,
          relatedEntityId: tenant._id,
          relatedEntityType: 'tenant'
        });
        return;
      }

      const lastPaymentDate = new Date(lastPayment.date);
      const daysSinceLastPayment = Math.floor((Date.now() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastPayment > 30) {
        notifications.push({
          id: `overdue-${tenant._id}`,
          title: 'Overdue Payment',
          message: `${tenant.name} hasn't paid rent for ${daysSinceLastPayment} days. Monthly rent: ${tenant.monthlyRent.toLocaleString()} RWF`,
          type: 'payment',
          priority: 'urgent',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/tenants/${tenant._id}`,
          relatedEntityId: tenant._id,
          relatedEntityType: 'tenant'
        });
      } else if (daysSinceLastPayment > 15) {
        notifications.push({
          id: `late-${tenant._id}`,
          title: 'Late Payment Warning',
          message: `${tenant.name} is ${daysSinceLastPayment} days late on rent payment.`,
          type: 'payment',
          priority: 'high',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/tenants/${tenant._id}`,
          relatedEntityId: tenant._id,
          relatedEntityType: 'tenant'
        });
      }
    });
  }

  private checkExpiringLeases(tenants: Tenant[], notifications: SmartNotification[]) {
    tenants.forEach(tenant => {
      const leaseEnd = new Date(tenant.leaseEnd);
      const daysUntilExpiry = Math.floor((leaseEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        notifications.push({
          id: `lease-expiry-${tenant._id}`,
          title: 'Lease Expiring Soon',
          message: `${tenant.name}'s lease expires in ${daysUntilExpiry} days. Consider renewal or new tenant search.`,
          type: 'reminder',
          priority: daysUntilExpiry <= 7 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/tenants/${tenant._id}`,
          relatedEntityId: tenant._id,
          relatedEntityType: 'tenant'
        });
      } else if (daysUntilExpiry < 0) {
        notifications.push({
          id: `lease-expired-${tenant._id}`,
          title: 'Lease Expired',
          message: `${tenant.name}'s lease expired ${Math.abs(daysUntilExpiry)} days ago. Immediate action required.`,
          type: 'alert',
          priority: 'urgent',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/tenants/${tenant._id}`,
          relatedEntityId: tenant._id,
          relatedEntityType: 'tenant'
        });
      }
    });
  }

  private checkPendingComplaints(complaints: Complaint[], notifications: SmartNotification[]) {
    const pendingComplaints = complaints.filter(c => 
      c.status === 'open' || c.status === 'in_progress'
    );

    pendingComplaints.forEach(complaint => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreated > 7) {
        notifications.push({
          id: `pending-complaint-${complaint._id}`,
          title: 'Pending Complaint',
          message: `Complaint "${complaint.title}" has been pending for ${daysSinceCreated} days. Requires attention.`,
          type: 'complaint',
          priority: daysSinceCreated > 14 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/complaints/${complaint._id}`,
          relatedEntityId: complaint._id,
          relatedEntityType: 'complaint'
        });
      }
    });
  }

  private checkOverdueMaintenance(maintenanceRecords: MaintenanceRecord[], notifications: SmartNotification[]) {
    const overdueMaintenance = maintenanceRecords.filter(m => 
      m.status === 'pending' || m.status === 'in_progress'
    );

    overdueMaintenance.forEach(maintenance => {
      const daysSinceScheduled = Math.floor((Date.now() - new Date(maintenance.scheduledDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceScheduled > 3) {
        notifications.push({
          id: `overdue-maintenance-${maintenance._id}`,
          title: 'Overdue Maintenance',
          message: `Maintenance "${maintenance.title}" is ${daysSinceScheduled} days overdue. Cost: ${maintenance.cost.toLocaleString()} RWF`,
          type: 'maintenance',
          priority: daysSinceScheduled > 7 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: true,
          actionUrl: `/maintenance/${maintenance._id}`,
          relatedEntityId: maintenance._id,
          relatedEntityType: 'maintenance'
        });
      }
    });
  }

  private checkLowOccupancy(properties: Property[], tenants: Tenant[], notifications: SmartNotification[]) {
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const occupiedUnits = tenants.filter(t => t.status === 'active').length;
    const occupancyRate = (occupiedUnits / totalUnits) * 100;

    if (occupancyRate < 70) {
      notifications.push({
        id: 'low-occupancy-overall',
        title: 'Low Overall Occupancy',
        message: `Overall occupancy rate is ${occupancyRate.toFixed(1)}%. Consider marketing strategies or competitive pricing.`,
        type: 'system',
        priority: 'medium',
        status: 'unread',
        createdAt: new Date().toISOString(),
        actionRequired: false,
        actionUrl: '/properties'
      });
    }
  }

  private checkUpcomingMaintenance(maintenanceRecords: MaintenanceRecord[], notifications: SmartNotification[]) {
    const upcomingMaintenance = maintenanceRecords.filter(m => 
      m.status === 'pending' && new Date(m.scheduledDate) > new Date()
    );

    upcomingMaintenance.forEach(maintenance => {
      const daysUntilScheduled = Math.floor((new Date(maintenance.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilScheduled <= 3) {
        notifications.push({
          id: `upcoming-maintenance-${maintenance._id}`,
          title: 'Upcoming Maintenance',
          message: `Maintenance "${maintenance.title}" is scheduled in ${daysUntilScheduled} days. Cost: ${maintenance.cost.toLocaleString()} RWF`,
          type: 'maintenance',
          priority: 'medium',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: false,
          actionUrl: `/maintenance/${maintenance._id}`,
          relatedEntityId: maintenance._id,
          relatedEntityType: 'maintenance'
        });
      }
    });
  }

  private checkPaymentReminders(tenants: Tenant[], payments: Payment[], notifications: SmartNotification[]) {
    const currentDate = new Date();
    const isFirstWeekOfMonth = currentDate.getDate() <= 7;
    
    if (isFirstWeekOfMonth) {
      tenants.forEach(tenant => {
        const thisMonthPayments = payments.filter(p => 
          p.tenantId === tenant._id && 
          new Date(p.date).getMonth() === currentDate.getMonth() &&
          new Date(p.date).getFullYear() === currentDate.getFullYear()
        );

        if (thisMonthPayments.length === 0) {
          notifications.push({
            id: `payment-reminder-${tenant._id}`,
            title: 'Payment Reminder',
            message: `Reminder: ${tenant.name} hasn't paid this month's rent yet. Amount: ${tenant.monthlyRent.toLocaleString()} RWF`,
            type: 'reminder',
            priority: 'medium',
            status: 'unread',
            createdAt: new Date().toISOString(),
            actionRequired: false,
            actionUrl: `/tenants/${tenant._id}`,
            relatedEntityId: tenant._id,
            relatedEntityType: 'tenant'
          });
        }
      });
    }
  }

  private checkPropertyValueOpportunities(properties: Property[], notifications: SmartNotification[]) {
    properties.forEach(property => {
      // Check for properties with low rent compared to market
      const avgRentPerUnit = property.monthlyRent / property.units;
      
      if (avgRentPerUnit < 1000000) { // Less than 1M RWF per unit
        notifications.push({
          id: `rent-opportunity-${property._id}`,
          title: 'Rent Increase Opportunity',
          message: `${property.name} has low rent per unit (${avgRentPerUnit.toLocaleString()} RWF). Consider market analysis for potential increase.`,
          type: 'system',
          priority: 'low',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: false,
          actionUrl: `/properties/${property._id}`,
          relatedEntityId: property._id,
          relatedEntityType: 'property'
        });
      }

      // Check for properties needing renovation
      if (property.yearBuilt && new Date().getFullYear() - property.yearBuilt > 20) {
        notifications.push({
          id: `renovation-${property._id}`,
          title: 'Property Renovation Consideration',
          message: `${property.name} was built in ${property.yearBuilt} and may benefit from renovation to increase value.`,
          type: 'system',
          priority: 'low',
          status: 'unread',
          createdAt: new Date().toISOString(),
          actionRequired: false,
          actionUrl: `/properties/${property._id}`,
          relatedEntityId: property._id,
          relatedEntityType: 'property'
        });
      }
    });
  }

  // Get notification summary for dashboard
  getNotificationSummary() {
    const notifications = this.generateSmartNotifications();
    
    return {
      total: notifications.length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      actionRequired: notifications.filter(n => n.actionRequired).length,
      unread: notifications.filter(n => n.status === 'unread').length
    };
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: 'urgent' | 'high' | 'medium' | 'low') {
    return this.generateSmartNotifications().filter(n => n.priority === priority);
  }

  // Get notifications by type
  getNotificationsByType(type: SmartNotification['type']) {
    return this.generateSmartNotifications().filter(n => n.type === type);
  }
}

export const notificationService = new NotificationService(); 