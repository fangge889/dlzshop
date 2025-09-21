import React from 'react';
import { PageBuilder } from '../components/PageBuilder';
import { ComponentConfig } from '../components/PageBuilder/types';

const TestPageBuilder: React.FC = () => {
  // 初始组件数据
  const initialComponents: ComponentConfig[] = [
    {
      id: 'text-1',
      type: 'text',
      name: '标题文本',
      icon: '📝',
      category: 'basic',
      props: {
        content: '欢迎使用页面构建器',
        type: 'title',
        level: 1,
        style: {
          textAlign: 'center',
          color: '#1890ff'
        }
      },
      children: []
    },
    {
      id: 'text-2',
      type: 'text',
      name: '段落文本',
      icon: '📝',
      category: 'basic',
      props: {
        content: '这是一个功能强大的可视化页面构建器，支持拖拽操作、实时预览和属性编辑。',
        type: 'paragraph',
        style: {
          textAlign: 'center',
          fontSize: 16,
          color: '#666'
        }
      },
      children: []
    }
  ];

  const handleSave = (components: ComponentConfig[]) => {
    console.log('保存页面:', components);
    // 这里可以调用API保存页面数据
  };

  const handlePreview = (components: ComponentConfig[]) => {
    console.log('预览页面:', components);
    // 这里可以打开预览窗口
  };

  return (
    <div style={{ height: '100vh' }}>
      <PageBuilder
        initialComponents={initialComponents}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
};

export default TestPageBuilder;