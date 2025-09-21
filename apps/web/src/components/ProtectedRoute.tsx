import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // 重定向到登录页面，并保存当前路径
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    // 用户没有足够的权限
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};