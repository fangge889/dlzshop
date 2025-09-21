import React from 'react';
import { Layout, Row, Col } from 'antd';
import { PageBuilderProvider } from './DragContext';
import { ComponentLibrary } from './ComponentLibrary';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { ComponentConfig } from './types';

const { Sider, Content } = Layout;

interface PageBuilderProps {
  initialComponents?: ComponentConfig[];
  onSave?: (components: ComponentConfig[]) => void;
  onPreview?: (components: ComponentConfig[]) => void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  initialComponents = [],
  onSave,
  onPreview
}) => {
  return (
    <PageBuilderProvider initialComponents={initialComponents}>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* 左侧组件库 */}
        <Sider
          width={280}
          style={{
            backgroundColor: 'white',
            borderRight: '1px solid #f0f0f0',
            overflow: 'hidden'
          }}
        >
          <ComponentLibrary />
        </Sider>

        {/* 中间画布区域 */}
        <Content style={{ overflow: 'hidden' }}>
          <Canvas />
        </Content>

        {/* 右侧属性面板 */}
        <Sider
          width={320}
          style={{
            backgroundColor: 'white',
            borderLeft: '1px solid #f0f0f0',
            overflow: 'hidden'
          }}
        >
          <PropertyPanel />
        </Sider>
      </Layout>
    </PageBuilderProvider>
  );
};

export default PageBuilder;