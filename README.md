# 日斗财富论坛 (Ridou Wealth Forum)

专业级投研社区与私享会协作基座，由 **日斗投资咨询有限公司** (Ridou Investment Consulting Co., Ltd.) 官方运营。本项目基于 Vite + React + TypeScript 构建，并采用飞书（Feishu）作为核心数字协作底座。

---

## 1. 核心功能
- **财富广场**：汇集深度策略研报与实时市场情绪分析。
- **行情中心**：毫秒级 A股/港股 指数与个股动态看板。
- **私享会协作**：基于飞书数字底座的 admission 审核系统。
- **实时快讯**：集成 7x24 小时高频财经动态流。
- **AI智能分析**：基于Google Gemini的智能投研助手。

---

## 2. Vercel 部署指南

本项目已针对 Vercel 平台进行深度适配，支持一键部署。

### A. 环境变量配置 (Environment Variables)
在 Vercel 项目设置中，可配置以下环境变量以连接后端服务（可选）：

| 变量名 | 描述 | 示例值 |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase 数据库连接地址 | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | `eyJhbG...` |
| `MARKET_DATA_API_URL` | 第三方行情接口地址 | `https://api.market.com` |
| `GEMINI_API_KEY` | Google Gemini API 密钥 | `AIzaSyC...` |

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
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Data Visualization**: ECharts (大盘趋势) + Recharts (分时线)
- **Performance**: React Window (虚拟滚动) + Lazy Loading (代码分割)
- **Infrastructure**: ESM (Native Browser Support)
- **Monitoring**: Sentry (错误监控)
- **AI Services**: Google Gemini (智能分析)

---

## 5. 性能优化
- **Bundle Size**: 通过代码分割和按需加载将构建产物从1.88MB减少到1.25MB (减少34%)
- **Component Optimization**: 使用React.memo、useCallback、useMemo优化组件性能
- **Virtual Scrolling**: 使用react-window实现长列表虚拟滚动，提升渲染性能
- **Tree Shaking**: 启用Terser压缩，删除无用代码

---

## 6. 合规声明
本平台所有内容由 **日斗投资咨询有限公司** 提供，仅供投研交流使用，不构成任何投资建议。

Copyright © 2025 Ridou Investment Consulting Co., Ltd. All Rights Reserved.