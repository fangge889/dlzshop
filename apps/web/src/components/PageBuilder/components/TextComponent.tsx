import React, { useState, useRef, useEffect } from 'react';
import { Typography, Input } from 'antd';
import { ComponentProps } from '../types';

const { Title, Paragraph, Text } = Typography;

interface TextComponentProps extends ComponentProps {
  props: {
    content?: string;
    type?: 'paragraph' | 'title' | 'text';
    level?: 1 | 2 | 3 | 4 | 5;
    style?: React.CSSProperties;
    editable?: boolean;
  };
}

export const TextComponent: React.FC<TextComponentProps> = ({
  id,
  props: componentProps,
  isSelected,
  previewMode,
  onUpdate,
  onSelect
}) => {
  const {
    content = '点击编辑文本',
    type = 'paragraph',
    level = 1,
    style = {},
    editable = true
  } = componentProps;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!previewMode && editable) {
      setIsEditing(true);
      setEditValue(content);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== content) {
      onUpdate?.({ content: editValue });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(content);
    }
  };

  const commonProps = {
    style: {
      margin: 0,
      cursor: !previewMode && editable ? 'text' : 'default',
      minHeight: 24,
      ...style
    },
    onClick: onSelect,
    onDoubleClick: handleDoubleClick
  };

  if (isEditing) {
    return (
      <Input.TextArea
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        autoSize={{ minRows: 1, maxRows: 10 }}
        style={{
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          resize: 'none',
          ...style
        }}
      />
    );
  }

  switch (type) {
    case 'title':
      return (
        <Title level={level} {...commonProps}>
          {content || '标题文本'}
        </Title>
      );
    
    case 'text':
      return (
        <Text {...commonProps}>
          {content || '文本内容'}
        </Text>
      );
    
    case 'paragraph':
    default:
      return (
        <Paragraph {...commonProps}>
          {content || '段落文本'}
        </Paragraph>
      );
  }
};