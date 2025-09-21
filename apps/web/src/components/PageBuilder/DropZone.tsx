import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, Empty, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ComponentConfig } from './types';
import { DraggableComponent } from './DraggableComponent';
import { ComponentRenderer } from './ComponentRenderer';
import { usePageBuilder } from './DragContext';

const { Text } = Typography;

interface DropZoneProps {
  id: string;
  components: ComponentConfig[];
  accepts?: string[];
  placeholder?: string;
  minHeight?: number;
  parentId?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  components,
  accepts = ['component'],
  placeholder = '拖拽组件到这里',
  minHeight = 100,
  parentId,
  className = '',
  style = {}
}) => {
  const { state } = usePageBuilder();
  const { previewMode } = state;

  const {
    setNodeRef,
    isOver,
    active
  } = useDroppable({
    id,
    data: {
      type: 'dropzone',
      accepts,
      parentId
    },
    disabled: previewMode
  });

  const componentIds = components.map(comp => comp.id);

  // 预览模式下直接渲染组件
  if (previewMode) {
    return (
      <div className={className} style={style}>
        {components.map((component, index) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            index={index}
            parentId={parentId}
          />
        ))}
      </div>
    );
  }

  const isEmpty = components.length === 0;
  const isDragOver = isOver && active;
  const canDrop = active && accepts.includes(active.data.current?.type || '');

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${className} ${isDragOver ? 'drag-over' : ''} ${isEmpty ? 'empty' : ''}`}
      style={{
        minHeight,
        position: 'relative',
        transition: 'all 0.2s ease',
        border: isEmpty ? '2px dashed #d9d9d9' : 'none',
        borderRadius: 4,
        padding: isEmpty ? 16 : 0,
        backgroundColor: isDragOver && canDrop ? 'rgba(24, 144, 255, 0.05)' : 'transparent',
        ...style
      }}
    >
      {isEmpty ? (
        // 空状态
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#8c8c8c',
            textAlign: 'center'
          }}
        >
          <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <Text type="secondary">{placeholder}</Text>
          
          {isDragOver && canDrop && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '2px dashed #1890ff',
                borderRadius: 4,
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                放置组件到这里
              </div>
            </div>
          )}
        </div>
      ) : (
        // 有组件时使用可排序上下文
        <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
          <div style={{ position: 'relative' }}>
            {components.map((component, index) => (
              <DraggableComponent
                key={component.id}
                component={component}
                index={index}
                parentId={parentId}
              >
                <ComponentRenderer
                  component={component}
                  index={index}
                  parentId={parentId}
                />
              </DraggableComponent>
            ))}
            
            {/* 拖拽悬停指示器 */}
            {isDragOver && canDrop && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: -2,
                  right: -2,
                  bottom: 0,
                  border: '2px solid #1890ff',
                  borderRadius: 4,
                  backgroundColor: 'rgba(24, 144, 255, 0.05)',
                  pointerEvents: 'none',
                  zIndex: 1000
                }}
              />
            )}
          </div>
        </SortableContext>
      )}

      <style jsx>{`
        .drop-zone {
          transition: all 0.2s ease;
        }
        
        .drop-zone.empty:hover {
          border-color: #40a9ff;
          background-color: rgba(24, 144, 255, 0.02);
        }
        
        .drop-zone.drag-over {
          border-color: #1890ff;
        }
        
        .drop-zone.drag-over.empty {
          background-color: rgba(24, 144, 255, 0.05);
        }
      `}</style>
    </div>
  );
};