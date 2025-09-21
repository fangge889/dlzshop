import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Divider, Upload, message, Modal, Input } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  CodeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '开始编写内容...',
  style
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (file: File) => {
    // 这里应该实现图片上传逻辑
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = `<img src="${e.target?.result}" style="max-width: 100%; height: auto;" />`;
      document.execCommand('insertHTML', false, img);
      handleContentChange();
    };
    reader.readAsDataURL(file);
    return false; // 阻止默认上传行为
  };

  const handleInsertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    }
    setLinkModalVisible(true);
  };

  const handleLinkConfirm = () => {
    if (linkUrl) {
      const link = `<a href="${linkUrl}" target="_blank">${linkText || linkUrl}</a>`;
      document.execCommand('insertHTML', false, link);
      handleContentChange();
    }
    setLinkModalVisible(false);
    setLinkUrl('');
    setLinkText('');
  };

  const toolbarButtons = [
    {
      icon: <BoldOutlined />,
      command: 'bold',
      title: '粗体'
    },
    {
      icon: <ItalicOutlined />,
      command: 'italic',
      title: '斜体'
    },
    {
      icon: <UnderlineOutlined />,
      command: 'underline',
      title: '下划线'
    },
    {
      icon: <StrikethroughOutlined />,
      command: 'strikeThrough',
      title: '删除线'
    }
  ];

  const listButtons = [
    {
      icon: <UnorderedListOutlined />,
      command: 'insertUnorderedList',
      title: '无序列表'
    },
    {
      icon: <OrderedListOutlined />,
      command: 'insertOrderedList',
      title: '有序列表'
    }
  ];

  const alignButtons = [
    {
      icon: <AlignLeftOutlined />,
      command: 'justifyLeft',
      title: '左对齐'
    },
    {
      icon: <AlignCenterOutlined />,
      command: 'justifyCenter',
      title: '居中对齐'
    },
    {
      icon: <AlignRightOutlined />,
      command: 'justifyRight',
      title: '右对齐'
    }
  ];

  const historyButtons = [
    {
      icon: <UndoOutlined />,
      command: 'undo',
      title: '撤销'
    },
    {
      icon: <RedoOutlined />,
      command: 'redo',
      title: '重做'
    }
  ];

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, ...style }}>
      {/* 工具栏 */}
      <div style={{ 
        padding: '8px 12px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space split={<Divider type="vertical" />}>
          {/* 文本格式 */}
          <Space>
            {toolbarButtons.map(btn => (
              <Button
                key={btn.command}
                type="text"
                size="small"
                icon={btn.icon}
                title={btn.title}
                onClick={() => handleCommand(btn.command)}
              />
            ))}
          </Space>

          {/* 列表 */}
          <Space>
            {listButtons.map(btn => (
              <Button
                key={btn.command}
                type="text"
                size="small"
                icon={btn.icon}
                title={btn.title}
                onClick={() => handleCommand(btn.command)}
              />
            ))}
          </Space>

          {/* 对齐 */}
          <Space>
            {alignButtons.map(btn => (
              <Button
                key={btn.command}
                type="text"
                size="small"
                icon={btn.icon}
                title={btn.title}
                onClick={() => handleCommand(btn.command)}
              />
            ))}
          </Space>

          {/* 插入 */}
          <Space>
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              title="插入链接"
              onClick={handleInsertLink}
            />
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                type="text"
                size="small"
                icon={<PictureOutlined />}
                title="插入图片"
              />
            </Upload>
            <Button
              type="text"
              size="small"
              icon={<CodeOutlined />}
              title="代码块"
              onClick={() => handleCommand('formatBlock', 'pre')}
            />
          </Space>

          {/* 历史操作 */}
          <Space>
            {historyButtons.map(btn => (
              <Button
                key={btn.command}
                type="text"
                size="small"
                icon={btn.icon}
                title={btn.title}
                onClick={() => handleCommand(btn.command)}
              />
            ))}
          </Space>
        </Space>
      </div>

      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        style={{
          minHeight: 300,
          padding: '16px',
          outline: 'none',
          lineHeight: 1.6,
          fontSize: 14
        }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* 插入链接弹窗 */}
      <Modal
        title="插入链接"
        open={linkModalVisible}
        onOk={handleLinkConfirm}
        onCancel={() => {
          setLinkModalVisible(false);
          setLinkUrl('');
          setLinkText('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>链接地址:</label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <label>显示文本:</label>
            <Input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="链接文本"
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>

      <style>
        {`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #bfbfbf;
            font-style: italic;
          }
          
          [contenteditable] img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 8px 0;
          }
          
          [contenteditable] pre {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            overflow-x: auto;
          }
          
          [contenteditable] blockquote {
            border-left: 4px solid #dfe2e5;
            padding-left: 16px;
            margin: 8px 0;
            color: #6a737d;
          }
          
          [contenteditable] ul, [contenteditable] ol {
            padding-left: 24px;
            margin: 8px 0;
          }
          
          [contenteditable] li {
            margin: 4px 0;
          }
          
          [contenteditable] a {
            color: #1890ff;
            text-decoration: none;
          }
          
          [contenteditable] a:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};