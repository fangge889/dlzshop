import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types/auth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error } = useAppSelector(state => state.auth);
  
  // 获取重定向路径
  const from = (location.state as any)?.from?.pathname || '/admin';

  const onFinish = async (values: LoginCredentials) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      navigate(from, { replace: true });
    } catch (error) {
      // 错误已经在 Redux 中处理
    }
  };

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  return (
    <>
      <Helmet>
        <title>登录 - DLZ Shop CMS</title>
      </Helmet>
      
      <div className="login-container">
        <Card className="login-form">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="text-center">
              <Title level={2} style={{ marginBottom: 8 }}>
                欢迎回来
              </Title>
              <Text type="secondary">
                登录到 DLZ Shop CMS 管理后台
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                closable
                onClose={handleErrorClose}
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名或邮箱' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名或邮箱"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Space split={<span>|</span>}>
                <Link to="/auth/register">
                  <Text>注册账号</Text>
                </Link>
                <Link to="/auth/forgot-password">
                  <Text>忘记密码</Text>
                </Link>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;