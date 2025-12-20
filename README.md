# 日斗财富论坛 (Ridou Wealth Forum)

专业级投研社区与私享会协作基座，由 **日斗投资咨询有限公司** (Ridou Investment Consulting Co., Ltd.) 官方运营。本项目基于 Vite + React + TypeScript 构建，并采用飞书（Feishu）作为核心数字协作底座。

---

## 1. 核心功能
- **聚合门户首页**：一站式访问所有功能模块
- **微信公众号合集**：日斗投资官方公众号四大内容合集
- **百度百家号集成**：企业认证官方账号内容展示
- **日斗动态**：官方公告与重要资讯，带有官方认证标志
- **个股查询**：支持A股（SH/SZ）和港股（HK）代码查询
- **行情中心**：毫秒级 A股/港股 指数与个股动态看板
- **私享会协作**：免费申请加入精英投研社群，基于飞书数字底座的 admission 审核系统
- **实时快讯**：集成 7x24 小时高频财经动态流

---

## 2. Vercel 部署指南

本项目已针对 Vercel 平台进行深度适配，支持一键部署。

### A. 环境变量配置 (Environment Variables)
在 Vercel 项目设置中，可配置以下环境变量以连接后端服务：

| 变量名 | 描述 | 示例值 | 是否必需 |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase 数据库连接地址 | `https://insqodihetuyywthnrkb.supabase.co` | 是 |
| `SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | `eyJhbG...` | 是 |
| `SENTRY_DSN` | Sentry 错误监控 DSN | `https://xyz@o123.ingest.sentry.io/456` | 否 |

**重要提示**：
1. 在Vercel环境中，请确保只使用上述不带`NEXT_PUBLIC_`前缀的变量名。Vite项目不需要也不应该使用Next.js风格的环境变量前缀。
2. `SUPABASE_URL`和`SUPABASE_ANON_KEY`是必需的环境变量，用于连接Supabase数据库。
3. 你可以在Supabase项目控制台的"Project Settings" -> "API"中找到这些值。

### B. 部署步骤
1. 将代码推送至 GitHub/GitLab。
2. 在 Vercel 控制台点击 **New Project**。
3. 选择此仓库。
4. 点击 **Deploy**，系统将自动识别 Vite 配置并完成构建。

---

## 3. 协作模型：飞书数字底座

日斗财富论坛不采用传统电话联系方式。所有入驻私享会的成员均通过以下流程对接：
1. **在线申请**：通过本平台提交姓名与手机号。
2. **飞书匹配**：导师仅通过飞书（Feishu）依据手机号发起好友连接。
3. **隐私要求**：用户必须在飞书设置中开启"通过手机号搜索我"。
4. **极简社交**：日斗官方及导师绝不拨打任何骚扰电话。

---

## 4. 技术栈
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (本地构建，非CDN引用)
- **State Management**: React Hooks + Context API
- **Data Visualization**: ECharts (大盘趋势) + Recharts (分时线)
- **Performance**: React Window (虚拟滚动) + Lazy Loading (代码分割)
- **Infrastructure**: ESM (Native Browser Support)
- **Monitoring**: Sentry (错误监控)

---

## 5. 性能优化策略
- **Bundle Size**: 通过代码分割和按需加载显著减小构建产物体积
- **Component Optimization**: 使用React.memo、useCallback、useMemo优化组件性能
- **Virtual Scrolling**: 使用react-window实现长列表虚拟滚动，提升渲染性能
- **Tree Shaking**: 启用Terser压缩，删除无用代码
- **Lazy Loading**: 实施路由级别和组件级别的懒加载

---

## 6. 本地开发

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

---

## 7. 数据库设置

请参考 [DATABASE_SETUP.md](DATABASE_SETUP.md) 文件了解如何设置Supabase数据库表结构。

---

## 8. 环境变量配置

请参考 [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) 文件了解如何正确配置环境变量。

---

## 9. 合规声明
本平台所有内容由 **日斗投资咨询有限公司** 提供，仅供投研交流使用，不构成任何投资建议。

Copyright © 2025 Ridou Investment Consulting Co., Ltd. All Rights Reserved.