import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Property, Tenant, Payment, MaintenanceRecord, Complaint } from '../types';
import { formatCurrency } from './currency';
import { format } from 'date-fns';

// PDF Export Functions
export const exportToPDF = {
  properties: (properties: Property[], title: string = 'Properties Report') => {
    try {
      console.log('Starting PDF export for properties:', properties.length);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      // Prepare data for table
      const tableData = properties.map(property => [
        property.name,
        property.type,
        property.address,
        property.units.toString(),
        formatCurrency(property.rentPerUnit, 'RWF'),
        formatCurrency(property.totalValue, 'RWF'),
        property.status,
        format(new Date(property.createdAt), 'PP')
      ]);
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      autoTable(doc, {
        head: [['Name', 'Type', 'Address', 'Units', 'Rent/Unit', 'Total Value', 'Status', 'Created']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      console.log('Saving PDF...');
      doc.save('properties-report.pdf');
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error);
    }
  },

  tenants: (tenants: Tenant[], properties: Property[], title: string = 'Tenants Report') => {
    try {
      console.log('Starting PDF export for tenants:', tenants.length);
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      const tableData = tenants.map(tenant => {
        const property = properties.find(p => p._id === tenant.propertyId);
        return [
          tenant.name,
          tenant.email,
          tenant.phone,
          property?.name || 'N/A',
          tenant.unitNumber,
          formatCurrency(tenant.monthlyRent, 'RWF'),
          tenant.status,
          format(new Date(tenant.leaseStart), 'PP'),
          format(new Date(tenant.leaseEnd), 'PP')
        ];
      });
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      autoTable(doc, {
        head: [['Name', 'Email', 'Phone', 'Property', 'Unit', 'Monthly Rent', 'Status', 'Lease Start', 'Lease End']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      console.log('Saving PDF...');
      doc.save('tenants-report.pdf');
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error);
    }
  },

  payments: (payments: Payment[], tenants: Tenant[], properties: Property[], title: string = 'Payments Report') => {
    try {
      console.log('Starting PDF export for payments:', payments.length);
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      const tableData = payments.map(payment => {
        const tenant = tenants.find(t => t._id === payment.tenantId);
        const property = properties.find(p => p._id === tenant?.propertyId);
        return [
          tenant?.name || 'N/A',
          property?.name || 'N/A',
          formatCurrency(payment.amount, 'RWF'),
          payment.method,
          format(new Date(payment.date), 'PP'),
          payment.status || 'paid'
        ];
      });
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      autoTable(doc, {
        head: [['Tenant', 'Property', 'Amount', 'Method', 'Date', 'Status']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      console.log('Saving PDF...');
      doc.save('payments-report.pdf');
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error);
    }
  },

  maintenance: (maintenanceRecords: MaintenanceRecord[], properties: Property[], title: string = 'Maintenance Report') => {
    try {
      console.log('Starting PDF export for maintenance:', maintenanceRecords.length);
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      const tableData = maintenanceRecords.map(record => {
        const property = properties.find(p => p._id === record.propertyId);
        return [
          record.title,
          property?.name || 'N/A',
          record.unitNumber || 'N/A',
          record.category,
          formatCurrency(record.cost, 'RWF'),
          record.vendor,
          record.status,
          record.priority,
          format(new Date(record.scheduledDate), 'PP')
        ];
      });
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      autoTable(doc, {
        head: [['Title', 'Property', 'Unit', 'Category', 'Cost', 'Vendor', 'Status', 'Priority', 'Scheduled']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      console.log('Saving PDF...');
      doc.save('maintenance-report.pdf');
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error);
    }
  },

  complaints: (complaints: Complaint[], tenants: Tenant[], title: string = 'Complaints Report') => {
    try {
      console.log('Starting PDF export for complaints:', complaints.length);
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
      
      const tableData = complaints.map(complaint => {
        const tenant = tenants.find(t => t._id === complaint.tenantId);
        return [
          complaint.title,
          tenant?.name || 'N/A',
          complaint.urgency,
          complaint.status,
          format(new Date(complaint.createdAt), 'PP'),
          complaint.description.substring(0, 50) + (complaint.description.length > 50 ? '...' : '')
        ];
      });
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      autoTable(doc, {
        head: [['Title', 'Tenant', 'Urgency', 'Status', 'Created', 'Description']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      console.log('Saving PDF...');
      doc.save('complaints-report.pdf');
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error);
    }
  }
};

// Excel Export Functions
export const exportToExcel = {
  properties: (properties: Property[], filename: string = 'properties-report.xlsx') => {
    try {
      console.log('Starting Excel export for properties:', properties.length);
      const data = properties.map(property => ({
        'Property Name': property.name,
        'Type': property.type,
        'Address': property.address,
        'Units': property.units,
        'Rent per Unit': property.rentPerUnit,
        'Total Value': property.totalValue,
        'Status': property.status,
        'Created Date': format(new Date(property.createdAt), 'PP'),
        'Last Updated': format(new Date(property.updatedAt), 'PP')
      }));

      console.log('Data prepared for Excel:', data.length, 'rows');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Properties');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
      console.log('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel: ' + error);
    }
  },

  tenants: (tenants: Tenant[], properties: Property[], filename: string = 'tenants-report.xlsx') => {
    try {
      console.log('Starting Excel export for tenants:', tenants.length);
      const data = tenants.map(tenant => {
        const property = properties.find(p => p._id === tenant.propertyId);
        return {
          'Tenant Name': tenant.name,
          'Email': tenant.email,
          'Phone': tenant.phone,
          'Property': property?.name || 'N/A',
          'Unit Number': tenant.unitNumber,
          'Monthly Rent': tenant.monthlyRent,
          'Status': tenant.status,
          'Lease Start': format(new Date(tenant.leaseStart), 'PP'),
          'Lease End': format(new Date(tenant.leaseEnd), 'PP'),
          'Created Date': format(new Date(tenant.createdAt), 'PP')
        };
      });

      console.log('Data prepared for Excel:', data.length, 'rows');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tenants');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
      console.log('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel: ' + error);
    }
  },

  payments: (payments: Payment[], tenants: Tenant[], properties: Property[], filename: string = 'payments-report.xlsx') => {
    try {
      console.log('Starting Excel export for payments:', payments.length);
      const data = payments.map(payment => {
        const tenant = tenants.find(t => t._id === payment.tenantId);
        const property = properties.find(p => p._id === tenant?.propertyId);
        return {
          'Tenant': tenant?.name || 'N/A',
          'Property': property?.name || 'N/A',
          'Amount': payment.amount,
          'Method': payment.method,
          'Date': format(new Date(payment.date), 'PP'),
          'Status': payment.status || 'paid',
          'Month': payment.month,
          'Year': payment.year,
          'Notes': payment.notes || ''
        };
      });

      console.log('Data prepared for Excel:', data.length, 'rows');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
      console.log('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel: ' + error);
    }
  },

  maintenance: (maintenanceRecords: MaintenanceRecord[], properties: Property[], filename: string = 'maintenance-report.xlsx') => {
    try {
      console.log('Starting Excel export for maintenance:', maintenanceRecords.length);
      const data = maintenanceRecords.map(record => {
        const property = properties.find(p => p._id === record.propertyId);
        return {
          'Title': record.title,
          'Property': property?.name || 'N/A',
          'Unit Number': record.unitNumber || 'N/A',
          'Category': record.category,
          'Cost': record.cost,
          'Vendor': record.vendor,
          'Contact Person': record.contactPerson,
          'Contact Phone': record.contactPhone,
          'Status': record.status,
          'Priority': record.priority,
          'Scheduled Date': format(new Date(record.scheduledDate), 'PP'),
          'Completed Date': record.completedDate ? format(new Date(record.completedDate), 'PP') : 'N/A',
          'Notes': record.notes || ''
        };
      });

      console.log('Data prepared for Excel:', data.length, 'rows');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
      console.log('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel: ' + error);
    }
  },

  complaints: (complaints: Complaint[], tenants: Tenant[], filename: string = 'complaints-report.xlsx') => {
    try {
      console.log('Starting Excel export for complaints:', complaints.length);
      const data = complaints.map(complaint => {
        const tenant = tenants.find(t => t._id === complaint.tenantId);
        return {
          'Title': complaint.title,
          'Tenant': tenant?.name || 'N/A',
          'Urgency': complaint.urgency,
          'Status': complaint.status,
          'Description': complaint.description,
          'Admin Reply': complaint.adminReply || '',
          'Created Date': format(new Date(complaint.createdAt), 'PP'),
          'Updated Date': format(new Date(complaint.updatedAt), 'PP')
        };
      });

      console.log('Data prepared for Excel:', data.length, 'rows');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Complaints');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
      console.log('Excel exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel: ' + error);
    }
  }
}; 