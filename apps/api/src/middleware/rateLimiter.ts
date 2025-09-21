import rateLimit from 'express-rate-limit';
import { logger } from '@/utils/logger';

// 基础速率限制
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100个请求
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: '请求过于频繁，请稍后再试',
    });
  },
});

// 严格的速率限制（用于登录等敏感操作）
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP 5次尝试
  message: {
    status: 'error',
    message: '尝试次数过多，请15分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// 文件上传速率限制
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 限制每个IP 10次上传
  message: {
    status: 'error',
    message: '上传过于频繁，请稍后再试',
  },
});