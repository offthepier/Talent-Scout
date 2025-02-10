import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Activity, TrendingUp, Award } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';

interface PerformanceData {
  date: string;
  minutes_played: number;
  distance_covered: number;
  sprint_speed: number;
  pass_accuracy: number;
  shots_on_target: number;
  goals: number;
  assists: number;
}

interface PerformanceAnalyticsProps {
  playerId: string;
}

export function PerformanceAnalytics({ playerId }: PerformanceAnalyticsProps) {
  const [performanceData, setPerformanceData] = React.useState<PerformanceData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'week' | 'month' | 'year'>('month');

  React.useEffect(() => {
    loadPerformanceData();
  }, [playerId, selectedPeriod]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate the start date based on selected period
      const now = new Date();
      let startDate = new Date();
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabaseClient.supabase
        .from('player_matches')
        .select('*')
        .eq('player_id', playerId)
        .gte('match_date', startDate.toISOString())
        .lte('match_date', now.toISOString())
        .order('match_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(match => ({
          date: new Date(match.match_date).toLocaleDateString(),
          minutes_played: match.minutes_played || 0,
          distance_covered: match.distance_covered || 0,
          sprint_speed: match.sprint_speed || 0,
          pass_accuracy: (match.performance_metrics?.pass_accuracy || 0),
          shots_on_target: match.shots_on_target || 0,
          goals: match.goals || 0,
          assists: match.assists || 0
        }));

        setPerformanceData(formattedData);
      } else {
        setPerformanceData([]);
      }
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError('Failed to load performance data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
        {error}
      </div>
    );
  }

  // If no data is available, show a message
  if (performanceData.length === 0) {
    return (
      <div className="glass p-8 rounded-xl text-center">
        <h3 className="text-xl font-semibold mb-4">No Performance Data Available</h3>
        <p className="text-white/60">
          No match data has been recorded for this player during the selected period.
        </p>
      </div>
    );
  }

  const averageStats = {
    goals: performanceData.reduce((acc, curr) => acc + curr.goals, 0) / performanceData.length || 0,
    assists: performanceData.reduce((acc, curr) => acc + curr.assists, 0) / performanceData.length || 0,
    pass_accuracy: performanceData.reduce((acc, curr) => acc + curr.pass_accuracy, 0) / performanceData.length || 0,
    shots_on_target: performanceData.reduce((acc, curr) => acc + curr.shots_on_target, 0) / performanceData.length || 0,
    distance_covered: performanceData.reduce((acc, curr) => acc + curr.distance_covered, 0) / performanceData.length || 0,
    sprint_speed: performanceData.reduce((acc, curr) => acc + curr.sprint_speed, 0) / performanceData.length || 0
  };

  const radarData = [
    {
      name: 'Goals',
      value: averageStats.goals * 20,
      fullMark: 100
    },
    {
      name: 'Assists',
      value: averageStats.assists * 20,
      fullMark: 100
    },
    {
      name: 'Pass Accuracy',
      value: averageStats.pass_accuracy,
      fullMark: 100
    },
    {
      name: 'Shots',
      value: averageStats.shots_on_target * 10,
      fullMark: 100
    },
    {
      name: 'Distance',
      value: (averageStats.distance_covered / 15) * 100,
      fullMark: 100
    },
    {
      name: 'Speed',
      value: (averageStats.sprint_speed / 35) * 100,
      fullMark: 100
    }
  ];

  return (
    <div className="space-y-8">
      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-[#FF3366] text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-[#FF3366]" />
            <h3 className="font-semibold">Match Performance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-1">Goals per Game</div>
              <div className="text-2xl font-bold">{averageStats.goals.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Assists per Game</div>
              <div className="text-2xl font-bold">{averageStats.assists.toFixed(2)}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#FF3366]" />
            <h3 className="font-semibold">Physical Stats</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-1">Avg Distance (km)</div>
              <div className="text-2xl font-bold">{averageStats.distance_covered.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Top Speed (km/h)</div>
              <div className="text-2xl font-bold">{averageStats.sprint_speed.toFixed(1)}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-[#FF3366]" />
            <h3 className="font-semibold">Technical Stats</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-1">Pass Accuracy</div>
              <div className="text-2xl font-bold">{averageStats.pass_accuracy.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Shots on Target</div>
              <div className="text-2xl font-bold">{averageStats.shots_on_target.toFixed(1)}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <div className="glass p-6 rounded-xl">
        <h3 className="font-semibold mb-6">Performance Trends</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A1128',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="goals"
                name="Goals"
                stroke="#FF3366"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="assists"
                name="Assists"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pass_accuracy"
                name="Pass Accuracy (%)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Radar */}
      <div className="glass p-6 rounded-xl">
        <h3 className="font-semibold mb-6">Skill Analysis</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.6)"
                tickLine={false}
              />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.6)" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#FF3366"
                fill="#FF3366"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}