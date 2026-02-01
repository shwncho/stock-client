import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyPrice } from '../types';

interface ChartComponentProps {
  data: DailyPrice[];
  title: string;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, title }) => {
  // 최근 30개 데이터만 표시 (역순으로 정렬)
  const chartData = data.slice(0, 30).reverse();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="tradeDate"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toLocaleString('ko-KR');
              }
              return value;
            }}
            labelFormatter={(label) => `날짜: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="closePrice"
            stroke="#3b82f6"
            name="종가"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="openPrice"
            stroke="#10b981"
            name="시가"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="highPrice"
            stroke="#f59e0b"
            name="고가"
            dot={false}
            isAnimationActive={false}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="lowPrice"
            stroke="#ef4444"
            name="저가"
            dot={false}
            isAnimationActive={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};