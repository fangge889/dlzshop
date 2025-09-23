import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Image,
  Button,
  Space,
  Divider,
  Table,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Badge
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  StarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import dayjs from 'dayjs';

export const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // 加载商品数据
  const loadProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await productService.getProduct(parseInt(id));
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        message.error('商品不存在');
        navigate('/admin/products');
      }
    } catch (error) {
      message.error('加载商品信息失败');
      console.error('Load product error:', error);
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

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

  // 规格表格列
  const variantColumns = [
    {
      title: '规格名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price ? `¥${price.toFixed(2)}` : '-',
    },
    {
      title: '对比价格',
      dataIndex: 'comparePrice',
      key: 'comparePrice',
      render: (price: number) => price ? `¥${price.toFixed(2)}` : '-',
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <span style={{ color: quantity > 0 ? '#52c41a' : '#f50' }}>
          {quantity}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载商品信息中...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 头部操作栏 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/products')}
              >
                返回列表
              </Button>
              <div>
                <h2 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {product.name}
                  {product.isFeatured && <StarOutlined style={{ color: '#faad14' }} />}
                </h2>
                <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
                  SKU: {product.sku || '未设置'} | 创建时间: {dayjs(product.createdAt).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EyeOutlined />}>
                预览
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              >
                编辑
              </Button>
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={24}>
        {/* 左侧主要信息 */}
        <Col span={16}>
          {/* 基本信息 */}
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="商品名称" span={2}>
                {product.name}
              </Descriptions.Item>
              <Descriptions.Item label="URL别名" span={2}>
                {product.slug}
              </Descriptions.Item>
              <Descriptions.Item label="简短描述" span={2}>
                {product.shortDesc || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="销售价格">
                <span style={{ color: '#f50', fontWeight: 500, fontSize: 16 }}>
                  ¥{product.price.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="对比价格">
                {product.comparePrice ? (
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>
                    ¥{product.comparePrice.toFixed(2)}
                  </span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="成本价格">
                {product.costPrice ? `¥${product.costPrice.toFixed(2)}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="SKU">
                {product.sku || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="条形码">
                {product.barcode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="库存数量">
                <span style={{ 
                  color: product.quantity <= product.lowStockThreshold ? '#f50' : '#52c41a',
                  fontWeight: 500 
                }}>
                  {product.quantity}
                  {product.quantity <= product.lowStockThreshold && ' (库存不足)'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 商品描述 */}
          {product.description && (
            <Card title="商品描述" style={{ marginBottom: 24 }}>
              <div 
                dangerouslySetInnerHTML={{ __html: product.description }}
                style={{ lineHeight: 1.6 }}
              />
            </Card>
          )}

          {/* 商品规格 */}
          {product.variants && product.variants.length > 0 && (
            <Card title="商品规格" style={{ marginBottom: 24 }}>
              <Table
                columns={variantColumns}
                dataSource={product.variants}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </Col>

        {/* 右侧信息 */}
        <Col span={8}>
          {/* 状态信息 */}
          <Card title="状态信息" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span style={{ marginRight: 8 }}>发布状态:</span>
                {getStatusTag(product.status)}
              </div>
              <div>
                <span style={{ marginRight: 8 }}>前台显示:</span>
                <Tag color={product.isVisible ? 'success' : 'default'}>
                  {product.isVisible ? '显示' : '隐藏'}
                </Tag>
              </div>
              <div>
                <span style={{ marginRight: 8 }}>推荐商品:</span>
                <Tag color={product.isFeatured ? 'gold' : 'default'}>
                  {product.isFeatured ? '是' : '否'}
                </Tag>
              </div>
              <div>
                <span style={{ marginRight: 8 }}>跟踪库存:</span>
                <Tag color={product.trackQuantity ? 'success' : 'default'}>
                  {product.trackQuantity ? '是' : '否'}
                </Tag>
              </div>
            </Space>
          </Card>

          {/* 分类信息 */}
          <Card title="分类信息" style={{ marginBottom: 24 }}>
            {product.categories.length > 0 ? (
              <Space wrap>
                {product.categories.map(pc => (
                  <Tag key={pc.categoryId} color="blue">
                    {pc.category.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: '#999' }}>未分类</span>
            )}
          </Card>

          {/* 商品属性 */}
          <Card title="商品属性" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="品牌">
                {product.brand || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="材质">
                {product.material || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="重量">
                {product.weight ? `${product.weight}kg` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="尺寸">
                {product.dimensions || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* SEO信息 */}
          {(product.metaTitle || product.metaDescription) && (
            <Card title="SEO信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="SEO标题">
                  {product.metaTitle || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="SEO描述">
                  {product.metaDescription || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* 统计信息 */}
          <Card title="统计信息">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="图片数量"
                  value={product.images.length}
                  prefix={<EyeOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="规格数量"
                  value={product.variants.length}
                  prefix={<ShoppingOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 商品图片 */}
      {product.images && product.images.length > 0 && (
        <Card title="商品图片" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {product.images.map(image => (
              <div key={image.id} style={{ position: 'relative' }}>
                <Image
                  width={150}
                  height={150}
                  src={image.url}
                  alt={image.altText}
                  style={{ objectFit: 'cover', borderRadius: 6 }}
                />
                {image.isMain && (
                  <Badge
                    count="主图"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#faad14'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};