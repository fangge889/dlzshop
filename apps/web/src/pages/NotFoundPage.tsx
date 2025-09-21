import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>页面未找到 - DLZ Shop CMS</title>
      </Helmet>

      <div className="center-content">
        <Result
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在。"
          extra={
            <Link to="/">
              <Button type="primary">返回首页</Button>
            </Link>
          }
        />
      </div>
    </>
  );
};

export default NotFoundPage;