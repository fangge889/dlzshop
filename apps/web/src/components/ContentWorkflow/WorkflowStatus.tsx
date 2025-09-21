import React from 'react';
import { Tag, Tooltip } from 'antd';
import { DEFAULT_CONTENT_STATUSES } from '../../types/content';

interface WorkflowStatusProps {
  status: string;
  showTooltip?: boolean;
  size?: 'small' | 'default';
}

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  status,
  showTooltip = true,
  size = 'default'
}) => {
  const statusConfig = DEFAULT_CONTENT_STATUSES.find(s => s.id === status);
  
  if (!statusConfig) {
    return (
      <Tag color="default" size={size}>
        未知状态
      </Tag>
    );
  }

  const tag = (
    <Tag color={statusConfig.color} size={size}>
      {statusConfig.name}
    </Tag>
  );

  if (showTooltip) {
    return (
      <Tooltip title={statusConfig.description}>
        {tag}
      </Tooltip>
    );
  }

  return tag;
};