# 环境变量配置指南

本项目支持多种部署环境，包括本地开发和Vercel生产环境。以下是正确的环境变量配置方法。

## 本地开发环境

在本地开发时，创建 `.env` 文件并添加以下变量：

```bash
# Supabase Configuration (必需)
SUPABASE_URL=https://insqodihetuyywthnrkb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluc3FvZGloZXR1eXl3dGhucmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMTMwNDcsImV4cCI6MjA4MTc4OTA0N30.tv7VsjfAvweyFyG25FjaeUFm8g1w6VABTZgUCYzrp-s

# Sentry Configuration (可选)
SENTRY_DSN=https://bec7cdcf3d16853396a8b64d8c97c448@o4510564899422208.ingest.us.sentry.io/4510565938298880

# Node Environment
NODE_ENV=development
```

## Vercel 生产环境

在 Vercel 控制台的项目设置中，添加以下环境变量：

| 变量名 | 描述 | 是否必需 |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase 数据库连接地址 | 是 |
| `SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | 是 |
| `SENTRY_DSN` | Sentry 错误监控 DSN | 否 |

**重要注意事项**：
1. 不要使用 `NEXT_PUBLIC_` 前缀，因为这是 Vite 项目，不是 Next.js 项目
2. Vercel 会自动加密存储这些环境变量
3. 环境变量在 Vercel 中区分开发、预览和生产环境

## 环境变量获取方式

### Supabase 配置获取：
1. 登录 Supabase 控制台
2. 进入你的项目
3. 在左侧菜单选择 "Project Settings"
4. 在 "API" 选项卡中找到以下信息：
   - Project URL (对应 SUPABASE_URL)
   - anon key (对应 SUPABASE_ANON_KEY)

## 故障排除

如果遇到 Supabase 连接问题，请检查：

1. 确保 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 变量已正确设置
2. 确认没有使用 `NEXT_PUBLIC_` 前缀
3. 检查 Supabase 项目是否已正确配置并允许来自 Vercel 的连接
4. 确认网络防火墙或安全组没有阻止连接

## 安全最佳实践

1. 永远不要在代码中硬编码敏感信息
2. 使用环境变量存储 API 密钥和连接字符串
3. 定期轮换密钥
4. 限制 Supabase 密钥的权限，只授予应用所需的最小权限