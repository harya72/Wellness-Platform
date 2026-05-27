

const multer = require('multer');
const { errorResponse, HTTP_STATUS } = require('../utils/responses');


const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];


const MAX_FILE_SIZE = 5 * 1024 * 1024;


const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      ),
      false
    );
  }
};


const storage = multer.memoryStorage();


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});


const singleImageUpload = upload.single('image');


const handleUpload = (req, res, next) => {
  singleImageUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return errorResponse(res, {
              statusCode: HTTP_STATUS.BAD_REQUEST.code,
              message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            });
          case 'LIMIT_FILE_COUNT':
            return errorResponse(res, {
              statusCode: HTTP_STATUS.BAD_REQUEST.code,
              message: 'Too many files. Only one file allowed.',
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return errorResponse(res, {
              statusCode: HTTP_STATUS.BAD_REQUEST.code,
              message: 'Unexpected field name. Use "image" as the field name.',
            });
          default:
            return errorResponse(res, {
              statusCode: HTTP_STATUS.BAD_REQUEST.code,
              message: err.message,
            });
        }
      } else if (err) {
        return errorResponse(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST.code,
          message: err.message,
        });
      }
    }
    next();
  });
};


const requireImage = (req, res, next) => {
  if (!req.file) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST.code,
      message: 'Image file is required',
    });
  }
  next();
};

/**
 * Get file buffer and info from request
 * @param {Object} req - Express request object
 * @returns {Object|null} - File info or null
 */
const getFileInfo = (req) => {
  if (!req.file) {
    return null;
  }

  return {
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
    size: req.file.size,
  };
};

module.exports = {
  handleUpload,
  requireImage,
  getFileInfo,
  singleImageUpload,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
