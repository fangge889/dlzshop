import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// 获取用户信息
router.get('/profile', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'success',
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败'
    });
  }
});

export default router;