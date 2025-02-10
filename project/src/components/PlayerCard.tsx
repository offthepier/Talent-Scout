import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  index: number;
}

export function PlayerCard({ player, index }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="gradient-border rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 bg-[#0A0A0A]"
    >
      <div className="relative group">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          src={`https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=800&q=80`}
          alt={player.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {player.verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs flex items-center shadow-lg"
          >
            <Star className="w-3 h-3 mr-1" />
            Verified
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between items-start mb-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-white">{player.name}</h3>
            <div className="text-white/60 text-sm flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {player.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-white">{player.age} years</div>
            <div className="text-sm text-white/60">{player.position}</div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(player.stats).map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                className="flex justify-between items-center"
              >
                <span className="text-white/60 capitalize">{key}</span>
                <div className="flex items-center">
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden mr-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + (i * 0.1) }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    />
                  </div>
                  <span className="font-medium w-8 text-white">{value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {player.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 pt-4 border-t border-white/10"
          >
            <div className="flex items-center text-sm text-white/60">
              <Award className="w-4 h-4 mr-1" />
              {player.achievements.length} Achievement{player.achievements.length !== 1 ? 's' : ''}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}