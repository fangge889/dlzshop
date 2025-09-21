import React, { useState } from 'react';
import { Layout, Menu, Card, Typography, Space, Button, Badge } from 'antd';
import {
  EditOutlined,
  AuditOutlined,
  SendOutlined,
  HistoryOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { ContentList } from '../../components/ContentWorkflow/ContentList';
import { ContentEditor } from '../../components/ContentWorkflow/ContentEditor';
import { ReviewPanel } from '../../components/ContentWorkflow/ReviewPanel';
import { PublishManager } from '../../components/ContentWorkflow/PublishManager';
import { WorkflowHistory } from '../../components/ContentWorkflow/WorkflowHistory';
import { ContentItem } from '../../types/content';

const { Sider, Content } = Layout;
const { Title } = Typography;

type ViewType = 'list' | 'editor' | 'review' | 'publish' | 'history';

export const ContentWorkflow: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);

  // 模拟统计数据
  const stats = {
    draft: 5,
    pending: 3,
    approved: 2,
    published: 15
  };

  const menuItems = [
    {
      key: 'list',
      icon: <FileTextOutlined />,
      label: '内容列表',
      badge: stats.draft + stats.pending
    },
    {
      key: 'editor',
      icon: <EditOutlined />,
      label: '内容编辑'
    },
    {
      key: 'review',
      icon: <AuditOutlined />,
      label: '审核管理',
      badge: stats.pending
    },
    {
      key: 'publish',
      icon: <SendOutlined />,
      label: '发布管理',
      badge: stats.approved
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '操作历史'
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setCurrentView(key as ViewType);
    if (key !== 'editor') {
      setSelectedContent(null);
    }
  };

  const handleCreateNew = () => {
    setSelectedContent(null);
    setCurrentView('editor');
  };

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setCurrentView('editor');
  };

  const handleSaveContent = async (contentData: Partial<ContentItem>) => {
    setLoading(true);
    try {
      // 这里应该调用API保存内容
      console.log('保存内容:', contentData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 保存成功后返回列表
      setCurrentView('list');
      setSelectedContent(null);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContent = async (contentData: Partial<ContentItem>) => {
    setLoading(true);
    try {
      // 这里应该调用API提交审核
      console.log('提交审核:', contentData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 提交成功后跳转到审核页面
      setCurrentView('review');
      setSelectedContent(null);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (contentId: string, action: string, data: any) => {
    setLoading(true);
    try {
      // 这里应该调用API执行审核操作
      console.log('审核操作:', { contentId, action, data });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('审核操作失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (contentId: string, data: any) => {
    setLoading(true);
    try {
      // 这里应该调用API发布内容
      console.log('发布内容:', { contentId, data });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('发布失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (contentId: string, data: any) => {
    setLoading(true);
    try {
      // 这里应该调用API设置定时发布
      console.log('定时发布:', { contentId, data });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('定时发布设置失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (contentId: string) => {
    setLoading(true);
    try {
      // 这里应该调用API取消发布
      console.log('取消发布:', contentId);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('取消发布失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <ContentList
            onEdit={handleEditContent}
            onDelete={async (contentId) => {
              console.log('删除内容:', contentId);
            }}
          />
        );
      
      case 'editor':
        return (
          <ContentEditor
            content={selectedContent || undefined}
            onSave={handleSaveContent}
            onSubmit={handleSubmitContent}
            onCancel={() => {
              setCurrentView('list');
              setSelectedContent(null);
            }}
            loading={loading}
          />
        );
      
      case 'review':
        return (
          <ReviewPanel
            onReview={handleReview}
          />
        );
      
      case 'publish':
        return (
          <PublishManager
            onPublish={handlePublish}
            onSchedule={handleSchedule}
            onUnpublish={handleUnpublish}
          />
        );
      
      case 'history':
        return (
          <Card title="操作历史">
            <WorkflowHistory
              contentId="all"
              history={[
                {
                  id: '1',
                  action: 'created',
                  status: 'draft',
                  comment: '创建新内容',
                  user: { id: 'user1', name: '张三' },
                  timestamp: '2024-01-15T10:00:00Z'
                },
                {
                  id: '2',
                  action: 'submitted',
                  status: 'pending',
                  comment: '提交审核',
                  user: { id: 'user1', name: '张三' },
                  timestamp: '2024-01-15T14:00:00Z'
                },
                {
                  id: '3',
                  action: 'approved',
                  status: 'approved',
                  comment: '审核通过',
                  user: { id: 'user2', name: '李四' },
                  timestamp: '2024-01-15T16:00:00Z'
                }
              ]}
            />
          </Card>
        );
      
      default:
        return <div>页面不存在</div>;
    }
  };

  const getPageTitle = () => {
    const titles = {
      list: '内容管理',
      editor: selectedContent ? '编辑内容' : '新建内容',
      review: '审核管理',
      publish: '发布管理',
      history: '操作历史'
    };
    return titles[currentView];
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider
        width={240}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            内容工作流
          </Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[currentView]}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Space>
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge count={item.badge} size="small" />
                )}
              </Space>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Content style={{ padding: '24px' }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              {getPageTitle()}
            </Title>
            
            {currentView === 'list' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
              >
                新建内容
              </Button>
            )}
          </div>

          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};