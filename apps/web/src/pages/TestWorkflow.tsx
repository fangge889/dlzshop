import React, { useState } from 'react';
import { Card, Tabs, Space, Button, message, Typography } from 'antd';
import { ContentList } from '../components/ContentWorkflow/ContentList';
import { ContentEditor } from '../components/ContentWorkflow/ContentEditor';
import { ReviewPanel } from '../components/ContentWorkflow/ReviewPanel';
import { PublishManager } from '../components/ContentWorkflow/PublishManager';
import { WorkflowStatus } from '../components/ContentWorkflow/WorkflowStatus';
import { WorkflowActions } from '../components/ContentWorkflow/WorkflowActions';
import { WorkflowHistoryComponent } from '../components/ContentWorkflow/WorkflowHistory';
import { ContentItem } from '../types/content';

const { Title, Paragraph } = Typography;

// 模拟测试数据
const mockContent: ContentItem = {
  id: 'test-1',
  title: '测试文章：产品功能介绍',
  slug: 'test-product-features',
  content: '<h2>产品核心功能</h2><p>这是一篇测试文章，用于演示内容管理工作流的各项功能。</p><ul><li>功能一：用户管理</li><li>功能二：内容编辑</li><li>功能三：工作流管理</li></ul>',
  excerpt: '这是一篇用于测试内容管理工作流功能的示例文章',
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
        action: 'created',
        status: 'draft',
        comment: '创建新文章',
        user: { id: 'user1', name: '张三' },
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        action: 'submit',
        status: 'pending',
        comment: '文章已完成，提交审核',
        user: { id: 'user1', name: '张三' },
        timestamp: '2024-01-15T14:00:00Z'
      }
    ]
  },
  metadata: {
    seoTitle: '产品功能介绍 - 完整指南',
    seoDescription: '了解我们产品的核心功能和使用方法',
    keywords: ['产品', '功能', '指南']
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T14:00:00Z',
  version: 2,
  tags: ['产品', '功能', '指南'],
  categories: ['产品介绍']
};

export const TestWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testContent, setTestContent] = useState<ContentItem>(mockContent);

  const handleSaveContent = async (contentData: Partial<ContentItem>) => {
    console.log('保存内容:', contentData);
    message.success('内容保存成功');
    
    // 模拟更新内容
    setTestContent(prev => ({
      ...prev,
      ...contentData,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSubmitContent = async (contentData: Partial<ContentItem>) => {
    console.log('提交审核:', contentData);
    message.success('内容已提交审核');
    
    // 模拟状态变更
    setTestContent(prev => ({
      ...prev,
      ...contentData,
      status: 'pending',
      updatedAt: new Date().toISOString()
    }));
  };

  const handleWorkflowAction = async (action: any, data?: any) => {
    console.log('工作流操作:', action, data);
    
    const actionMap: Record<string, string> = {
      'approve': 'approved',
      'reject': 'rejected',
      'publish': 'published',
      'unpublish': 'draft'
    };

    const newStatus = actionMap[action.type] || testContent.status;
    
    setTestContent(prev => ({
      ...prev,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
      workflow: {
        ...prev.workflow,
        history: [
          ...prev.workflow.history,
          {
            id: Date.now().toString(),
            action: action.type,
            status: newStatus,
            comment: data?.comment || `执行${action.name}操作`,
            user: { id: 'current', name: '当前用户' },
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));

    message.success(`${action.name}操作成功`);
  };

  const handleReview = async (contentId: string, action: string, data: any) => {
    console.log('审核操作:', { contentId, action, data });
    await handleWorkflowAction({ type: action, name: action }, data);
  };

  const handlePublish = async (contentId: string, data: any) => {
    console.log('发布内容:', { contentId, data });
    await handleWorkflowAction({ type: 'publish', name: '发布' }, data);
  };

  const handleSchedule = async (contentId: string, data: any) => {
    console.log('定时发布:', { contentId, data });
    message.success('定时发布设置成功');
  };

  const handleUnpublish = async (contentId: string) => {
    console.log('取消发布:', contentId);
    await handleWorkflowAction({ type: 'unpublish', name: '取消发布' });
  };

  const tabItems = [
    {
      key: 'overview',
      label: '功能概览',
      children: (
        <div>
          <Title level={3}>内容管理工作流测试</Title>
          <Paragraph>
            这个页面用于测试内容管理工作流的各项功能。您可以通过不同的标签页体验：
          </Paragraph>
          
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>当前测试内容状态</Title>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>标题:</strong> {testContent.title}</div>
                <div><strong>状态:</strong> <WorkflowStatus status={testContent.status} /></div>
                <div><strong>作者:</strong> {testContent.author.name}</div>
                <div><strong>最后更新:</strong> {new Date(testContent.updatedAt).toLocaleString()}</div>
              </Space>
            </Card>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={4}>快速操作</Title>
            <Space wrap>
              <WorkflowActions
                content={testContent}
                onAction={handleWorkflowAction}
              />
            </Space>
          </div>

          <div>
            <Title level={4}>操作历史</Title>
            <WorkflowHistoryComponent history={testContent.workflow.history} />
          </div>
        </div>
      )
    },
    {
      key: 'editor',
      label: '内容编辑器',
      children: (
        <ContentEditor
          content={testContent}
          onSave={handleSaveContent}
          onSubmit={handleSubmitContent}
          onCancel={() => message.info('取消编辑')}
        />
      )
    },
    {
      key: 'list',
      label: '内容列表',
      children: (
        <ContentList
          onEdit={(content) => {
            console.log('编辑内容:', content);
            message.info(`编辑内容: ${content.title}`);
          }}
          onDelete={async (contentId) => {
            console.log('删除内容:', contentId);
            message.success('内容删除成功');
          }}
        />
      )
    },
    {
      key: 'review',
      label: '审核管理',
      children: (
        <ReviewPanel onReview={handleReview} />
      )
    },
    {
      key: 'publish',
      label: '发布管理',
      children: (
        <PublishManager
          onPublish={handlePublish}
          onSchedule={handleSchedule}
          onUnpublish={handleUnpublish}
        />
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>内容管理工作流测试页面</Title>
          <Paragraph type="secondary">
            测试和体验完整的内容管理工作流功能，包括内容编辑、审核、发布等各个环节。
          </Paragraph>
        </div>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </div>
    </div>
  );
};