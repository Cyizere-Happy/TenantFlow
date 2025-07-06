const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const jwt = require('jsonwebtoken');
const { t } = require('./utils/translations');

// Load environment variables
dotenv.config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Serve static files (uploaded images) with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  console.log('🔐 Authenticating request to:', req.path);
  console.log('📋 Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🎫 Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: t('noTokenProvided') });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ error: t('invalidToken') });
    }
    console.log('✅ Token verified, user:', user);
    req.user = user;
    next();
  });
}

// Register routes BEFORE 404 handler
app.use('/api/users', userRoutes);
app.use('/api', authenticateToken);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: t('notFound') });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: t('fileTooLarge') });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: t('tooManyFiles') });
    }
    return res.status(400).json({ error: t('fileUploadError') });
  }
  
  // Handle other file upload errors
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: t('onlyImagesAllowed') });
  }
  
  res.status(500).json({ error: t('internalServerError') });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 