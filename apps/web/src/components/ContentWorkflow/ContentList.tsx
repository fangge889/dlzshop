import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Tooltip,
  Dropdown,
  Modal,
  Statistic,
  Row,
  Col,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ContentItem, ContentFilter, ContentStats, DEFAULT_CONTENT_STATUSES } from '../../types/content';
import { WorkflowStatus } from './WorkflowStatus';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowHistoryComponent } from './WorkflowHistory';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

interface ContentListProps {
  onCreateContent?: () => void;
  onEditContent?: (content: ContentItem) => void;
}

export const ContentList: React.FC<ContentListProps> = ({
  onCreateContent,
  onEditContent
}) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ContentFilter>({});
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    published: 0,
    archived: 0
  });
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // 模拟数据
  const mockContents: ContentItem[] = [
    {
      id: '1',
      title: '产品介绍页面',
      slug: 'product-intro',
      content: '这是产品介绍页面的内容...',
      excerpt: '产品介绍页面摘要',
      status: 'draft',
      type: 'page',
      author: {
        id: 'user1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      assignee: {
        id: 'user2',
        name: '李四'
      },
      workflow: {
        id: 'default',
        currentStep: 'draft',
        history: [
          {
            id: '1',
            action: 'create',
            status: 'draft',
            comment: '创建新页面',
            user: {
              id: 'user1',
              name: '张三'
            },
            timestamp: '2024-01-15T10:00:00Z'
          }
        ]
      },
      metadata: {
        seoTitle: '产品介绍 - 我的网站',
        seoDescription: '了解我们的产品特色和优势'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      version: 1,
      tags: ['产品', '介绍'],
      categories: ['页面']
    },
    {
      id: '2',
      title: '公司新闻：2024年度总结',
      slug: 'company-news-2024',
      content: '2024年公司发展总结...',
      excerpt: '回顾2024年的重要成就',
      status: 'pending',
      type: 'post',
      author: {
        id: 'user2',
        name: '李四'
      },
      workflow: {
        id: 'default',
        currentStep: 'pending',
        history: [
          {
            id: '1',
            action: 'create',
            status: 'draft',
            user: { id: 'user2', name: '李四' },
            timestamp: '2024-01-14T09:00:00Z'
          },
          {
            id: '2',
            action: 'submit',
            status: 'pending',
            comment: '请审核这篇年度总结文章',
            user: { id: 'user2', name: '李四' },
            timestamp: '2024-01-14T16:00:00Z'
          }
        ]
      },
      metadata: {
        seoTitle: '2024年度总结 - 公司新闻',
        publishedAt: '2024-01-16T08:00:00Z'
      },
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T16:00:00Z',
      version: 2,
      tags: ['新闻', '总结'],
      categories: ['公司动态']
    }
  ];

  useEffect(() => {
    loadContents();
  }, [filter]);

  const loadContents = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredContents = mockContents;
      
      // 应用过滤器
      if (filter.status?.length) {
        filteredContents = filteredContents.filter(c => filter.status!.includes(c.status));
      }
      if (filter.type?.length) {
        filteredContents = filteredContents.filter(c => filter.type!.includes(c.type));
      }
      if (filter.search) {
        filteredContents = filteredContents.filter(c => 
          c.title.toLowerCase().includes(filter.search!.toLowerCase()) ||
          c.content.toLowerCase().includes(filter.search!.toLowerCase())
        );
      }
      
      setContents(filteredContents);
      
      // 计算统计数据
      const newStats = mockContents.reduce((acc, content) => {
        acc.total++;
        acc[content.status as keyof ContentStats]++;
        return acc;
      }, {
        total: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        published: 0,
        archived: 0
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('加载内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (content: ContentItem, action: any, data?: any) => {
    console.log('执行工作流操作:', { content: content.id, action, data });
    // 这里应该调用API执行工作流操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadContents(); // 重新加载数据
  };

  const showHistory = (content: ContentItem) => {
    setSelectedContent(content);
    setHistoryModalVisible(true);
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title: string, record: ContentItem) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.type === 'page' ? '页面' : '文章'} • {record.slug}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <WorkflowStatus status={status} />
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author: ContentItem['author']) => (
        <Space>
          <Avatar size="small" src={author.avatar} icon={<UserOutlined />} />
          <span>{author.name}</span>
        </Space>
      )
    },
    {
      title: '指派给',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
      render: (assignee?: ContentItem['assignee']) => (
        assignee ? (
          <Space>
            <Avatar size="small" src={assignee.avatar} icon={<UserOutlined />} />
            <span>{assignee.name}</span>
          </Space>
        ) : (
          <span style={{ color: '#8c8c8c' }}>未指派</span>
        )
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: ContentItem) => (
        <Space>
          <WorkflowActions
            content={record}
            onAction={(action, data) => handleWorkflowAction(record, action, data)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: '编辑',
                  onClick: () => onEditContent?.(record)
                },
                {
                  key: 'history',
                  icon: <EyeOutlined />,
                  label: '查看历史',
                  onClick: () => showHistory(record)
                }
              ]
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="总计" value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="草稿" 
              value={stats.draft} 
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="待审核" 
              value={stats.pending} 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已审核" 
              value={stats.approved} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已发布" 
              value={stats.published} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已归档" 
              value={stats.archived} 
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 内容列表 */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>内容管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateContent}>
            新建内容
          </Button>
        </div>

        {/* 过滤器 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Search
              placeholder="搜索标题或内容"
              style={{ width: 200 }}
              onSearch={(value) => setFilter({ ...filter, search: value })}
            />
            
            <Select
              mode="multiple"
              placeholder="状态"
              style={{ width: 150 }}
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              {DEFAULT_CONTENT_STATUSES.map(status => (
                <Option key={status.id} value={status.id}>
                  {status.name}
                </Option>
              ))}
            </Select>

            <Select
              mode="multiple"
              placeholder="类型"
              style={{ width: 120 }}
              onChange={(value) => setFilter({ ...filter, type: value })}
            >
              <Option value="page">页面</Option>
              <Option value="post">文章</Option>
            </Select>

            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates) {
                  setFilter({
                    ...filter,
                    dateRange: {
                      start: dates[0]!.toISOString(),
                      end: dates[1]!.toISOString()
                    }
                  });
                } else {
                  const { dateRange, ...newFilter } = filter;
                  setFilter(newFilter);
                }
              }}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={contents}
          rowKey="id"
          loading={loading}
          pagination={{
            total: contents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 历史记录弹窗 */}
      <Modal
        title={`操作历史 - ${selectedContent?.title}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedContent && (
          <WorkflowHistoryComponent history={selectedContent.workflow.history} />
        )}
      </Modal>
    </div>
  );
};