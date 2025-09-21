import React from 'react';
import { Tree, Typography, Button, Space, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  DeleteOutlined,
  CopyOutlined,
  DragOutlined
} from '@ant-design/icons';
import { usePageBuilder } from './DragContext';
import { ComponentConfig } from './types';

const { Title, Text } = Typography;

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  icon?: React.ReactNode;
}

export const LayerPanel: React.FC = () => {
  const { state, selectComponent, deleteComponent, updateComponent } = usePageBuilder();
  const { components, selectedComponent } = state;

  // 将组件转换为树形结构
  const convertToTreeData = (components: ComponentConfig[]): TreeNode[] => {
    return components.map(component => ({
      key: component.id,
      title: (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '2px 0'
        }}>
          <Space size={4}>
            <span style={{ fontSize: 12 }}>{getComponentIcon(component.type)}</span>
            <Text style={{ fontSize: 12 }}>{component.name}</Text>
          </Space>
          
          <Space size={2}>
            <Tooltip title="显示/隐藏">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                style={{ fontSize: 10, padding: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // 切换组件可见性
                }}
              />
            </Tooltip>
            
            <Tooltip title="复制">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                style={{ fontSize: 10, padding: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // 复制组件
                }}
              />
            </Tooltip>
            
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ fontSize: 10, padding: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteComponent(component.id);
                }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
      icon: <DragOutlined style={{ fontSize: 12, color: '#999' }} />,
      children: component.children ? convertToTreeData(component.children) : undefined
    }));
  };

  // 获取组件图标
  const getComponentIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      text: '📝',
      image: '🖼️',
      button: '🔘',
      container: '📦',
      divider: '➖'
    };
    return iconMap[type] || '🔧';
  };

  // 处理节点选择
  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string;
    selectComponent(key || null);
  };

  // 处理节点展开
  const handleExpand = (expandedKeys: React.Key[]) => {
    // 可以在这里保存展开状态
  };

  const treeData = convertToTreeData(components);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 16 }}>
        <Title level={5} style={{ margin: '0 0 16px 0' }}>图层管理</Title>
        
        {treeData.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#999'
          }}>
            <Text type="secondary">暂无组件</Text>
          </div>
        ) : (
          <Tree
            treeData={treeData}
            selectedKeys={selectedComponent ? [selectedComponent] : []}
            onSelect={handleSelect}
            onExpand={handleExpand}
            showIcon
            blockNode
            style={{
              backgroundColor: 'transparent'
            }}
          />
        )}
      </div>

      <style>{`
        .ant-tree .ant-tree-node-content-wrapper {
          padding: 2px 4px;
          border-radius: 4px;
        }
        
        .ant-tree .ant-tree-node-content-wrapper:hover {
          background-color: #f5f5f5;
        }
        
        .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
          background-color: #e6f7ff;
        }
        
        .ant-tree .ant-tree-treenode {
          padding: 2px 0;
        }
        
        .ant-tree .ant-tree-switcher {
          width: 16px;
          height: 20px;
          line-height: 20px;
        }
        
        .ant-tree .ant-tree-node-content-wrapper .ant-tree-title {
          width: 100%;
        }
      `}</style>
    </div>
  );
};