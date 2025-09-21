import React from 'react';
import { Divider } from 'antd';
import { ComponentProps } from '../types';

interface DividerComponentProps extends ComponentProps {
  props: {
    type?: 'horizontal' | 'vertical';
    dashed?: boolean;
    plain?: boolean;
    orientation?: 'left' | 'right' | 'center';
    orientationMargin?: string | number;
    style?: React.CSSProperties;
  };
}

export const DividerComponent: React.FC<DividerComponentProps> = ({
  id,
  props: componentProps,
  isSelected,
  previewMode,
  onUpdate,
  onSelect
}) => {
  const {
    type = 'horizontal',
    dashed = false,
    plain = false,
    orientation = 'center',
    orientationMargin,
    style = {}
  } = componentProps;

  return (
    <div onClick={onSelect} style={{ position: 'relative' }}>
      <Divider
        type={type}
        dashed={dashed}
        plain={plain}
        orientation={orientation}
        orientationMargin={orientationMargin}
        style={{
          margin: '16px 0',
          ...style
        }}
      />
    </div>
  );
};