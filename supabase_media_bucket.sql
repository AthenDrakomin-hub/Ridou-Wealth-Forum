-- 创建媒体存储桶和相关策略

-- 创建存储桶
insert into storage.buckets (id, name, public)
values ('media', 'media', true);

-- 为媒体存储桶设置访问策略
create policy "允许公开访问媒体文件"
on storage.objects for select
using ( bucket_id = 'media' );

create policy "允许认证用户上传媒体文件"
on storage.objects for insert
with check (
  bucket_id = 'media' 
  and auth.role() = 'authenticated'
);

create policy "允许认证用户更新自己的媒体文件"
on storage.objects for update
using (
  bucket_id = 'media' 
  and auth.role() = 'authenticated' 
  and owner = auth.uid()
);

create policy "允许文件所有者删除文件"
on storage.objects for delete
using (
  bucket_id = 'media' 
  and auth.role() = 'authenticated' 
  and owner = auth.uid()
);