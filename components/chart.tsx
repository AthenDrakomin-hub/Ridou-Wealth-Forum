
import React, { useMemo } from 'react';
import { LineChart, Line, YAxis, Tooltip } from 'recharts';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';

interface ChartProps {
  id: string;
  data: { time: string; value: number }[];
  isPositive: boolean;
}

const Chart: React.FC<ChartProps> = ({ id, data, isPositive }) => {
  // 缓存线条颜色样式
  const strokeColor = useMemo(() => {
    return isPositive ? '#ef4444' : '#10b981';
  }, [isPositive]);

  // 核心性能优化：使用 useMemo 钩子对 LineChart 组件进行包裹
  // 确保只有在 data, strokeColor 或 id 发生实际变化时才重新执行图表的渲染逻辑
  // 这在列表滚动或高频数据刷新时能显著减少 CPU 占用
  const chartElement = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart 
        id={id} // 为图表组件添加唯一的 id 属性，利于 Recharts 内部引用和 SVG 标识
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
        <Tooltip 
          hideContent={true}
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          isAnimationActive={true}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  ), [data, strokeColor, id]);

  return (
    <div className="h-16 w-full relative overflow-hidden" style={{ minWidth: 0 }}>
      {chartElement}
    </div>
  );
};

export default React.memo(Chart);