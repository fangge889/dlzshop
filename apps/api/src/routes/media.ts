import { Router } from 'express';
import {
  getMediaFiles,
  uploadMediaFiles,
  getMediaFile,
  updateMediaFile,
  deleteMediaFile,
  deleteMediaFiles,
  resizeImage
} from '../controllers/mediaController';
import { uploadMultiple, uploadImage, handleUploadError } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// 所有媒体路由都需要认证
router.use(authMiddleware);

// 获取媒体文件列表
router.get('/', getMediaFiles);

// 上传媒体文件
router.post('/upload', uploadMultiple, handleUploadError, uploadMediaFiles);

// 上传图片（专用）
router.post('/upload-images', uploadImage, handleUploadError, uploadMediaFiles);

// 获取单个媒体文件
router.get('/:id', getMediaFile);

// 更新媒体文件信息
router.put('/:id', updateMediaFile);

// 删除单个媒体文件
router.delete('/:id', deleteMediaFile);

// 批量删除媒体文件
router.delete('/', deleteMediaFiles);

// 图片处理 - 调整大小
router.post('/:id/resize', resizeImage);

export default router;