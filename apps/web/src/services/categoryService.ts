import { Category, ApiResponse } from '../types/product';

const API_BASE_URL = (window as any).env?.REACT_APP_API_URL || 'http://localhost:3001/api';

class CategoryService {
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

  // 获取分类列表
  async getCategories(includeProducts = false): Promise<ApiResponse<Category[]>> {
    const params = includeProducts ? '?includeProducts=true' : '';
    return this.request<ApiResponse<Category[]>>(`/shop/categories${params}`);
  }

  // 获取分类树结构
  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return this.request<ApiResponse<Category[]>>('/shop/categories/tree');
  }

  // 获取单个分类详情
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>(`/shop/categories/${id}`);
  }

  // 创建分类
  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: number;
    sortOrder?: number;
  }): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>('/shop/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 更新分类
  async updateCategory(id: number, data: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: number;
    sortOrder?: number;
  }): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>(`/shop/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 删除分类
  async deleteCategory(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/shop/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // 批量更新分类排序
  async reorderCategories(categories: { id: number; sortOrder: number }[]): Promise<ApiResponse> {
    return this.request<ApiResponse>('/shop/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ categories }),
    });
  }
}

export const categoryService = new CategoryService();