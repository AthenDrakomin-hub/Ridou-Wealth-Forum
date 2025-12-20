# 数据库设置指南

本项目使用Supabase作为后端数据库，需要创建两个主要的数据表：`posts` 和 `applications`。

## 表结构说明

### 1. posts 表
存储论坛帖子数据：
- `id`: UUID主键
- `author`: 作者名称
- `avatar`: 作者头像URL
- `title`: 帖子标题
- `content`: 帖子内容
- `timestamp`: 发布时间
- `likes`: 点赞数
- `comments`: 评论数
- `views`: 浏览数
- `images`: 图片URL数组
- `relatedStock`: 相关股票信息(JSONB)
- `isFeatured`: 是否为精选帖子
- `commentsList`: 评论列表(JSONB数组)
- `tags`: 标签数组
- `attachments`: 附件信息(JSONB数组)

### 2. applications 表
存储私享会申请数据：
- `id`: UUID主键
- `name`: 申请人姓名
- `phone`: 手机号
- `investYears`: 投资年限
- `missingAbilities`: 投研痛点
- `learningExpectation`: 学习期望
- `createdAt`: 申请时间
- `status`: 申请状态

## ⚠️ 重要注意事项

在原始的SQL文件中，数据库字段使用下划线命名法（snake_case），而TypeScript接口使用驼峰命名法（camelCase）。这会导致字段映射问题。

**推荐使用以下修正后的SQL文件：**
- `supabase_posts_table_fixed.sql`
- `supabase_applications_table_fixed.sql`

这些文件中的字段名已调整为与TypeScript接口一致的驼峰命名法。

## 创建表的方法

### 方法一：使用Supabase控制台
1. 登录 [Supabase控制台](https://app.supabase.com/)
2. 进入你的项目
3. 在左侧菜单选择 "SQL Editor"
4. 复制并执行以下文件中的SQL语句：
   - `supabase_posts_table_fixed.sql` (推荐)
   - `supabase_applications_table_fixed.sql` (推荐)
   
   或者使用原始文件（但可能会有字段映射问题）：
   - `supabase_posts_table.sql`
   - `supabase_applications_table.sql`

### 方法二：使用Supabase CLI (如果你已安装)
1. 确保已安装Supabase CLI
2. 在项目根目录运行：
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## 验证表是否创建成功
1. 在Supabase控制台中选择 "Table Editor"
2. 确认能看到 `posts` 和 `applications` 表
3. 可以尝试插入一些测试数据来验证表结构

## 注意事项
- 确保在Supabase项目中启用了相应的行级安全策略(RLS)
- 如果需要修改表结构，请先备份现有数据
- 生产环境中建议设置适当的身份验证和权限控制