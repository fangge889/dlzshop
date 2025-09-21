// 内容管理相关类型定义

export interface ContentStatus {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface ContentWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  isDefault: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: string;
  requiredRole: string[];
  actions: WorkflowAction[];
  nextSteps: string[];
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'approve' | 'reject' | 'publish' | 'archive' | 'edit';
  targetStatus: string;
  requiredPermission: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  type: 'page' | 'post' | 'custom';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  workflow: {
    id: string;
    currentStep: string;
    history: WorkflowHistory[];
  };
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    publishedAt?: string;
    scheduledAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
  tags: string[];
  categories: string[];
}

export interface WorkflowHistory {
  id: string;
  action: string;
  status: string;
  comment?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

export interface ContentFilter {
  status?: string[];
  type?: string[];
  author?: string[];
  assignee?: string[];
  tags?: string[];
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ContentStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
  archived: number;
}

// 默认内容状态
export const DEFAULT_CONTENT_STATUSES: ContentStatus[] = [
  {
    id: 'draft',
    name: '草稿',
    color: '#8c8c8c',
    description: '内容正在编辑中'
  },
  {
    id: 'pending',
    name: '待审核',
    color: '#faad14',
    description: '等待审核人员审核'
  },
  {
    id: 'approved',
    name: '已审核',
    color: '#52c41a',
    description: '内容已通过审核'
  },
  {
    id: 'published',
    name: '已发布',
    color: '#1890ff',
    description: '内容已公开发布'
  },
  {
    id: 'rejected',
    name: '已拒绝',
    color: '#ff4d4f',
    description: '内容被拒绝，需要修改'
  },
  {
    id: 'archived',
    name: '已归档',
    color: '#d9d9d9',
    description: '内容已归档'
  }
];

// 默认工作流
export const DEFAULT_WORKFLOW: ContentWorkflow = {
  id: 'default',
  name: '标准审核流程',
  isDefault: true,
  steps: [
    {
      id: 'draft',
      name: '草稿',
      status: 'draft',
      requiredRole: ['author', 'editor', 'admin'],
      actions: [
        {
          id: 'submit',
          name: '提交审核',
          type: 'approve',
          targetStatus: 'pending',
          requiredPermission: 'content.submit'
        },
        {
          id: 'save',
          name: '保存草稿',
          type: 'edit',
          targetStatus: 'draft',
          requiredPermission: 'content.edit'
        }
      ],
      nextSteps: ['pending']
    },
    {
      id: 'pending',
      name: '待审核',
      status: 'pending',
      requiredRole: ['editor', 'admin'],
      actions: [
        {
          id: 'approve',
          name: '通过审核',
          type: 'approve',
          targetStatus: 'approved',
          requiredPermission: 'content.approve'
        },
        {
          id: 'reject',
          name: '拒绝',
          type: 'reject',
          targetStatus: 'rejected',
          requiredPermission: 'content.approve'
        }
      ],
      nextSteps: ['approved', 'rejected']
    },
    {
      id: 'approved',
      name: '已审核',
      status: 'approved',
      requiredRole: ['editor', 'admin'],
      actions: [
        {
          id: 'publish',
          name: '发布',
          type: 'publish',
          targetStatus: 'published',
          requiredPermission: 'content.publish'
        },
        {
          id: 'reject',
          name: '退回修改',
          type: 'reject',
          targetStatus: 'draft',
          requiredPermission: 'content.approve'
        }
      ],
      nextSteps: ['published', 'draft']
    },
    {
      id: 'published',
      name: '已发布',
      status: 'published',
      requiredRole: ['admin'],
      actions: [
        {
          id: 'archive',
          name: '归档',
          type: 'archive',
          targetStatus: 'archived',
          requiredPermission: 'content.archive'
        },
        {
          id: 'unpublish',
          name: '取消发布',
          type: 'edit',
          targetStatus: 'draft',
          requiredPermission: 'content.publish'
        }
      ],
      nextSteps: ['archived', 'draft']
    }
  ]
};