-- 创建 applications 表
create table applications (
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
create index idx_applications_created_at on applications (created_at desc);
create index idx_applications_status on applications (status);
create index idx_applications_phone on applications (phone);

-- 设置行级安全策略 (RLS)
alter table applications enable row level security;

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