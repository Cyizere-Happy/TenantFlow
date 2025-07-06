const MaintenanceRecord = require('../models/MaintenanceRecord');
const { t } = require('../utils/translations');

exports.createMaintenance = async (req, res) => {
  try {
    console.log('Creating maintenance record with data:', req.body);
    
    const record = new MaintenanceRecord(req.body);
    await record.save();
    
    console.log('Maintenance record created successfully:', record);
    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating maintenance record:', err);
    console.error('Validation errors:', err.errors);
    res.status(400).json({ error: t('databaseQueryError'), details: err.message });
  }
};

exports.getMaintenances = async (req, res) => {
  try {
    const records = await MaintenanceRecord.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMaintenanceById = async (req, res) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: t('maintenanceRecordNotFound') });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: t('maintenanceRecordNotFound') });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: t('maintenanceRecordNotFound') });
    res.json({ message: t('maintenanceRecordDeleted') });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 