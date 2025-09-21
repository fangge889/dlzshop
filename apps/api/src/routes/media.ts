import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// 获取媒体文件列表
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'success',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取媒体文件失败'
    });
  }
});

export default router;