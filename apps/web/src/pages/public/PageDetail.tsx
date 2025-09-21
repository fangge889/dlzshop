import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Avatar, 
  Divider,
  Button,
  Row,
  Col,
  BackTop,
  Affix
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined, 
  UserOutlined,
  EyeOutlined,
  ShareAltOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Paragraph, Text } = Typography;

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'page' | 'post';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  categories: string[];
  featuredImage?: string;
  viewCount?: number;
}

export const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);

  // 模拟页面数据（实际应该从API获取）
  const mockPages: Record<string, PageData> = {
    'about-us': {
      id: '1',
      title: '公司简介 - 关于我们',
      slug: 'about-us',
      content: `
        <h2>公司简介</h2>
        <p>我们是一家专注于创新技术的现代化企业，致力于为客户提供优质的产品和服务。自成立以来，我们始终坚持以客户为中心的理念，不断追求技术创新和服务优化。</p>
        
        <h3>企业文化</h3>
        <p>我们秉承"创新、协作、诚信、卓越"的核心价值观，营造开放包容的工作环境，鼓励员工发挥创造力，共同推动公司发展。</p>
        
        <h3>发展历程</h3>
        <ul>
          <li><strong>2020年</strong> - 公司成立，专注于技术研发</li>
          <li><strong>2021年</strong> - 推出首款产品，获得市场认可</li>
          <li><strong>2022年</strong> - 扩大团队规模，建立完善的服务体系</li>
          <li><strong>2023年</strong> - 技术升级，产品功能全面优化</li>
          <li><strong>2024年</strong> - 持续创新，为客户提供更好的体验</li>
        </ul>
        
        <h3>核心优势</h3>
        <p>我们拥有专业的技术团队和丰富的行业经验，能够为客户提供定制化的解决方案。我们的产品具有以下特点：</p>
        <ul>
          <li>技术先进，性能稳定</li>
          <li>界面友好，操作简便</li>
          <li>功能完善，扩展性强</li>
          <li>服务周到，响应及时</li>
        </ul>
      `,
      excerpt: '了解我们公司的发展历程、企业文化和核心价值观',
      type: 'page',
      author: {
        id: 'user1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      publishedAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
      tags: ['公司', '介绍'],
      categories: ['公司信息'],
      viewCount: 1250
    },
    'product-features': {
      id: '2',
      title: '产品功能详细介绍',
      slug: 'product-features',
      content: `
        <h2>核心功能概览</h2>
        <p>我们的产品是一个功能强大、易于使用的现代化内容管理系统，为企业和个人用户提供全面的内容管理解决方案。</p>
        
        <h3>🎨 可视化页面构建器</h3>
        <p>通过直观的拖拽界面，用户可以轻松创建和编辑页面：</p>
        <ul>
          <li>丰富的组件库，包含文本、图片、按钮、表单等常用元素</li>
          <li>实时预览功能，所见即所得的编辑体验</li>
          <li>响应式设计支持，自动适配不同设备屏幕</li>
          <li>模板系统，快速创建专业页面</li>
        </ul>
        
        <h3>📝 内容管理工作流</h3>
        <p>完整的内容生命周期管理：</p>
        <ul>
          <li>富文本编辑器，支持多种格式和媒体插入</li>
          <li>草稿→审核→发布的标准工作流程</li>
          <li>版本控制和历史记录追踪</li>
          <li>定时发布和内容调度功能</li>
        </ul>
        
        <h3>👥 用户权限管理</h3>
        <p>灵活的权限控制系统：</p>
        <ul>
          <li>角色基础的权限管理（管理员、编辑、作者等）</li>
          <li>细粒度的操作权限控制</li>
          <li>内容审核和批准流程</li>
          <li>用户活动日志和审计追踪</li>
        </ul>
        
        <h3>📊 数据分析与报表</h3>
        <p>深入了解内容表现：</p>
        <ul>
          <li>页面访问统计和用户行为分析</li>
          <li>内容表现报告和趋势分析</li>
          <li>自定义仪表板和数据可视化</li>
          <li>导出功能，支持多种格式</li>
        </ul>
        
        <h3>🔧 技术特性</h3>
        <p>现代化的技术架构：</p>
        <ul>
          <li>基于React + TypeScript的前端架构</li>
          <li>RESTful API设计，支持第三方集成</li>
          <li>云原生部署，支持容器化和微服务</li>
          <li>高性能缓存和CDN加速</li>
        </ul>
      `,
      excerpt: '详细了解我们产品的核心功能和技术特色',
      type: 'post',
      author: {
        id: 'user2',
        name: '李四',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      publishedAt: '2024-01-18T14:30:00Z',
      updatedAt: '2024-01-19T10:15:00Z',
      tags: ['产品', '功能', '技术'],
      categories: ['产品介绍'],
      featuredImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop',
      viewCount: 890
    },
    'user-guide': {
      id: '3',
      title: '用户使用指南',
      slug: 'user-guide',
      content: `
        <h2>快速开始指南</h2>
        <p>欢迎使用我们的内容管理系统！本指南将帮助您快速上手，充分利用系统的各项功能。</p>
        
        <h3>第一步：账户注册与登录</h3>
        <p>首次使用需要创建账户：</p>
        <ol>
          <li>访问注册页面，填写基本信息</li>
          <li>验证邮箱地址</li>
          <li>设置安全密码</li>
          <li>完成账户激活</li>
        </ol>
        
        <h3>第二步：熟悉界面布局</h3>
        <p>系统采用直观的界面设计：</p>
        <ul>
          <li><strong>顶部导航栏</strong>：快速访问主要功能模块</li>
          <li><strong>侧边栏菜单</strong>：详细的功能分类和导航</li>
          <li><strong>主工作区</strong>：内容编辑和管理的核心区域</li>
          <li><strong>状态栏</strong>：显示当前操作状态和提示信息</li>
        </ul>
        
        <h3>第三步：创建您的第一个页面</h3>
        <p>使用页面构建器创建内容：</p>
        <ol>
          <li>点击"新建页面"按钮</li>
          <li>选择页面模板或从空白页开始</li>
          <li>使用拖拽方式添加组件</li>
          <li>编辑内容和样式</li>
          <li>预览效果并发布</li>
        </ol>
        
        <h3>第四步：内容管理最佳实践</h3>
        <p>为了更好地管理内容，建议：</p>
        <ul>
          <li>合理使用标签和分类组织内容</li>
          <li>定期备份重要内容</li>
          <li>利用SEO优化功能提升搜索排名</li>
          <li>设置合适的发布时间和更新频率</li>
        </ul>
        
        <h3>常见问题解答</h3>
        <p><strong>Q: 如何修改已发布的内容？</strong></p>
        <p>A: 在内容列表中找到对应项目，点击编辑按钮即可修改。修改后需要重新发布。</p>
        
        <p><strong>Q: 可以同时编辑同一个页面吗？</strong></p>
        <p>A: 系统支持协作编辑，但建议通过版本控制避免冲突。</p>
        
        <p><strong>Q: 如何恢复误删的内容？</strong></p>
        <p>A: 可以通过回收站功能恢复30天内删除的内容。</p>
      `,
      excerpt: '新用户快速上手指南，从注册到使用的完整流程',
      type: 'page',
      author: {
        id: 'user3',
        name: '王五',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      publishedAt: '2024-01-15T16:45:00Z',
      updatedAt: '2024-01-16T09:20:00Z',
      tags: ['指南', '教程', '新手'],
      categories: ['用户帮助'],
      viewCount: 2100
    }
  };

  useEffect(() => {
    if (slug) {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        const page = mockPages[slug];
        setPageData(page || null);
        setLoading(false);
      }, 500);
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Title level={3}>页面不存在</Title>
        <Paragraph>您访问的页面可能已被删除或不存在。</Paragraph>
        <Button type="primary" onClick={() => navigate('/published')}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {/* 返回按钮 */}
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/published')}
          >
            返回列表
          </Button>
        </div>

        {/* 特色图片 */}
        {pageData.featuredImage && (
          <div style={{ marginBottom: 24 }}>
            <img
              src={pageData.featuredImage}
              alt={pageData.title}
              style={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderRadius: 8
              }}
            />
          </div>
        )}

        {/* 主要内容 */}
        <Card>
          {/* 文章头部 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={pageData.type === 'page' ? 'blue' : 'green'}>
                  {pageData.type === 'page' ? '页面' : '文章'}
                </Tag>
                {pageData.categories.map(category => (
                  <Tag key={category}>{category}</Tag>
                ))}
              </Space>
            </div>

            <Title level={1} style={{ marginBottom: 16, lineHeight: 1.3 }}>
              {pageData.title}
            </Title>

            <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
              {pageData.excerpt}
            </Paragraph>

            <Row justify="space-between" align="middle">
              <Col>
                <Space size="large">
                  <Space>
                    <Avatar 
                      src={pageData.author.avatar} 
                      icon={<UserOutlined />}
                      size="small"
                    />
                    <Text>{pageData.author.name}</Text>
                  </Space>
                  
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">
                      {dayjs(pageData.publishedAt).format('YYYY年MM月DD日')}
                    </Text>
                  </Space>
                  
                  {pageData.viewCount && (
                    <Space>
                      <EyeOutlined />
                      <Text type="secondary">{pageData.viewCount} 次浏览</Text>
                    </Space>
                  )}
                </Space>
              </Col>
              
              <Col>
                <Space>
                  <Button icon={<HeartOutlined />} size="small">
                    收藏
                  </Button>
                  <Button icon={<ShareAltOutlined />} size="small">
                    分享
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* 文章内容 */}
          <div 
            className="page-content"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
            style={{
              lineHeight: 1.8,
              fontSize: 16,
              color: '#333'
            }}
          />

          <Divider />

          {/* 标签 */}
          <div style={{ marginTop: 32 }}>
            <Text strong style={{ marginRight: 16 }}>标签：</Text>
            <Space wrap>
              {pageData.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>
          </div>

          {/* 更新时间 */}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              最后更新：{dayjs(pageData.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Text>
          </div>
        </Card>

        {/* 返回顶部 */}
        <BackTop />
      </div>

      <style>
        {`
          .page-content h2 {
            color: #1890ff;
            margin-top: 32px;
            margin-bottom: 16px;
            font-size: 24px;
            font-weight: 600;
          }
          
          .page-content h3 {
            color: #333;
            margin-top: 24px;
            margin-bottom: 12px;
            font-size: 20px;
            font-weight: 500;
          }
          
          .page-content p {
            margin-bottom: 16px;
            text-align: justify;
          }
          
          .page-content ul, .page-content ol {
            margin-bottom: 16px;
            padding-left: 24px;
          }
          
          .page-content li {
            margin-bottom: 8px;
          }
          
          .page-content strong {
            color: #1890ff;
            font-weight: 600;
          }
          
          .page-content code {
            background: #f6f8fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
          }
        `}
      </style>
    </div>
  );
};