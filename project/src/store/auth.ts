import { create } from 'zustand';
import { supabase, supabaseClient, SupabaseError } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'player' | 'scout' | 'club';
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new SupabaseError(error.message, error, error.code);
    } catch (error) {
      if (error instanceof SupabaseError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to sign in' });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, role) => {
    try {
      set({ loading: true, error: null });
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw new SupabaseError(authError.message, authError, authError.code);
      if (!authData.user) throw new SupabaseError('Failed to create user');

      try {
        // Create the profile
        await supabaseClient.updateProfile(authData.user.id, {
          id: authData.user.id,
          email,
          role
        });

        // Create the role-specific record
        if (role === 'player') {
          await supabaseClient.updatePlayerProfile(authData.user.id, {
            id: authData.user.id,
            stats: {
              pace: 50,
              shooting: 50,
              passing: 50,
              dribbling: 50,
              defending: 50,
              physical: 50
            }
          });
        }
      } catch (error) {
        // If anything fails after auth user creation, clean up
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to sign up' });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw new SupabaseError(error.message, error, error.code);
      set({ user: null, profile: null });
    } catch (error) {
      if (error instanceof SupabaseError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to sign out' });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadUser: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          const profile = await supabaseClient.getProfile(user.id);
          set({ user, profile, loading: false });
        } catch (error) {
          // If profile doesn't exist, create it
          if (error instanceof SupabaseError && error.code === 'PGRST116') {
            const newProfile = await supabaseClient.updateProfile(user.id, {
              id: user.id,
              email: user.email,
              role: 'player' // Default to player role
            });
            set({ user, profile: newProfile, loading: false });
          } else {
            throw error;
          }
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ 
        user: null, 
        profile: null, 
        loading: false,
        error: error instanceof SupabaseError ? error.message : 'Failed to load user'
      });
    }
  },
}));