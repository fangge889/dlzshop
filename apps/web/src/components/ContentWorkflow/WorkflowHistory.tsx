import React from 'react';
import { Timeline, Avatar, Typography, Tag, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EditOutlined,
  SendOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { WorkflowHistory } from '../../types/content';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

interface WorkflowHistoryProps {
  history: WorkflowHistory[];
  compact?: boolean;
}

export const WorkflowHistoryComponent: React.FC<WorkflowHistoryProps> = ({
  history,
  compact = false
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
      case 'publish':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'reject':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'submit':
        return <SendOutlined style={{ color: '#1890ff' }} />;
      case 'edit':
      case 'save':
        return <EditOutlined style={{ color: '#faad14' }} />;
      default:
        return <EditOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
      case 'publish':
        return 'success';
      case 'reject':
        return 'error';
      case 'submit':
        return 'processing';
      case 'edit':
      case 'save':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      'create': '创建内容',
      'save': '保存草稿',
      'submit': '提交审核',
      'approve': '通过审核',
      'reject': '拒绝',
      'publish': '发布内容',
      'unpublish': '取消发布',
      'archive': '归档内容',
      'edit': '编辑内容',
      'assign': '指派处理'
    };
    return actionMap[action] || action;
  };

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24, color: '#8c8c8c' }}>
        暂无操作历史
      </div>
    );
  }

  const timelineItems = history.map(item => ({
    dot: getActionIcon(item.action),
    children: (
      <div>
        <div style={{ marginBottom: 8 }}>
          <Space>
            <Avatar 
              size="small" 
              src={item.user.avatar} 
              icon={<UserOutlined />}
            />
            <Text strong>{item.user.name}</Text>
            <Tag color={getActionColor(item.action)}>
              {getActionText(item.action)}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(item.timestamp).fromNow()}
            </Text>
          </Space>
        </div>
        
        {item.comment && (
          <Paragraph 
            style={{ 
              margin: 0, 
              marginLeft: compact ? 0 : 32,
              fontSize: 13,
              color: '#666'
            }}
          >
            {item.comment}
          </Paragraph>
        )}
      </div>
    )
  }));

  return (
    <Timeline
      items={timelineItems}
      size={compact ? 'small' : 'default'}
      style={{ marginTop: 16 }}
    />
  );
};