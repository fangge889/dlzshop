import React from 'react';
import { Card } from 'antd';
import { ComponentProps } from '../types';
import { DropZone } from '../DropZone';

interface ContainerComponentProps extends ComponentProps {
  props: {
    title?: string;
    bordered?: boolean;
    shadow?: boolean;
    padding?: number;
    margin?: number;
    backgroundColor?: string;
    borderRadius?: number;
    style?: React.CSSProperties;
    minHeight?: number;
  };
}

export const ContainerComponent: React.FC<ContainerComponentProps> = ({
  id,
  props: componentProps,
  children = [],
  isSelected,
  previewMode,
  onUpdate,
  onSelect
}) => {
  const {
    title,
    bordered = true,
    shadow = false,
    padding = 16,
    margin = 0,
    backgroundColor = 'transparent',
    borderRadius = 4,
    style = {},
    minHeight = 100
  } = componentProps;

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    borderRadius,
    margin,
    minHeight,
    ...style
  };

  const bodyStyle: React.CSSProperties = {
    padding
  };

  if (shadow) {
    containerStyle.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  }

  return (
    <div onClick={onSelect} style={{ position: 'relative' }}>
      <Card
        title={title}
        bordered={bordered}
        style={containerStyle}
        bodyStyle={bodyStyle}
      >
        <DropZone
          id={`${id}-dropzone`}
          components={children}
          parentId={id}
          placeholder="拖拽组件到容器中"
          minHeight={minHeight - (padding * 2)}
        />
      </Card>
    </div>
  );
};