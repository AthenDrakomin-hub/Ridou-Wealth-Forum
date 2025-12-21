import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 代理新浪财经 API（解决开发环境 CORS 问题）
          '/api/sina': {
            target: 'https://zhibo.sina.com.cn',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/sina/, '/api/zhibo')
          },
          // 代理东方财富 API
          '/api/eastmoney': {
            target: 'https://push2.eastmoney.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/eastmoney/, '/api/qt')
          }
        }
      },
      plugins: [
        react()
        // visualizer({
        //   filename: 'dist/stats.html',
        //   open: true,
        //   gzipSize: true,
        //   brotliSize: true
        // })
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
        'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          external: ['@sentry/tracing'],
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              echarts: ['echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers'],
              recharts: ['recharts', 'recharts/lib/component/ResponsiveContainer'],
              utils: ['./utils/formatters.ts'],
              // 添加更多细粒度的代码分割
              'tanstack': ['@tanstack/react-virtual'],
              'supabase': ['@supabase/supabase-js']
            }
          }
        },
        brotliSize: false,
        sourcemap: mode === 'development',
        chunkSizeWarningLimit: 1000,
        // 启用terser压缩选项
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // 删除console语句
            drop_debugger: true, // 删除debugger语句
          }
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom']
      }
    };
});