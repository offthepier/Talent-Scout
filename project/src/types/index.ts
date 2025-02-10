export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  location: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  achievements: Achievement[];
  verified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  verified: boolean;
}

export interface Scout {
  id: string;
  name: string;
  club: string;
  role: string;
}