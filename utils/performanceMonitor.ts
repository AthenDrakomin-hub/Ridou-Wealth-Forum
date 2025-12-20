// 性能监控工具
class PerformanceMonitor {
  // 监控 Web Vitals 指标
  static initWebVitals() {
    // Core Web Vitals
    if ('performance' in window) {
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 上报 FID 数据
          this.reportMetric('FID', (entry as any).processingStart - (entry as any).startTime);
        }
      }).observe({ type: 'first-input', buffered: true });

      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.reportMetric('LCP', lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }
  }

  // 监控资源加载性能
  static observeResourcePerformance() {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 过滤出资源加载时间超过1秒的资源
          if (entry.duration > 1000) {
            this.reportMetric('SlowResource', {
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType
            });
          }
        }
      }).observe({ entryTypes: ['resource'] });
    }
  }

  // 监控长任务
  static observeLongTasks() {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 上报长任务（超过50ms）
          if (entry.duration > 50) {
            this.reportMetric('LongTask', entry.duration);
          }
        }
      }).observe({ entryTypes: ['longtask'] });
    }
  }

  // 上报指标数据
  static reportMetric(name: string, value: any) {
    // 在生产环境中上报数据到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 示例：发送到自定义监控接口
      // navigator.sendBeacon('/api/performance', JSON.stringify({ name, value, timestamp: Date.now() }));
      
      // 或者集成第三方监控服务如 Google Analytics
      // gtag('event', 'performance_metric', { name, value });
    } else {
      // 开发环境中输出到控制台
      console.log(`[Performance] ${name}:`, value);
    }
  }

  // 初始化所有监控
  static init() {
    // 页面加载完成后初始化监控
    if (document.readyState === 'complete') {
      this.initWebVitals();
      this.observeResourcePerformance();
      this.observeLongTasks();
    } else {
      window.addEventListener('load', () => {
        this.initWebVitals();
        this.observeResourcePerformance();
        this.observeLongTasks();
      });
    }
  }
}

// 页面加载完成后初始化性能监控
PerformanceMonitor.init();

export default PerformanceMonitor;