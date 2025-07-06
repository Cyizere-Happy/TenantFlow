const Notification = require('../models/Notification');
const { t } = require('../utils/translations');

exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: t('notificationNotFound') });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: t('notificationNotFound') });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ error: t('notificationNotFound') });
    res.json({ message: t('notificationDeleted') });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 