import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
};

// 内存存储配置 - 用于处理上传的文件
const storage = multer.memoryStorage();

// 上传配置
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  }
});

// 单文件上传中间件
export const uploadSingle = uploadConfig.single('file');

// 多文件上传中间件
export const uploadMultiple = uploadConfig.array('files', 10);

// 图片上传中间件（只允许图片）
export const uploadImage = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
    files: 20
  }
}).array('images', 20);

// 错误处理中间件
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          status: 'error',
          message: '文件大小超出限制'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          status: 'error',
          message: '文件数量超出限制'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          status: 'error',
          message: '意外的文件字段'
        });
      default:
        return res.status(400).json({
          status: 'error',
          message: '文件上传错误'
        });
    }
  }

  if (error.message.includes('不支持的文件类型') || error.message.includes('只允许上传图片文件')) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

  next(error);
};