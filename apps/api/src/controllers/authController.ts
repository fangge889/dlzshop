import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/database/connection';
import { AppError, catchAsync } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// 生成 JWT 令牌
function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// 生成刷新令牌
function generateRefreshToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

// 用户注册
const register = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password, role = 'AUTHOR' } = req.body;

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    throw new AppError('用户名或邮箱已存在', 409);
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 12);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // 生成令牌
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`新用户注册: ${username} (${email})`);

  res.status(201).json({
    status: 'success',
    message: '注册成功',
    data: {
      user,
      token,
      refreshToken,
    },
  });
});

// 用户登录
const login = catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 查找用户
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: username },
      ],
    },
  });

  if (!user || !user.isActive) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // 生成令牌
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`用户登录: ${user.username}`);

  res.json({
    status: 'success',
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
      refreshToken,
    },
  });
});

// 刷新令牌
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('未提供刷新令牌', 401);
  }

  // 验证刷新令牌
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as any;

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError('无效的刷新令牌', 401);
  }

  // 生成新的访问令牌
  const newToken = generateToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  res.json({
    status: 'success',
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
    },
  });
});

// 用户登出
const logout = catchAsync(async (req: Request, res: Response) => {
  // 在实际应用中，这里可以将令牌加入黑名单
  res.json({
    status: 'success',
    message: '登出成功',
  });
});

// 忘记密码
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // 为了安全，即使用户不存在也返回成功消息
    return res.json({
      status: 'success',
      message: '如果该邮箱存在，重置密码链接已发送',
    });
  }

  // 生成重置令牌
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  // 在实际应用中，这里应该发送邮件
  logger.info(`密码重置请求: ${email}, 令牌: ${resetToken}`);

  res.json({
    status: 'success',
    message: '如果该邮箱存在，重置密码链接已发送',
    // 开发环境下返回令牌
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

// 重置密码
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // 验证重置令牌
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new AppError('无效的重置令牌', 400);
  }

  // 更新密码
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  logger.info(`密码重置成功: ${user.username}`);

  res.json({
    status: 'success',
    message: '密码重置成功',
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};