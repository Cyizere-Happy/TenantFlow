const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unitNumber: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'cleaning', 'landscaping', 'other'], required: true },
  cost: { type: Number, required: true },
  vendor: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'low' },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  notes: { type: String },
  receipts: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema); 