import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>DLZ Shop CMS - 现代化内容管理系统</title>
        <meta name="description" content="DLZ Shop CMS 是一个现代化的企业级内容管理系统，提供强大的内容编辑和管理功能。" />
      </Helmet>

      <Content style={{ padding: '50px', textAlign: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ fontSize: '3rem', marginBottom: '2rem' }}>
            欢迎来到 DLZ Shop CMS
          </Title>
          
          <Paragraph style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#666' }}>
            现代化的企业级内容管理系统，提供强大的内容编辑、实时协作、媒体管理等功能。
            采用最新的技术栈，为您提供高效、安全、易用的内容管理体验。
          </Paragraph>

          <Space size="large">
            <Link to="/admin">
              <Button type="primary" size="large">
                进入管理后台
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="large">
                登录
              </Button>
            </Link>
          </Space>

          <div style={{ marginTop: '4rem', padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
            <Title level={3}>核心功能特性</Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              <div>
                <Title level={4}>📝 富文本编辑</Title>
                <Paragraph>强大的富文本编辑器，支持Markdown和可视化编辑</Paragraph>
              </div>
              <div>
                <Title level={4}>🤝 实时协作</Title>
                <Paragraph>多用户实时协作编辑，提升团队工作效率</Paragraph>
              </div>
              <div>
                <Title level={4}>📁 媒体管理</Title>
                <Paragraph>完善的媒体库管理，支持图片处理和优化</Paragraph>
              </div>
              <div>
                <Title level={4}>🎨 可视化构建</Title>
                <Paragraph>拖拽式页面构建器，轻松创建精美页面</Paragraph>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </>
  );
};

export default HomePage;