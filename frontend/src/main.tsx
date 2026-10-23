import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#245fa8', colorError: '#b83b3b', colorText: '#263a54', colorTextSecondary: '#586b83', colorTextPlaceholder: '#586b83', colorBorder: '#cbd7e8', colorBgContainer: '#ffffff', fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 14, borderRadius: 6, controlHeight: 38 }, components: { Drawer: { paddingLG: 24 }, Tooltip: { colorBgSpotlight: '#263a54' } } }}>
      <BrowserRouter><App /></BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
