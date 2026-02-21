import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url =
    process.env.VITE_DEV_REMOTE === 'remote'
      ? process.env.VITE_BACKEND_SERVER
      : 'http://samuel-dev-backend:8889/';

  const config = {
    plugins: [react()],
    resolve: {
      base: '/',
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Preservar todos los headers
              Object.keys(req.headers).forEach(key => {
                proxyReq.setHeader(key, req.headers[key]);
              });
              
              console.log('🔍 Proxy request:', req.method, req.url);
              console.log('🔍 Proxy headers:', req.headers);
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('🔍 Proxy response status:', proxyRes.statusCode);
            });
          },
        },
      },
    },
  };
  return defineConfig(config);
};
