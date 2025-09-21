import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// 创建 Prisma 客户端实例
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// 监听 Prisma 事件
prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Params: ${e.params}`);
  logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e.message);
});

// 连接数据库
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
}

// 断开数据库连接
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('数据库连接已断开');
  } catch (error) {
    logger.error('断开数据库连接时出错:', error);
    throw error;
  }
}

// 数据库健康检查
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('数据库健康检查失败:', error);
    return false;
  }
}

export { prisma };
export default prisma;