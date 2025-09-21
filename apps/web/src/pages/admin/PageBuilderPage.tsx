import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Typography, 
  message, 
  Modal,
  Input,
  Form
} from 'antd';
import { 
  SaveOutlined, 
  EyeOutlined, 
  ArrowLeftOutlined,
  SendOutlined 
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBuilder } from '../../components/PageBuilder';
import { ComponentConfig } from '../../components/PageBuilder/types';
import { useAppSelector } from '../../hooks/redux';

const { Title } = Typography;

interface PageData {
  id?: string;
  title: string;
  slug: string;
  components: ComponentConfig[];
  status: 'DRAFT' | 'PUBLISHED';
}

const PageBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector(state => state.auth);
  
  const [pageData, setPageData] = useState<PageData>({
    title: '新页面',
    slug: 'new-page',
    components: [],
    status: 'DRAFT'
  });
  const [saving, setSaving] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [form] = Form.useForm();

  const isEditing = Boolean(id && id !== 'new');

  // 加载页面数据
  useEffect(() => {
    if (isEditing) {
      // 这里应该调用API加载页面数据
      // 模拟数据加载
      const mockData: PageData = {
        id,
        title: '示例页面',
        slug: 'example-page',
        components: [
          {
            id: 'text-1',
            type: 'text',
            name: '文本',
            props: {
              content: '欢迎使用页面构建器',
              type: 'title',
              level: 1,
              style: { textAlign: 'center', margin: '20px 0' }
            },
            children: []
          },
          {
            id: 'container-1',
            type: 'container',
            name: '容器',
            props: {
              title: '内容区域',
              bordered: true,
              padding: 24,
              style: { margin: '20px 0' }
            },
            children: [
              {
                id: 'text-2',
                type: 'text',
                name: '文本',
                props: {
                  content: '这是一个示例页面，展示了页面构建器的功能。您可以拖拽左侧的组件到画布中，然后在右侧编辑组件属性。',
                  type: 'paragraph',
                  style: { marginBottom: '16px' }
                },
                children: []
              },
              {
                id: 'button-1',
                type: 'button',
                name: '按钮',
                props: {
                  text: '了解更多',
                  type: 'primary',
                  size: 'large',
                  href: '#',
                  style: { marginTop: '16px' }
                },
                children: []
              }
            ]
          }
        ],
        status: 'DRAFT'
      };
      
      setPageData(mockData);
      form.setFieldsValue({
        title: mockData.title,
        slug: mockData.slug
      });
    }
  }, [isEditing, id, form]);

  // 保存页面
  const handleSave = async (components: ComponentConfig[], publish = false) => {
    try {
      setSaving(true);
      
      const saveData = {
        ...pageData,
        components,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        authorId: user?.id,
        updatedAt: new Date().toISOString()
      };

      console.log('保存页面数据:', saveData);
      
      // 这里应该调用API保存页面
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(publish ? '页面发布成功' : '页面保存成功');
      
      if (!isEditing) {
        navigate('/admin/pages');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 预览页面
  const handlePreview = (components: ComponentConfig[]) => {
    console.log('预览页面:', components);
    // 这里可以打开新窗口预览页面
    message.info('预览功能开发中');
  };

  // 显示保存对话框
  const showSaveModal = (components: ComponentConfig[]) => {
    form.setFieldsValue({
      title: pageData.title,
      slug: pageData.slug
    });
    setSaveModalVisible(true);
  };

  // 确认保存
  const handleSaveConfirm = async (publish = false) => {
    try {
      const values = await form.validateFields();
      setPageData(prev => ({ ...prev, ...values }));
      setSaveModalVisible(false);
      
      // 这里需要获取当前的组件数据
      // 暂时使用空数组，实际应该从PageBuilder获取
      await handleSave(pageData.components, publish);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? '编辑页面' : '新建页面'} - 页面构建器 - DLZ Shop CMS</title>
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/pages')}
            >
              返回列表
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {isEditing ? '编辑页面' : '新建页面'} - {pageData.title}
            </Title>
          </Space>
          
          <Space>
            <Button 
              icon={<EyeOutlined />}
              onClick={() => handlePreview(pageData.components)}
            >
              预览
            </Button>
            <Button 
              icon={<SaveOutlined />}
              onClick={() => showSaveModal(pageData.components)}
              loading={saving}
            >
              保存草稿
            </Button>
            <Button 
              type="primary"
              icon={<SendOutlined />}
              onClick={() => showSaveModal(pageData.components)}
              loading={saving}
            >
              发布页面
            </Button>
          </Space>
        </div>

        {/* 页面构建器 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PageBuilder
            initialComponents={pageData.components}
            onSave={handleSave}
            onPreview={handlePreview}
          />
        </div>
      </div>

      {/* 保存对话框 */}
      <Modal
        title="保存页面"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSaveModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="draft" 
            onClick={() => handleSaveConfirm(false)}
            loading={saving}
          >
            保存草稿
          </Button>,
          <Button 
            key="publish" 
            type="primary" 
            onClick={() => handleSaveConfirm(true)}
            loading={saving}
          >
            发布页面
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="页面标题"
            rules={[{ required: true, message: '请输入页面标题' }]}
          >
            <Input placeholder="输入页面标题" />
          </Form.Item>
          
          <Form.Item
            name="slug"
            label="页面路径"
            rules={[
              { required: true, message: '请输入页面路径' },
              { pattern: /^[a-z0-9-]+$/, message: '路径只能包含小写字母、数字和连字符' }
            ]}
          >
            <Input placeholder="page-url" addonBefore="/" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PageBuilderPage;