import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { useDraggable } from '@dnd-kit/core';
import { ComponentLibraryItem } from './types';
import { usePageBuilder } from './DragContext';

const { Title, Text } = Typography;

// 组件库数据
const componentLibrary: ComponentLibraryItem[] = [
  // 基础组件
  {
    type: 'text',
    name: '文本',
    icon: '📝',
    category: 'basic',
    defaultProps: {
      content: '这是一段文本',
      type: 'paragraph',
      style: {}
    },
    preview: '文本组件'
  },
  {
    type: 'image',
    name: '图片',
    icon: '🖼️',
    category: 'basic',
    defaultProps: {
      src: '',
      alt: '图片',
      width: '100%',
      height: 'auto',
      style: {}
    },
    preview: '图片组件'
  },
  {
    type: 'button',
    name: '按钮',
    icon: '🔘',
    category: 'basic',
    defaultProps: {
      text: '按钮',
      type: 'default',
      size: 'middle',
      style: {}
    },
    preview: '按钮组件'
  },
  {
    type: 'divider',
    name: '分割线',
    icon: '➖',
    category: 'basic',
    defaultProps: {
      type: 'horizontal',
      dashed: false,
      style: {}
    },
    preview: '分割线组件'
  },
  // 布局组件
  {
    type: 'container',
    name: '容器',
    icon: '📦',
    category: 'layout',
    defaultProps: {
      title: '',
      bordered: true,
      padding: 16,
      style: {},
      minHeight: 100
    },
    preview: '容器组件'
  }
];

// 可拖拽的组件项
interface DraggableLibraryItemProps {
  item: ComponentLibraryItem;
}

const DraggableLibraryItem: React.FC<DraggableLibraryItemProps> = ({ item }) => {
  const { setDraggedComponent } = usePageBuilder();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `library-${item.type}`,
    data: {
      type: 'component',
      component: {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        icon: item.icon,
        category: item.category,
        props: item.defaultProps,
        children: []
      },
      isNew: true
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1
  } : undefined;

  const handleDragStart = () => {
    setDraggedComponent({
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      name: item.name,
      icon: item.icon,
      category: item.category,
      isNew: true
    });
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Tooltip title={item.preview} placement="right">
        <Card
          size="small"
          hoverable
          style={{
            cursor: 'grab',
            marginBottom: 8,
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s ease'
          }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <Text style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</Text>
          </div>
        </Card>
      </Tooltip>
    </div>
  );
};

// 组件库面板
export const ComponentLibrary: React.FC = () => {
  const basicComponents = componentLibrary.filter(item => item.category === 'basic');
  const layoutComponents = componentLibrary.filter(item => item.category === 'layout');
  const advancedComponents = componentLibrary.filter(item => item.category === 'advanced');

  return (
    <div className="component-library" style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 16 }}>
        <Title level={4} style={{ margin: '0 0 16px 0' }}>组件库</Title>
        
        {/* 基础组件 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: '#666' }}>
            基础组件
          </Text>
          {basicComponents.map(item => (
            <DraggableLibraryItem key={item.type} item={item} />
          ))}
        </div>

        {/* 布局组件 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: '#666' }}>
            布局组件
          </Text>
          {layoutComponents.map(item => (
            <DraggableLibraryItem key={item.type} item={item} />
          ))}
        </div>

        {/* 高级组件 */}
        {advancedComponents.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 12, color: '#666' }}>
              高级组件
            </Text>
            {advancedComponents.map(item => (
              <DraggableLibraryItem key={item.type} item={item} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .component-library .ant-card:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
        }
        
        .component-library .ant-card:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};