# 日斗财富论坛 - API 接入指南

本指南定义了前端系统如何接入实时数据源。

## 1. 基础环境配置
所有 API 地址与密钥必须在项目根目录的 `.env` 文件中配置：

```bash
# Elasticsearch 配置 (用于存储新闻快讯与论坛帖子)
ELASTICSEARCH_URL=https://your-es-cluster.com
ELASTICSEARCH_API_KEY=your_es_api_key

# 实时行情 API 配置 (用于获取 A股/港股 指数与个股数据)
MARKET_DATA_API_URL=https://api.market-data.com/v1
```

## 2. 数据源定义

### A. 全文检索源 (Elasticsearch)
用于非结构化或半结构化数据的快速检索与排序。

#### 1. 获取 7x24 快讯
- **Endpoint**: `POST /news/_search`
- **功能**: 获取最新的财经新闻，支持按情感倾向过滤。
- **请求体 (JSON)**:
  ```json
  {
    "sort": [{ "timestamp": { "order": "desc" } }],
    "size": 20,
    "query": { "match_all": {} }
  }
  ```

#### 2. 获取论坛精华帖
- **Endpoint**: `POST /posts/_search`
- **功能**: 获取社区高质量投研报告。

### B. 实时行情源 (Market API)
用于获取毫秒级更新的金融市场数据。

#### 1. 市场指数
- **Endpoint**: `GET /indices`
- **返回结构**:
  ```json
  [
    { "name": "上证指数", "value": 3050.12, "change": 1.25, "changeAmount": 35.2 },
    { "name": "恒生指数", "value": 16500.5, "change": -0.5, "changeAmount": -82.1 }
  ]
  ```

#### 2. 板块热点
- **Endpoint**: `GET /sectors`
- **功能**: 获取当日领涨板块及龙头股。

---

## 3. 鉴权与安全
1. **ES 鉴权**: 在 Header 中携带 `Authorization: ApiKey {ES_KEY}`。
2. **行情鉴权**: 根据供应商要求，通常在 URL 参数或 Header 中携带 Token。

## 4. 实时性保障
- **快讯**: 建议前端每 60 秒轮询一次。
- **行情**: 建议在“行情中心”页面开启 WebSocket 或 5-10 秒短轮询。
