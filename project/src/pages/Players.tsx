import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SearchFilters } from '../components/SearchFilters';
import { PlayerCard } from '../components/PlayerCard';
import { usePlayersStore } from '../store/players';

export function Players() {
  const { players, loading, error, searchPlayers } = usePlayersStore();

  React.useEffect(() => {
    searchPlayers();
  }, [searchPlayers]);

  return (
    <div className="min-h-screen py-24">
      <SearchFilters />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-8"
        >
          Discover Players
        </motion.h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white/60">Loading players...</div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No players found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {players.map((player, index) => (
              <Link key={player.player_id} to={`/players/${player.player_id}`}>
                <PlayerCard
                  player={{
                    id: player.player_id,
                    name: player.player_name,
                    position: player.player_position,
                    location: player.player_location,
                    age: player.player_age,
                    stats: player.player_stats,
                    verified: player.player_verified,
                    achievements: []
                  }}
                  index={index}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}