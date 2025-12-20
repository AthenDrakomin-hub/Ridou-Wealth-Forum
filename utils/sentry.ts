import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// 初始化Sentry
export function initSentry() {
  // 仅在生产环境中初始化
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          // 设置 tracesSampleRate 以控制采样率
          tracingOrigins: ["localhost", /^\//],
        }),
      ],
      // 设置性能监控采样率
      tracesSampleRate: 1.0,
      // 设置错误采样率
      sampleRate: 1.0,
    });
  }
}

// 性能监控
export function setupPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // 添加性能监控集成
    // Sentry.configureScope已弃用，使用新API
  }
}