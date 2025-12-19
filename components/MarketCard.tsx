
import React, { useState } from 'react';
import { StockData } from '../types';
import { formatNumber, formatPercent } from '../utils/formatters';
import { DataService } from '../services/api';
import Chart from './chart';

interface MarketCardProps {
  stock: StockData;
}

const MarketCard: React.FC<MarketCardProps> = ({ stock: initialStock }) => {
  const [stock, setStock] = useState<StockData>(initialStock);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isPositive = stock.change >= 0;

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const latestData = await DataService.getInstance().fetchStockData(stock.symbol);
      if (latestData) setStock(latestData);
    } catch (err) {
      console.error("刷新行情失败", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white p-5 md:p-6 lg:p-8 2xl:p-10 3xl:p-12 rounded-[2rem] md:rounded-[2.5rem] 3xl:rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-[0_40px_80px_-15px_rgba(192,149,14,0.2)] hover:border-amber-200/50 hover:scale-[1.03] hover:-translate-y-2 transition-all duration-700 group relative overflow-hidden cursor-pointer">
      {/* 动态背景修饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors duration-700"></div>
      
      <div className="flex justify-between items-start mb-6 md:mb-8 2xl:mb-12 3xl:mb-16 relative z-10">
        <div className="space-y-1 2xl:space-y-2">
          <h3 className="font-black text-slate-900 tracking-tighter flex items-center gap-2 text-base md:text-lg lg:text-xl 2xl:text-2xl 3xl:text-4xl">
            {stock.name}
            <button 
              onClick={handleRefresh}
              className={`text-[10px] 2xl:text-xs p-1.5 2xl:p-2.5 rounded-full bg-slate-50 transition-all active:scale-90 ${
                isRefreshing ? 'animate-spin text-amber-500' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
              }`}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </h3>
          <p className="text-[9px] md:text-[10px] 2xl:text-xs 3xl:text-sm text-slate-400 font-black tracking-[0.2em] uppercase">{stock.symbol}</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-red-500' : 'text-emerald-600'}`}>
          <p className="text-xl md:text-2xl lg:text-3xl 2xl:text-4xl 3xl:text-6xl font-black leading-none mb-1.5 2xl:mb-3 tabular-nums tracking-tighter">
            {formatNumber(stock.price)}
          </p>
          <div className="flex items-center justify-end gap-1.5">
            <span className={`text-[10px] md:text-xs 2xl:text-sm 3xl:text-base font-black px-2 py-0.5 2xl:px-3 2xl:py-1 rounded-lg inline-block ${isPositive ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {formatPercent(stock.change)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-2 2xl:mt-4">
        <div className="h-16 md:h-20 2xl:h-24 3xl:h-32 w-full">
          <Chart 
            id={`chart-${stock.symbol.replace(/[^a-zA-Z0-9]/g, '-')}`}
            data={stock.history}
            isPositive={isPositive}
          />
        </div>
      </div>

      {/* 底部详情提示 - 仅在较大屏幕显示 */}
      <div className="mt-6 2xl:mt-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 relative z-10">
        <span className="text-[9px] 2xl:text-[11px] font-black text-slate-300 uppercase tracking-widest">Real-time Analysis</span>
        <i className="fas fa-chevron-right text-[10px] text-amber-500 animate-bounce-x"></i>
      </div>

      {/* 极简背景水印 */}
      <div className="absolute -bottom-6 -right-6 text-8xl 2xl:text-[10rem] 3xl:text-[14rem] opacity-[0.015] group-hover:opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 pointer-events-none italic font-serif font-black select-none">
        {stock.symbol.slice(2)}
      </div>
      
      {/* 顶部高端装饰线 */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </div>
  );
};

export default React.memo(MarketCard);
