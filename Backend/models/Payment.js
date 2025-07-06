const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'bank_transfer', 'card', 'check'], required: true },
  date: { type: Date, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  isPartial: { type: Boolean, default: false },
  notes: { type: String },
  receiptGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema); 