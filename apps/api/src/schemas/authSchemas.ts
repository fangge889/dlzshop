import Joi from 'joi';

// 用户注册验证模式
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少需要3个字符',
      'string.max': '用户名不能超过30个字符',
      'any.required': '用户名是必填项',
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项',
    }),
  
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': '密码至少需要6个字符',
      'string.pattern.base': '密码必须包含至少一个大写字母、一个小写字母和一个数字',
      'any.required': '密码是必填项',
    }),
  
  role: Joi.string()
    .valid('ADMIN', 'EDITOR', 'AUTHOR', 'SUBSCRIBER')
    .default('AUTHOR'),
});

// 用户登录验证模式
export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': '用户名或邮箱是必填项',
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码是必填项',
    }),
});

// 忘记密码验证模式
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项',
    }),
});

// 重置密码验证模式
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': '重置令牌是必填项',
    }),
  
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': '密码至少需要6个字符',
      'string.pattern.base': '密码必须包含至少一个大写字母、一个小写字母和一个数字',
      'any.required': '密码是必填项',
    }),
});

// 刷新令牌验证模式
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': '刷新令牌是必填项',
    }),
});