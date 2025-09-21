import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Space,
  Typography,
  theme,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logoutUser } from '@/store/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/admin/pages',
      icon: <FileTextOutlined />,
      label: '页面管理',
    },
    {
      key: '/admin/media',
      icon: <PictureOutlined />,
      label: '媒体库',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'logout':
        dispatch(logoutUser());
        navigate('/auth/login');
        break;
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="sidebar-logo">
          <h1>{collapsed ? 'CMS' : 'DLZ Shop CMS'}</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="header-trigger"
            />
          </div>
          
          <div className="header-right">
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <div className="user-avatar">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatarUrl}
                />
                <Space>
                  <Text>{user?.username}</Text>
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 6,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};