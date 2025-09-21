import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { RegisterData } from '@/types/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { loading, error } = useAppSelector(state => state.auth);

  const onFinish = async (values: RegisterData) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      navigate('/admin', { replace: true });
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
        <title>注册 - DLZ Shop CMS</title>
      </Helmet>
      
      <div className="login-container">
        <Card className="login-form">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="text-center">
              <Title level={2} style={{ marginBottom: 8 }}>
                创建账号
              </Title>
              <Text type="secondary">
                注册 DLZ Shop CMS 账号
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
              name="register"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 30, message: '用户名不能超过30个字符' },
                  { pattern: /^[a-zA-Z0-9]+$/, message: '用户名只能包含字母和数字' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱地址"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                    message: '密码必须包含大小写字母和数字' 
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                />
              </Form.Item>

              <Form.Item
                name="role"
                initialValue="AUTHOR"
              >
                <Select placeholder="选择角色">
                  <Option value="AUTHOR">作者</Option>
                  <Option value="EDITOR">编辑</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  注册
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text>
                已有账号？ <Link to="/auth/login">立即登录</Link>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;