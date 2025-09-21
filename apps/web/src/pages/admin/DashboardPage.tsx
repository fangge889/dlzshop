import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  FileTextOutlined,
  PictureOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>仪表板 - DLZ Shop CMS</title>
      </Helmet>

      <div className="fade-in">
        <Title level={2} style={{ marginBottom: 24 }}>
          仪表板
        </Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总页面数"
                value={12}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="媒体文件"
                value={48}
                prefix={<PictureOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="用户数量"
                value={5}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="今日访问"
                value={1234}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="最近活动" style={{ height: 400 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>📝 管理员创建了新页面"关于我们"</div>
                <div>🖼️ 编辑上传了3张图片到媒体库</div>
                <div>✏️ 作者更新了页面"产品介绍"</div>
                <div>👤 新用户"张三"注册了账号</div>
                <div>🚀 页面"首页"已发布</div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="快速操作" style={{ height: 400 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <a href="/admin/pages/new">📝 创建新页面</a>
                <a href="/admin/media">🖼️ 上传媒体文件</a>
                <a href="/admin/settings">⚙️ 系统设置</a>
                <a href="/admin/users">👥 用户管理</a>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DashboardPage;