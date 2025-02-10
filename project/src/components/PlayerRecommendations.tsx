import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayerCard } from './PlayerCard';
import { usePlayersStore } from '../store/players';

interface PlayerRecommendationsProps {
  playerId: string;
}

export function PlayerRecommendations({ playerId }: PlayerRecommendationsProps) {
  const { recommendations, loadingRecommendations, getSimilarPlayers } = usePlayersStore();

  React.useEffect(() => {
    getSimilarPlayers(playerId);
  }, [playerId, getSimilarPlayers]);

  if (loadingRecommendations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading recommendations...</div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No similar players found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Similar Players</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((player, index) => (
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
    </div>
  );
}