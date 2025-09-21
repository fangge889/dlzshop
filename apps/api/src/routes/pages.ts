import { Router } from 'express';
import { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage 
} from '@/controllers/pageController';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  createPageSchema, 
  updatePageSchema, 
  getPageSchema 
} from '@/schemas/pageSchemas';

const router = Router();

// 获取页面列表 (公开访问)
router.get('/', getPages);

// 获取单个页面 (公开访问)
router.get('/:id', validateRequest(getPageSchema), getPage);

// 以下路由需要认证
router.use(authenticateToken);

// 创建页面
router.post('/', validateRequest(createPageSchema), createPage);

// 更新页面
router.put('/:id', validateRequest(updatePageSchema), updatePage);

// 删除页面
router.delete('/:id', deletePage);

export default router;