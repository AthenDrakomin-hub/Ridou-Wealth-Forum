
import React from 'react';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  onClick?: (post: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={() => onClick?.(post)}
      className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-500 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-black border border-amber-100 shadow-inner">
            日
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">日斗投资</span>
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-100">官方认证</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{post.timestamp}</p>
          </div>
        </div>
        {post.isFeatured && (
          <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm shadow-amber-500/20">精华</span>
        )}
      </div>

      <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-amber-600 transition-colors relative z-10">
        {post.title}
      </h3>

      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 font-medium relative z-10">
        {post.content}
      </p>

      <div className="flex flex-wrap gap-2 relative z-10">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
            #{tag}
          </span>
        ))}
        {post.attachments && post.attachments.length > 0 && (
          <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">
            📎 {post.attachments.length} 附件
          </span>
        )}
      </div>

      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none">
        <span className="text-8xl">🎯</span>
      </div>
    </div>
  );
};

export default React.memo(PostItem);
