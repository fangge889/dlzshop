import React from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Switch,
  Select,
  message,
  Tabs 
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // 这里应该调用保存设置的 API
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('设置保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <>
      <Helmet>
        <title>系统设置 - DLZ Shop CMS</title>
      </Helmet>

      <div className="fade-in">
        <Title level={2} style={{ marginBottom: 24 }}>
          系统设置
        </Title>

        <Tabs defaultActiveKey="general">
          <TabPane tab="基本设置" key="general">
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  siteName: 'DLZ Shop CMS',
                  siteDescription: '现代化内容管理系统',
                  siteUrl: 'http://localhost:3000',
                  adminEmail: 'admin@example.com',
                  timezone: 'Asia/Shanghai',
                  language: 'zh-CN',
                }}
              >
                <Form.Item
                  name="siteName"
                  label="网站名称"
                  rules={[{ required: true, message: '请输入网站名称' }]}
                >
                  <Input placeholder="输入网站名称" />
                </Form.Item>

                <Form.Item
                  name="siteDescription"
                  label="网站描述"
                >
                  <TextArea
                    rows={3}
                    placeholder="输入网站描述"
                  />
                </Form.Item>

                <Form.Item
                  name="siteUrl"
                  label="网站地址"
                  rules={[
                    { required: true, message: '请输入网站地址' },
                    { type: 'url', message: '请输入有效的网站地址' }
                  ]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>

                <Form.Item
                  name="adminEmail"
                  label="管理员邮箱"
                  rules={[
                    { required: true, message: '请输入管理员邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="admin@example.com" />
                </Form.Item>

                <Form.Item
                  name="timezone"
                  label="时区"
                >
                  <Select>
                    <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                    <Option value="UTC">UTC</Option>
                    <Option value="America/New_York">America/New_York</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="language"
                  label="默认语言"
                >
                  <Select>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="en-US">English</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="内容设置" key="content">
            <Card>
              <Form layout="vertical">
                <Form.Item
                  name="postsPerPage"
                  label="每页文章数量"
                  initialValue={10}
                >
                  <Select>
                    <Option value={5}>5</Option>
                    <Option value={10}>10</Option>
                    <Option value={20}>20</Option>
                    <Option value={50}>50</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="allowComments"
                  label="允许评论"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="moderateComments"
                  label="评论需要审核"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="媒体设置" key="media">
            <Card>
              <Form layout="vertical">
                <Form.Item
                  name="maxFileSize"
                  label="最大文件大小 (MB)"
                  initialValue={10}
                >
                  <Select>
                    <Option value={1}>1 MB</Option>
                    <Option value={5}>5 MB</Option>
                    <Option value={10}>10 MB</Option>
                    <Option value={20}>20 MB</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="allowedFileTypes"
                  label="允许的文件类型"
                  initialValue="jpg,jpeg,png,gif,pdf,doc,docx"
                >
                  <Input placeholder="用逗号分隔，如：jpg,png,pdf" />
                </Form.Item>

                <Form.Item
                  name="imageQuality"
                  label="图片压缩质量"
                  initialValue={80}
                >
                  <Select>
                    <Option value={60}>60%</Option>
                    <Option value={70}>70%</Option>
                    <Option value={80}>80%</Option>
                    <Option value={90}>90%</Option>
                    <Option value={100}>100% (无压缩)</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;