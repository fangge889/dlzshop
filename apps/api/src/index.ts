import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// 导入路由和中间件
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { rateLimiter } from '@/middleware/rateLimiter';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/database/connection';
import { setupSocketIO } from '@/services/socketService';

// 导入路由
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import pageRoutes from '@/routes/pages';
import mediaRoutes from '@/routes/media';
import categoryRoutes from '@/routes/categories';
import tagRoutes from '@/routes/tags';
import settingRoutes from '@/routes/settings';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 速率限制
app.use('/api', rateLimiter);

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/settings', authMiddleware, settingRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Socket.IO 设置
setupSocketIO(io);

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 启动服务器
async function startServer(): Promise<void> {
  try {
    // 连接数据库
    await connectDatabase();
    logger.info('数据库连接成功');

    // 启动服务器
    server.listen(PORT, () => {
      logger.info(`🚀 服务器运行在 http://${HOST}:${PORT}`);
      logger.info(`📊 健康检查: http://${HOST}:${PORT}/health`);
      logger.info(`🔌 Socket.IO 已启用`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

startServer();

export { app, server, io };