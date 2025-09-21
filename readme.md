# DLZ Shop CMS - 现代化内容管理系统

基于 React + Node.js + TypeScript 构建的现代化 CMS 系统，采用 Monorepo 架构，提供完整的内容管理解决方案。

## 🚀 项目特性

- **现代化技术栈**: React 18 + Node.js + TypeScript + Prisma
- **Monorepo 架构**: 使用 pnpm workspace 管理多包项目
- **响应式设计**: 基于 Ant Design 的现代化 UI
- **实时协作**: WebSocket 支持的实时编辑功能
- **安全认证**: JWT + RBAC 权限控制
- **性能优化**: 代码分割、懒加载、缓存策略
- **开发体验**: 热重载、TypeScript、ESLint、Prettier

## 📁 项目结构

```
dlzshop-cms/
├── apps/
│   ├── api/                 # 后端 API 服务
│   │   ├── src/
│   │   │   ├── controllers/ # 控制器
│   │   │   ├── middleware/  # 中间件
│   │   │   ├── models/      # 数据模型
│   │   │   ├── routes/      # 路由
│   │   │   ├── schemas/     # 验证模式
│   │   │   └── utils/       # 工具函数
│   │   └── prisma/          # 数据库模式
│   └── web/                 # 前端应用
│       ├── src/
│       │   ├── components/  # 组件
│       │   ├── pages/       # 页面
│       │   ├── store/       # 状态管理
│       │   ├── services/    # API 服务
│       │   └── types/       # 类型定义
│       └── public/          # 静态资源
├── packages/                # 共享包
└── docs/                    # 文档
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: Ant Design
- **状态管理**: Redux Toolkit + RTK Query
- **路由**: React Router v6
- **样式**: CSS Modules + Styled Components
- **富文本编辑**: Quill.js
- **图表**: Chart.js

### 后端
- **运行时**: Node.js + TypeScript
- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + Passport.js
- **文件上传**: Multer + Sharp
- **实时通信**: Socket.io
- **日志**: Winston
- **缓存**: Redis

### 开发工具
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **测试**: Jest + React Testing Library
- **容器化**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0 (可选)

### 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

2. 配置数据库连接和其他环境变量

### 数据库设置

```bash
# 生成 Prisma 客户端
pnpm --filter @dlzshop/api prisma generate

# 运行数据库迁移
pnpm --filter @dlzshop/api prisma migrate dev

# 填充初始数据
pnpm --filter @dlzshop/api prisma db seed
```

### 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 或分别启动
pnpm --filter @dlzshop/api dev    # 后端服务 (端口 3001)
pnpm --filter @dlzshop/web dev    # 前端服务 (端口 3000)
```

### 使用 Docker 开发

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.dev.yml up -d
```

## 📚 功能模块

### 🔐 用户认证
- 用户注册/登录
- JWT 令牌认证
- 角色权限管理 (Admin/Editor/Author)
- 密码重置

### 📝 内容管理
- 页面创建/编辑
- 富文本编辑器
- 草稿/发布状态
- SEO 优化设置
- 媒体库管理

### 🎨 界面管理
- 响应式后台界面
- 主题定制
- 多语言支持
- 实时预览

### 📊 数据分析
- 访问统计
- 内容分析
- 用户行为追踪
- 性能监控

## 🔧 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 确保代码质量：

```bash
# 检查代码规范
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch
```

### 构建

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter @dlzshop/web build
pnpm --filter @dlzshop/api build
```

## 🚀 部署

### 生产环境构建

```bash
# 构建生产版本
pnpm build

# 使用 Docker 构建
docker build -t dlzshop-cms .
```

### 环境变量

生产环境需要配置以下环境变量：

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/dlzshop

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# 文件上传
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760

# Redis (可选)
REDIS_URL=redis://localhost:6379

# 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📖 API 文档

API 文档可通过以下方式访问：

- 开发环境: http://localhost:3001/api-docs
- Swagger UI 界面提供完整的 API 文档

### 主要 API 端点

```
POST   /api/auth/login          # 用户登录
POST   /api/auth/register       # 用户注册
GET    /api/pages               # 获取页面列表
POST   /api/pages               # 创建页面
GET    /api/pages/:id           # 获取页面详情
PUT    /api/pages/:id           # 更新页面
DELETE /api/pages/:id           # 删除页面
POST   /api/media/upload        # 文件上传
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言
- [Prisma](https://www.prisma.io/) - 现代数据库工具包
- [Express.js](https://expressjs.com/) - Web 应用框架

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系我们：

- 创建 [Issue](https://github.com/your-username/dlzshop-cms/issues)
- 发送邮件至: support@dlzshop.com
- 访问我们的 [文档站点](https://docs.dlzshop.com)

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！

## 🎯 升级进度

### ✅ 已完成
- [x] 项目结构重构 (Monorepo)
- [x] TypeScript 配置
- [x] 前端应用基础架构 (React + Vite + Ant Design)
- [x] 后端 API 基础架构 (Express + Prisma)
- [x] 用户认证系统
- [x] 页面管理功能
- [x] 媒体库管理
- [x] 响应式管理界面

### 🚧 进行中
- [ ] 依赖包安装完成
- [ ] 数据库初始化
- [ ] 开发服务器启动测试

### 📋 待完成
- [ ] 实时协作功能
- [ ] 性能优化
- [ ] 测试覆盖
- [ ] 生产环境部署