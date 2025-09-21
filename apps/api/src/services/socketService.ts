import { Server } from 'socket.io';
import { logger } from '@/utils/logger';

export function setupSocketIO(io: Server): void {
  io.on('connection', (socket) => {
    logger.info(`用户连接: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`用户断开连接: ${socket.id}`);
    });

    // 加入房间
    socket.on('join-room', (room: string) => {
      socket.join(room);
      logger.info(`用户 ${socket.id} 加入房间: ${room}`);
    });

    // 离开房间
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      logger.info(`用户 ${socket.id} 离开房间: ${room}`);
    });
  });
}