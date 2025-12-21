-- ============================================
-- Ridou Wealth Forum - 数据库初始化脚本
-- ============================================
-- 此脚本创建所有必需的表、索引、存储桶和安全策略
-- 执行前请确保已连接到正确的 Supabase 项目
-- ============================================

-- ============================================
-- 1. 创建 posts 表（论坛帖子）
-- ============================================
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  author text not null,
  avatar text,
  title text not null,
  content text not null,
  timestamp timestamptz default now(),
  likes integer default 0,
  comments integer default 0,
  views integer default 0,
  images text[],
  related_stock jsonb,
  is_featured boolean default false,
  comments_list jsonb[],
  tags text[],
  attachments jsonb[]
);

-- 为 posts 表创建索引
create index if not exists idx_posts_timestamp on posts (timestamp desc);
create index if not exists idx_posts_featured on posts (is_featured);
create index if not exists idx_posts_tags on posts using gin (tags);

-- 设置行级安全策略 (RLS)
alter table posts enable row level security;

-- 删除现有策略（如果存在）
drop policy if exists "允许所有人查看帖子" on posts;
drop policy if exists "允许认证用户创建帖子" on posts;
drop policy if exists "允许帖子作者更新自己的帖子" on posts;
drop policy if exists "允许帖子作者删除自己的帖子" on posts;

-- 创建访问策略
create policy "允许所有人查看帖子"
  on posts for select
  using (true);

create policy "允许认证用户创建帖子"
  on posts for insert
  with check (true);

create policy "允许帖子作者更新自己的帖子"
  on posts for update
  using (true);

create policy "允许帖子作者删除自己的帖子"
  on posts for delete
  using (true);

-- ============================================
-- 2. 创建 applications 表（私享会申请）
-- ============================================
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  invest_years text,
  missing_abilities text,
  learning_expectation text,
  created_at timestamptz default now(),
  status text default 'pending'
);

-- 为 applications 表创建索引
create index if not exists idx_applications_created_at on applications (created_at desc);
create index if not exists idx_applications_status on applications (status);
create index if not exists idx_applications_phone on applications (phone);

-- 设置行级安全策略 (RLS)
alter table applications enable row level security;

-- 删除现有策略（如果存在）
drop policy if exists "允许认证用户查看自己的申请" on applications;
drop policy if exists "允许任何人创建申请" on applications;
drop policy if exists "允许管理员更新申请状态" on applications;
drop policy if exists "不允许删除申请" on applications;

-- 创建访问策略
create policy "允许认证用户查看自己的申请"
  on applications for select
  using (true);

create policy "允许任何人创建申请"
  on applications for insert
  with check (true);

create policy "允许管理员更新申请状态"
  on applications for update
  using (true);

create policy "不允许删除申请"
  on applications for delete
  using (false);

-- ============================================
-- 3. 创建媒体存储桶和策略
-- ============================================

-- 创建存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 删除现有存储策略（如果存在）
drop policy if exists "允许公开访问媒体文件" on storage.objects;
drop policy if exists "允许认证用户上传媒体文件" on storage.objects;
drop policy if exists "允许认证用户更新自己的媒体文件" on storage.objects;
drop policy if exists "允许文件所有者删除文件" on storage.objects;
drop policy if exists "允许任何人上传到media桶" on storage.objects;

-- 为媒体存储桶设置访问策略
create policy "允许公开访问媒体文件"
on storage.objects for select
using ( bucket_id = 'media' );

-- 允许任何人上传（简化策略，便于前端使用）
create policy "允许任何人上传到media桶"
on storage.objects for insert
with check ( bucket_id = 'media' );

create policy "允许认证用户更新自己的媒体文件"
on storage.objects for update
using (
  bucket_id = 'media' 
  and (auth.role() = 'authenticated' or auth.role() = 'anon')
);

create policy "允许文件所有者删除文件"
on storage.objects for delete
using (
  bucket_id = 'media' 
  and (auth.role() = 'authenticated' or auth.role() = 'anon')
);

-- ============================================
-- 4. 插入示例数据（可选）
-- ============================================

-- 插入示例论坛帖子
insert into posts (author, avatar, title, content, likes, comments, views, is_featured, tags)
values 
  (
    '日斗智库',
    '',
    '【实时追踪】核心资产逻辑重估：寻找确定性锚点',
    '在当前宏观环境下，我们认为传统的博弈逻辑正在失效，产业逻辑的权重在持续上升。本文将深度剖析当前市场环境下，哪些核心资产具备真正的确定性...',
    1200,
    85,
    5600,
    true,
    ARRAY['策略', '核心资产']
  ),
  (
    '证裕研究院',
    '',
    '半导体行业深度：国产替代进入收获期',
    '从产业链调研数据来看，国产半导体设备和材料的渗透率正在加速提升。我们认为2025年将是国产替代的关键收获期...',
    856,
    42,
    3200,
    true,
    ARRAY['半导体', '产业逻辑']
  ),
  (
    '投研前线',
    '',
    '高股息策略：防御中寻找进攻机会',
    '在市场波动加剧的背景下，高股息资产的配置价值凸显。但我们更关注那些既有高股息，又具备成长性的标的...',
    624,
    28,
    2100,
    false,
    ARRAY['高股息', '防御策略']
  )
on conflict (id) do nothing;

-- ============================================
-- 初始化完成
-- ============================================
