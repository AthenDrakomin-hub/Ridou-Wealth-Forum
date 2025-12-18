
import React from 'react';
import { NewsItem } from '../types';

interface RealtimeNewsFeedProps {
  news: NewsItem[];
  onRefresh?: () => void;
  loading?: boolean;
}

const CATEGORY_STYLE: Record<string, string> = {
  'A股': 'bg-red-50 text-red-600',
  '港股': 'bg-blue-50 text-blue-600',
  '中概股': 'bg-purple-50 text-purple-600',
  '宏观': 'bg-amber-50 text-amber-600'
};

const RealtimeNewsFeed: React.FC<RealtimeNewsFeedProps> = ({ news, onRefresh, loading }) => {
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
          🎙️ 实时快讯
        </h4>
        <button 
          onClick={onRefresh}
          className={`text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 hover:scale-105 transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {news.length > 0 ? (
          news.map((item) => (
            <div key={item.id} className="group cursor-pointer relative pl-4 border-l-4 border-slate-100 hover:border-amber-500 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-300 uppercase font-mono">{item.timestamp}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${CATEGORY_STYLE[item.category] || 'bg-slate-50 text-slate-500'}`}>
                  {item.category}
                </span>
              </div>
              <p className="text-sm font-bold leading-snug text-slate-600 group-hover:text-slate-900 transition-colors">
                {item.title}
              </p>
            </div>
          ))
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
};

export default React.memo(RealtimeNewsFeed);
