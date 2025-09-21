const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (category) {
      where.categories = {
        some: {
          categoryId: parseInt(category)
        }
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          images: {
            orderBy: {
              sortOrder: 'asc'
            }
          },
          variants: true,
          _count: {
            select: {
              variants: true,
              images: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

// 获取单个商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variants: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
});

// 创建商品
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      comparePrice,
      costPrice,
      sku,
      barcode,
      trackQuantity,
      quantity,
      lowStockThreshold,
      status,
      isVisible,
      isFeatured,
      metaTitle,
      metaDescription,
      weight,
      dimensions,
      material,
      brand,
      categoryIds,
      variants
    } = req.body;

    // 验证必填字段
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: '商品名称和价格为必填项'
      });
    }

    // 检查slug是否已存在
    if (slug) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'URL别名已存在'
        });
      }
    }

    // 创建商品
    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        shortDesc,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku,
        barcode,
        trackQuantity: trackQuantity === 'true',
        quantity: quantity ? parseInt(quantity) : 0,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
        status: status || 'DRAFT',
        isVisible: isVisible === 'true',
        isFeatured: isFeatured === 'true',
        metaTitle,
        metaDescription,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        material,
        brand,
        authorId: 1 // 临时使用固定用户ID
      }
    });

    // 添加分类关联
    if (categoryIds) {
      const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      await Promise.all(
        categoryIdArray.map(categoryId =>
          prisma.productCategory.create({
            data: {
              productId: product.id,
              categoryId: parseInt(categoryId)
            }
          })
        )
      );
    }

    // 处理上传的图片
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file, index) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              url: `/uploads/products/${file.filename}`,
              altText: `${name} - 图片 ${index + 1}`,
              sortOrder: index,
              isMain: index === 0
            }
          })
        )
      );
    }

    // 处理商品规格
    if (variants) {
      const variantData = Array.isArray(variants) ? variants : [variants];
      await Promise.all(
        variantData.map(variant =>
          prisma.productVariant.create({
            data: {
              productId: product.id,
              title: variant.title,
              price: variant.price ? parseFloat(variant.price) : null,
              comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
              sku: variant.sku,
              barcode: variant.barcode,
              quantity: variant.quantity ? parseInt(variant.quantity) : 0,
              options: JSON.stringify(variant.options || {}),
              image: variant.image,
              isActive: variant.isActive !== false
            }
          })
        )
      );
    }

    // 获取完整的商品信息返回
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variants: true
      }
    });

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: createdProduct
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({
      success: false,
      message: '创建商品失败',
      error: error.message
    });
  }
});

// 更新商品
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      comparePrice,
      costPrice,
      sku,
      barcode,
      trackQuantity,
      quantity,
      lowStockThreshold,
      status,
      isVisible,
      isFeatured,
      metaTitle,
      metaDescription,
      weight,
      dimensions,
      material,
      brand,
      categoryIds,
      variants,
      removeImageIds
    } = req.body;

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 检查slug是否已被其他商品使用
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'URL别名已存在'
        });
      }
    }

    // 更新商品基本信息
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        shortDesc,
        price: price ? parseFloat(price) : undefined,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku,
        barcode,
        trackQuantity: trackQuantity !== undefined ? trackQuantity === 'true' : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : undefined,
        status,
        isVisible: isVisible !== undefined ? isVisible === 'true' : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
        metaTitle,
        metaDescription,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        material,
        brand,
        publishedAt: status === 'ACTIVE' && existingProduct.status !== 'ACTIVE' ? new Date() : undefined
      }
    });

    // 更新分类关联
    if (categoryIds !== undefined) {
      // 删除现有分类关联
      await prisma.productCategory.deleteMany({
        where: { productId: parseInt(id) }
      });

      // 添加新的分类关联
      if (categoryIds) {
        const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
        await Promise.all(
          categoryIdArray.map(categoryId =>
            prisma.productCategory.create({
              data: {
                productId: parseInt(id),
                categoryId: parseInt(categoryId)
              }
            })
          )
        );
      }
    }

    // 删除指定的图片
    if (removeImageIds) {
      const imageIdsToRemove = Array.isArray(removeImageIds) ? removeImageIds : [removeImageIds];
      await prisma.productImage.deleteMany({
        where: {
          id: { in: imageIdsToRemove.map(id => parseInt(id)) },
          productId: parseInt(id)
        }
      });
    }

    // 添加新上传的图片
    if (req.files && req.files.length > 0) {
      const existingImagesCount = await prisma.productImage.count({
        where: { productId: parseInt(id) }
      });

      await Promise.all(
        req.files.map((file, index) =>
          prisma.productImage.create({
            data: {
              productId: parseInt(id),
              url: `/uploads/products/${file.filename}`,
              altText: `${name} - 图片 ${existingImagesCount + index + 1}`,
              sortOrder: existingImagesCount + index,
              isMain: existingImagesCount === 0 && index === 0
            }
          })
        )
      );
    }

    // 获取完整的商品信息返回
    const result = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variants: true
      }
    });

    res.json({
      success: true,
      message: '商品更新成功',
      data: result
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新商品失败',
      error: error.message
    });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 删除商品（级联删除会自动删除关联的图片、规格等）
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    // 删除商品图片文件
    product.images.forEach(image => {
      const filePath = path.join(__dirname, '../../', image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message
    });
  }
});

// 批量操作
router.post('/batch', async (req, res) => {
  try {
    const { action, productIds } = req.body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: '参数错误'
      });
    }

    const ids = productIds.map(id => parseInt(id));

    switch (action) {
      case 'delete':
        await prisma.product.deleteMany({
          where: { id: { in: ids } }
        });
        break;
      case 'activate':
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { status: 'ACTIVE', publishedAt: new Date() }
        });
        break;
      case 'deactivate':
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { status: 'DRAFT' }
        });
        break;
      case 'archive':
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { status: 'ARCHIVED' }
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '不支持的操作'
        });
    }

    res.json({
      success: true,
      message: `批量${action}操作成功`
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作失败',
      error: error.message
    });
  }
});

module.exports = router;