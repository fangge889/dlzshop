import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Divider,
  Empty
} from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface PublishedPage {
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

export const PublishedPages: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // 模拟已发布的页面数据
  const publishedPages: PublishedPage[] = [
    {
      id: '1',
      title: '公司简介 - 关于我们',
      slug: 'about-us',
      content: '<h2>公司简介</h2><p>我们是一家专注于创新技术的现代化企业，致力于为客户提供优质的产品和服务。</p><p>自成立以来，我们始终坚持以客户为中心的理念，不断追求技术创新和服务优化。</p>',
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
    {
      id: '2',
      title: '产品功能详细介绍',
      slug: 'product-features',
      content: '<h2>核心功能</h2><ul><li>内容管理系统</li><li>用户权限管理</li><li>数据分析报表</li><li>API接口服务</li></ul><p>我们的产品具有强大的功能和灵活的配置选项。</p>',
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
      featuredImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop',
      viewCount: 890
    },
    {
      id: '3',
      title: '用户使用指南',
      slug: 'user-guide',
      content: '<h2>快速开始</h2><p>本指南将帮助您快速上手我们的产品。</p><h3>第一步：注册账户</h3><p>访问注册页面，填写必要信息完成账户创建。</p><h3>第二步：配置设置</h3><p>根据您的需求配置相关设置。</p>',
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
    },
    {
      id: '4',
      title: '最新版本更新日志',
      slug: 'changelog-v2-0',
      content: '<h2>版本 2.0 更新内容</h2><h3>新功能</h3><ul><li>全新的用户界面设计</li><li>增强的性能优化</li><li>新增批量操作功能</li></ul><h3>修复问题</h3><ul><li>修复了数据同步问题</li><li>优化了加载速度</li></ul>',
      excerpt: '查看最新版本的功能更新和问题修复',
      type: 'post',
      author: {
        id: 'user1',
        name: '张三'
      },
      publishedAt: '2024-01-22T11:00:00Z',
      updatedAt: '2024-01-22T11:00:00Z',
      tags: ['更新', '版本', '功能'],
      categories: ['产品动态'],
      viewCount: 567
    },
    {
      id: '5',
      title: '联系我们',
      slug: 'contact',
      content: '<h2>联系方式</h2><p><strong>地址：</strong>北京市朝阳区科技园区</p><p><strong>电话：</strong>400-123-4567</p><p><strong>邮箱：</strong>contact@example.com</p><p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>',
      excerpt: '获取我们的联系方式和办公地址信息',
      type: 'page',
      author: {
        id: 'user2',
        name: '李四'
      },
      publishedAt: '2024-01-10T08:30:00Z',
      updatedAt: '2024-01-10T08:30:00Z',
      tags: ['联系', '地址'],
      categories: ['公司信息'],
      viewCount: 445
    }
  ];

  // 筛选和搜索逻辑
  const filteredPages = publishedPages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || page.categories.includes(selectedCategory);
    const matchesType = selectedType === 'all' || page.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // 获取所有分类
  const allCategories = Array.from(new Set(publishedPages.flatMap(page => page.categories)));

  const handleViewPage = (page: PublishedPage) => {
    // 跳转到页面详情
    navigate(`/page/${page.slug}`);
  };

  const getTypeLabel = (type: string) => {
    return type === 'page' ? '页面' : '文章';
  };

  const getTypeColor = (type: string) => {
    return type === 'page' ? 'blue' : 'green';
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 页面头部 */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={1} style={{ marginBottom: 16 }}>
            📚 已发布内容
          </Title>
          <Paragraph style={{ fontSize: 16, color: '#666' }}>
            浏览所有已发布的页面和文章内容
          </Paragraph>
        </div>

        {/* 搜索和筛选 */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索标题、内容或标签..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                placeholder="选择分类"
              >
                <Option value="all">所有分类</Option>
                {allCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: '100%' }}
                placeholder="内容类型"
              >
                <Option value="all">所有类型</Option>
                <Option value="page">页面</Option>
                <Option value="post">文章</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  共找到 {filteredPages.length} 个内容
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 内容列表 */}
        <div>
          {filteredPages.length === 0 ? (
            <Card>
              <Empty
                description="没有找到匹配的内容"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              dataSource={filteredPages}
              renderItem={(page) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    cover={
                      page.featuredImage && (
                        <div style={{ height: 200, overflow: 'hidden' }}>
                          <img
                            alt={page.title}
                            src={page.featuredImage}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        key="view"
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPage(page)}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Space>
                              <Tag color={getTypeColor(page.type)}>
                                {getTypeLabel(page.type)}
                              </Tag>
                              {page.viewCount && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <EyeOutlined /> {page.viewCount} 次浏览
                                </Text>
                              )}
                            </Space>
                          </div>
                          <div style={{ 
                            fontSize: 16, 
                            fontWeight: 500,
                            lineHeight: 1.4,
                            marginBottom: 8
                          }}>
                            {page.title}
                          </div>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ 
                              margin: '8px 0 12px 0',
                              color: '#666',
                              fontSize: 14
                            }}
                          >
                            {page.excerpt}
                          </Paragraph>
                          
                          <div style={{ marginBottom: 12 }}>
                            <Space wrap size={[4, 4]}>
                              {page.tags.slice(0, 3).map(tag => (
                                <Tag key={tag} size="small">{tag}</Tag>
                              ))}
                              {page.tags.length > 3 && (
                                <Tag size="small">+{page.tags.length - 3}</Tag>
                              )}
                            </Space>
                          </div>

                          <Divider style={{ margin: '12px 0' }} />
                          
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Space size={4}>
                              <Avatar 
                                size="small" 
                                src={page.author.avatar} 
                                icon={<UserOutlined />}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {page.author.name}
                              </Text>
                            </Space>
                            
                            <Space size={4}>
                              <CalendarOutlined style={{ fontSize: 12, color: '#999' }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(page.publishedAt).format('MM-DD')}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* 统计信息 */}
        <Card style={{ marginTop: 24 }}>
          <Row gutter={16} justify="center">
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {publishedPages.length}
                </div>
                <div style={{ color: '#666' }}>总内容数</div>
              </div>
            </Col>
            <Col>
              <Divider type="vertical" style={{ height: 40 }} />
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {publishedPages.filter(p => p.type === 'page').length}
                </div>
                <div style={{ color: '#666' }}>页面数</div>
              </div>
            </Col>
            <Col>
              <Divider type="vertical" style={{ height: 40 }} />
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {publishedPages.filter(p => p.type === 'post').length}
                </div>
                <div style={{ color: '#666' }}>文章数</div>
              </div>
            </Col>
            <Col>
              <Divider type="vertical" style={{ height: 40 }} />
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                  {publishedPages.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
                </div>
                <div style={{ color: '#666' }}>总浏览量</div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};