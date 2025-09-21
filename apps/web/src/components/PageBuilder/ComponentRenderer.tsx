import React from 'react';
import { ComponentConfig } from './types';
import { usePageBuilder } from './DragContext';

// 基础组件渲染器
import { TextComponent } from './components/TextComponent';
import { ImageComponent } from './components/ImageComponent';
import { ButtonComponent } from './components/ButtonComponent';
import { ContainerComponent } from './components/ContainerComponent';
import { DividerComponent } from './components/DividerComponent';

interface ComponentRendererProps {
  component: ComponentConfig;
  index: number;
  parentId?: string;
}

// 组件映射表
const componentMap: Record<string, React.ComponentType<any>> = {
  text: TextComponent,
  image: ImageComponent,
  button: ButtonComponent,
  container: ContainerComponent,
  divider: DividerComponent,
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  index,
  parentId
}) => {
  const { state, selectComponent, updateComponent, deleteComponent } = usePageBuilder();
  const { selectedComponent, previewMode } = state;

  const Component = componentMap[component.type];
  
  if (!Component) {
    console.warn(`Unknown component type: ${component.type}`);
    return (
      <div style={{ 
        padding: 16, 
        border: '1px dashed #ff4d4f', 
        borderRadius: 4,
        color: '#ff4d4f',
        textAlign: 'center'
      }}>
        未知组件类型: {component.type}
      </div>
    );
  }

  const isSelected = selectedComponent === component.id;

  const componentProps = {
    id: component.id,
    type: component.type,
    props: component.props,
    children: component.children,
    isSelected,
    previewMode,
    onSelect: () => !previewMode && selectComponent(component.id),
    onUpdate: (props: Record<string, any>) => updateComponent(component.id, props),
    onDelete: () => deleteComponent(component.id),
    parentId,
    index
  };

  return <Component {...componentProps} />;
};