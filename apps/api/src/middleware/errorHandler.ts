import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// 创建应用错误
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 处理 Prisma 错误
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      return new AppError('数据已存在，违反唯一约束', 409);
    case 'P2014':
      return new AppError('数据关联冲突', 400);
    case 'P2003':
      return new AppError('外键约束失败', 400);
    case 'P2025':
      return new AppError('记录未找到', 404);
    default:
      return new AppError('数据库操作失败', 500);
  }
}

// 处理验证错误
function handleValidationError(error: any): AppError {
  const errors = Object.values(error.errors).map((err: any) => err.message);
  const message = `输入数据无效: ${errors.join('. ')}`;
  return new AppError(message, 400);
}

// 处理 JWT 错误
function handleJWTError(): AppError {
  return new AppError('无效的令牌，请重新登录', 401);
}

function handleJWTExpiredError(): AppError {
  return new AppError('令牌已过期，请重新登录', 401);
}

// 发送错误响应
function sendErrorDev(err: AppError, res: Response): void {
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err: AppError, res: Response): void {
  // 操作错误：发送消息给客户端
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
    });
  } else {
    // 编程错误：不泄露错误详情
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
    });
  }
}

// 全局错误处理中间件
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // 处理特定类型的错误
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaError(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
}

// 异步错误捕获包装器
export function catchAsync(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}