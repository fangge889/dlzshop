import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Tooltip,
  Image,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Product, ProductListParams, Category } from '../../types/product';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ProductListParams>({
    status: 'all',
    category: undefined,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
  });

  // 加载商品列表
  const loadProducts = async (params?: ProductListParams) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...params,
      };

      const response = await productService.getProducts(queryParams);
      
      if (response.success) {
        setProducts(response.data.products);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          current: response.data.pagination.page,
        }));

        // 计算统计数据
        const total = response.data.pagination.total;
        const activeCount = response.data.products.filter(p => p.status === 'ACTIVE').length;
        const draftCount = response.data.products.filter(p => p.status === 'DRAFT').length;
        const archivedCount = response.data.products.filter(p => p.status === 'ARCHIVED').length;
        
        setStats({
          total,
          active: activeCount,
          draft: draftCount,
          archived: archivedCount,
        });
      }
    } catch (error) {
      message.error('加载商品列表失败');
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    loadProducts({ search: value, page: 1 });
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadProducts({ ...newFilters, page: 1 });
  };

  // 处理表格变化
  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    const newPagination = {
      ...pagination,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };
    setPagination(newPagination);

    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    
    if (sorter.field) {
      sortBy = sorter.field;
      sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    loadProducts({
      page: newPagination.current,
      limit: newPagination.pageSize,
      sortBy,
      sortOrder,
    });
  };

  // 删除商品
  const handleDelete = async (id: number) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        message.success('商品删除成功');
        loadProducts();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除商品失败');
      console.error('Delete product error:', error);
    }
  };

  // 批量操作
  const handleBatchOperation = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的商品');
      return;
    }

    try {
      const productIds = selectedRowKeys.map(key => Number(key));
      const response = await productService.batchOperation(action, productIds);
      
      if (response.success) {
        message.success(`批量${action}操作成功`);
        setSelectedRowKeys([]);
        loadProducts();
      } else {
        message.error(response.message || '批量操作失败');
      }
    } catch (error) {
      message.error('批量操作失败');
      console.error('Batch operation error:', error);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'success', text: '已发布' },
      DRAFT: { color: 'default', text: '草稿' },
      ARCHIVED: { color: 'warning', text: '已归档' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      key: 'product',
      width: 300,
      render: (record: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            {record.images.length > 0 ? (
              <Image
                src={record.images.find(img => img.isMain)?.url || record.images[0].url}
                alt={record.name}
                width={60}
                height={60}
                style={{ objectFit: 'cover', borderRadius: 6 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InboxOutlined style={{ fontSize: 24, color: '#ccc' }} />
              </div>
            )}
            {record.isFeatured && (
              <Badge
                count={<StarOutlined style={{ color: '#faad14' }} />}
                style={{ position: 'absolute', top: -5, right: -5 }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
              SKU: {record.sku || '未设置'}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              分类: {record.categories.map(c => c.category.name).join(', ') || '未分类'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      sorter: true,
      render: (record: Product) => (
        <div>
          <div style={{ fontWeight: 500, color: '#f50' }}>
            ¥{record.price.toFixed(2)}
          </div>
          {record.comparePrice && (
            <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
              ¥{record.comparePrice.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      sorter: true,
      render: (quantity: number, record: Product) => (
        <div>
          <div style={{ 
            color: quantity <= record.lowStockThreshold ? '#f50' : '#52c41a',
            fontWeight: 500 
          }}>
            {quantity}
          </div>
          {quantity <= record.lowStockThreshold && (
            <div style={{ fontSize: 12, color: '#f50' }}>
              库存不足
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Product) => (
        <div>
          {getStatusTag(status)}
          {!record.isVisible && (
            <div style={{ fontSize: 12, color: '#999' }}>
              已隐藏
            </div>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: Product) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/products/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个商品吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总商品数"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.active}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已归档"
              value={stats.archived}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        {/* 工具栏 */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/products/new')}
                >
                  添加商品
                </Button>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Button onClick={() => handleBatchOperation('activate')}>
                      批量发布
                    </Button>
                    <Button onClick={() => handleBatchOperation('deactivate')}>
                      批量下架
                    </Button>
                    <Popconfirm
                      title="确定要删除选中的商品吗？"
                      onConfirm={() => handleBatchOperation('delete')}
                    >
                      <Button danger>批量删除</Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                <Search
                  placeholder="搜索商品名称、SKU..."
                  allowClear
                  style={{ width: 250 }}
                  onSearch={handleSearch}
                />
                <Select
                  value={filters.status}
                  style={{ width: 120 }}
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="ACTIVE">已发布</Option>
                  <Option value="DRAFT">草稿</Option>
                  <Option value="ARCHIVED">已归档</Option>
                </Select>
                <Select
                  value={filters.category}
                  style={{ width: 150 }}
                  placeholder="选择分类"
                  allowClear
                  onChange={(value) => handleFilterChange('category', value)}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadProducts()}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};