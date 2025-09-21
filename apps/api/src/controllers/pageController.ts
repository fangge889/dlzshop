import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

export const getPages = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      }),
      prisma.page.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        pages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('获取页面列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面列表失败'
    });
  }
};

export const getPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const page = await prisma.page.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    logger.error('获取页面详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面详情失败'
    });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      status = 'DRAFT',
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage
    } = req.body;

    // 检查 slug 是否已存在
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: '页面路径已存在'
      });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        metaTitle,
        metaDescription,
        metaKeywords,
        featuredImage,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    logger.info(`页面创建成功: ${title}`, { pageId: page.id, userId: req.user.id });

    res.status(201).json({
      success: true,
      data: page,
      message: '页面创建成功'
    });
  } catch (error) {
    logger.error('创建页面失败:', error);
    res.status(500).json({
      success: false,
      message: '创建页面失败'
    });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage
    } = req.body;

    // 检查页面是否存在
    const existingPage = await prisma.page.findUnique({
      where: { id: Number(id) }
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    // 检查权限
    if (existingPage.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此页面'
      });
    }

    // 如果修改了 slug，检查是否与其他页面冲突
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: '页面路径已存在'
        });
      }
    }

    const page = await prisma.page.update({
      where: { id: Number(id) },
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        metaTitle,
        metaDescription,
        metaKeywords,
        featuredImage,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    logger.info(`页面更新成功: ${title}`, { pageId: page.id, userId: req.user.id });

    res.json({
      success: true,
      data: page,
      message: '页面更新成功'
    });
  } catch (error) {
    logger.error('更新页面失败:', error);
    res.status(500).json({
      success: false,
      message: '更新页面失败'
    });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPage = await prisma.page.findUnique({
      where: { id: Number(id) }
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    // 检查权限
    if (existingPage.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此页面'
      });
    }

    await prisma.page.delete({
      where: { id: Number(id) }
    });

    logger.info(`页面删除成功: ${existingPage.title}`, { pageId: id, userId: req.user.id });

    res.json({
      success: true,
      message: '页面删除成功'
    });
  } catch (error) {
    logger.error('删除页面失败:', error);
    res.status(500).json({
      success: false,
      message: '删除页面失败'
    });
  }
};