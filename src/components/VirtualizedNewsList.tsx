import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  const parentRef = React.useRef<HTMLDivElement>(null);

  // 使用TanStack Virtual的useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: news.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

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

  return (
    <div ref={parentRef} style={{ height: `${height}px`, overflow: 'auto' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <NewsItemRow 
              item={news[virtualItem.index]} 
              style={{}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(VirtualizedNewsList);