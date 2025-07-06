const Tenant = require('../models/Tenant');
const { t } = require('../utils/translations');

exports.createTenant = async (req, res) => {
  try {
    console.log('Creating tenant with data:', req.body);
    
    // Validate required fields
    const { name, phone, email, propertyId, unitNumber, monthlyRent, leaseStart, leaseEnd } = req.body;
    
    if (!name || !phone || !email || !propertyId || !unitNumber || !monthlyRent || !leaseStart || !leaseEnd) {
      console.log('Missing required fields:', { name, phone, email, propertyId, unitNumber, monthlyRent, leaseStart, leaseEnd });
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: {
          name: !name,
          phone: !phone,
          email: !email,
          propertyId: !propertyId,
          unitNumber: !unitNumber,
          monthlyRent: !monthlyRent,
          leaseStart: !leaseStart,
          leaseEnd: !leaseEnd
        }
      });
    }
    
    const tenant = new Tenant(req.body);
    await tenant.save();
    res.status(201).json(tenant);
  } catch (err) {
    console.error('Error creating tenant:', err);
    res.status(400).json({ error: err.message || t('databaseQueryError') });
  }
};

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ error: t('tenantNotFound') });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ error: t('tenantNotFound') });
    res.json(tenant);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ error: t('tenantNotFound') });
    res.json({ message: t('tenantDeleted') });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 