const Complaint = require('../models/Complaint');
const { t } = require('../utils/translations');

exports.createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: t('complaintNotFound') });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: t('complaintNotFound') });
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ error: t('complaintNotFound') });
    res.json({ message: t('complaintDeleted') });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 