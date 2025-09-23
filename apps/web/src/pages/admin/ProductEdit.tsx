import React, { useState, useEffect } from 'react';
import { Card, message, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '../../components/ProductForm/ProductForm';
import { Product, ProductFormData } from '../../types/product';
import { productService } from '../../services/productService';

export const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const handleSubmit = async (data: ProductFormData, images: File[]) => {
    if (!id) return;
    
    setSubmitLoading(true);
    try {
      const formData = productService.createFormData(data, images);
      const response = await productService.updateProduct(parseInt(id), formData);
      
      if (response.success) {
        message.success('商品更新成功');
        navigate('/admin/products');
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      message.error('更新商品失败');
      console.error('Update product error:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

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
      <Card
        title={`编辑商品 - ${product.name}`}
        style={{ marginBottom: 24 }}
      >
        <div style={{ fontSize: 14, color: '#666' }}>
          修改商品信息，包括基本信息、图片、规格和SEO设置
        </div>
      </Card>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
};