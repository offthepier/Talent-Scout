import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Ruler, Weight, Award, MessageSquare, LineChart as ChartLineUp } from 'lucide-react';
import { usePlayersStore } from '../store/players';
import { useAuthStore } from '../store/auth';
import { ChatSystem } from '../components/ChatSystem';
import { PerformanceAnalytics } from '../components/PerformanceAnalytics';
import { PlayerRecommendations } from '../components/PlayerRecommendations';

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const { getPlayerProfile, loading, error } = usePlayersStore();
  const { user } = useAuthStore();
  const [player, setPlayer] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'analytics' | 'chat'>('overview');

  React.useEffect(() => {
    if (id) {
      getPlayerProfile(id)
        .then(setPlayer)
        .catch(console.error);
    }
  }, [id, getPlayerProfile]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-white/60">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-white/60">Player not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-8 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.profiles.full_name}`}
                  alt={player.profiles.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{player.profiles.full_name}</h1>
                    <div className="flex flex-wrap gap-4 text-white/60">
                      {player.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {player.location}
                        </div>
                      )}
                      {player.birth_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date().getFullYear() - new Date(player.birth_date).getFullYear()} years
                        </div>
                      )}
                      {player.height && (
                        <div className="flex items-center">
                          <Ruler className="w-4 h-4 mr-1" />
                          {player.height}cm
                        </div>
                      )}
                      {player.weight && (
                        <div className="flex items-center">
                          <Weight className="w-4 h-4 mr-1" />
                          {player.weight}kg
                        </div>
                      )}
                    </div>
                  </div>
                  {user && user.id !== id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('chat')}
                      className="px-4 py-2 bg-[#FF3366] text-white rounded-lg flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message Player
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-white/10">
            {(['overview', 'analytics', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#FF3366] border-b-2 border-[#FF3366]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'analytics' && (
                  <span className="flex items-center gap-2">
                    <ChartLineUp className="w-4 h-4" />
                    Performance
                  </span>
                )}
                {tab === 'chat' && (
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="lg:col-span-2 glass p-8 rounded-2xl"
                >
                  <h2 className="text-2xl font-bold mb-6">Performance Stats</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(player.stats || {}).map(([key, value], index) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 capitalize">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Achievements */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="glass p-8 rounded-2xl"
                >
                  <h2 className="text-2xl font-bold mb-6">Achievements</h2>
                  <div className="space-y-4">
                    {player.achievements?.length > 0 ? (
                      player.achievements.map((achievement: any) => (
                        <div
                          key={achievement.id}
                          className="p-4 bg-white/5 rounded-lg space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <Award className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-medium">{achievement.title}</h3>
                              {achievement.description && (
                                <p className="text-sm text-white/60">
                                  {achievement.description}
                                </p>
                              )}
                              {achievement.date && (
                                <p className="text-sm text-white/40 mt-1">
                                  {new Date(achievement.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/60">No achievements yet</div>
                    )}
                  </div>
                </motion.div>

                {/* Similar Players */}
                <PlayerRecommendations playerId={id} />
              </>
            )}

            {activeTab === 'analytics' && (
              <PerformanceAnalytics playerId={id} />
            )}

            {activeTab === 'chat' && user && user.id !== id && (
              <ChatSystem
                receiverId={id}
                receiverName={player.profiles.full_name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}