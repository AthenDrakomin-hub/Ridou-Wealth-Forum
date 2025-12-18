
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
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {stock.name}
            <button 
              onClick={handleRefresh}
              className={`text-[10px] p-1 rounded-md transition-all ${
                isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-300 hover:text-emerald-500'
              }`}
            >
              🔄
            </button>
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">{stock.symbol}</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
          <p className="text-lg font-black leading-none mb-1">{formatNumber(stock.price)}</p>
          <p className="text-[10px] font-bold">
            {formatPercent(stock.change)}
          </p>
        </div>
      </div>
      
      <Chart 
        id={`chart-${stock.symbol.replace(/[^a-zA-Z0-9]/g, '-')}`}
        data={stock.history}
        isPositive={isPositive}
      />
    </div>
  );
};

export default React.memo(MarketCard);
