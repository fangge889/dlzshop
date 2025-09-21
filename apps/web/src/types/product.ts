// 商品相关类型定义

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId: number;
  author: {
    id: number;
    username: string;
    email: string;
  };
  categories: ProductCategory[];
  images: ProductImage[];
  variants: ProductVariant[];
  _count?: {
    variants: number;
    images: number;
  };
}

export interface ProductCategory {
  productId: number;
  categoryId: number;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  createdAt: string;
  products?: ProductCategory[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  sortOrder: number;
  isMain: boolean;
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  title: string;
  price?: number;
  comparePrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  options: string; // JSON字符串
  image?: string;
  isActive: boolean;
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductFormData {
  name: string;
  slug?: string;
  description?: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  brand?: string;
  categoryIds: number[];
  variants?: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  status?: ProductStatus | 'all';
  category?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}