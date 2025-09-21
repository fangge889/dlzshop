import React, { useState, useEffect } from 'react';
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
  Spin,
  Pagination,
  Select,
  Checkbox,
  Popconfirm
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CopyOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  useGetMediaFilesQuery,
  useUploadMediaFilesMutation,
  useDeleteMediaFileMutation,
  useDeleteMediaFilesMutation,
  useUpdateMediaFileMutation,
  MediaFile
} from '../../services/mediaAPI';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const MediaLibraryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editForm, setEditForm] = useState({ altText: '', caption: '' });

  // API hooks
  const { data: mediaData, isLoading, refetch } = useGetMediaFilesQuery({
    page,
    limit,
    search: search || undefined,
    type: type || undefined
  });

  const [uploadFiles, { isLoading: uploading }] = useUploadMediaFilesMutation();
  const [deleteFile] = useDeleteMediaFileMutation();
  const [deleteFiles] = useDeleteMediaFilesMutation();
  const [updateFile] = useUpdateMediaFileMutation();

  const files = mediaData?.files || [];
  const pagination = mediaData?.pagination;

  const handlePreview = (file: MediaFile) => {
    setPreviewImage(file.filePath);
    setPreviewTitle(file.originalName);
    setPreviewVisible(true);
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    message.success('URL 已复制到剪贴板');
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFile(id).unwrap();
      message.success('文件删除成功');
      setSelectedFiles(prev => prev.filter(fileId => fileId !== id));
    } catch (error) {
      message.error('文件删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    try {
      await deleteFiles(selectedFiles).unwrap();
      message.success(`成功删除 ${selectedFiles.length} 个文件`);
      setSelectedFiles([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setEditForm({
      altText: file.altText || '',
      caption: file.caption || ''
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    try {
      await updateFile({
        id: editingFile.id,
        ...editForm
      }).unwrap();
      message.success('文件信息更新成功');
      setEditModalVisible(false);
      setEditingFile(null);
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    const formData = new FormData();
    formData.append('files', file);

    try {
      await uploadFiles(formData).unwrap();
      onSuccess();
      message.success(`${file.name} 上传成功`);
    } catch (error) {
      onError(error);
      message.error(`${file.name} 上传失败`);
    }
  };

  const uploadProps = {
    name: 'files',
    multiple: true,
    customRequest: handleUpload,
    beforeUpload: (file: File) => {
      const isValidType = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ].includes(file.type);
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      
      if (!isValidType) {
        message.error('只支持 JPG、PNG、GIF、WebP 格式的图片');
        return false;
      }
      
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB');
        return false;
      }
      
      return true;
    },
  };

  const handleSelectFile = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
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
        <div className="media-library-header" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              媒体库
            </Title>
            <Space>
              <Input
                placeholder="搜索文件..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="文件类型"
                value={type}
                onChange={setType}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="image">图片</Option>
                <Option value="video">视频</Option>
                <Option value="audio">音频</Option>
                <Option value="application">文档</Option>
              </Select>
              {selectedFiles.length > 0 && (
                <Popconfirm
                  title={`确定要删除选中的 ${selectedFiles.length} 个文件吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger>
                    批量删除 ({selectedFiles.length})
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传。支持 JPG、PNG、GIF、WebP 格式，单个文件不超过 10MB
            </p>
          </Dragger>
        </Card>

        <div className="media-library-content">
          {files.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Checkbox
                checked={selectedFiles.length === files.length}
                indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                全选
              </Checkbox>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                共 {pagination?.total || 0} 个文件
              </Text>
            </div>
          )}

          {isLoading || uploading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {files.map((file) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={4} key={file.id}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onChange={(e) => handleSelectFile(file.id, e.target.checked)}
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 1,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: 4,
                              padding: 2
                            }}
                          />
                          {file.mimeType.startsWith('image/') ? (
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
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                              fontSize: 48,
                              color: '#999'
                            }}>
                              📄
                            </div>
                          )}
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
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(file)}
                        />,
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyUrl(file.filePath)}
                        />,
                        <Popconfirm
                          title="确定要删除这个文件吗？"
                          onConfirm={() => handleDelete(file.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
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
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(file.createdAt).toLocaleDateString()}
                            </Text>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {pagination && pagination.pages > 1 && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={page}
                    total={pagination.total}
                    pageSize={limit}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }
                    onChange={(newPage, newPageSize) => {
                      setPage(newPage);
                      if (newPageSize !== limit) {
                        setLimit(newPageSize);
                      }
                    }}
                  />
                </div>
              )}
            </>
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

        <Modal
          title="编辑文件信息"
          open={editModalVisible}
          onOk={handleSaveEdit}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingFile(null);
          }}
          okText="保存"
          cancelText="取消"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>文件名：</Text>
              <Text>{editingFile?.originalName}</Text>
            </div>
            <div>
              <Text strong>Alt 文本：</Text>
              <Input
                value={editForm.altText}
                onChange={(e) => setEditForm(prev => ({ ...prev, altText: e.target.value }))}
                placeholder="为图片添加 Alt 文本"
              />
            </div>
            <div>
              <Text strong>说明：</Text>
              <Input.TextArea
                value={editForm.caption}
                onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="添加文件说明"
                rows={3}
              />
            </div>
          </Space>
        </Modal>
      </div>
    </>
  );
};

export default MediaLibraryPage;