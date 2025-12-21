
import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { MarketIndex } from '../types';

// 注册必需的组件以减小包体积
echarts.use([
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent,
  CanvasRenderer
]);

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

  // 电脑端高性能调整大小逻辑
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartInstance.current) {
        chartInstance.current.resize({
          animation: { duration: 200 }
        });
      }
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && indices.length > 0) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current, undefined, {
          devicePixelRatio: window.devicePixelRatio,
          renderer: 'canvas'
        });
      }
      
      const option = {
        animation: false, // 行情高频刷新禁用动画减负
        tooltip: { 
          trigger: 'axis', 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          borderRadius: 12,
          confine: true
        },
        legend: { top: 10, itemGap: 20, icon: 'circle' },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '20%', containLabel: true },
        xAxis: { 
          type: 'category', 
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisTick: { show: false }
        },
        yAxis: { 
          type: 'value', 
          scale: true, 
          splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
          axisLine: { show: false }
        },
        series: indices.map(idx => ({
          name: idx.name,
          type: 'line',
          smooth: 0.3,
          symbol: 'none',
          data: [Math.random()*10, Math.random()*20, idx.value % 100] // 示例趋势
        }))
      };
      
      chartInstance.current.setOption(option, { notMerge: true, lazyUpdate: true });
    }
  }, [indices]);

  const marketIndicesCards = useMemo(() => {
    return indices.map((idx) => (
      <div key={idx.name} className="bg-white rounded-[2rem] p-6 2xl:p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group transform translate-z-0">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-black text-slate-800 tracking-tight text-sm 2xl:text-base">{idx.name}</h3>
          <span className={`text-[10px] 2xl:text-xs font-black px-2.5 py-1 rounded-full ${idx.change >= 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
            {idx.change >= 0 ? '+' : ''}{idx.change}%
          </span>
        </div>
        <div className="mb-2">
          <div className={`text-3xl 2xl:text-4xl font-black tabular-nums tracking-tighter ${idx.change >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] 2xl:text-xs font-bold text-slate-400">
            {idx.changeAmount >= 0 ? '+' : ''}{idx.changeAmount}
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 text-6xl 2xl:text-7xl opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">📈</div>
      </div>
    ));
  }, [indices]);

  if (!indices || indices.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">行情链路同步中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl 2xl:text-3xl font-black text-slate-800 flex items-center gap-3 italic">
          <span className="w-1.5 h-7 bg-amber-500 rounded-full"></span>
          REALTIME QUOTES
        </h2>
        <div className="flex items-center gap-2 text-[10px] 2xl:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Direct DB Sync
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 xl:gap-6">
        {marketIndicesCards}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 overflow-hidden shadow-sm">
        <div ref={chartRef} className="h-[400px] 2xl:h-[500px] w-full" />
      </div>

      {summary && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 2xl:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 shadow-2xl overflow-hidden relative translate-z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
            <p className="text-[10px] 2xl:text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Market Sentiment</p>
            <h3 className="text-xl 2xl:text-3xl font-black italic">多空情绪指数：{summary.riseCount > summary.fallCount ? '强势看多' : '观望修复'}</h3>
          </div>
          <div className="flex items-center gap-12 2xl:gap-20 relative z-10">
            <div className="text-center">
              <p className="text-[10px] 2xl:text-xs font-bold text-white/40 uppercase mb-1">上涨家数</p>
              <p className="text-2xl 2xl:text-4xl font-black text-red-400">{summary.riseCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] 2xl:text-xs font-bold text-white/40 uppercase mb-1">两市成交额</p>
              <p className="text-2xl 2xl:text-4xl font-black text-amber-500">{summary.turnover}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(RealtimeQuotes);