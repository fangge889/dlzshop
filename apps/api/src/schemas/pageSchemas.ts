import Joi from 'joi';

// 创建页面验证模式
export const createPageSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required().min(1).max(200).messages({
      'string.empty': '页面标题不能为空',
      'string.min': '页面标题至少1个字符',
      'string.max': '页面标题不能超过200个字符',
      'any.required': '页面标题是必填项'
    }),
    slug: Joi.string().required().pattern(/^[a-z0-9-]+$/).min(1).max(100).messages({
      'string.empty': '页面路径不能为空',
      'string.pattern.base': '页面路径只能包含小写字母、数字和连字符',
      'string.min': '页面路径至少1个字符',
      'string.max': '页面路径不能超过100个字符',
      'any.required': '页面路径是必填项'
    }),
    content: Joi.string().allow('').max(50000).messages({
      'string.max': '页面内容不能超过50000个字符'
    }),
    excerpt: Joi.string().allow('').max(500).messages({
      'string.max': '页面摘要不能超过500个字符'
    }),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED').default('DRAFT'),
    metaTitle: Joi.string().allow('').max(60).messages({
      'string.max': 'SEO标题不能超过60个字符'
    }),
    metaDescription: Joi.string().allow('').max(160).messages({
      'string.max': 'SEO描述不能超过160个字符'
    }),
    metaKeywords: Joi.string().allow('').max(200).messages({
      'string.max': '关键词不能超过200个字符'
    }),
    featuredImage: Joi.string().uri().allow('').messages({
      'string.uri': '特色图片必须是有效的URL'
    }),
    publishedAt: Joi.date().iso().allow(null),
  })
});

// 更新页面验证模式
export const updatePageSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': '页面ID必须是数字',
      'number.integer': '页面ID必须是整数',
      'number.positive': '页面ID必须是正数',
      'any.required': '页面ID是必填项'
    })
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(200).messages({
      'string.empty': '页面标题不能为空',
      'string.min': '页面标题至少1个字符',
      'string.max': '页面标题不能超过200个字符'
    }),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(1).max(100).messages({
      'string.empty': '页面路径不能为空',
      'string.pattern.base': '页面路径只能包含小写字母、数字和连字符',
      'string.min': '页面路径至少1个字符',
      'string.max': '页面路径不能超过100个字符'
    }),
    content: Joi.string().allow('').max(50000).messages({
      'string.max': '页面内容不能超过50000个字符'
    }),
    excerpt: Joi.string().allow('').max(500).messages({
      'string.max': '页面摘要不能超过500个字符'
    }),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'),
    metaTitle: Joi.string().allow('').max(60).messages({
      'string.max': 'SEO标题不能超过60个字符'
    }),
    metaDescription: Joi.string().allow('').max(160).messages({
      'string.max': 'SEO描述不能超过160个字符'
    }),
    metaKeywords: Joi.string().allow('').max(200).messages({
      'string.max': '关键词不能超过200个字符'
    }),
    featuredImage: Joi.string().uri().allow('').messages({
      'string.uri': '特色图片必须是有效的URL'
    }),
    publishedAt: Joi.date().iso().allow(null),
  }).min(1).messages({
    'object.min': '至少需要提供一个要更新的字段'
  })
});

// 获取页面验证模式
export const getPageSchema = Joi.object({
  params: Joi.object({
    id: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^[a-z0-9-]+$/)
    ).required().messages({
      'alternatives.match': '页面ID必须是数字或有效的slug',
      'any.required': '页面ID是必填项'
    })
  }),
  query: Joi.object({
    include: Joi.string().valid('author', 'comments').optional()
  })
});

// 获取页面列表验证模式
export const getPagesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码必须大于0'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量必须大于0',
      'number.max': '每页数量不能超过100'
    }),
    search: Joi.string().max(100).messages({
      'string.max': '搜索关键词不能超过100个字符'
    }),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'),
    sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt', 'publishedAt').default('updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    authorId: Joi.number().integer().positive().messages({
      'number.base': '作者ID必须是数字',
      'number.integer': '作者ID必须是整数',
      'number.positive': '作者ID必须是正数'
    })
  })
});