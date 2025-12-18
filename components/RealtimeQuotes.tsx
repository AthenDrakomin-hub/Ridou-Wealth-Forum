
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { MarketIndex } from '../types';

interface RealtimeQuotesProps {
  indices: MarketIndex[];
  summary?: {
    riseCount: number;
    fallCount: number;
    flatCount: number;
    turnover: string;
  };
}

const RealtimeQuotes: React.FC<RealtimeQuotesProps> = ({ indices, summary }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && indices.length > 0) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      const option = {
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12 },
        legend: { top: 10, itemGap: 20 },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: { type: 'category', axisLine: { lineStyle: { color: '#e2e8f0' } } },
        yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
        series: indices.map(idx => ({
          name: idx.name,
          type: 'line',
          smooth: true,
          data: [] // 此处由 DataService 获取的历史趋势填充
        }))
      };
      chartInstance.current.setOption(option);
    }
  }, [indices]);

  if (!indices || indices.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">正在连接实时行情源...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-2 h-8 bg-[#C0950E] rounded-full"></span>
          实时大盘行情
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Live Data Sync
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((idx) => (
          <div key={idx.name} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-slate-800">{idx.name}</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${idx.change >= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change}%
              </span>
            </div>
            <div className="mb-2">
              <div className={`text-3xl font-black ${idx.change >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {idx.value.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-slate-400">
                {idx.changeAmount >= 0 ? '+' : ''}{idx.changeAmount}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-[0.03] group-hover:scale-125 transition-transform duration-700">📈</div>
          </div>
        ))}
      </div>

      {summary && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Market Sentiment</p>
            <h3 className="text-xl font-black">今日市场情绪指数：{summary.riseCount > summary.fallCount ? '活跃' : '偏冷'}</h3>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">上涨家数</p>
              <p className="text-2xl font-black text-red-400">{summary.riseCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">成交总额</p>
              <p className="text-2xl font-black text-white">{summary.turnover}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeQuotes;
