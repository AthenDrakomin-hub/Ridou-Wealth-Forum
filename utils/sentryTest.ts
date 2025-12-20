// Sentry测试工具
export const testSentryIntegration = () => {
  // 仅在生产环境测试
  if (process.env.NODE_ENV === 'production') {
    // 测试错误上报
    setTimeout(() => {
      Sentry.captureMessage("Sentry integration test message");
    }, 5000);
    
    // 测试异常上报
    setTimeout(() => {
      try {
        throw new Error("Sentry integration test error");
      } catch (error) {
        Sentry.captureException(error);
      }
    }, 10000);
    
    console.log("Sentry integration tests scheduled");
  } else {
    console.log("Sentry integration tests only run in production environment");
  }
};