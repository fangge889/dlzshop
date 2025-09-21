import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet-async';

import { useAppSelector } from './hooks/redux';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';

// 页面组件
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import PagesListPage from './pages/admin/PagesListPage';
import PageEditorPage from './pages/admin/PageEditorPage';
import PageBuilderPage from './pages/admin/PageBuilderPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import SettingsPage from './pages/admin/SettingsPage';
import HomePage from './pages/public/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TestPageBuilder from './pages/TestPageBuilder';
import { TestWorkflow } from './pages/TestWorkflow';
import { TestIndex } from './pages/TestIndex';
import { TestGuide } from './pages/TestGuide';
import { StepByStepTest } from './pages/StepByStepTest';
import { TestLogin } from './pages/TestLogin';

import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  return (
    <>
      <Helmet>
        <title>DLZ Shop CMS</title>
        <meta name="description" content="现代化企业级内容管理系统" />
      </Helmet>

      <Layout style={{ minHeight: '100vh' }}>
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* 认证路由 */}
          <Route path="/auth/login" element={
            isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />
          } />
          <Route path="/auth/register" element={
            isAuthenticated ? <Navigate to="/admin" replace /> : <RegisterPage />
          } />

          {/* 管理后台路由 */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="pages" element={<PagesListPage />} />
            <Route path="pages/new" element={<PageEditorPage />} />
            <Route path="pages/:id/edit" element={<PageEditorPage />} />
            <Route path="pages/builder" element={<PageBuilderPage />} />
            <Route path="pages/:id/builder" element={<PageBuilderPage />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 测试页面 */}
          <Route path="/test" element={<TestIndex />} />
          <Route path="/test/login" element={<TestLogin />} />
          <Route path="/test/guide" element={<TestGuide />} />
          <Route path="/test/steps" element={<StepByStepTest />} />
          <Route path="/test/page-builder" element={<TestPageBuilder />} />
          <Route path="/test/workflow" element={<TestWorkflow />} />

          {/* 404 页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  );
};

export default App;