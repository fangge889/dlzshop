import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Slider, 
  ColorPicker, 
  InputNumber,
  Space,
  Typography,
  Divider,
  Button
} from 'antd';
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { usePageBuilder } from './DragContext';
import { ComponentConfig } from './types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const PropertyPanel: React.FC = () => {
  const { state, updateComponent, deleteComponent, selectComponent } = usePageBuilder();
  const { components, selectedComponent } = state;

  // 查找选中的组件
  const findComponent = (components: ComponentConfig[], id: string): ComponentConfig | null => {
    for (const component of components) {
      if (component.id === id) {
        return component;
      }
      if (component.children) {
        const found = findComponent(component.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponentData = selectedComponent 
    ? findComponent(components, selectedComponent) 
    : null;

  const handlePropertyChange = (key: string, value: any) => {
    if (selectedComponent) {
      updateComponent(selectedComponent, { [key]: value });
    }
  };

  const handleStyleChange = (styleKey: string, value: any) => {
    if (selectedComponent && selectedComponentData) {
      const currentStyle = selectedComponentData.props.style || {};
      updateComponent(selectedComponent, {
        style: { ...currentStyle, [styleKey]: value }
      });
    }
  };

  const handleDelete = () => {
    if (selectedComponent) {
      deleteComponent(selectedComponent);
      selectComponent(null);
    }
  };

  const handleCopy = () => {
    if (selectedComponentData) {
      // 复制组件逻辑
      console.log('复制组件:', selectedComponentData);
    }
  };

  if (!selectedComponentData) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Text type="secondary">请选择一个组件来编辑属性</Text>
      </div>
    );
  }

  // 渲染不同类型组件的属性编辑器
  const renderComponentProperties = () => {
    const { type, props } = selectedComponentData;

    switch (type) {
      case 'text':
        return (
          <>
            <Form.Item label="文本内容">
              <TextArea
                value={props.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={3}
              />
            </Form.Item>
            
            <Form.Item label="文本类型">
              <Select
                value={props.type || 'paragraph'}
                onChange={(value) => handlePropertyChange('type', value)}
              >
                <Option value="paragraph">段落</Option>
                <Option value="title">标题</Option>
                <Option value="text">文本</Option>
              </Select>
            </Form.Item>

            {props.type === 'title' && (
              <Form.Item label="标题级别">
                <Select
                  value={props.level || 1}
                  onChange={(value) => handlePropertyChange('level', value)}
                >
                  <Option value={1}>H1</Option>
                  <Option value={2}>H2</Option>
                  <Option value={3}>H3</Option>
                  <Option value={4}>H4</Option>
                  <Option value={5}>H5</Option>
                </Select>
              </Form.Item>
            )}
          </>
        );

      case 'image':
        return (
          <>
            <Form.Item label="图片地址">
              <Input
                value={props.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder="输入图片URL"
              />
            </Form.Item>
            
            <Form.Item label="替代文本">
              <Input
                value={props.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                placeholder="图片描述"
              />
            </Form.Item>

            <Form.Item label="宽度">
              <Input
                value={props.width || '100%'}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
                placeholder="如: 100%, 300px"
              />
            </Form.Item>

            <Form.Item label="高度">
              <Input
                value={props.height || 'auto'}
                onChange={(e) => handlePropertyChange('height', e.target.value)}
                placeholder="如: auto, 200px"
              />
            </Form.Item>

            <Form.Item label="适应方式">
              <Select
                value={props.fit || 'cover'}
                onChange={(value) => handlePropertyChange('fit', value)}
              >
                <Option value="contain">包含</Option>
                <Option value="cover">覆盖</Option>
                <Option value="fill">填充</Option>
                <Option value="none">原始</Option>
                <Option value="scale-down">缩小</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'button':
        return (
          <>
            <Form.Item label="按钮文本">
              <Input
                value={props.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="按钮类型">
              <Select
                value={props.type || 'default'}
                onChange={(value) => handlePropertyChange('type', value)}
              >
                <Option value="default">默认</Option>
                <Option value="primary">主要</Option>
                <Option value="dashed">虚线</Option>
                <Option value="text">文本</Option>
                <Option value="link">链接</Option>
              </Select>
            </Form.Item>

            <Form.Item label="按钮大小">
              <Select
                value={props.size || 'middle'}
                onChange={(value) => handlePropertyChange('size', value)}
              >
                <Option value="small">小</Option>
                <Option value="middle">中</Option>
                <Option value="large">大</Option>
              </Select>
            </Form.Item>

            <Form.Item label="链接地址">
              <Input
                value={props.href || ''}
                onChange={(e) => handlePropertyChange('href', e.target.value)}
                placeholder="输入链接URL"
              />
            </Form.Item>

            <Form.Item label="块级按钮">
              <Switch
                checked={props.block || false}
                onChange={(checked) => handlePropertyChange('block', checked)}
              />
            </Form.Item>
          </>
        );

      case 'container':
        return (
          <>
            <Form.Item label="容器标题">
              <Input
                value={props.title || ''}
                onChange={(e) => handlePropertyChange('title', e.target.value)}
                placeholder="容器标题（可选）"
              />
            </Form.Item>

            <Form.Item label="显示边框">
              <Switch
                checked={props.bordered !== false}
                onChange={(checked) => handlePropertyChange('bordered', checked)}
              />
            </Form.Item>

            <Form.Item label="显示阴影">
              <Switch
                checked={props.shadow || false}
                onChange={(checked) => handlePropertyChange('shadow', checked)}
              />
            </Form.Item>

            <Form.Item label="内边距">
              <Slider
                min={0}
                max={48}
                value={props.padding || 16}
                onChange={(value) => handlePropertyChange('padding', value)}
              />
            </Form.Item>

            <Form.Item label="最小高度">
              <InputNumber
                min={50}
                max={1000}
                value={props.minHeight || 100}
                onChange={(value) => handlePropertyChange('minHeight', value)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );

      default:
        return (
          <Text type="secondary">该组件暂无可编辑属性</Text>
        );
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 16 }}>
        {/* 组件信息 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Title level={5} style={{ margin: 0 }}>
              {selectedComponentData.name}
            </Title>
            <Space>
              <Button 
                size="small" 
                icon={<CopyOutlined />} 
                onClick={handleCopy}
                title="复制组件"
              />
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
                title="删除组件"
              />
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {selectedComponentData.id}
          </Text>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 组件属性 */}
        <Card title="组件属性" size="small" style={{ marginBottom: 16 }}>
          <Form layout="vertical" size="small">
            {renderComponentProperties()}
          </Form>
        </Card>

        {/* 样式属性 */}
        <Card title="样式设置" size="small">
          <Form layout="vertical" size="small">
            <Form.Item label="外边距">
              <InputNumber
                value={selectedComponentData.props.style?.margin || 0}
                onChange={(value) => handleStyleChange('margin', value)}
                style={{ width: '100%' }}
                placeholder="外边距"
              />
            </Form.Item>

            <Form.Item label="背景颜色">
              <ColorPicker
                value={selectedComponentData.props.style?.backgroundColor || 'transparent'}
                onChange={(color) => handleStyleChange('backgroundColor', color.toHexString())}
                showText
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="文字颜色">
              <ColorPicker
                value={selectedComponentData.props.style?.color || '#000000'}
                onChange={(color) => handleStyleChange('color', color.toHexString())}
                showText
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="字体大小">
              <InputNumber
                value={selectedComponentData.props.style?.fontSize || 14}
                onChange={(value) => handleStyleChange('fontSize', value)}
                style={{ width: '100%' }}
                min={12}
                max={48}
              />
            </Form.Item>

            <Form.Item label="文字对齐">
              <Select
                value={selectedComponentData.props.style?.textAlign || 'left'}
                onChange={(value) => handleStyleChange('textAlign', value)}
              >
                <Option value="left">左对齐</Option>
                <Option value="center">居中</Option>
                <Option value="right">右对齐</Option>
                <Option value="justify">两端对齐</Option>
              </Select>
            </Form.Item>

            <Form.Item label="圆角">
              <Slider
                min={0}
                max={20}
                value={selectedComponentData.props.style?.borderRadius || 0}
                onChange={(value) => handleStyleChange('borderRadius', value)}
              />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};