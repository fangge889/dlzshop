import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Card, 
  Select, 
  Switch,
  message,
  Row,
  Col 
} from 'antd';
import { SaveOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchPage } from '@/store/slices/contentSlice';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PageEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  
  const { currentPage, loading } = useAppSelector(state => state.content);
  const isEditing = !!id && id !== 'new';

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchPage(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (currentPage && isEditing) {
      form.setFieldsValue({
        title: currentPage.title,
        slug: currentPage.slug,
        content: currentPage.content,
        excerpt: currentPage.excerpt,
        status: currentPage.status,
      });
    }
  }, [currentPage, form, isEditing]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // 这里应该调用保存 API
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟 API 调用
      message.success(isEditing ? '页面更新成功' : '页面创建成功');
      if (!isEditing) {
        navigate('/admin/pages');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    // 这里可以打开预览窗口或跳转到预览页面
    message.info('预览功能开发中');
  };

  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      values.status = 'PUBLISHED';
      await handleSave(values);
    } catch (error) {
      message.error('请先完善页面信息');
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? '编辑页面' : '创建页面'} - DLZ Shop CMS</title>
      </Helmet>

      <div className="page-editor fade-in">
        <div className="page-editor-header">
          <Title level={2} style={{ margin: 0 }}>
            {isEditing ? '编辑页面' : '创建页面'}
          </Title>
          <Space>
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              预览
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              loading={saving}
              onClick={() => form.submit()}
            >
              保存草稿
            </Button>
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              loading={saving}
              onClick={handlePublish}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              发布
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'DRAFT',
          }}
        >
          <Row gutter={24}>
            <Col span={18}>
              <Card title="页面内容" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="title"
                  label="页面标题"
                  rules={[{ required: true, message: '请输入页面标题' }]}
                >
                  <Input 
                    placeholder="输入页面标题" 
                    size="large"
                    onChange={(e) => {
                      // 自动生成 slug
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                      form.setFieldValue('slug', slug);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label="页面路径"
                  rules={[
                    { required: true, message: '请输入页面路径' },
                    { pattern: /^[a-z0-9-]+$/, message: '路径只能包含小写字母、数字和连字符' }
                  ]}
                >
                  <Input 
                    placeholder="page-url" 
                    addonBefore="/"
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="页面内容"
                >
                  <TextArea
                    rows={20}
                    placeholder="输入页面内容（支持 HTML 和 Markdown）"
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col span={6}>
              <Card title="页面设置" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="status"
                  label="发布状态"
                >
                  <Select>
                    <Option value="DRAFT">草稿</Option>
                    <Option value="PUBLISHED">已发布</Option>
                    <Option value="SCHEDULED">定时发布</Option>
                    <Option value="ARCHIVED">已归档</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="excerpt"
                  label="页面摘要"
                >
                  <TextArea
                    rows={4}
                    placeholder="输入页面摘要"
                  />
                </Form.Item>

                <Form.Item
                  name="featuredImage"
                  label="特色图片"
                >
                  <Input placeholder="图片 URL" />
                </Form.Item>
              </Card>

              <Card title="SEO 设置">
                <Form.Item
                  name="metaTitle"
                  label="SEO 标题"
                >
                  <Input placeholder="SEO 标题" />
                </Form.Item>

                <Form.Item
                  name="metaDescription"
                  label="SEO 描述"
                >
                  <TextArea
                    rows={3}
                    placeholder="SEO 描述"
                  />
                </Form.Item>

                <Form.Item
                  name="metaKeywords"
                  label="关键词"
                >
                  <Input placeholder="关键词，用逗号分隔" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default PageEditorPage;