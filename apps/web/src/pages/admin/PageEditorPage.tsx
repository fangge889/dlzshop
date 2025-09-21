import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Select, 
  Switch,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  EyeOutlined, 
  SendOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { RichTextEditor } from '../../components/Editor';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchPage } from '../../store/slices/contentSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  layout: string;
  template?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

const PageEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector(state => state.auth);
  const { currentPage, loading } = useAppSelector(state => state.content);
  
  const [form] = Form.useForm<PageFormData>();
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const isEditing = Boolean(id && id !== 'new');

  // 加载页面数据
  useEffect(() => {
    if (isEditing) {
      dispatch(fetchPage(id));
    }
  }, [dispatch, id, isEditing]);

  // 设置表单数据
  useEffect(() => {
    if (currentPage && isEditing) {
      const pageData: PageFormData = {
        title: currentPage.title,
        slug: currentPage.slug,
        content: currentPage.content,
        excerpt: currentPage.excerpt || '',
        layout: 'page',
        status: currentPage.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        metaTitle: currentPage.metaTitle || '',
        metaDescription: currentPage.metaDescription || '',
        metaKeywords: currentPage.metaKeywords || ''
      };
      
      form.setFieldsValue(pageData);
      setContent(currentPage.content);
    }
  }, [currentPage, isEditing, form]);

  // 自动生成slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isEditing) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setFieldValue('slug', slug);
    }
  };

  // 保存页面
  const handleSave = async (status?: 'DRAFT' | 'PUBLISHED') => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const pageData = {
        ...values,
        content,
        status: status || values.status,
        authorId: user?.id
      };

      console.log('保存页面数据:', pageData);
      
      // 这里应该调用API保存页面
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(status === 'PUBLISHED' ? '页面发布成功' : '页面保存成功');
      
      if (!isEditing) {
        navigate('/admin/pages');
      }
    } catch (error) {
      message.error('保存失败，请检查表单数据');
    } finally {
      setSaving(false);
    }
  };

  // 预览页面
  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? '编辑页面' : '新建页面'} - DLZ Shop CMS</title>
      </Helmet>

      <div className="page-editor fade-in">
        {/* 头部操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/admin/pages')}
                >
                  返回列表
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  {isEditing ? '编辑页面' : '新建页面'}
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  type={previewMode ? 'primary' : 'default'}
                >
                  {previewMode ? '编辑模式' : '预览模式'}
                </Button>
                <Button 
                  icon={<SaveOutlined />}
                  onClick={() => handleSave('DRAFT')}
                  loading={saving}
                >
                  保存草稿
                </Button>
                <Button 
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => handleSave('PUBLISHED')}
                  loading={saving}
                >
                  发布页面
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={24}>
          {/* 主编辑区域 */}
          <Col xs={24} lg={previewMode ? 12 : 18}>
            <Card>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  layout: 'page',
                  status: 'DRAFT'
                }}
              >
                <Form.Item
                  name="title"
                  label="页面标题"
                  rules={[{ required: true, message: '请输入页面标题' }]}
                >
                  <Input 
                    placeholder="输入页面标题"
                    size="large"
                    onChange={handleTitleChange}
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label="页面链接"
                  rules={[{ required: true, message: '请输入页面链接' }]}
                >
                  <Input 
                    placeholder="page-url"
                    addonBefore="/"
                  />
                </Form.Item>

                <Form.Item
                  name="excerpt"
                  label="页面摘要"
                >
                  <TextArea 
                    placeholder="输入页面摘要（可选）"
                    rows={3}
                  />
                </Form.Item>

                <Form.Item label="页面内容">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="开始编写页面内容..."
                    style={{ minHeight: 500 }}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 预览区域 */}
          {previewMode && (
            <Col xs={24} lg={12}>
              <Card title="预览" style={{ height: 'fit-content' }}>
                <div 
                  className="page-preview"
                  dangerouslySetInnerHTML={{ __html: content }}
                  style={{
                    minHeight: 400,
                    padding: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    backgroundColor: '#fafafa'
                  }}
                />
              </Card>
            </Col>
          )}

          {/* 侧边栏设置 */}
          <Col xs={24} lg={previewMode ? 24 : 6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 发布设置 */}
              <Card title="发布设置" size="small">
                <Form form={form} layout="vertical">
                  <Form.Item name="status" label="状态">
                    <Select>
                      <Option value="DRAFT">草稿</Option>
                      <Option value="PUBLISHED">已发布</Option>
                      <Option value="ARCHIVED">已归档</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="layout" label="页面布局">
                    <Select>
                      <Option value="page">标准页面</Option>
                      <Option value="post">文章页面</Option>
                      <Option value="landing">落地页</Option>
                      <Option value="custom">自定义</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="template" label="页面模板">
                    <Select placeholder="选择模板（可选）" allowClear>
                      <Option value="default">默认模板</Option>
                      <Option value="full-width">全宽模板</Option>
                      <Option value="sidebar">侧边栏模板</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>

              {/* SEO设置 */}
              <Card title="SEO设置" size="small">
                <Form form={form} layout="vertical">
                  <Form.Item name="metaTitle" label="SEO标题">
                    <Input placeholder="页面SEO标题" />
                  </Form.Item>

                  <Form.Item name="metaDescription" label="SEO描述">
                    <TextArea 
                      placeholder="页面SEO描述"
                      rows={3}
                      showCount
                      maxLength={160}
                    />
                  </Form.Item>

                  <Form.Item name="metaKeywords" label="关键词">
                    <Input placeholder="关键词，用逗号分隔" />
                  </Form.Item>
                </Form>
              </Card>

              {/* 特色图片 */}
              <Card title="特色图片" size="small">
                <Form form={form} layout="vertical">
                  <Form.Item name="featuredImage">
                    <div style={{ 
                      border: '1px dashed #d9d9d9',
                      borderRadius: 4,
                      padding: 16,
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}>
                      <Text type="secondary">点击选择特色图片</Text>
                    </div>
                  </Form.Item>
                </Form>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default PageEditorPage;