import React from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { UserOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';

const { Title, Paragraph } = Typography;

export const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleTestLogin = () => {
    // 模拟登录状态，用于测试
    const mockUser = {
      id: 'test-user-1',
      username: 'testuser',
      email: 'test@example.com',
      name: '测试用户',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockToken = 'test-token-' + Date.now();

    // 设置localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // 手动设置Redux状态
    dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true
      }
    });

    // 跳转到测试页面
    navigate('/test/workflow');
  };

  const handleDirectAccess = () => {
    // 直接访问测试页面（不需要登录）
    navigate('/test/workflow');
  };

  return (
    <div style={{ 
      padding: 48, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card style={{ 
        width: 500, 
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }}>
            <ExperimentOutlined />
          </div>
          <Title level={2}>测试环境登录</Title>
          <Paragraph type="secondary">
            选择一种方式访问内容管理工作流测试页面
          </Paragraph>
        </div>

        <Alert
          message="测试说明"
          description="这是一个测试环境，您可以选择模拟登录或直接访问测试页面。所有功能都是演示性质的，不会影响实际数据。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            size="large"
            icon={<UserOutlined />}
            onClick={handleTestLogin}
            style={{ 
              width: '100%', 
              height: 48,
              borderRadius: 8
            }}
          >
            模拟管理员登录
          </Button>

          <Button
            size="large"
            onClick={handleDirectAccess}
            style={{ 
              width: '100%', 
              height: 48,
              borderRadius: 8
            }}
          >
            直接访问测试页面
          </Button>
        </Space>

        <div style={{ 
          marginTop: 24, 
          textAlign: 'center',
          color: '#666',
          fontSize: 14
        }}>
          <div>🎯 完整的内容管理工作流测试</div>
          <div>🎨 可视化拖拽页面构建器</div>
          <div>⚡ React + TypeScript + Ant Design</div>
        </div>
      </Card>
    </div>
  );
};