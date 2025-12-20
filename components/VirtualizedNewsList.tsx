import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { VariableSizeList } from 'react-window';
import { NewsItem } from '../types';
import { CATEGORY_STYLE } from '../utils/constants';

// 单个新闻项组件
const NewsItemRow: React.FC<{
  item: NewsItem;
  style: React.CSSProperties;
}> = React.memo(({ item, style }) => {
  return (
    <div 
      style={style}
      className="group cursor-pointer relative pl-4 border-l-4 border-slate-100 hover:border-amber-500 transition-all duration-300 py-3"
    >
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
  );
});

// 虚拟滚动新闻列表组件
const VirtualizedNewsList: React.FC<{
  news: NewsItem[];
  itemHeight?: number;
}> = ({ news, itemHeight = 80 }) => {
  const [height, setHeight] = useState(400);

  // 使用useCallback优化getItemSize函数
  const getItemSize = useCallback((index: number) => {
    // 可以根据内容动态调整高度
    return itemHeight;
  }, [itemHeight]);

  // 使用useMemo优化itemData
  const itemData = useMemo(() => news, [news]);

  useEffect(() => {
    // 动态计算容器高度
    const calculateHeight = () => {
      const container = document.querySelector('.news-container');
      if (container) {
        setHeight(container.clientHeight || 400);
      }
    };

    calculateHeight();
    
    // 使用ResizeObserver代替resize事件监听器（如果可用）
    let resizeObserver: ResizeObserver | null = null;
    const container = document.querySelector('.news-container');
    
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(calculateHeight);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', calculateHeight);
    }
    
    return () => {
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', calculateHeight);
      }
    };
  }, []);

  // 使用useCallback优化rowRenderer
  const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <NewsItemRow 
      item={itemData[index]} 
      style={style} 
    />
  ), [itemData]);

  return (
    <VariableSizeList
      height={height}
      itemCount={itemData.length}
      itemSize={getItemSize}
      width="100%"
      itemData={itemData}
      overscanCount={5} // 预渲染额外的行以提高滚动性能
    >
      {rowRenderer}
    </VariableSizeList>
  );
};

export default React.memo(VirtualizedNewsList);