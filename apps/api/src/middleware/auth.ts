import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/database/connection';
import { AppError, catchAsync } from './errorHandler';
import { logger } from '@/utils/logger';

// 扩展 Request 接口
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

// JWT 令牌验证中间件
export const authMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. 获取令牌
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('未提供访问令牌，请先登录', 401));
    }

    // 2. 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 3. 检查用户是否仍然存在
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!currentUser) {
      return next(new AppError('令牌对应的用户不存在', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('用户账户已被禁用', 401));
    }

    // 4. 将用户信息添加到请求对象
    req.user = currentUser;
    next();
  }
);

// 权限检查中间件
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('未认证的用户', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`用户 ${req.user.username} 尝试访问需要 ${roles.join('/')} 权限的资源`);
      return next(new AppError('权限不足', 403));
    }

    next();
  };
}

// 可选的认证中间件（不强制要求登录）
export const optionalAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const currentUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
          },
        });

        if (currentUser && currentUser.isActive) {
          req.user = currentUser;
        }
      } catch (error) {
        // 忽略令牌错误，继续处理请求
        logger.debug('可选认证失败:', error);
      }
    }

    next();
  }
);