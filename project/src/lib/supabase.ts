import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'talent-scout' }
  },
  db: {
    schema: 'public'
  }
});

// Add a helper to handle Supabase errors consistently
export class SupabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
    public code?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Add a wrapper for Supabase calls with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors or validation errors
      if (error?.status === 401 || error?.status === 422) {
        throw new SupabaseError(
          error.message || 'Authentication error',
          error,
          error.code
        );
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw new SupabaseError(
    'Failed to connect to the server after multiple attempts',
    lastError
  );
}

// Add helper methods for common operations
export const supabaseClient = {
  async getProfile(userId: string) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },
  
  async updateProfile(userId: string, updates: any) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },
  
  async getPlayerProfile(userId: string) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          profiles (
            full_name,
            email,
            role
          )
        `)
        .eq('id', userId)
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },
  
  async updatePlayerProfile(userId: string, updates: any) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('players')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },

  async getPlayerAchievements(userId: string) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('player_id', userId)
        .order('achievement_date', { ascending: false });
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },

  async addPlayerAchievement(userId: string, achievement: any) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('player_achievements')
        .insert([{ ...achievement, player_id: userId }])
        .select()
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },

  async getPlayerVideos(userId: string) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('player_videos')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  },

  async addPlayerVideo(userId: string, video: any) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('player_videos')
        .insert([{ ...video, player_id: userId }])
        .select()
        .single();
        
      if (error) throw new SupabaseError(error.message, error, error.code);
      return data;
    });
  }
};