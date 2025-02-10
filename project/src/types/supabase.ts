export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'player' | 'scout' | 'club';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: 'player' | 'scout' | 'club';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'player' | 'scout' | 'club';
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          height: number | null;
          weight: number | null;
          position: string | null;
          preferred_foot: 'left' | 'right' | 'both' | null;
          location: string | null;
          birth_date: string | null;
          stats: Record<string, number>;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          player_id: string;
          title: string;
          description: string | null;
          date: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      scouts: {
        Row: {
          id: string;
          club: string | null;
          role: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          league: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}