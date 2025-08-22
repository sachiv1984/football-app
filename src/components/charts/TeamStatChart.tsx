// src/components/charts/TeamStatChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  color?: string;
}

interface TeamStatChartProps {
  title: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie';
  color?: string;
  showTrend?: boolean;
  height?: number;
  className?: string;
}

export const TeamStatChart: React.FC<TeamStatChartProps> = ({
  title,
  data,
  type = 'line',
  color = '#39FF14',
  showTrend = true,
  height = 200,
  className = ''
}) => {
  // Calculate trend
  const trend = React.useMemo(() => {
    if (!showTrend || data.length < 2) return null;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  }, [data, showTrend]);

  const pieColors = ['#39FF14', '#FFFF00', '#14B8A6', '#EF4444', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`${payload[0].dataKey}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
            {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
            dataKey="matchweek" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ value: 'Matchweek', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            reversed
            domain={[1, 20]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ value: 'Position', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="position" 
            stroke="#003366"
            strokeWidth={3}
            dot={{ fill: '#003366', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: '#003366', strokeWidth: 2, fill: '#fff' }}
          />
          
          {/* Zone indicators */}
          <defs>
            <linearGradient id="topFour" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.1}/>
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="relegation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.0}/>
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>

      {/* Position zones legend */}
      <div className="flex justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Champions League (1-4)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Europa League (5-7)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Relegation (18-20)</span>
        </div>
      </div>
    </div>
  );
};
