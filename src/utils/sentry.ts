import * as Sentry from "@sentry/react";

// 初始化Sentry
export function initSentry() {
  // 仅在生产环境中初始化
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      // 设置错误采样率
      sampleRate: 1.0,
    });
  }
}