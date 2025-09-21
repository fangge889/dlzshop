import React, { useState } from 'react';
import { Image, Button, Upload, message } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { ComponentProps } from '../types';

interface ImageComponentProps extends ComponentProps {
  props: {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  };
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  id,
  props: componentProps,
  isSelected,
  previewMode,
  onUpdate,
  onSelect
}) => {
  const {
    src,
    alt = '图片',
    width = '100%',
    height = 'auto',
    style = {},
    fit = 'cover'
  } = componentProps;

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // 这里应该调用上传API
      const formData = new FormData();
      formData.append('image', file);
      
      // 模拟上传
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);
      
      onUpdate?.({ src: mockUrl });
      message.success('图片上传成功');
    } catch (error) {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return false;
      }
      
      handleUpload(file);
      return false;
    },
    showUploadList: false
  };

  if (!src) {
    return (
      <div
        style={{
          border: '2px dashed #d9d9d9',
          borderRadius: 4,
          padding: 24,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        onClick={onSelect}
      >
        <PictureOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }} />
        
        {!previewMode ? (
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading}
              type="dashed"
            >
              {uploading ? '上传中...' : '选择图片'}
            </Button>
          </Upload>
        ) : (
          <span style={{ color: '#bfbfbf' }}>暂无图片</span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: typeof width === 'number' ? `${width}px` : width,
        ...style
      }}
      onClick={onSelect}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          objectFit: fit,
          borderRadius: 4
        }}
        preview={previewMode}
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
      />
      
      {/* 编辑模式下的操作按钮 */}
      {!previewMode && isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 4,
            padding: 4
          }}
        >
          <Upload {...uploadProps}>
            <Button 
              type="text" 
              size="small" 
              icon={<UploadOutlined />}
              style={{ color: 'white' }}
              loading={uploading}
            />
          </Upload>
        </div>
      )}
    </div>
  );
};