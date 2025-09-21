import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  message,
  Row,
  Col,
  Statistic,
  Calendar,
  Badge,
  Typography,
  Popconfirm
} from 'antd';
import {
  SendOutlined,
  ScheduleOutlined,
  StopOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ContentItem } from '../../types/content';
import { WorkflowStatus } from './WorkflowStatus';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface PublishManagerProps {
  onPublish?: (contentId: string, data: any) => Promise<void>;
  onSchedule?: (contentId: string, data: any) => Promise<void>;
  onUnpublish?: (contentId: string) => Promise<void>;
}

interface ScheduledItem {
  id: string;
  content: ContentItem;
  scheduledAt: string;
  status: 'scheduled' | 'published' | 'failed';
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const PublishManager: React.FC<PublishManagerProps> = ({
  onPublish,
  onSchedule,
  onUnpublish
}) => {
  const [loading, setLoading] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('ready');

  // 模拟数据
  const readyToPublish: ContentItem[] = [
    {
      id: '1',
      title: '产品更新公告',
      slug: 'product-update-announcement',
      content: '产品更新的详细内容...',
      status: 'approved',
      type: 'post',
      author: {
        id: 'user1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      workflow: {
        id: 'default',
        currentStep: 'approved',
        history: []
      },
      metadata: {
        seoTitle: '产品更新公告',
        seoDescription: '最新的产品更新信息'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T16:00:00Z',
      version: 1,
      tags: ['产品', '更新'],
      categories: ['公告']
    }
  ];

  const scheduledItems: ScheduledItem[] = [
    {
      id: 'sched-1',
      content: {
        id: '2',
        title: '春节放假通知',
        slug: 'spring-festival-holiday',
        content: '春节放假安排通知...',
        status: 'approved',
        type: 'post',
        author: {
          id: 'user2',
          name: '李四'
        },
        workflow: {
          id: 'default',
          currentStep: 'approved',
          history: []
        },
        metadata: {},
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T16:00:00Z',
        version: 1,
        tags: ['通知'],
        categories: ['公告']
      },
      scheduledAt: '2024-02-01T09:00:00Z',
      status: 'scheduled',
      createdBy: {
        id: 'user2',
        name: '李四'
      }
    }
  ];

  const publishedItems: ContentItem[] = [
    {
      id: '3',
      title: '公司年度报告',
      slug: 'annual-report-2023',
      content: '2023年度报告内容...',
      status: 'published',
      type: 'page',
      author: {
        id: 'user3',
        name: '王五'
      },
      workflow: {
        id: 'default',
        currentStep: 'published',
        history: []
      },
      metadata: {},
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T16:00:00Z',
      publishedAt: '2024-01-05T09:00:00Z',
      version: 1,
      tags: ['报告'],
      categories: ['公司']
    }
  ];

  const handlePublishNow = async (content: ContentItem) => {
    setLoading(true);
    try {
      await onPublish?.(content.id, {
        publishedAt: dayjs().toISOString()
      });
      message.success('内容发布成功');
    } catch (error) {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePublish = (content: ContentItem) => {
    setSelectedContent(content);
    setScheduleModalVisible(true);
  };

  const handleScheduleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSchedule?.(selectedContent!.id, {
        scheduledAt: values.scheduledAt.toISOString(),
        comment: values.comment
      });
      message.success('定时发布设置成功');
      setScheduleModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('设置失败');
    }
  };

  const handleUnpublish = async (contentId: string) => {
    setLoading(true);
    try {
      await onUnpublish?.(contentId);
      message.success('取消发布成功');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 准备发布的内容表格列
  const readyColumns: ColumnsType<ContentItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.type === 'page' ? '页面' : '文章'} • {record.slug}
          </Text>
        </div>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author) => (
        <Space>
          <Avatar size="small" src={author.avatar} icon={<UserOutlined />} />
          {author.name}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <WorkflowStatus status={status} />
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => dayjs(date).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={() => handlePublishNow(record)}
            loading={loading}
          >
            立即发布
          </Button>
          <Button
            size="small"
            icon={<ScheduleOutlined />}
            onClick={() => handleSchedulePublish(record)}
          >
            定时发布
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/preview/${record.id}`, '_blank')}
          >
            预览
          </Button>
        </Space>
      )
    }
  ];

  // 定时发布表格列
  const scheduledColumns: ColumnsType<ScheduledItem> = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: ContentItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{content.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {content.type === 'page' ? '页面' : '文章'}
          </Text>
        </div>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 150,
      render: (date) => (
        <div>
          <div>{dayjs(date).format('MM-DD HH:mm')}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).fromNow()}
          </Text>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          scheduled: { color: 'processing', text: '已安排' },
          published: { color: 'success', text: '已发布' },
          failed: { color: 'error', text: '失败' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (user) => (
        <Space>
          <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
          {user.name}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'scheduled' && (
            <Popconfirm
              title="确定要取消定时发布吗？"
              onConfirm={() => {
                message.success('已取消定时发布');
              }}
            >
              <Button size="small" icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/preview/${record.content.id}`, '_blank')}
          >
            预览
          </Button>
        </Space>
      )
    }
  ];

  // 已发布内容表格列
  const publishedColumns: ColumnsType<ContentItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.type === 'page' ? '页面' : '文章'} • {record.slug}
          </Text>
        </div>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      render: (date) => dayjs(date).format('MM-DD HH:mm')
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      render: (author) => (
        <Space>
          <Avatar size="small" src={author.avatar} icon={<UserOutlined />} />
          {author.name}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/${record.slug}`, '_blank')}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要取消发布吗？"
            onConfirm={() => handleUnpublish(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              loading={loading}
            >
              取消发布
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const stats = {
    ready: readyToPublish.length,
    scheduled: scheduledItems.filter(item => item.status === 'scheduled').length,
    published: publishedItems.length,
    todayPublished: publishedItems.filter(item => 
      dayjs(item.publishedAt).isAfter(dayjs().startOf('day'))
    ).length
  };

  // 日历数据
  const getCalendarData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const items = scheduledItems.filter(item => 
      dayjs(item.scheduledAt).format('YYYY-MM-DD') === dateStr
    );
    return items;
  };

  const dateCellRender = (value: Dayjs) => {
    const items = getCalendarData(value);
    return (
      <div>
        {items.map(item => (
          <Badge
            key={item.id}
            status="processing"
            text={
              <Tooltip title={item.content.title}>
                <div style={{ 
                  fontSize: 12, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 100
                }}>
                  {dayjs(item.scheduledAt).format('HH:mm')} {item.content.title}
                </div>
              </Tooltip>
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待发布"
              value={stats.ready}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="定时发布"
              value={stats.scheduled}
              prefix={<ScheduleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日发布"
              value={stats.todayPublished}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          {/* 内容管理标签页 */}
          <Card
            tabList={[
              { key: 'ready', tab: `待发布 (${stats.ready})` },
              { key: 'scheduled', tab: `定时发布 (${stats.scheduled})` },
              { key: 'published', tab: `已发布 (${stats.published})` }
            ]}
            activeTabKey={activeTab}
            onTabChange={setActiveTab}
          >
            {activeTab === 'ready' && (
              <Table
                columns={readyColumns}
                dataSource={readyToPublish}
                rowKey="id"
                pagination={false}
              />
            )}
            
            {activeTab === 'scheduled' && (
              <Table
                columns={scheduledColumns}
                dataSource={scheduledItems}
                rowKey="id"
                pagination={false}
              />
            )}
            
            {activeTab === 'published' && (
              <Table
                columns={publishedColumns}
                dataSource={publishedItems}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
              />
            )}
          </Card>
        </Col>

        <Col span={8}>
          {/* 发布日历 */}
          <Card title="发布日历" size="small">
            <Calendar
              fullscreen={false}
              dateCellRender={dateCellRender}
            />
          </Card>
        </Col>
      </Row>

      {/* 定时发布弹窗 */}
      <Modal
        title="设置定时发布"
        open={scheduleModalVisible}
        onOk={handleScheduleSubmit}
        onCancel={() => {
          setScheduleModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="scheduledAt"
            label="发布时间"
            rules={[{ required: true, message: '请选择发布时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="选择发布时间"
            />
          </Form.Item>
          
          <Form.Item
            name="comment"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="可选：添加定时发布的备注信息"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};