const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const { includeProducts = false, parentId } = req.query;
    
    const where = {};
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: true,
        children: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        ...(includeProducts === 'true' && {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
            }
          }
        }),
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 获取分类树结构
router.get('/tree', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        children: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ],
          include: {
            children: {
              orderBy: [
                { sortOrder: 'asc' },
                { name: 'asc' }
              ],
              include: {
                _count: {
                  select: {
                    products: true
                  }
                }
              }
            },
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类树失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类树失败',
      error: error.message
    });
  }
});

// 获取单个分类详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        parent: true,
        children: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                status: true,
                images: {
                  where: { isMain: true },
                  take: 1
                }
              }
            }
          }
        },
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message
    });
  }
});

// 创建分类
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      parentId,
      sortOrder
    } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称为必填项'
      });
    }

    // 检查slug是否已存在
    if (slug) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'URL别名已存在'
        });
      }
    }

    // 如果指定了父分类，检查父分类是否存在
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parseInt(parentId) }
      });
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: '父分类不存在'
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        parentId: parentId ? parseInt(parentId) : null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      },
      include: {
        parent: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: category
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      parentId,
      sortOrder
    } = req.body;

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 检查slug是否已被其他分类使用
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'URL别名已存在'
        });
      }
    }

    // 如果指定了父分类，检查父分类是否存在且不是自己或自己的子分类
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parseInt(parentId) }
      });
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: '父分类不存在'
        });
      }

      // 防止循环引用
      if (parseInt(parentId) === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: '不能将分类设置为自己的父分类'
        });
      }

      // 检查是否会造成循环引用（简单检查，实际应该递归检查所有子分类）
      const children = await prisma.category.findMany({
        where: { parentId: parseInt(id) }
      });
      if (children.some(child => child.id === parseInt(parentId))) {
        return res.status(400).json({
          success: false,
          message: '不能将子分类设置为父分类'
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        parentId: parentId ? parseInt(parentId) : null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined
      },
      include: {
        parent: true,
        children: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: '分类更新成功',
      data: updatedCategory
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
});

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        products: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 检查是否有子分类
    if (category.children.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下还有子分类，请先删除子分类'
      });
    }

    // 检查是否有商品
    if (category.products.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下还有商品，请先移除或删除商品'
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
});

// 批量更新分类排序
router.post('/reorder', async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: '参数格式错误'
      });
    }

    // 批量更新排序
    await Promise.all(
      categories.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id: parseInt(id) },
          data: { sortOrder: parseInt(sortOrder) }
        })
      )
    );

    res.json({
      success: true,
      message: '分类排序更新成功'
    });
  } catch (error) {
    console.error('更新分类排序失败:', error);
    res.status(500).json({
      success: false,
      message: '更新分类排序失败',
      error: error.message
    });
  }
});

module.exports = router;