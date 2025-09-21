import React, { useState } from 'react';
import {
  Card,
  List,
  Avatar,
  Space,
  Button,
  Tag,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { ContentItem } from '../../types/content';
import { WorkflowStatus } from './WorkflowStatus';
import { WorkflowActions } from './WorkflowActions';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ReviewPanelProps {
  onReview?: (contentId: string, action: string, data: any) => Promise<void>;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  onReview
}) => {
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [form] = Form.useForm();

  // 模拟待审核内容数据
  const pendingContents: ContentItem[] = [
    {
      id: '1',
      title: '2024年产品发布计划',
      slug: 'product-roadmap-2024',
      content: '详细的产品发布计划内容...',
      excerpt: '介绍2024年的产品发布计划和重要里程碑',
      status: 'pending',
      type: 'post',
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
        currentStep: 'pending',
        history: [
          {
            id: '1',
            action: 'submit',
            status: 'pending',
            comment: '请审核产品发布计划',
            user: { id: 'user1', name: '张三' },
            timestamp: '2024-01-15T09:00:00Z'
          }
        ]
      },
      metadata: {
        seoTitle: '2024年产品发布计划',
        seoDescription: '了解我们2024年的产品发布计划'
      },
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      version: 2,
      tags: ['产品', '计划'],
      categories: ['产品动态']
    },
    {
      id: '2',
      title: '用户指南：如何使用新功能',
      slug: 'user-guide-new-features',
      content: '新功能使用指南的详细内容...',
      excerpt: '帮助用户快速上手新功能',
      status: 'pending',
      type: 'page',
      author: {
        id: 'user3',
        name: '王五'
      },
      workflow: {
        id: 'default',
        currentStep: 'pending',
        history: [
          {
            id: '1',
            action: 'submit',
            status: 'pending',
            comment: '用户指南已完成，请审核',
            user: { id: 'user3', name: '王五' },
            timestamp: '2024-01-15T14:30:00Z'
          }
        ]
      },
      metadata: {
        seoTitle: '新功能使用指南',
        seoDescription: '详细的新功能使用说明'
      },
      createdAt: '2024-01-13T15:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      version: 3,
      tags: ['指南', '功能'],
      categories: ['用户帮助']
    }
  ];

  const handleReviewAction = async (content: ContentItem, action: any, data?: any) => {
    setLoading(true);
    try {
      await onReview?.(content.id, action.type, data);
      message.success(`${action.name}成功`);
      setReviewModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(`操作失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (content: ContentItem) => {
    setSelectedContent(content);
    setReviewModalVisible(true);
  };

  const getPriorityColor = (updatedAt: string) => {
    const hours = dayjs().diff(dayjs(updatedAt), 'hour');
    if (hours > 48) return 'red';
    if (hours > 24) return 'orange';
    return 'green';
  };

  const stats = {
    pending: pendingContents.length,
    urgent: pendingContents.filter(c => dayjs().diff(dayjs(c.updatedAt), 'hour') > 24).length,
    today: pendingContents.filter(c => dayjs(c.updatedAt).isAfter(dayjs().startOf('day'))).length
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="紧急处理"
              value={stats.urgent}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日提交"
              value={stats.today}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 待审核列表 */}
      <Card title="待审核内容" extra={
        <Space>
          <Button type="primary" size="small">
            批量审核
          </Button>
        </Space>
      }>
        <List
          itemLayout="vertical"
          dataSource={pendingContents}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <WorkflowActions
                  key="actions"
                  content={item}
                  onAction={(action, data) => handleReviewAction(item, action, data)}
                  loading={loading}
                />,
                <Button
                  key="detail"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => openReviewModal(item)}
                >
                  详细审核
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    dot
                    color={getPriorityColor(item.updatedAt)}
                  >
                    <Avatar src={item.author.avatar} icon={<UserOutlined />} />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.title}</span>
                    <WorkflowStatus status={item.status} size="small" />
                    <Tag size="small">{item.type === 'page' ? '页面' : '文章'}</Tag>
                  </div>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <div>
                      <Text type="secondary">作者: {item.author.name}</Text>
                      {item.assignee && (
                        <>
                          <Divider type="vertical" />
                          <Text type="secondary">指派给: {item.assignee.name}</Text>
                        </>
                      )}
                    </div>
                    <div>
                      <Text type="secondary">
                        提交时间: {dayjs(item.updatedAt).format('MM-DD HH:mm')}
                      </Text>
                      <Divider type="vertical" />
                      <Text type="secondary">
                        等待时长: {dayjs(item.updatedAt).fromNow()}
                      </Text>
                    </div>
                  </Space>
                }
              />
              
              <div style={{ marginTop: 8 }}>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true }}
                  style={{ margin: 0, color: '#666' }}
                >
                  {item.excerpt || item.content}
                </Paragraph>
              </div>

              {item.tags.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {item.tags.map(tag => (
                      <Tag key={tag} size="small">{tag}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </List.Item>
          )}
        />
      </Card>

      {/* 详细审核弹窗 */}
      <Modal
        title={`审核内容 - ${selectedContent?.title}`}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedContent && (
          <div>
            {/* 内容信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div><strong>标题:</strong> {selectedContent.title}</div>
                  <div><strong>类型:</strong> {selectedContent.type === 'page' ? '页面' : '文章'}</div>
                  <div><strong>作者:</strong> {selectedContent.author.name}</div>
                </Col>
                <Col span={12}>
                  <div><strong>状态:</strong> <WorkflowStatus status={selectedContent.status} /></div>
                  <div><strong>创建时间:</strong> {dayjs(selectedContent.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                  <div><strong>更新时间:</strong> {dayjs(selectedContent.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
                </Col>
              </Row>
            </Card>

            {/* 内容预览 */}
            <Card title="内容预览" size="small" style={{ marginBottom: 16 }}>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                <Paragraph>{selectedContent.content}</Paragraph>
              </div>
            </Card>

            {/* 审核操作 */}
            <Card title="审核操作" size="small">
              <WorkflowActions
                content={selectedContent}
                onAction={(action, data) => handleReviewAction(selectedContent, action, data)}
                loading={loading}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};