const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('displayName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters')
    .trim(),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateProfileUpdate = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Bio cannot exceed 150 characters')
    .trim(),
  
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
    .trim(),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value'),
  
  handleValidationErrors
];

// Post validation rules
const validatePostCreation = [
  body('caption')
    .isLength({ min: 1, max: 500 })
    .withMessage('Caption must be between 1 and 500 characters')
    .trim(),
  
  body('hashtags')
    .optional()
    .isArray()
    .withMessage('Hashtags must be an array'),
  
  body('hashtags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each hashtag must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Hashtags can only contain letters, numbers, and underscores'),
  
  body('location.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location name cannot exceed 100 characters'),
  
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  handleValidationErrors
];

// Story validation rules
const validateStoryCreation = [
  body('caption')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Caption cannot exceed 200 characters')
    .trim(),
  
  body('music.title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Music title cannot exceed 100 characters'),
  
  body('music.artist')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Music artist cannot exceed 100 characters'),
  
  body('music.duration')
    .optional()
    .isInt({ min: 0, max: 300 })
    .withMessage('Music duration must be between 0 and 300 seconds'),
  
  body('textOverlay.text')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Text overlay cannot exceed 100 characters'),
  
  body('textOverlay.color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Text overlay color must be a valid hex color'),
  
  body('textOverlay.position.x')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Text overlay X position must be between 0 and 100'),
  
  body('textOverlay.position.y')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Text overlay Y position must be between 0 and 100'),
  
  body('textOverlay.size')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Text overlay size must be small, medium, or large'),
  
  handleValidationErrors
];

// Comment validation rules
const validateCommentCreation = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim(),
  
  handleValidationErrors
];

// Duet validation rules
const validateDuetCreation = [
  body('response')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Duet response must be between 1 and 1000 characters')
    .trim(),
  
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  handleValidationErrors
];

// Message validation rules
const validateMessageCreation = [
  body('content')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters')
    .trim(),
  
  body('type')
    .isIn(['text', 'image', 'video', 'audio', 'file'])
    .withMessage('Message type must be text, image, video, audio, or file'),
  
  body('receiverId')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePostCreation,
  validateStoryCreation,
  validateCommentCreation,
  validateDuetCreation,
  validateMessageCreation,
  validateObjectId,
  validatePagination
};
