import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { ComponentProps } from '../types';

interface ButtonComponentProps extends ComponentProps {
  props: {
    text?: string;
    type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
    size?: 'small' | 'middle' | 'large';
    shape?: 'default' | 'circle' | 'round';
    icon?: string;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    style?: React.CSSProperties;
    block?: boolean;
    disabled?: boolean;
  };
}

export const ButtonComponent: React.FC<ButtonComponentProps> = ({
  id,
  props: componentProps,
  isSelected,
  previewMode,
  onUpdate,
  onSelect
}) => {
  const {
    text = '按钮',
    type = 'default',
    size = 'middle',
    shape = 'default',
    icon,
    href,
    target = '_blank',
    style = {},
    block = false,
    disabled = false
  } = componentProps;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);

  const handleDoubleClick = () => {
    if (!previewMode) {
      setIsEditing(true);
      setEditValue(text);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== text) {
      onUpdate?.({ text: editValue });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(text);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (previewMode && href) {
      window.open(href, target);
    } else if (!previewMode) {
      e.preventDefault();
      onSelect?.();
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        style={{
          width: 'auto',
          minWidth: 60,
          ...style
        }}
        autoFocus
      />
    );
  }

  return (
    <Button
      type={type}
      size={size}
      shape={shape}
      block={block}
      disabled={disabled && previewMode}
      style={{
        cursor: !previewMode ? 'pointer' : href ? 'pointer' : 'default',
        ...style
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {text}
    </Button>
  );
};