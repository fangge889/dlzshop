import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

export const PublicLayout: React.FC = () => {
  return (
    <Layout>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};