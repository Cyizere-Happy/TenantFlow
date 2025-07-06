const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Process and save image
const processAndSaveImage = async (file, folder = 'properties') => {
  try {
    const filename = `${uuidv4()}.webp`;
    const folderPath = path.join(imagesDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    const filepath = path.join(folderPath, filename);
    
    // Process image with sharp
    await sharp(file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toFile(filepath);
    
    // Return the relative path for database storage
    return `/uploads/images/${folder}/${filename}`;
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Delete image file
const deleteImage = async (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Middleware for single image upload
const uploadSingleImage = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Middleware for multiple images upload
const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  processAndSaveImage,
  deleteImage
}; 