import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

// 请求验证中间件
export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join('; ');
      
      return next(new AppError(`输入验证失败: ${errorMessage}`, 400));
    }

    // 将验证后的数据替换原始请求体
    req.body = value;
    next();
  };
}

// 查询参数验证中间件
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join('; ');
      
      return next(new AppError(`查询参数验证失败: ${errorMessage}`, 400));
    }

    req.query = value;
    next();
  };
}

// 路径参数验证中间件
export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join('; ');
      
      return next(new AppError(`路径参数验证失败: ${errorMessage}`, 400));
    }

    req.params = value;
    next();
  };
}