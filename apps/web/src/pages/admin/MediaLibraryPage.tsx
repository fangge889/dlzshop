import React, { useState } from 'react';
import { 
  Upload, 
  Button, 
  Typography, 
  Card, 
  Image, 
  Space, 
  Modal, 
  Input,
  message,
  Row,
  Col,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CopyOutlined 
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const MediaLibraryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { files, loading } = useAppSelector(state => state.media);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 模拟媒体文件数据
  const mockFiles = [
    {
      id: 1,
      filename: 'hero-image.jpg',
      originalName: '英雄图片.jpg',
      filePath: '/uploads/hero-image.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      filename: 'logo.png',
      originalName: '公司标志.png',
      filePath: '/uploads/logo.png',
      fileSize: 512000,
      mimeType: 'image/png',
      width: 200,
      height: 200,
      createdAt: '2023-01-02T00:00:00Z',
    },
  ];

  const handlePreview = (file: any) => {
    setPreviewImage(file.filePath);
    setPreviewTitle(file.originalName);
    setPreviewVisible(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('URL 已复制到剪贴板');
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确定要删除这个文件吗？',
      content: '删除后无法恢复',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        message.success('文件删除成功');
        // 这里应该调用删除 API
      },
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/media/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      const isLt10M = file.size / 1024 / 1024 < 10;
      
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB');
        return false;
      }
      
      return true;
    },
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Helmet>
        <title>媒体库 - DLZ Shop CMS</title>
      </Helmet>

      <div className="media-library fade-in">
        <div className="media-library-header">
          <Title level={2} style={{ margin: 0 }}>
            媒体库
          </Title>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传。支持 JPG、PNG、GIF 格式，单个文件不超过 10MB
            </p>
          </Dragger>
        </Card>

        <div className="media-library-content">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {mockFiles.map((file) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={file.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: 200, overflow: 'hidden' }}>
                        <Image
                          src={file.filePath}
                          alt={file.originalName}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          preview={false}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(file)}
                      />,
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyUrl(file.filePath)}
                      />,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(file.id)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text ellipsis={{ tooltip: file.originalName }}>
                          {file.originalName}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatFileSize(file.fileSize)}
                          </Text>
                          {file.width && file.height && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {file.width} × {file.height}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="80%"
          style={{ top: 20 }}
        >
          <Image
            src={previewImage}
            alt={previewTitle}
            style={{ width: '100%' }}
          />
        </Modal>
      </div>
    </>
  );
};

export default MediaLibraryPage;