import React, { useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Input, 
  Select,
  Popconfirm,
  message 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchPages } from '@/store/slices/contentSlice';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const PagesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pages, loading, pagination } = useAppSelector(state => state.content);

  useEffect(() => {
    dispatch(fetchPages({}));
  }, [dispatch]);

  const handleDelete = (id: number) => {
    message.success('页面删除成功');
    // 这里应该调用删除 API
  };

  const handleStatusChange = (id: number, status: string) => {
    message.success(`页面状态已更新为${status}`);
    // 这里应该调用状态更新 API
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Link to={`/admin/pages/${record.id}/edit`}>
          {text}
        </Link>
      ),
    },
    {
      title: '路径',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => <code>/{text}</code>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          PUBLISHED: { color: 'green', text: '已发布' },
          DRAFT: { color: 'orange', text: '草稿' },
          ARCHIVED: { color: 'red', text: '已归档' },
          SCHEDULED: { color: 'blue', text: '定时发布' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      key: 'author',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/${record.slug}`, '_blank')}
          >
            预览
          </Button>
          <Link to={`/admin/pages/${record.id}/edit`}>
            <Button type="text" icon={<EditOutlined />}>
              编辑
            </Button>
          </Link>
          <Popconfirm
            title="确定要删除这个页面吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>页面管理 - DLZ Shop CMS</title>
      </Helmet>

      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            页面管理
          </Title>
          <Link to="/admin/pages/new">
            <Button type="primary" icon={<PlusOutlined />}>
              创建页面
            </Button>
          </Link>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Search
            placeholder="搜索页面标题或内容"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => {
              dispatch(fetchPages({ search: value }));
            }}
          />
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              dispatch(fetchPages({ status: value }));
            }}
          >
            <Option value="PUBLISHED">已发布</Option>
            <Option value="DRAFT">草稿</Option>
            <Option value="ARCHIVED">已归档</Option>
            <Option value="SCHEDULED">定时发布</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={pages}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, pageSize) => {
              dispatch(fetchPages({ page, limit: pageSize }));
            },
          }}
        />
      </div>
    </>
  );
};

export default PagesListPage;