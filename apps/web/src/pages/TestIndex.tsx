import React from 'react';
import { Card, Row, Col, Button, Typography, Space } from 'antd';
import { 
  BuildOutlined, 
  FileTextOutlined, 
  ExperimentOutlined,
  RocketOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export const TestIndex: React.FC = () => {
  const navigate = useNavigate();

  const testPages = [
    {
      title: '页面构建器测试',
      description: '测试拖拽页面构建器的各项功能，包括组件拖拽、属性编辑、预览等',
      icon: <BuildOutlined />,
      path: '/test/page-builder',
      color: '#1890ff'
    },
    {
      title: '内容工作流测试',
      description: '测试完整的内容管理工作流，包括编辑、审核、发布等功能',
      icon: <FileTextOutlined />,
      path: '/test/workflow',
      color: '#52c41a'
    },
    {
      title: '管理后台',
      description: '访问完整的管理后台系统，体验所有功能模块',
      icon: <RocketOutlined />,
      path: '/admin',
      color: '#722ed1'
    }
  ];

  return (
    <div style={{ 
      padding: 48, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48, color: 'white' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            🚀 DLZ Shop CMS 测试中心
          </Title>
          <Paragraph style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>
            现代化企业级内容管理系统 - 功能测试和演示
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {testPages.map((page, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                hoverable
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                bodyStyle={{ padding: 32, textAlign: 'center' }}
              >
                <div style={{ 
                  fontSize: 48, 
                  color: page.color, 
                  marginBottom: 16 
                }}>
                  {page.icon}
                </div>
                
                <Title level={3} style={{ marginBottom: 16 }}>
                  {page.title}
                </Title>
                
                <Paragraph 
                  style={{ 
                    color: '#666', 
                    marginBottom: 24,
                    minHeight: 60
                  }}
                >
                  {page.description}
                </Paragraph>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<ExperimentOutlined />}
                  onClick={() => navigate(page.path)}
                  style={{
                    background: page.color,
                    borderColor: page.color,
                    borderRadius: 8,
                    height: 48,
                    fontSize: 16
                  }}
                >
                  开始测试
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ 
          marginTop: 48, 
          textAlign: 'center',
          color: 'rgba(255,255,255,0.8)'
        }}>
          <Space direction="vertical" size={8}>
            <div>🎯 完整的内容管理工作流系统</div>
            <div>🎨 可视化拖拽页面构建器</div>
            <div>⚡ React + TypeScript + Ant Design</div>
            <div>🔧 现代化企业级架构</div>
          </Space>
        </div>
      </div>
    </div>
  );
};