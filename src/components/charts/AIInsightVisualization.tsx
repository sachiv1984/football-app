// src/components/charts/AIInsightVisualization.tsx
interface AIInsightData {
  market: string;
  confidence: number;
  probability: number;
  odds: number;
  trend: 'up' | 'down' | 'stable';
}

interface AIInsightVisualizationProps {
  insights: AIInsightData[];
  className?: string;
}

export const AIInsightVisualization: React.FC<AIInsightVisualizationProps> = ({
  insights,
  className = ''
}) => {
  const confidenceData = insights.map(insight => ({
    name: insight.market,
    confidence: insight.confidence,
    probability: insight.probability,
    fill: insight.confidence >= 80 ? '#10B981' : 
          insight.confidence >= 60 ? '#F59E0B' : '#EF4444'
  }));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Betting Insights</h3>
      
      {/* Confidence Distribution Chart */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Confidence Distribution</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={confidenceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Confidence %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, 'Confidence']}
              labelFormatter={(label) => `Market: ${label}`}
            />
            <Bar 
              dataKey="confidence" 
              radius={[4, 4, 0, 0]}
              fill={(entry) => entry.fill}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Insights */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Market Analysis</h4>
        {insights.map((insight, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">{insight.market}</h5>
              <div className="flex items-center space-x-2">
                {insight.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {insight.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                {insight.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {insight.confidence}% confidence
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Probability:</span>
                <div className="font-semibold">{insight.probability}%</div>
              </div>
              <div>
                <span className="text-gray-500">Odds:</span>
                <div className="font-semibold">{insight.odds.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-500">Value:</span>
                <div className={`font-semibold ${
                  (insight.probability / 100) * insight.odds > 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(((insight.probability / 100) * insight.odds - 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Confidence bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Confidence Level</span>
                <span>{insight.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    insight.confidence >= 80 ? 'bg-green-500' : 
                    insight.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${insight.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        )}

        {type === 'bar' && (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ label, value }) => `${label}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
