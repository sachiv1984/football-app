// src/components/charts/HeadToHeadChart.tsx
interface HeadToHeadData {
  team1: {
    name: string;
    logo: string;
    stats: Record<string, number>;
  };
  team2: {
    name: string;
    logo: string;
    stats: Record<string, number>;
  };
}

interface HeadToHeadChartProps {
  data: HeadToHeadData;
  statsToShow: string[];
  className?: string;
}

export const HeadToHeadChart: React.FC<HeadToHeadChartProps> = ({
  data,
  statsToShow,
  className = ''
}) => {
  const chartData = statsToShow.map(stat => ({
    stat,
    team1: data.team1.stats[stat] || 0,
    team2: data.team2.stats[stat] || 0
  }));

  const maxValue = Math.max(
    ...chartData.flatMap(item => [item.team1, item.team2])
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Head to Head Comparison</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-3">
            <img src={data.team1.logo} alt={data.team1.name} className="w-8 h-8" />
            <span className="font-medium">{data.team1.name}</span>
          </div>
          <div className="text-2xl font-bold text-gray-400">VS</div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">{data.team2.name}</span>
            <img src={data.team2.logo} alt={data.team2.name} className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {chartData.map((item) => (
          <div key={item.stat} className="space-y-2">
            <div className="text-center text-sm font-medium text-gray-600 capitalize">
              {item.stat.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Team 1 */}
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {item.team1}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-electric-yellow transition-all duration-500"
                    style={{ width: `${(item.team1 / maxValue) * 100}%` }}
                  />
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-deep-blue transition-all duration-500 ml-auto"
                    style={{ width: `${(item.team2 / maxValue) * 100}%` }}
                  />
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900">
                  {item.team2}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
