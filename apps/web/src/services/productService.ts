import { Product, ProductFormData, ProductListParams, ProductListResponse, ApiResponse } from '../types/product';

const API_BASE_URL = (window as any).env?.REACT_APP_API_URL || 'http://localhost:3001/api';

class ProductService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 如果有token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 获取商品列表
  async getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ProductListResponse>(endpoint);
  }

  // 获取单个商品详情
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/products/${id}`);
  }

  // 创建商品
  async createProduct(formData: FormData): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type为multipart/form-data
    });
  }

  // 更新商品
  async updateProduct(id: number, formData: FormData): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type为multipart/form-data
    });
  }

  // 删除商品
  async deleteProduct(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // 批量操作
  async batchOperation(action: string, productIds: number[]): Promise<ApiResponse> {
    return this.request<ApiResponse>('/products/batch', {
      method: 'POST',
      body: JSON.stringify({ action, productIds }),
    });
  }

  // 将商品表单数据转换为FormData
  createFormData(data: ProductFormData, images?: File[]): FormData {
    const formData = new FormData();

    // 添加基本字段
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'categoryIds' && Array.isArray(value)) {
          value.forEach(id => formData.append('categoryIds', String(id)));
        } else if (key === 'variants' && Array.isArray(value)) {
          formData.append('variants', JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // 添加图片文件
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    return formData;
  }
}

export const productService = new ProductService();