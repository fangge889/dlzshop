import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Upload,
  message,
  Divider,
  Tag,
  DatePicker,
  Typography
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  EyeOutlined,
  PictureOutlined,
  UploadOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { RichTextEditor } from '../Editor/RichTextEditor';
import { WorkflowStatus } from './WorkflowStatus';
import { WorkflowActions } from './WorkflowActions';
import { ContentItem, DEFAULT_WORKFLOW } from '../../types/content';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface ContentEditorProps {
  content?: ContentItem;
  onSave: (content: Partial<ContentItem>) => Promise<void>;
  onSubmit?: (content: Partial<ContentItem>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onSave,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('content');
  const [contentValue, setContentValue] = useState(content?.content || '');
  const [tags, setTags] = useState<string[]>(content?.tags || []);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (content) {
      form.setFieldsValue({
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        type: content.type,
        status: content.status,
        categories: content.categories,
        seoTitle: content.metadata.seoTitle,
        seoDescription: content.metadata.seoDescription,
        keywords: content.metadata.keywords?.join(', '),
        scheduledAt: content.metadata.scheduledAt ? dayjs(content.metadata.scheduledAt) : null
      });
      setContentValue(content.content);
      setTags(content.tags);
    }
  }, [content, form]);

  const handleSave = async (isDraft = true) => {
    try {
      const values = await form.validateFields();
      const contentData: Partial<ContentItem> = {
        ...values,
        content: contentValue,
        tags,
        status: isDraft ? 'draft' : 'pending',
        metadata: {
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
          keywords: values.keywords ? values.keywords.split(',').map((k: string) => k.trim()) : [],
          scheduledAt: values.scheduledAt?.toISOString()
        }
      };

      if (isDraft) {
        await onSave(contentData);
        message.success('草稿保存成功');
      } else {
        await onSubmit?.(contentData);
        message.success('内容已提交审核');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const tabItems = [
    {
      key: 'content',
      label: '内容编辑',
      children: (
        <div>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input
              placeholder="输入内容标题"
              onChange={(e) => {
                const title = e.target.value;
                if (title && !content?.slug) {
                  form.setFieldValue('slug', generateSlug(title));
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="URL别名"
            rules={[{ required: true, message: '请输入URL别名' }]}
          >
            <Input placeholder="url-slug" />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="摘要"
          >
            <TextArea
              rows={3}
              placeholder="内容摘要，用于搜索结果和社交分享"
            />
          </Form.Item>

          <Form.Item label="正文内容">
            <RichTextEditor
              value={contentValue}
              onChange={setContentValue}
              placeholder="开始编写内容..."
              style={{ minHeight: 400 }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'settings',
      label: '设置',
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="内容类型"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="page">页面</Option>
                <Option value="post">文章</Option>
                <Option value="custom">自定义</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="categories"
              label="分类"
            >
              <Select mode="multiple" placeholder="选择分类">
                <Option value="产品介绍">产品介绍</Option>
                <Option value="公司动态">公司动态</Option>
                <Option value="技术文档">技术文档</Option>
                <Option value="用户指南">用户指南</Option>
              </Select>
            </Form.Item>

            <Form.Item label="标签">
              <div>
                <Space wrap style={{ marginBottom: 8 }}>
                  {tags.map(tag => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 80px)' }}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onPressEnter={handleAddTag}
                    placeholder="添加标签"
                  />
                  <Button
                    type="primary"
                    icon={<TagsOutlined />}
                    onClick={handleAddTag}
                  >
                    添加
                  </Button>
                </Input.Group>
              </div>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="scheduledAt"
              label="定时发布"
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="选择发布时间"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Card title="特色图片" size="small">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
              >
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              </Upload>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'seo',
      label: 'SEO优化',
      children: (
        <div>
          <Form.Item
            name="seoTitle"
            label="SEO标题"
          >
            <Input placeholder="搜索引擎显示的标题" />
          </Form.Item>

          <Form.Item
            name="seoDescription"
            label="SEO描述"
          >
            <TextArea
              rows={3}
              placeholder="搜索引擎显示的描述"
              showCount
              maxLength={160}
            />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关键词"
          >
            <Input placeholder="用逗号分隔多个关键词" />
          </Form.Item>

          <Card title="预览效果" size="small" style={{ marginTop: 16 }}>
            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ color: '#1a0dab', fontSize: 18, marginBottom: 4 }}>
                {form.getFieldValue('seoTitle') || form.getFieldValue('title') || '页面标题'}
              </div>
              <div style={{ color: '#006621', fontSize: 14, marginBottom: 4 }}>
                https://example.com/{form.getFieldValue('slug') || 'page-url'}
              </div>
              <div style={{ color: '#545454', fontSize: 13 }}>
                {form.getFieldValue('seoDescription') || form.getFieldValue('excerpt') || '页面描述...'}
              </div>
            </div>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {content ? '编辑内容' : '新建内容'}
            </Title>
            {content && (
              <div style={{ marginTop: 8 }}>
                <Space>
                  <WorkflowStatus status={content.status} />
                  <Text type="secondary">
                    最后更新: {dayjs(content.updatedAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </Space>
              </div>
            )}
          </div>

          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSave(true)}
              loading={loading}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSave(false)}
              loading={loading}
            >
              提交审核
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                // 打开预览窗口
                window.open(`/preview/${content?.id || 'new'}`, '_blank');
              }}
            >
              预览
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'page',
            status: 'draft'
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Form>
      </Card>

      {/* 工作流操作面板 */}
      {content && content.status !== 'draft' && (
        <Card title="工作流操作" style={{ marginTop: 16 }}>
          <WorkflowActions
            content={content}
            onAction={async (action, data) => {
              console.log('工作流操作:', action, data);
              // 这里应该调用API执行工作流操作
            }}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
};