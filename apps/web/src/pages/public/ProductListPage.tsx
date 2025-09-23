import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Pagination,
  Spin,
  Empty,
  Tag,
  Image,
  Space,
  Breadcrumb,
  Slider,
  Checkbox,
  Drawer,
  Badge
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  StarFilled
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product, Category, ProductListParams } from '../../types/product';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import './ProductListPage.css';

const { Search } = Input;
const { Option } = Select;

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterVisible, setFilterVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [filters, setFilters] = useState<ProductListParams>({
    page: 1,
    limit: 12,
    status: 'ACTIVE',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载商品列表
  const loadProducts = async (params?: ProductListParams) => {
    setLoading(true);
    try {
      const queryParams = { ...filters, ...params };
      const response = await productService.getProducts(queryParams);
      
      if (response.success) {
        setProducts(response.data.products);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          current: response.data.pagination.page,
        }));
      }
    } catch (error) {
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

  // 更新URL参数
  const updateSearchParams = (newFilters: Partial<ProductListParams>) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value, page: 1 };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    loadProducts(newFilters);
  };

  // 处理分类筛选
  const handleCategoryChange = (categoryId: number | undefined) => {
    const newFilters = { ...filters, category: categoryId, page: 1 };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    loadProducts(newFilters);
  };

  // 处理排序
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    loadProducts(newFilters);
  };

  // 处理分页
  const handlePageChange = (page: number, pageSize?: number) => {
    const newFilters = { ...filters, page, limit: pageSize || filters.limit };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    loadProducts(newFilters);
  };

  // 获取当前分类信息
  const currentCategory = categories.find(c => c.id === filters.category);

  // 商品卡片组件
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const mainImage = product.images.find(img => img.isMain) || product.images[0];
    const hasDiscount = product.comparePrice && product.comparePrice > product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
      : 0;

    return (
      <Card
        className="product-card"
        hoverable
        cover={
          <div className="product-image-container">
            <Image
              src={mainImage?.url}
              alt={product.name}
              className="product-image"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              preview={false}
              onClick={() => navigate(`/products/${product.id}`)}
            />
            {hasDiscount && (
              <div className="discount-badge">
                -{discountPercent}%
              </div>
            )}
            {product.isFeatured && (
              <div className="featured-badge">
                <StarFilled />
              </div>
            )}
            <div className="product-actions">
              <Button
                type="text"
                icon={<HeartOutlined />}
                className="action-btn"
              />
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                className="action-btn"
              >
                加入购物车
              </Button>
            </div>
          </div>
        }
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-desc">{product.shortDesc}</p>
          
          <div className="product-categories">
            {product.categories.slice(0, 2).map(pc => (
              <Tag key={pc.categoryId} size="small">
                {pc.category.name}
              </Tag>
            ))}
          </div>

          <div className="product-price">
            <span className="current-price">¥{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="compare-price">¥{product.comparePrice!.toFixed(2)}</span>
            )}
          </div>

          <div className="product-meta">
            <span className="stock-info">
              {product.quantity > 0 ? `库存 ${product.quantity}` : '缺货'}
            </span>
            {product.brand && (
              <span className="brand">{product.brand}</span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // 筛选面板
  const FilterPanel = () => (
    <div className="filter-panel">
      <div className="filter-section">
        <h4>价格区间</h4>
        <Slider
          range
          min={0}
          max={10000}
          value={priceRange}
          onChange={setPriceRange}
          tipFormatter={(value) => `¥${value}`}
        />
        <div className="price-inputs">
          <Input
            size="small"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            addonBefore="¥"
          />
          <span>-</span>
          <Input
            size="small"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
            addonBefore="¥"
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>品牌</h4>
        <Checkbox.Group
          value={selectedBrands}
          onChange={setSelectedBrands}
        >
          <div className="brand-list">
            {['Apple', 'Samsung', '华为', '小米', 'OPPO', 'vivo'].map(brand => (
              <Checkbox key={brand} value={brand}>
                {brand}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </div>
    </div>
  );

  return (
    <div className="product-list-page">
      {/* 面包屑导航 */}
      <div className="breadcrumb-container">
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href="/">首页</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>商品</Breadcrumb.Item>
          {currentCategory && (
            <Breadcrumb.Item>{currentCategory.name}</Breadcrumb.Item>
          )}
        </Breadcrumb>
      </div>

      {/* 页面标题 */}
      <div className="page-header">
        <h1>{currentCategory ? currentCategory.name : '全部商品'}</h1>
        {currentCategory?.description && (
          <p className="category-desc">{currentCategory.description}</p>
        )}
      </div>

      <Row gutter={24}>
        {/* 侧边栏筛选 - 桌面端 */}
        {!isMobile && (
          <Col span={6}>
            <Card title="商品筛选" className="filter-card">
              <div className="category-filter">
                <h4>商品分类</h4>
                <div className="category-list">
                  <div
                    className={`category-item ${!filters.category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(undefined)}
                  >
                    全部分类
                  </div>
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`category-item ${filters.category === category.id ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                      {category._count?.products && (
                        <span className="count">({category._count.products})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <FilterPanel />
            </Card>
          </Col>
        )}

        {/* 主内容区 */}
        <Col span={isMobile ? 24 : 18}>
          {/* 工具栏 */}
          <div className="toolbar">
            <div className="toolbar-left">
              <Search
                placeholder="搜索商品..."
                allowClear
                style={{ width: isMobile ? 200 : 300 }}
                onSearch={handleSearch}
                defaultValue={filters.search}
              />
              {isMobile && (
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFilterVisible(true)}
                >
                  筛选
                </Button>
              )}
            </div>

            <div className="toolbar-right">
              <Space>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  style={{ width: 150 }}
                  onChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                  }}
                >
                  <Option value="createdAt-desc">最新发布</Option>
                  <Option value="price-asc">价格从低到高</Option>
                  <Option value="price-desc">价格从高到低</Option>
                  <Option value="name-asc">名称A-Z</Option>
                  <Option value="name-desc">名称Z-A</Option>
                </Select>

                <Button.Group>
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                  />
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setViewMode('list')}
                  />
                </Button.Group>
              </Space>
            </div>
          </div>

          {/* 商品列表 */}
          <div className="products-container">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Empty
                description="暂无商品"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                <Row gutter={[16, 16]} className={`products-grid ${viewMode}`}>
                  {products.map(product => (
                    <Col
                      key={product.id}
                      xs={12}
                      sm={12}
                      md={viewMode === 'grid' ? 8 : 24}
                      lg={viewMode === 'grid' ? 6 : 24}
                      xl={viewMode === 'grid' ? 6 : 24}
                    >
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>

                {/* 分页 */}
                <div className="pagination-container">
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    showSizeChanger
                    showQuickJumper={!isMobile}
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }
                    onChange={handlePageChange}
                    responsive
                  />
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* 移动端筛选抽屉 */}
      <Drawer
        title="商品筛选"
        placement="left"
        onClose={() => setFilterVisible(false)}
        open={filterVisible}
        width={300}
      >
        <div className="mobile-filter">
          <div className="category-filter">
            <h4>商品分类</h4>
            <div className="category-list">
              <div
                className={`category-item ${!filters.category ? 'active' : ''}`}
                onClick={() => {
                  handleCategoryChange(undefined);
                  setFilterVisible(false);
                }}
              >
                全部分类
              </div>
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-item ${filters.category === category.id ? 'active' : ''}`}
                  onClick={() => {
                    handleCategoryChange(category.id);
                    setFilterVisible(false);
                  }}
                >
                  {category.name}
                  {category._count?.products && (
                    <span className="count">({category._count.products})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <FilterPanel />
        </div>
      </Drawer>
    </div>
  );
};