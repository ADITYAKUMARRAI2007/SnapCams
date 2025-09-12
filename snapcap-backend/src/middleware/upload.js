const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for different file types
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }
  });
};

// Multer configurations for different upload types
const avatarUpload = multer({
  storage: createStorage('snapcap/avatars', ['jpg', 'jpeg', 'png']),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  }
});

const postUpload = multer({
  storage: createStorage('snapcap/posts', ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed for posts'), false);
    }
  }
});

const storyUpload = multer({
  storage: createStorage('snapcap/stories', ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed for stories'), false);
    }
  }
});

const messageUpload = multer({
  storage: createStorage('snapcap/messages', ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'pdf', 'doc', 'docx']),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Upload failed'
  });
};

// Utility function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Utility function to get file info
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    url: file.path,
    publicId: file.filename,
    format: file.format,
    size: file.bytes,
    width: file.width,
    height: file.height,
    duration: file.duration // For videos
  };
};

module.exports = {
  avatarUpload,
  postUpload,
  storyUpload,
  messageUpload,
  handleUploadError,
  deleteFile,
  getFileInfo,
  cloudinary
};





