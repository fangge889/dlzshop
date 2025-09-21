import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// 确保上传目录存在
const ensureUploadDir = async (dir: string) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// 获取媒体文件列表
export const getMediaFiles = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { originalName: { contains: search as string } },
        { altText: { contains: search as string } },
        { caption: { contains: search as string } }
      ];
    }

    if (type) {
      where.mimeType = { startsWith: type as string };
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: { id: true, username: true }
          }
        }
      }),
      prisma.mediaFile.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        files,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('获取媒体文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取媒体文件失败'
    });
  }
};

// 上传媒体文件
export const uploadMediaFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const userId = (req as any).user?.id;

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '没有上传文件'
      });
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    const thumbnailDir = path.join(uploadDir, 'thumbnails');
    
    await ensureUploadDir(uploadDir);
    await ensureUploadDir(thumbnailDir);

    const uploadedFiles = [];

    for (const file of files) {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;
      const filePath = path.join(uploadDir, filename);
      const thumbnailPath = path.join(thumbnailDir, `thumb_${filename}`);

      // 保存原始文件
      await fs.writeFile(filePath, file.buffer);

      let width: number | undefined;
      let height: number | undefined;
      let thumbnailUrl: string | undefined;

      // 如果是图片，处理图片信息和缩略图
      if (file.mimetype.startsWith('image/')) {
        try {
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width;
          height = metadata.height;

          // 生成缩略图 (300x300)
          await sharp(file.buffer)
            .resize(300, 300, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

          thumbnailUrl = `/uploads/thumbnails/thumb_${filename}`;
        } catch (imageError) {
          logger.warn('图片处理失败:', imageError);
        }
      }

      // 保存到数据库
      const mediaFile = await prisma.mediaFile.create({
        data: {
          filename,
          originalName: file.originalname,
          filePath: `/uploads/${filename}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          width,
          height,
          uploadedBy: userId
        },
        include: {
          uploader: {
            select: { id: true, username: true }
          }
        }
      });

      uploadedFiles.push({
        ...mediaFile,
        thumbnailUrl
      });
    }

    res.json({
      status: 'success',
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      data: uploadedFiles
    });

  } catch (error) {
    logger.error('文件上传失败:', error);
    res.status(500).json({
      status: 'error',
      message: '文件上传失败'
    });
  }
};

// 获取单个媒体文件
export const getMediaFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const file = await prisma.mediaFile.findUnique({
      where: { id: Number(id) },
      include: {
        uploader: {
          select: { id: true, username: true }
        }
      }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    res.json({
      status: 'success',
      data: file
    });
  } catch (error) {
    logger.error('获取媒体文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取媒体文件失败'
    });
  }
};

// 更新媒体文件信息
export const updateMediaFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { altText, caption } = req.body;

    const file = await prisma.mediaFile.update({
      where: { id: Number(id) },
      data: {
        altText,
        caption
      },
      include: {
        uploader: {
          select: { id: true, username: true }
        }
      }
    });

    res.json({
      status: 'success',
      message: '文件信息更新成功',
      data: file
    });
  } catch (error) {
    logger.error('更新媒体文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新媒体文件失败'
    });
  }
};

// 删除媒体文件
export const deleteMediaFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const file = await prisma.mediaFile.findUnique({
      where: { id: Number(id) }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    // 删除物理文件
    const fullPath = path.join(__dirname, '../../uploads', file.filename);
    const thumbnailPath = path.join(__dirname, '../../uploads/thumbnails', `thumb_${file.filename}`);

    try {
      await fs.unlink(fullPath);
      await fs.unlink(thumbnailPath).catch(() => {}); // 缩略图可能不存在
    } catch (fileError) {
      logger.warn('删除物理文件失败:', fileError);
    }

    // 从数据库删除
    await prisma.mediaFile.delete({
      where: { id: Number(id) }
    });

    res.json({
      status: 'success',
      message: '文件删除成功'
    });
  } catch (error) {
    logger.error('删除媒体文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '删除媒体文件失败'
    });
  }
};

// 批量删除媒体文件
export const deleteMediaFiles = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '请提供要删除的文件ID列表'
      });
    }

    const files = await prisma.mediaFile.findMany({
      where: { id: { in: ids.map(Number) } }
    });

    // 删除物理文件
    for (const file of files) {
      const fullPath = path.join(__dirname, '../../uploads', file.filename);
      const thumbnailPath = path.join(__dirname, '../../uploads/thumbnails', `thumb_${file.filename}`);

      try {
        await fs.unlink(fullPath);
        await fs.unlink(thumbnailPath).catch(() => {});
      } catch (fileError) {
        logger.warn(`删除物理文件失败 ${file.filename}:`, fileError);
      }
    }

    // 从数据库批量删除
    const result = await prisma.mediaFile.deleteMany({
      where: { id: { in: ids.map(Number) } }
    });

    res.json({
      status: 'success',
      message: `成功删除 ${result.count} 个文件`
    });
  } catch (error) {
    logger.error('批量删除媒体文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '批量删除媒体文件失败'
    });
  }
};

// 图片处理 - 调整大小
export const resizeImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { width, height, quality = 80 } = req.body;

    const file = await prisma.mediaFile.findUnique({
      where: { id: Number(id) }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    if (!file.mimeType.startsWith('image/')) {
      return res.status(400).json({
        status: 'error',
        message: '只能处理图片文件'
      });
    }

    const originalPath = path.join(__dirname, '../../uploads', file.filename);
    const resizedFilename = `resized_${width}x${height}_${file.filename}`;
    const resizedPath = path.join(__dirname, '../../uploads', resizedFilename);

    // 使用 Sharp 调整图片大小
    await sharp(originalPath)
      .resize(Number(width), Number(height), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: Number(quality) })
      .toFile(resizedPath);

    // 获取调整后的文件信息
    const stats = await fs.stat(resizedPath);
    const metadata = await sharp(resizedPath).metadata();

    // 创建新的媒体文件记录
    const resizedFile = await prisma.mediaFile.create({
      data: {
        filename: resizedFilename,
        originalName: `${width}x${height}_${file.originalName}`,
        filePath: `/uploads/${resizedFilename}`,
        fileSize: stats.size,
        mimeType: file.mimeType,
        width: metadata.width,
        height: metadata.height,
        uploadedBy: (req as any).user?.id
      }
    });

    res.json({
      status: 'success',
      message: '图片处理成功',
      data: resizedFile
    });
  } catch (error) {
    logger.error('图片处理失败:', error);
    res.status(500).json({
      status: 'error',
      message: '图片处理失败'
    });
  }
};