const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { uploadSingleImage, uploadMultipleImages } = require('../middleware/upload');

// Property CRUD operations with image upload
router.post('/', uploadSingleImage('image'), propertyController.createProperty);
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.put('/:id', uploadSingleImage('image'), propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

// Additional image management routes
router.post('/:id/images', uploadMultipleImages('images', 5), propertyController.uploadPropertyImages);
router.delete('/:propertyId/images/:imagePath', propertyController.deletePropertyImage);

module.exports = router; 