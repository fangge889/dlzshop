import React from 'react';
import { Divider } from 'antd';
import { ComponentProps } from '../types';

interface DividerComponentProps extends ComponentProps {
  props: {
    type?: 'horizontal' | 'vertical';
    orientation?: 'left' | 'right' | 'center';
    orientationMargin?: string | number;
    dashed?: boolean;
    plain?: boolean;
    style?: React.CSSProperties;
    children?: string;
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
    orientation = 'center',
    orientationMargin,
    dashed = false,
    plain = false,
    style = {},
    children
  } = componentProps;

  return (
    <div onClick={onSelect}>
      <Divider
        type={type}
        orientation={orientation}
        orientationMargin={orientationMargin}
        dashed={dashed}
        plain={plain}
        style={style}
      >
        {children}
      </Divider>
    </div>
  );
};