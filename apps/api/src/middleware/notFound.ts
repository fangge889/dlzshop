import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const err = new AppError(`找不到路径 ${req.originalUrl}`, 404);
  next(err);
}