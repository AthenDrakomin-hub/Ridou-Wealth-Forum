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
      },
      plugins: [
        react(),
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
        'process.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          external: ['react-is', '@sentry/tracing'],
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              echarts: ['echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers'],
              recharts: ['recharts', 'recharts/lib/component/ResponsiveContainer'],
              utils: ['./utils/formatters.ts'],
              // 添加更多细粒度的代码分割
              'react-window': ['react-window'],
              'supabase': ['@supabase/supabase-js'],
              'gemini': ['@google/genai'],
              'groq': ['groq-sdk']
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