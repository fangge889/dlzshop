import React from 'react';
import { useDragLayer } from '@dnd-kit/core';
import { Card, Typography } from 'antd';
import { usePageBuilder } from './DragContext';

const { Text } = Typography;

interface DragLayerProps {
  children?: React.ReactNode;
}

export const DragLayer: React.FC<DragLayerProps> = ({ children }) => {
  const { state } = usePageBuilder();
  const { draggedComponent } = state;

  if (!draggedComponent) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 1000,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <div
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            opacity: 0.8
          }}
        >
          <Card
            size="small"
            style={{
              minWidth: 120,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{draggedComponent.icon}</span>
              <Text strong>{draggedComponent.name}</Text>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};