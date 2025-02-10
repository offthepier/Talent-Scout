import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type PlayerSearchFilters = {
  query?: string;
  position?: string;
  minAge?: number;
  maxAge?: number;
  location?: string;
};

export async function searchPlayers(filters: PlayerSearchFilters) {
  const { query, position, minAge, maxAge, location } = filters;
  
  const { data, error } = await supabase
    .rpc('search_players', {
      search_query: query || null,
      position_filter: position || null,
      min_age: minAge || null,
      max_age: maxAge || null,
      location_filter: location || null
    });

  if (error) throw error;
  return data;
}

export async function getPlayerProfile(id: string) {
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select(`
      *,
      profiles (
        full_name,
        email
      ),
      achievements (
        id,
        title,
        description,
        date,
        verified
      )
    `)
    .eq('id', id)
    .single();

  if (playerError) throw playerError;
  return player;
}

export async function updatePlayerProfile(id: string, data: Partial<Database['public']['Tables']['players']['Row']>) {
  const { error } = await supabase
    .from('players')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function addAchievement(playerId: string, achievement: {
  title: string;
  description?: string;
  date?: string;
}) {
  const { error } = await supabase
    .from('achievements')
    .insert([{ ...achievement, player_id: playerId }]);

  if (error) throw error;
}