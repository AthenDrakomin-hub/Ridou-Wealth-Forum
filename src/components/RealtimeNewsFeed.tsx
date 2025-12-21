
import React from 'react';
import { NewsItem } from '../types';
import VirtualizedNewsList from './VirtualizedNewsList';
import { CATEGORY_STYLE } from '../utils/constants';

interface RealtimeNewsFeedProps {
  news: NewsItem[];
  onRefresh?: () => void;
  loading?: boolean;
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
}

const RealtimeNewsFeed: React.FC<RealtimeNewsFeedProps> = React.memo(({ news, onRefresh, loading }) => {
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
          🎙️ 实时快讯
        </h4>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 hover:scale-105 transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
          aria-label={loading ? "刷新中" : "刷新快讯"}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 news-container">
        {news.length > 0 ? (
          <VirtualizedNewsList news={news} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-40 py-20">
            <p className="text-[10px] font-black uppercase tracking-widest">等待信号同步...</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Ridou Intel Center · 2025</p>
      </div>
    </div>
  );
});

export default RealtimeNewsFeed;