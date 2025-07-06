const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unitNumber: { type: String, required: true },
  monthlyRent: { type: Number, required: true },
  leaseStart: { type: Date, required: true },
  leaseEnd: { type: Date, required: true },
  status: { type: String, enum: ['active', 'pending', 'evicted'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to handle date conversion
TenantSchema.pre('save', function(next) {
  // Convert string dates to Date objects if needed
  if (typeof this.leaseStart === 'string') {
    this.leaseStart = new Date(this.leaseStart);
  }
  if (typeof this.leaseEnd === 'string') {
    this.leaseEnd = new Date(this.leaseEnd);
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Tenant', TenantSchema); 