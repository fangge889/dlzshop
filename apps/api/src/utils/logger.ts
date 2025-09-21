import winston from 'winston';
import path from 'path';

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 文件传输配置
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // 错误日志文件
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // 所有日志文件
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// 在生产环境中不输出到控制台
if (process.env.NODE_ENV === 'production') {
  logger.remove(logger.transports[0]);
}

export { logger };
export default logger;