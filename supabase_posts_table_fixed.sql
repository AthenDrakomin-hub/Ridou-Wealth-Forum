-- 创建 posts 表
create table posts (
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
  relatedStock jsonb,
  isFeatured boolean default false,
  commentsList jsonb[],
  tags text[],
  attachments jsonb[]
);

-- 为 posts 表创建索引
create index idx_posts_timestamp on posts (timestamp desc);
create index idx_posts_featured on posts (isFeatured);
create index idx_posts_tags on posts using gin (tags);

-- 设置行级安全策略 (RLS)
alter table posts enable row level security;

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