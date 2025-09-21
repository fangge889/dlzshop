import React, { useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, Button, Space, Tooltip } from 'antd';
import { 
  DragOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined 
} from '@ant-design/icons';
import { ComponentConfig } from './types';
import { usePageBuilder } from './DragContext';

interface DraggableComponentProps {
  component: ComponentConfig;
  children: React.ReactNode;
  index: number;
  parentId?: string;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  children,
  index,
  parentId
}) => {
  const { state, selectComponent, deleteComponent, updateComponent } = usePageBuilder();
  const { selectedComponent, previewMode } = state;
  
  const isSelected = selectedComponent === component.id;
  const dragRef = useRef<HTMLDivElement>(null);

  // 拖拽配置
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging
  } = useDraggable({
    id: component.id,
    data: {
      type: 'component',
      component,
      index,
      parentId
    },
    disabled: previewMode
  });

  // 放置配置
  const {
    setNodeRef: setDropRef,
    isOver
  } = useDroppable({
    id: `${component.id}-drop`,
    data: {
      type: 'component-drop',
      componentId: component.id,
      accepts: ['component']
    },
    disabled: previewMode
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 0.2s ease'
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewMode) {
      selectComponent(component.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(component.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 复制组件逻辑
    const newComponent: ComponentConfig = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      props: { ...component.props }
    };
    // 这里需要调用添加组件的方法
    console.log('复制组件:', newComponent);
  };

  // 预览模式下直接渲染内容
  if (previewMode) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
        if (dragRef.current) {
          dragRef.current = node;
        }
      }}
      style={style}
      onClick={handleSelect}
      className={`draggable-component ${isSelected ? 'selected' : ''} ${isOver ? 'drop-over' : ''}`}
    >
      <div
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #1890ff' : '1px dashed transparent',
          borderRadius: 4,
          minHeight: 40,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '1px dashed #d9d9d9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '1px dashed transparent';
          }
        }}
      >
        {/* 组件内容 */}
        {children}

        {/* 选中时的操作工具栏 */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: -32,
              left: 0,
              zIndex: 10,
              background: '#1890ff',
              borderRadius: '4px 4px 0 0',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: 'white', fontSize: 12, marginRight: 8 }}>
              {component.name}
            </span>
            
            <Space size={2}>
              <Tooltip title="拖拽">
                <Button
                  type="text"
                  size="small"
                  icon={<DragOutlined />}
                  style={{ color: 'white', padding: 2 }}
                  {...attributes}
                  {...listeners}
                />
              </Tooltip>
              
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  style={{ color: 'white', padding: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // 打开属性编辑面板
                  }}
                />
              </Tooltip>
              
              <Tooltip title="复制">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  style={{ color: 'white', padding: 2 }}
                  onClick={handleCopy}
                />
              </Tooltip>
              
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ color: 'white', padding: 2 }}
                  onClick={handleDelete}
                />
              </Tooltip>
            </Space>
          </div>
        )}

        {/* 拖拽放置指示器 */}
        {isOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(24, 144, 255, 0.1)',
              border: '2px dashed #1890ff',
              borderRadius: 4,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                background: '#1890ff',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              放置到这里
            </div>
          </div>
        )}
      </div>

      <style>{`
        .draggable-component {
          transition: all 0.2s ease;
        }
        
        .draggable-component:hover {
          z-index: 1;
        }
        
        .draggable-component.selected {
          z-index: 2;
        }
        
        .draggable-component.drop-over {
          z-index: 3;
        }
      `}</style>
    </div>
  );
};