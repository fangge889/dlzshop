import React, { useState } from 'react';
import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/ProductForm/ProductForm';
import { ProductFormData } from '../../types/product';
import { productService } from '../../services/productService';

export const ProductNew: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData, images: File[]) => {
    setLoading(true);
    try {
      const formData = productService.createFormData(data, images);
      const response = await productService.createProduct(formData);
      
      if (response.success) {
        message.success('商品创建成功');
        navigate('/admin/products');
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (error) {
      message.error('创建商品失败');
      console.error('Create product error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="添加商品"
        style={{ marginBottom: 24 }}
      >
        <div style={{ fontSize: 14, color: '#666' }}>
          创建新的商品信息，包括基本信息、图片、规格和SEO设置
        </div>
      </Card>

      <ProductForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};