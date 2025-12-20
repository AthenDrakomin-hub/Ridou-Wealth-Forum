# 日斗财富论坛 - API 接入指南

本指南定义了前端系统如何接入实时数据源。

## 1. 基础环境配置
所有 API 地址与密钥必须在项目根目录的 `.env` 文件中配置：

```bash
# Supabase 配置 (用于存储论坛帖子和私享会申请)
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API 配置 (用于AI智能分析)
GEMINI_API_KEY=your_gemini_api_key

# Sentry 配置 (用于错误监控)
SENTRY_DSN=your_sentry_dsn
```

## 2. 数据源定义

### A. Supabase 数据源
用于存储结构化数据，包括论坛帖子和私享会申请。

#### 1. 论坛帖子表 (posts)
- **功能**: 存储社区投研报告和讨论帖
- **表结构**:
  ```typescript
  {
    id: string;           // 帖子ID
    title: string;        // 标题
    content: string;      // 内容
    author: string;       // 作者
    timestamp: string;    // 发布时间
    likes: number;        // 点赞数
    comments: number;     // 评论数
    views: number;        // 浏览数
    isFeatured: boolean;  // 是否精华帖
    tags: string[];       // 标签
  }
  ```

#### 2. 私享会申请表 (applications)
- **功能**: 存储私享会成员申请信息
- **表结构**:
  ```typescript
  {
    id: string;           // 申请ID
    name: string;         // 姓名
    phone: string;        // 手机号
    reason: string;       // 申请理由
    timestamp: string;    // 申请时间
    status: 'pending' | 'approved' | 'rejected'; // 状态
  }
  ```

### B. 东方财富 API (实时行情)
用于获取毫秒级更新的金融市场数据。

#### 1. 市场指数
- **Endpoint**: `GET https://push2.eastmoney.com/api/qt/stock/get`
- **参数**: 
  - `fields=f43,f170,f169,f168,f167,f58`
  - `secid={指数代码}` (如: 1.000001 表示上证指数)
- **返回结构**:
  ```json
  {
    "data": {
      "f58": "上证指数",   // 名称
      "f43": 305012,      // 当前点位 (需除以100)
      "f170": 125,        // 涨跌幅 (需除以100)
      "f169": 3520        // 涨跌额 (需除以100)
    }
  }
  ```

#### 2. 个股行情
- **Endpoint**: `GET https://push2.eastmoney.com/api/qt/stock/get`
- **参数**: 
  - `fields=f43,f170,f169,f168,f167,f58`
  - `secid={股票代码}` (如: 1.600000 表示上海浦发银行)
- **返回结构**: 同市场指数

### C. 新浪财经 API (7x24快讯)
用于获取最新的财经新闻。

#### 1. 获取 7x24 快讯
- **Endpoint**: `GET https://zhibo.sina.com.cn/api/zhibo/feed`
- **参数**:
  - `page=1`
  - `page_size=20`
  - `zhibo_id=152`
- **返回结构**:
  ```json
  {
    "result": {
      "data": {
        "feed": {
          "list": [
            {
              "id": "12345",
              "content": "快讯内容",
              "createtime": "2023-01-01 10:30:00",
              "doc_url": "http://news.sina.com.cn/..."
            }
          ]
        }
      }
    }
  }
  ```

## 3. 鉴权与安全
1. **Supabase 鉴权**: 使用 anon key 进行匿名访问
2. **Gemini API 鉴权**: 在 Header 中携带 `x-goog-api-key`
3. **数据安全**: 所有敏感信息应通过环境变量配置，不在代码中硬编码

## 4. 实时性保障
- **快讯**: 建议前端每 60 秒轮询一次
- **行情**: 建议在"行情中心"页面开启 5-10 秒短轮询
- **论坛帖子**: 用户操作时实时更新，其他情况可适当缓存

## 5. 错误处理与降级
1. **网络异常**: 提供友好的错误提示和重试机制
2. **API限流**: 实现合理的重试策略
3. **服务降级**: 当第三方API不可用时，提供模拟数据或缓存数据