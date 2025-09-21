import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  BuildOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import PageBuilderPage from './PageBuilderPage';
import { ContentWorkflow } from './ContentWorkflow';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type AdminPageType = 'dashboard' | 'content-workflow' | 'page-builder' | 'users' | 'settings';

export const AdminLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPageType>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: 'content-workflow',
      icon: <FileTextOutlined />,
      label: '内容工作流'
    },
    {
      key: 'page-builder',
      icon: <BuildOutlined />,
      label: '页面构建器'
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setCurrentPage(key as AdminPageType);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div style={{ padding: 24 }}>
            <Title level={2}>仪表盘</Title>
            <p>欢迎使用内容管理系统</p>
          </div>
        );
      
      case 'content-workflow':
        return <ContentWorkflow />;
      
      case 'page-builder':
        return <PageBuilderPage />;
      
      case 'users':
        return (
          <div style={{ padding: 24 }}>
            <Title level={2}>用户管理</Title>
            <p>用户管理功能开发中...</p>
          </div>
        );
      
      case 'settings':
        return (
          <div style={{ padding: 24 }}>
            <Title level={2}>系统设置</Title>
            <p>系统设置功能开发中...</p>
          </div>
        );
      
      default:
        return <div>页面不存在</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              CMS 管理后台
            </Title>
          )}
          {collapsed && (
            <div style={{ color: '#1890ff', fontSize: 20, fontWeight: 'bold' }}>
              CMS
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div />
          
          <Space size="large">
            <Badge count={3}>
              <BellOutlined style={{ fontSize: 18, color: '#666' }} />
            </Badge>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    // 处理退出登录
                    console.log('退出登录');
                  }
                }
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ background: '#f0f2f5' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};