import { Router } from 'express';
import { authController } from '@/controllers/authController';
import { strictRateLimiter } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';
import { loginSchema, registerSchema } from '@/schemas/authSchemas';

const router = Router();

// 用户注册
router.post('/register', strictRateLimiter, validateRequest(registerSchema), authController.register);

// 用户登录
router.post('/login', strictRateLimiter, validateRequest(loginSchema), authController.login);

// 刷新令牌
router.post('/refresh', authController.refreshToken);

// 用户登出
router.post('/logout', authController.logout);

// 忘记密码
router.post('/forgot-password', strictRateLimiter, authController.forgotPassword);

// 重置密码
router.post('/reset-password', authController.resetPassword);

export default router;