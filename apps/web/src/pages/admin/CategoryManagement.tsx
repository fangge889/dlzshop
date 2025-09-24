import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Tooltip,
  Badge,
  Tree
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Category } from '../../types/product';
import { categoryService } from '../../services/categoryService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  category: Category;
}

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  // 加载分类数据
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories(true);
      if (response.success && response.data) {
        setCategories(response.data);
        buildTreeData(response.data);
      }
    } catch (error) {
      message.error('加载分类失败');
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 构建树形数据
  const buildTreeData = (categories: Category[]) => {
    const categoryMap = new Map<number, Category>();
    categories.forEach(cat => categoryMap.set(cat.id, cat));

    const buildNode = (category: Category): TreeNode => ({
      key: category.id.toString(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>{category.name}</span>
            {category._count && (
              <Badge count={category._count.products} showZero color="blue" />
            )}
            {category.description && (
              <Tooltip title={category.description}>
                <Tag size="small">描述</Tag>
              </Tooltip>
            )}
          </div>
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(category)}
            />
            <Popconfirm
              title="确定要删除这个分类吗？"
              description={category._count?.products ? `该分类下有 ${category._count.products} 个商品` : undefined}
              onConfirm={() => handleDelete(category.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      category,
      children: category.children?.map(buildNode) || [],
    });

    const rootCategories = categories.filter(cat => !cat.parentId);
    setTreeData(rootCategories.map(buildNode));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 处理添加分类
  const handleAdd = (parentId?: number) => {
    setEditingCategory(null);
    form.resetFields();
    if (parentId) {
      form.setFieldValue('parentId', parentId);
    }
    setModalVisible(true);
  };

  // 处理编辑分类
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
    });
    setModalVisible(true);
  };

  // 处理删除分类
  const handleDelete = async (id: number) => {
    try {
      const response = await categoryService.deleteCategory(id);
      if (response.success) {
        message.success('删除成功');
        loadCategories();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        const response = await categoryService.updateCategory(editingCategory.id, values);
        if (response.success) {
          message.success('更新成功');
        } else {
          message.error(response.message || '更新失败');
        }
      } else {
        const response = await categoryService.createCategory(values);
        if (response.success) {
          message.success('创建成功');
        } else {
          message.error(response.message || '创建失败');
        }
      }
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      message.error(error.message || (editingCategory ? '更新失败' : '创建失败'));
    }
  };

  // 获取父分类选项
  const getParentOptions = () => {
    const buildOptions = (categories: Category[], level = 0): React.ReactNode[] => {
      return categories.reduce((acc: React.ReactNode[], category) => {
        if (editingCategory && category.id === editingCategory.id) {
          return acc; // 不能选择自己作为父分类
        }

        const prefix = '　'.repeat(level);
        acc.push(
          <Option key={category.id} value={category.id}>
            {prefix}{category.name}
          </Option>
        );

        if (category.children && category.children.length > 0) {
          acc.push(...buildOptions(category.children, level + 1));
        }

        return acc;
      }, []);
    };

    const rootCategories = categories.filter(cat => !cat.parentId);
    return buildOptions(rootCategories);
  };

  // 表格列定义
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.parentId && (
            <Tag size="small" color="blue">
              子分类
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'URL别名',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <code style={{ fontSize: 12, background: '#f5f5f5', padding: '2px 4px', borderRadius: 2 }}>
          {slug}
        </code>
      ),
    },
    {
      title: '父分类',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent: Category) => parent ? parent.name : '-',
    },
    {
      title: '商品数量',
      key: 'productCount',
      width: 100,
      render: (record: Category) => (
        <Badge count={record._count?.products || 0} showZero color="blue" />
      ),
    },
    {
      title: '子分类',
      key: 'childrenCount',
      width: 100,
      render: (record: Category) => (
        <Badge count={record._count?.children || 0} showZero color="green" />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: Category, b: Category) => a.sortOrder - b.sortOrder,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: Category) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(record.id)}
          >
            添加子分类
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            description={
              record._count?.products ? `该分类下有 ${record._count.products} 个商品` : 
              record._count?.children ? `该分类下有 ${record._count.children} 个子分类` : undefined
            }
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 头部工具栏 */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>商品分类管理</h2>
            </Col>
            <Col>
              <Space>
                <Button.Group>
                  <Button
                    type={viewMode === 'table' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setViewMode('table')}
                  >
                    表格视图
                  </Button>
                  <Button
                    type={viewMode === 'tree' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('tree')}
                  >
                    树形视图
                  </Button>
                </Button.Group>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadCategories}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAdd()}
                >
                  添加分类
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 内容区域 */}
        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={categories}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        ) : (
          <div style={{ minHeight: 400 }}>
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              showIcon
              icon={({ expanded }) => expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
              blockNode
            />
          </div>
        )}

        {/* 编辑/添加分类模态框 */}
        <Modal
          title={editingCategory ? '编辑分类' : '添加分类'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          okText="确定"
          cancelText="取消"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="分类名称"
                  rules={[{ required: true, message: '请输入分类名称' }]}
                >
                  <Input placeholder="请输入分类名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slug"
                  label="URL别名"
                  tooltip="用于生成友好的URL，如果不填写将自动生成"
                >
                  <Input placeholder="如：women-clothing" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="分类描述"
            >
              <TextArea
                rows={3}
                placeholder="请输入分类描述"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="parentId"
                  label="父分类"
                  tooltip="选择父分类可以创建多级分类结构"
                >
                  <Select
                    placeholder="选择父分类（可选）"
                    allowClear
                  >
                    {getParentOptions()}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  label="排序"
                  tooltip="数字越小排序越靠前"
                >
                  <InputNumber
                    min={0}
                    placeholder="排序值"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};