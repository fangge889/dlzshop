import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { store } from './store';
import './index.css';

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#001529',
      triggerBg: '#002140',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider locale={zhCN} theme={theme}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);