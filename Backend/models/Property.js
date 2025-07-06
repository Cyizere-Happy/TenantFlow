const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['house', 'apartment', 'commercial', 'land'], required: true },
  address: { type: String, required: true },
  units: { type: Number, required: true, default: 1 },
  occupiedUnits: { type: Number, default: 0 },
  rentPerUnit: { type: Number, required: true },
  monthlyRent: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  image: { type: String }, // Main property image
  images: [{ type: String }], // Additional images
  yearBuilt: { type: Number },
  propertyManager: { type: String },
  insuranceExpiry: { type: Date },
  taxRate: { type: Number, default: 0 },
  amenities: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamps on save
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Property', PropertySchema); 