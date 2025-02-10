import { create } from 'zustand';
import { searchPlayers, getPlayerProfile } from '../lib/api';
import { supabase } from '../lib/supabase';

interface Player {
  player_id: string;
  player_name: string;
  player_position: string;
  player_location: string;
  player_age: number;
  player_stats: Record<string, number>;
  player_verified: boolean;
  similarity_score: number;
}

interface PlayersState {
  players: Player[];
  loading: boolean;
  error: string | null;
  filters: {
    query: string;
    position: string;
    minAge: number;
    maxAge: number;
    location: string;
    minHeight: number;
    maxHeight: number;
    preferredFoot: string;
    minStats: Record<string, number>;
    sortBy: 'relevance' | 'age' | 'rating';
    similarTo?: string;
  };
  setFilters: (filters: Partial<PlayersState['filters']>) => void;
  searchPlayers: () => Promise<void>;
  getPlayerProfile: (id: string) => Promise<any>;
  getSimilarPlayers: (playerId: string) => Promise<void>;
  recommendations: Player[];
  loadingRecommendations: boolean;
}

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: [],
  loading: false,
  error: null,
  recommendations: [],
  loadingRecommendations: false,
  filters: {
    query: '',
    position: '',
    minAge: 0,
    maxAge: 100,
    location: '',
    minHeight: 0,
    maxHeight: 300,
    preferredFoot: '',
    minStats: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0
    },
    sortBy: 'relevance'
  },
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  searchPlayers: async () => {
    try {
      set({ loading: true, error: null });
      const players = await searchPlayers(get().filters);
      set({ players, loading: false });
    } catch (error) {
      console.error('Search error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search players', 
        loading: false 
      });
    }
  },
  getPlayerProfile: async (id) => {
    try {
      set({ loading: true, error: null });
      const profile = await getPlayerProfile(id);
      set({ loading: false });
      return profile;
    } catch (error) {
      console.error('Profile error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load profile', 
        loading: false 
      });
      throw error;
    }
  },
  getSimilarPlayers: async (playerId) => {
    try {
      set({ loadingRecommendations: true, error: null });
      
      // Get the current player's profile first
      const { data: currentPlayer } = await supabase
        .from('players')
        .select('position, stats')
        .eq('id', playerId)
        .single();

      if (!currentPlayer) {
        throw new Error('Player not found');
      }

      // Get players with similar position and stats
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          profiles!inner (
            full_name
          ),
          position,
          location,
          birth_date,
          stats,
          verified
        `)
        .eq('position', currentPlayer.position)
        .neq('id', playerId)
        .limit(10);

      if (error) throw error;

      if (!data) {
        set({ recommendations: [], loadingRecommendations: false });
        return;
      }

      // Calculate similarity scores and format the data
      const recommendations = data
        .map(player => ({
          player_id: player.id,
          player_name: player.profiles.full_name,
          player_position: player.position,
          player_location: player.location,
          player_age: player.birth_date ? 
            new Date().getFullYear() - new Date(player.birth_date).getFullYear() : 
            0,
          player_stats: player.stats,
          player_verified: player.verified,
          similarity_score: calculateSimilarity(currentPlayer.stats, player.stats)
        }))
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 3);

      set({ recommendations, loadingRecommendations: false });
    } catch (error) {
      console.error('Recommendations error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load recommendations',
        loadingRecommendations: false,
        recommendations: []
      });
    }
  }
}));

// Helper function to calculate similarity between two players' stats
function calculateSimilarity(stats1: Record<string, number>, stats2: Record<string, number>): number {
  const statKeys = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
  let totalDiff = 0;

  for (const key of statKeys) {
    const diff = Math.abs((stats1[key] || 0) - (stats2[key] || 0));
    totalDiff += diff;
  }

  // Convert difference to similarity score (0-1)
  const maxPossibleDiff = 100 * statKeys.length; // Maximum possible difference
  const similarity = 1 - (totalDiff / maxPossibleDiff);

  return similarity;
}