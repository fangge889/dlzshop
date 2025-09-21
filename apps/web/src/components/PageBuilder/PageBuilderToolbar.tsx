import React from 'react';
import { Space, Button, Divider, Select, Typography } from 'antd';
import { 
  SaveOutlined, 
  EyeOutlined, 
  UndoOutlined, 
  RedoOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { usePageBuilder } from './DragContext';
import { ComponentConfig } from './types';

const { Text } = Typography;

interface PageBuilderToolbarProps {
  onSave?: (components: ComponentConfig[]) => void;
  onPreview?: (components: ComponentConfig[]) => void;
  onSettings?: () => void;
}

export const PageBuilderToolbar: React.FC<PageBuilderToolbarProps> = ({
  onSave,
  onPreview,
  onSettings
}) => {
  const { state, setPreviewMode, setDeviceMode } = usePageBuilder();
  const { components, previewMode, deviceMode } = state;

  const handleSave = () => {
    onSave?.(components);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    onPreview?.(components);
  };

  return (
    <div
      style={{
        height: 56,
        padding: '0 16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* 左侧操作 */}
      <Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
        >
          保存
        </Button>
        
        <Button
          icon={<EyeOutlined />}
          onClick={handlePreview}
          type={previewMode ? 'primary' : 'default'}
        >
          {previewMode ? '退出预览' : '预览'}
        </Button>

        <Divider type="vertical" />

        <Button icon={<UndoOutlined />} disabled>
          撤销
        </Button>
        
        <Button icon={<RedoOutlined />} disabled>
          重做
        </Button>
      </Space>

      {/* 中间标题 */}
      <div style={{ textAlign: 'center' }}>
        <Text strong style={{ fontSize: 16 }}>
          页面构建器
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          组件数量: {components.length}
        </Text>
      </div>

      {/* 右侧设备切换和设置 */}
      <Space>
        <Text type="secondary">设备预览:</Text>
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

        <Divider type="vertical" />

        <Button
          icon={<SettingOutlined />}
          onClick={onSettings}
        >
          设置
        </Button>
      </Space>
    </div>
  );
};