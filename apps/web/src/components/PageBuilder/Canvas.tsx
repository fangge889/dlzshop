import React from 'react';
import { Card, Empty, Button, Space, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, MobileOutlined, TabletOutlined, DesktopOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { DropZone } from './DropZone';
import { DragLayer } from './DragLayer';
import { usePageBuilder } from './DragContext';
import { ComponentConfig } from './types';

const { Title, Text } = Typography;

interface CanvasProps {
  style?: React.CSSProperties;
}

export const Canvas: React.FC<CanvasProps> = ({ style = {} }) => {
  const { 
    state, 
    addComponent, 
    moveComponent, 
    setDraggedComponent,
    setPreviewMode,
    setDeviceMode
  } = usePageBuilder();
  
  const { components, previewMode, deviceMode } = state;

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current;
    
    if (dragData?.isNew) {
      setDraggedComponent({
        id: dragData.component.id,
        type: dragData.component.type,
        name: dragData.component.name,
        icon: dragData.component.icon,
        category: dragData.component.category,
        isNew: true
      });
    }
  };

  // 拖拽悬停
  const handleDragOver = (event: DragOverEvent) => {
    // 可以在这里处理拖拽悬停逻辑
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDraggedComponent(null);
      return;
    }

    const dragData = active.data.current;
    const dropData = over.data.current;

    // 从组件库拖拽新组件到画布
    if (dragData?.isNew && dropData?.type === 'dropzone') {
      const newComponent: ComponentConfig = {
        id: `${dragData.component.type}-${Date.now()}`,
        type: dragData.component.type,
        name: dragData.component.name,
        props: { ...dragData.component.props },
        children: []
      };

      addComponent(newComponent, dropData.parentId);
    }
    
    // 移动现有组件
    else if (dragData?.type === 'component' && dropData?.type === 'component-drop') {
      // 处理组件移动逻辑
      console.log('移动组件:', dragData, dropData);
    }

    setDraggedComponent(null);
  };

  // 设备模式样式
  const getCanvasStyle = () => {
    const baseStyle: React.CSSProperties = {
      margin: '0 auto',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      minHeight: 600,
      ...style
    };

    switch (deviceMode) {
      case 'mobile':
        return { ...baseStyle, width: 375, maxWidth: 375 };
      case 'tablet':
        return { ...baseStyle, width: 768, maxWidth: 768 };
      case 'desktop':
      default:
        return { ...baseStyle, width: '100%', maxWidth: '100%' };
    }
  };

  return (
    <div className="canvas-container" style={{ height: '100%', overflow: 'auto' }}>
      {/* 工具栏 */}
      {!previewMode && (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={5} style={{ margin: 0 }}>页面画布</Title>
          
          <Space>
            {/* 设备切换 */}
            <Button.Group>
              <Button
                size="small"
                type={deviceMode === 'desktop' ? 'primary' : 'default'}
                icon={<DesktopOutlined />}
                onClick={() => setDeviceMode('desktop')}
              />
              <Button
                size="small"
                type={deviceMode === 'tablet' ? 'primary' : 'default'}
                icon={<TabletOutlined />}
                onClick={() => setDeviceMode('tablet')}
              />
              <Button
                size="small"
                type={deviceMode === 'mobile' ? 'primary' : 'default'}
                icon={<MobileOutlined />}
                onClick={() => setDeviceMode('mobile')}
              />
            </Button.Group>

            {/* 预览模式 */}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreviewMode(!previewMode)}
              type={previewMode ? 'primary' : 'default'}
            >
              {previewMode ? '退出预览' : '预览'}
            </Button>
          </Space>
        </div>
      )}

      {/* 画布区域 */}
      <div style={{ 
        padding: 24, 
        backgroundColor: '#f5f5f5',
        minHeight: previewMode ? '100vh' : 'calc(100vh - 120px)'
      }}>
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <DragLayer>
            <Card
              style={getCanvasStyle()}
              bodyStyle={{ padding: 0 }}
              bordered={!previewMode}
            >
              {components.length === 0 ? (
                // 空状态
                <div style={{ 
                  padding: 60, 
                  textAlign: 'center',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                          页面还没有任何内容
                        </Text>
                        <br />
                        <Text type="secondary">
                          从左侧组件库拖拽组件到这里开始构建页面
                        </Text>
                      </div>
                    }
                  />
                </div>
              ) : (
                // 组件渲染区域
                <DropZone
                  id="main-canvas"
                  components={components}
                  placeholder="拖拽组件到这里"
                  minHeight={400}
                  style={{ padding: 16 }}
                />
              )}
            </Card>
          </DragLayer>
        </DndContext>
      </div>

      <style>{`
        .canvas-container {
          position: relative;
        }
        
        .canvas-container .ant-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .canvas-container {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};