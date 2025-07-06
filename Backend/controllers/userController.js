const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { t } = require('../utils/translations');

// Register Controller
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: t('emailAlreadyInUse') });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role, avatar });
    await user.save();

    res.status(201).json({ message: t('userRegisteredSuccessfully') });
  } catch (err) {
    console.error('🔥 Register Error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    console.log('📥 Login Request Body:', req.body);
    console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ error: t('invalidCredentials') });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ error: t('invalidCredentials') });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ Token created:', token);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('🔥 Login Error:', err); // 🔴 This is the key
    res.status(500).json({ error: t('internalServerError') });
  }
};


// Validation Rules
exports.validate = (method) => {
  switch (method) {
    case 'register':
      return [
        body('name').notEmpty().withMessage(t('nameRequired')),
        body('email').isEmail().withMessage(t('validEmailRequired')),
        body('password').isLength({ min: 6 }).withMessage(t('passwordMinLength')),
        body('role').notEmpty().withMessage(t('roleRequired')),
      ];
    case 'login':
      return [
        body('email').isEmail().withMessage(t('validEmailRequired')),
        body('password').notEmpty().withMessage(t('passwordRequired')),
      ];
    default:
      return [];
  }
};

// Validation Handler
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
