import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// 获取系统设置
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'success',
      data: {
        siteName: 'DLZ Shop CMS',
        version: '2.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取设置失败'
    });
  }
});

export default router;