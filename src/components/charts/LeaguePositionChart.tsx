// src/components/charts/LeaguePositionChart.tsx
interface PositionData {
  matchweek: number;
  position: number;
  points: number;
}

interface LeaguePositionChartProps {
  teamName: string;
  teamLogo: string;
  data: PositionData[];
  className?: string;
}

export const LeaguePositionChart: React.FC<LeaguePositionChartProps> = ({
  teamName,
  teamLogo,
  data,
  className = ''
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">Matchweek {label}</p>
          <p className="text-sm text-blue-600">Position: {data.position}</p>
          <p className="text-sm text-green-600">Points: {data.points}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <img src={teamLogo} alt={teamName} className="w-8 h-8" />
        <h3 className="text-lg font-semibold text-gray-900">
          {teamName} - League Position Over Time
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
