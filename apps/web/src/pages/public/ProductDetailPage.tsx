import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Tag,
  Divider,
  InputNumber,
  Radio,
  Breadcrumb,
  Image,
  Carousel,
  Tabs,
  Rate,
  message,
  Spin,
  Badge,
  Tooltip,
  Affix
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  StarFilled,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Product, ProductVariant } from '../../types/product';
import { productService } from '../../services/productService';
import './ProductDetailPage.css';

const { TabPane } = Tabs;

export const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // 加载商品数据
  const loadProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await productService.getProduct(parseInt(id));
      if (response.success && response.data) {
        setProduct(response.data);
        // 如果有规格，默认选择第一个
        if (response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } else {
        message.error('商品不存在');
        navigate('/products');
      }
    } catch (error) {
      message.error('加载商品信息失败');
      console.error('Load product error:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // 处理规格选择
  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1); // 重置数量
  };

  // 处理加入购物车
  const handleAddToCart = () => {
    if (!product) return;
    
    // 检查库存
    const availableQuantity = selectedVariant ? selectedVariant.quantity : product.quantity;
    if (availableQuantity < quantity) {
      message.error('库存不足');
      return;
    }

    // 这里应该调用购物车API
    message.success('已加入购物车');
  };

  // 处理立即购买
  const handleBuyNow = () => {
    if (!product) return;
    
    // 检查库存
    const availableQuantity = selectedVariant ? selectedVariant.quantity : product.quantity;
    if (availableQuantity < quantity) {
      message.error('库存不足');
      return;
    }

    // 这里应该跳转到结算页面
    message.info('跳转到结算页面');
  };

  // 处理收藏
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? '已取消收藏' : '已收藏');
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.shortDesc,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    }
  };

  // 获取当前价格
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  // 获取对比价格
  const getComparePrice = () => {
    if (selectedVariant && selectedVariant.comparePrice) {
      return selectedVariant.comparePrice;
    }
    return product?.comparePrice;
  };

  // 获取当前库存
  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.quantity;
    }
    return product?.quantity || 0;
  };

  // 获取当前SKU
  const getCurrentSku = () => {
    if (selectedVariant && selectedVariant.sku) {
      return selectedVariant.sku;
    }
    return product?.sku;
  };

  // 计算折扣百分比
  const getDiscountPercent = () => {
    const currentPrice = getCurrentPrice();
    const comparePrice = getComparePrice();
    if (comparePrice && comparePrice > currentPrice) {
      return Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
    }
    return 0;
  };

  // 自定义轮播箭头
  const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick?: () => void }) => (
    <div
      className={`custom-arrow ${direction}`}
      onClick={onClick}
    >
      {direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载商品信息中...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountPercent = getDiscountPercent();
  const currentStock = getCurrentStock();
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="product-detail-page">
      {/* 面包屑导航 */}
      <div className="breadcrumb-container">
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href="/">首页</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/products">商品</a>
          </Breadcrumb.Item>
          {product.categories.length > 0 && (
            <Breadcrumb.Item>
              <a href={`/products?category=${product.categories[0].categoryId}`}>
                {product.categories[0].category.name}
              </a>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Row gutter={[32, 32]}>
        {/* 左侧图片区域 */}
        <Col xs={24} md={12} lg={10}>
          <div className="product-images">
            {/* 主图轮播 */}
            <div className="main-image-container">
              {product.images.length > 0 ? (
                <Carousel
                  dots={false}
                  arrows
                  prevArrow={<CustomArrow direction="left" />}
                  nextArrow={<CustomArrow direction="right" />}
                  beforeChange={(current, next) => setSelectedImage(next)}
                >
                  {product.images.map((image, index) => (
                    <div key={image.id} className="carousel-item">
                      <Image
                        src={image.url}
                        alt={image.altText || product.name}
                        className="main-image"
                        preview={{
                          src: image.url,
                        }}
                      />
                      {discountPercent > 0 && index === 0 && (
                        <div className="discount-badge">
                          -{discountPercent}%
                        </div>
                      )}
                      {product.isFeatured && index === 0 && (
                        <div className="featured-badge">
                          <StarFilled />
                        </div>
                      )}
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="no-image">
                  <div>暂无图片</div>
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`thumbnail-item ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || product.name}
                      preview={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* 右侧商品信息 */}
        <Col xs={24} md={12} lg={14}>
          <div className="product-info">
            {/* 商品标题 */}
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-subtitle">
                {product.shortDesc && (
                  <p className="short-desc">{product.shortDesc}</p>
                )}
                <div className="product-meta">
                  <Space split={<Divider type="vertical" />}>
                    {getCurrentSku() && (
                      <span>SKU: {getCurrentSku()}</span>
                    )}
                    {product.brand && (
                      <span>品牌: {product.brand}</span>
                    )}
                    <span>库存: {currentStock}</span>
                  </Space>
                </div>
              </div>
            </div>

            {/* 价格信息 */}
            <div className="price-section">
              <div className="price-main">
                <span className="current-price">¥{getCurrentPrice().toFixed(2)}</span>
                {getComparePrice() && (
                  <span className="compare-price">¥{getComparePrice()!.toFixed(2)}</span>
                )}
                {discountPercent > 0 && (
                  <Tag color="red" className="discount-tag">
                    省¥{(getComparePrice()! - getCurrentPrice()).toFixed(2)}
                  </Tag>
                )}
              </div>
            </div>

            {/* 商品分类 */}
            {product.categories.length > 0 && (
              <div className="categories-section">
                <span className="label">分类：</span>
                <Space wrap>
                  {product.categories.map(pc => (
                    <Tag
                      key={pc.categoryId}
                      color="blue"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/products?category=${pc.categoryId}`)}
                    >
                      {pc.category.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 商品规格选择 */}
            {product.variants.length > 0 && (
              <div className="variants-section">
                <div className="section-title">选择规格：</div>
                <Radio.Group
                  value={selectedVariant?.id}
                  onChange={(e) => {
                    const variant = product.variants.find(v => v.id === e.target.value);
                    if (variant) handleVariantChange(variant);
                  }}
                  className="variant-options"
                >
                  {product.variants.map(variant => {
                    const options = JSON.parse(variant.options || '{}');
                    const isDisabled = !variant.isActive || variant.quantity <= 0;
                    
                    return (
                      <Radio.Button
                        key={variant.id}
                        value={variant.id}
                        disabled={isDisabled}
                        className="variant-option"
                      >
                        <div className="variant-content">
                          <div className="variant-title">{variant.title}</div>
                          {Object.entries(options).map(([key, value]) => (
                            <div key={key} className="variant-detail">
                              {key}: {String(value)}
                            </div>
                          ))}
                          {variant.price && variant.price !== product.price && (
                            <div className="variant-price">
                              ¥{variant.price.toFixed(2)}
                            </div>
                          )}
                          {isDisabled && (
                            <div className="variant-disabled">缺货</div>
                          )}
                        </div>
                      </Radio.Button>
                    );
                  })}
                </Radio.Group>
              </div>
            )}

            {/* 数量选择 */}
            <div className="quantity-section">
              <span className="label">数量：</span>
              <InputNumber
                min={1}
                max={currentStock}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                disabled={isOutOfStock}
              />
              <span className="stock-info">
                {isOutOfStock ? (
                  <Tag color="red">缺货</Tag>
                ) : currentStock <= product.lowStockThreshold ? (
                  <Tag color="orange">库存紧张，仅剩 {currentStock} 件</Tag>
                ) : (
                  <span className="stock-available">现货 {currentStock} 件</span>
                )}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="action-section">
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="add-to-cart-btn"
                >
                  加入购物车
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="buy-now-btn"
                >
                  立即购买
                </Button>
                <Button
                  type="text"
                  size="large"
                  icon={<HeartOutlined />}
                  onClick={handleToggleFavorite}
                  className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
                <Button
                  type="text"
                  size="large"
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                >
                  分享
                </Button>
              </Space>
            </div>

            {/* 服务保障 */}
            <div className="service-section">
              <div className="section-title">服务保障</div>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="service-item">
                    <TruckOutlined className="service-icon" />
                    <span>包邮</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="service-item">
                    <SafetyOutlined className="service-icon" />
                    <span>正品保证</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="service-item">
                    <CustomerServiceOutlined className="service-icon" />
                    <span>7天退换</span>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* 商品详情标签页 */}
      <div className="product-details-tabs">
        <Tabs defaultActiveKey="description" size="large">
          <TabPane tab="商品详情" key="description">
            <Card>
              {product.description ? (
                <div
                  className="product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="no-description">暂无详细描述</div>
              )}
            </Card>
          </TabPane>
          
          <TabPane tab="规格参数" key="specifications">
            <Card>
              <div className="specifications">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="spec-item">
                      <span className="spec-label">商品名称：</span>
                      <span className="spec-value">{product.name}</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="spec-item">
                      <span className="spec-label">商品编号：</span>
                      <span className="spec-value">{getCurrentSku() || '无'}</span>
                    </div>
                  </Col>
                  {product.brand && (
                    <Col span={12}>
                      <div className="spec-item">
                        <span className="spec-label">品牌：</span>
                        <span className="spec-value">{product.brand}</span>
                      </div>
                    </Col>
                  )}
                  {product.material && (
                    <Col span={12}>
                      <div className="spec-item">
                        <span className="spec-label">材质：</span>
                        <span className="spec-value">{product.material}</span>
                      </div>
                    </Col>
                  )}
                  {product.weight && (
                    <Col span={12}>
                      <div className="spec-item">
                        <span className="spec-label">重量：</span>
                        <span className="spec-value">{product.weight}kg</span>
                      </div>
                    </Col>
                  )}
                  {product.dimensions && (
                    <Col span={12}>
                      <div className="spec-item">
                        <span className="spec-label">尺寸：</span>
                        <span className="spec-value">{product.dimensions}</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="用户评价" key="reviews">
            <Card>
              <div className="reviews-section">
                <div className="reviews-summary">
                  <Row gutter={32}>
                    <Col span={8}>
                      <div className="rating-overview">
                        <div className="rating-score">4.8</div>
                        <Rate disabled defaultValue={5} />
                        <div className="rating-count">共 128 条评价</div>
                      </div>
                    </Col>
                    <Col span={16}>
                      <div className="rating-breakdown">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="rating-bar">
                            <span>{star}星</span>
                            <div className="bar">
                              <div 
                                className="fill" 
                                style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                              />
                            </div>
                            <span>{star === 5 ? 102 : star === 4 ? 19 : 7}</span>
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </div>
                
                <Divider />
                
                <div className="reviews-list">
                  <div className="review-item">
                    <div className="review-header">
                      <div className="user-info">
                        <span className="username">用户***123</span>
                        <Rate disabled defaultValue={5} size="small" />
                      </div>
                      <div className="review-date">2024-01-15</div>
                    </div>
                    <div className="review-content">
                      质量很好，款式也很喜欢，物流很快，包装也很仔细，非常满意的一次购物体验！
                    </div>
                  </div>
                  
                  <div className="review-item">
                    <div className="review-header">
                      <div className="user-info">
                        <span className="username">用户***456</span>
                        <Rate disabled defaultValue={4} size="small" />
                      </div>
                      <div className="review-date">2024-01-10</div>
                    </div>
                    <div className="review-content">
                      整体不错，就是颜色比图片稍微深一点，不过还是很满意的。
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* 底部固定操作栏 - 移动端 */}
      <Affix offsetBottom={0} className="mobile-action-bar">
        <div className="mobile-actions">
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={handleToggleFavorite}
            className={isFavorite ? 'favorited' : ''}
          >
            收藏
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{ flex: 1 }}
          >
            加入购物车
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            style={{ flex: 1 }}
          >
            立即购买
          </Button>
        </div>
      </Affix>
    </div>
  );
};