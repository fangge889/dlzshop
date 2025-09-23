import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Upload,
  Image,
  Space,
  Divider,
  Tag,
  message,
  Tabs,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  SaveOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Product, ProductFormData, Category } from '../../types/product';
import { categoryService } from '../../services/categoryService';
import { RichTextEditor } from '../Editor/RichTextEditor';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData, images: File[]) => Promise<void>;
  loading?: boolean;
}

interface ImageFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  file?: File;
  isMain?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageList, setImageList] = useState<ImageFile[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

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
    loadCategories();
    
    // 如果有初始数据，填充表单
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description,
        shortDesc: initialData.shortDesc,
        price: initialData.price,
        comparePrice: initialData.comparePrice,
        costPrice: initialData.costPrice,
        sku: initialData.sku,
        barcode: initialData.barcode,
        trackQuantity: initialData.trackQuantity,
        quantity: initialData.quantity,
        lowStockThreshold: initialData.lowStockThreshold,
        status: initialData.status,
        isVisible: initialData.isVisible,
        isFeatured: initialData.isFeatured,
        metaTitle: initialData.metaTitle,
        metaDescription: initialData.metaDescription,
        weight: initialData.weight,
        dimensions: initialData.dimensions,
        material: initialData.material,
        brand: initialData.brand,
        categoryIds: initialData.categories.map(c => c.categoryId),
      });

      // 设置图片列表
      if (initialData.images) {
        const images = initialData.images.map(img => ({
          uid: String(img.id),
          name: img.altText || '商品图片',
          status: 'done' as const,
          url: img.url,
          isMain: img.isMain,
        }));
        setImageList(images);
      }

      // 设置规格列表
      if (initialData.variants) {
        setVariants(initialData.variants.map(v => ({
          ...v,
          options: JSON.parse(v.options || '{}'),
        })));
      }
    }
  }, [initialData, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      // 收集新上传的图片文件
      const newImages = imageList
        .filter(img => img.file)
        .map(img => img.file!)
        .filter(Boolean);

      const formData: ProductFormData = {
        ...values,
        variants: variants.map(v => ({
          ...v,
          options: JSON.stringify(v.options || {}),
        })),
      };

      await onSubmit(formData, newImages);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // 处理图片上传
  const handleImageChange = ({ fileList }: any) => {
    const newImageList = fileList.map((file: any) => {
      if (file.originFileObj) {
        return {
          ...file,
          file: file.originFileObj,
        };
      }
      return file;
    });
    setImageList(newImageList);
  };

  // 设置主图
  const setMainImage = (uid: string) => {
    const newImageList = imageList.map(img => ({
      ...img,
      isMain: img.uid === uid,
    }));
    setImageList(newImageList);
  };

  // 添加规格
  const addVariant = () => {
    const newVariant = {
      id: Date.now(),
      title: '',
      price: undefined,
      comparePrice: undefined,
      sku: '',
      barcode: '',
      quantity: 0,
      options: {},
      image: '',
      isActive: true,
    };
    setVariants([...variants, newVariant]);
  };

  // 删除规格
  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // 更新规格
  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // 自动生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        trackQuantity: true,
        quantity: 0,
        lowStockThreshold: 10,
        status: 'DRAFT',
        isVisible: true,
        isFeatured: false,
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 基本信息 */}
        <TabPane tab="基本信息" key="basic">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="商品信息" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="name"
                  label="商品名称"
                  rules={[{ required: true, message: '请输入商品名称' }]}
                >
                  <Input
                    placeholder="请输入商品名称"
                    onChange={(e) => {
                      const slug = generateSlug(e.target.value);
                      form.setFieldValue('slug', slug);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label="URL别名"
                  rules={[
                    { required: true, message: '请输入URL别名' },
                    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符' }
                  ]}
                >
                  <Input placeholder="自动生成或手动输入" />
                </Form.Item>

                <Form.Item name="shortDesc" label="简短描述">
                  <TextArea
                    rows={3}
                    placeholder="商品的简短描述，用于列表页展示"
                    maxLength={200}
                    showCount
                  />
                </Form.Item>

                <Form.Item name="description" label="详细描述">
                  <RichTextEditor
                    placeholder="请输入商品的详细描述..."
                    style={{ minHeight: 300 }}
                  />
                </Form.Item>
              </Card>

              <Card title="价格与库存" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="price"
                      label="销售价格"
                      rules={[{ required: true, message: '请输入销售价格' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        addonBefore="¥"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="comparePrice" label="对比价格">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        addonBefore="¥"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="costPrice" label="成本价格">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        addonBefore="¥"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="sku" label="SKU">
                      <Input placeholder="商品SKU" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="barcode" label="条形码">
                      <Input placeholder="商品条形码" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="trackQuantity" label="跟踪库存" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.trackQuantity !== curr.trackQuantity}>
                  {({ getFieldValue }) => {
                    const trackQuantity = getFieldValue('trackQuantity');
                    return trackQuantity ? (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="quantity" label="库存数量">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="0"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="lowStockThreshold" label="低库存阈值">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="10"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ) : null;
                  }}
                </Form.Item>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="商品状态" style={{ marginBottom: 24 }}>
                <Form.Item name="status" label="发布状态">
                  <Select>
                    <Option value="DRAFT">草稿</Option>
                    <Option value="ACTIVE">已发布</Option>
                    <Option value="ARCHIVED">已归档</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="isVisible" label="前台显示" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item name="isFeatured" label="推荐商品" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Card>

              <Card title="分类" style={{ marginBottom: 24 }}>
                <Form.Item name="categoryIds" label="商品分类">
                  <Select
                    mode="multiple"
                    placeholder="选择商品分类"
                    allowClear
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              <Card title="商品属性">
                <Form.Item name="brand" label="品牌">
                  <Input placeholder="商品品牌" />
                </Form.Item>

                <Form.Item name="material" label="材质">
                  <Input placeholder="商品材质" />
                </Form.Item>

                <Form.Item name="weight" label="重量(kg)">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                  />
                </Form.Item>

                <Form.Item name="dimensions" label="尺寸">
                  <Input placeholder="长x宽x高 (cm)" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 商品图片 */}
        <TabPane tab="商品图片" key="images">
          <Card title="商品图片">
            <div style={{ marginBottom: 16 }}>
              <Upload
                listType="picture-card"
                fileList={imageList}
                onChange={handleImageChange}
                beforeUpload={() => false} // 阻止自动上传
                multiple
                accept="image/*"
              >
                {imageList.length >= 10 ? null : uploadButton}
              </Upload>
            </div>

            {imageList.length > 0 && (
              <div>
                <Divider>图片管理</Divider>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {imageList.map((image, index) => (
                    <div key={image.uid} style={{ position: 'relative' }}>
                      <Image
                        width={120}
                        height={120}
                        src={image.url || (image.file ? URL.createObjectURL(image.file) : '')}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        gap: 4
                      }}>
                        {image.isMain ? (
                          <Tag color="gold">主图</Tag>
                        ) : (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => setMainImage(image.uid)}
                          >
                            设为主图
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabPane>

        {/* 商品规格 */}
        <TabPane tab="商品规格" key="variants">
          <Card
            title="商品规格"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={addVariant}>
                添加规格
              </Button>
            }
          >
            {variants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无商品规格，点击"添加规格"创建
              </div>
            ) : (
              <Collapse>
                {variants.map((variant, index) => (
                  <Panel
                    key={variant.id}
                    header={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{variant.title || `规格 ${index + 1}`}</span>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariant(index);
                          }}
                        />
                      </div>
                    }
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <label>规格名称</label>
                          <Input
                            value={variant.title}
                            onChange={(e) => updateVariant(index, 'title', e.target.value)}
                            placeholder="如：红色-M码"
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <label>SKU</label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="规格SKU"
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 16 }}>
                          <label>价格</label>
                          <InputNumber
                            style={{ width: '100%' }}
                            value={variant.price}
                            onChange={(value) => updateVariant(index, 'price', value)}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 16 }}>
                          <label>对比价格</label>
                          <InputNumber
                            style={{ width: '100%' }}
                            value={variant.comparePrice}
                            onChange={(value) => updateVariant(index, 'comparePrice', value)}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ marginBottom: 16 }}>
                          <label>库存</label>
                          <InputNumber
                            style={{ width: '100%' }}
                            value={variant.quantity}
                            onChange={(value) => updateVariant(index, 'quantity', value)}
                            min={0}
                            placeholder="0"
                          />
                        </div>
                      </Col>
                    </Row>
                  </Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </TabPane>

        {/* SEO优化 */}
        <TabPane tab="SEO优化" key="seo">
          <Card title="搜索引擎优化">
            <Form.Item name="metaTitle" label="SEO标题">
              <Input
                placeholder="页面标题，用于搜索引擎显示"
                maxLength={60}
                showCount
              />
            </Form.Item>

            <Form.Item name="metaDescription" label="SEO描述">
              <TextArea
                rows={4}
                placeholder="页面描述，用于搜索引擎显示"
                maxLength={160}
                showCount
              />
            </Form.Item>

            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <h4>搜索结果预览</h4>
              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#1a0dab', fontSize: 18, marginBottom: 4 }}>
                  {form.getFieldValue('metaTitle') || form.getFieldValue('name') || '商品标题'}
                </div>
                <div style={{ color: '#006621', fontSize: 14, marginBottom: 4 }}>
                  https://example.com/products/{form.getFieldValue('slug') || 'product-slug'}
                </div>
                <div style={{ color: '#545454', fontSize: 14 }}>
                  {form.getFieldValue('metaDescription') || form.getFieldValue('shortDesc') || '商品描述...'}
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 操作按钮 */}
      <div style={{ 
        position: 'sticky', 
        bottom: 0, 
        backgroundColor: 'white', 
        padding: '16px 0', 
        borderTop: '1px solid #f0f0f0',
        marginTop: 24 
      }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            {initialData ? '更新商品' : '创建商品'}
          </Button>
          <Button size="large">
            取消
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="large"
          >
            预览
          </Button>
        </Space>
      </div>
    </Form>
  );
};