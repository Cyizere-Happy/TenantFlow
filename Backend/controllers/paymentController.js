const Payment = require('../models/Payment');
const { t } = require('../utils/translations');

exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: t('paymentNotFound') });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: t('paymentNotFound') });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    console.log('Delete payment request for ID:', req.params.id);
    console.log('User from token:', req.user);
    
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      console.log('Payment not found');
      return res.status(404).json({ error: t('paymentNotFound') });
    }
    
    console.log('Payment deleted successfully:', payment);
    res.json({ message: t('paymentDeleted') });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 