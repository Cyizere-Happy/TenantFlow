const Property = require('../models/Property');
const { t } = require('../utils/translations');
const { processAndSaveImage, deleteImage } = require('../middleware/upload');

exports.createProperty = async (req, res) => {
  try {
    let imagePath = null;
    
    // Handle image upload if file is present
    if (req.file) {
      try {
        imagePath = await processAndSaveImage(req.file, 'properties');
      } catch (imageError) {
        return res.status(400).json({ error: t('imageUploadError') });
      }
    }

    // Calculate monthly rent if not provided
    const monthlyRent = req.body.monthlyRent || (req.body.rentPerUnit * req.body.units);
    
    const propertyData = {
      ...req.body,
      image: imagePath,
      monthlyRent: monthlyRent,
      lastUpdated: new Date()
    };

    const property = new Property(propertyData);
    await property.save();
    
    res.status(201).json({
      success: true,
      message: t('propertyCreated'),
      property
    });
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      properties
    });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: t('propertyNotFound') });
    res.json({
      success: true,
      property
    });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: t('propertyNotFound') });

    let imagePath = property.image; // Keep existing image by default
    
    // Handle new image upload if file is present
    if (req.file) {
      try {
        // Delete old image if it exists
        if (property.image) {
          await deleteImage(property.image);
        }
        
        // Process and save new image
        imagePath = await processAndSaveImage(req.file, 'properties');
      } catch (imageError) {
        return res.status(400).json({ error: t('imageUploadError') });
      }
    }

    // Calculate monthly rent if not provided
    const monthlyRent = req.body.monthlyRent || (req.body.rentPerUnit * req.body.units);
    
    const updateData = {
      ...req.body,
      image: imagePath,
      monthlyRent: monthlyRent,
      lastUpdated: new Date()
    };

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json({
      success: true,
      message: t('propertyUpdated'),
      property: updatedProperty
    });
  } catch (err) {
    res.status(400).json({ error: t('databaseQueryError') });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    console.log('=== DELETE PROPERTY REQUEST ===');
    console.log('Request params:', req.params);
    console.log('Property ID:', req.params.id);
    console.log('Request headers:', req.headers);
    
    const property = await Property.findById(req.params.id);
    console.log('Property found:', property ? 'YES' : 'NO');
    
    if (!property) {
      console.log('Property not found, returning 404');
      return res.status(404).json({ error: t('propertyNotFound') });
    }

    console.log('Property found, deleting images...');
    // Delete associated images
    if (property.image) {
      console.log('Deleting main image:', property.image);
      await deleteImage(property.image);
    }
    if (property.images && property.images.length > 0) {
      console.log('Deleting additional images:', property.images.length);
      for (const imagePath of property.images) {
        await deleteImage(imagePath);
      }
    }

    console.log('Deleting property from database...');
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    console.log('Property deleted from database:', deletedProperty ? 'YES' : 'NO');
    
    console.log('Sending success response');
    res.json({ 
      success: true,
      message: t('propertyDeleted') 
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

// Upload additional images for a property
exports.uploadPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: t('propertyNotFound') });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: t('noImagesUploaded') });
    }

    const imagePaths = [];
    
    // Process each uploaded image
    for (const file of req.files) {
      try {
        const imagePath = await processAndSaveImage(file, 'properties');
        imagePaths.push(imagePath);
      } catch (imageError) {
        return res.status(400).json({ error: t('imageUploadError') });
      }
    }

    // Add new images to property
    property.images = [...(property.images || []), ...imagePaths];
    property.lastUpdated = new Date();
    await property.save();

    res.json({
      success: true,
      message: t('imagesUploaded'),
      images: imagePaths
    });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
};

// Delete a specific image from property
exports.deletePropertyImage = async (req, res) => {
  try {
    const { propertyId, imagePath } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: t('propertyNotFound') });

    // Decode the image path from URL
    const decodedImagePath = decodeURIComponent(imagePath);

    // Remove image from property
    property.images = property.images.filter(img => img !== decodedImagePath);
    property.lastUpdated = new Date();
    await property.save();

    // Delete image file
    await deleteImage(decodedImagePath);

    res.json({
      success: true,
      message: t('imageDeleted')
    });
  } catch (err) {
    res.status(500).json({ error: t('databaseQueryError') });
  }
}; 