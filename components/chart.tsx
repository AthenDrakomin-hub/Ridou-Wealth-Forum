
import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface ChartProps {
  id: string;
  data: { time: string; value: number }[];
  isPositive: boolean;
}

const Chart: React.FC<ChartProps> = ({ id, data, isPositive }) => {
  // 使用 useMemo 缓存图表数据，仅在数据源变化时重新计算
  const memoizedData = useMemo(() => {
    return data;
  }, [data]);

  // 使用 useMemo 缓存样式配置
  const strokeColor = useMemo(() => {
    return isPositive ? '#ef4444' : '#10b981';
  }, [isPositive]);

  return (
    <div className="h-16 w-full relative overflow-hidden" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart 
          id={id}
          data={memoizedData}
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
    </div>
  );
};

export default Chart;
