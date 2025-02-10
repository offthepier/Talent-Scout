import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Award } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { AchievementForm } from './AchievementForm';
import { VideoForm } from './VideoForm';

interface PlayerProfileFormData {
  full_name: string;
  height: number;
  weight: number;
  position: string;
  preferred_foot: 'left' | 'right' | 'both';
  location: string;
  birth_date: string;
  bio: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
}

const defaultStats = {
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50
};

export function PlayerProfileForm() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlayerProfileFormData>();
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [videos, setVideos] = React.useState<any[]>([]);
  const [showAchievementForm, setShowAchievementForm] = React.useState(false);
  const [showVideoForm, setShowVideoForm] = React.useState(false);

  React.useEffect(() => {
    async function loadPlayerData() {
      if (!user) return;

      try {
        const [playerData, achievementsData, videosData] = await Promise.all([
          supabaseClient.getPlayerProfile(user.id),
          supabaseClient.getPlayerAchievements(user.id),
          supabaseClient.getPlayerVideos(user.id)
        ]);

        // Format the date to YYYY-MM-DD for the input
        const formattedDate = playerData?.birth_date 
          ? new Date(playerData.birth_date).toISOString().split('T')[0] 
          : '';
        
        reset({
          full_name: profile?.full_name || '',
          height: playerData?.height || undefined,
          weight: playerData?.weight || undefined,
          position: playerData?.position || '',
          preferred_foot: playerData?.preferred_foot || undefined,
          location: playerData?.location || '',
          birth_date: formattedDate,
          bio: playerData?.bio || '',
          stats: playerData?.stats || defaultStats
        });

        setAchievements(achievementsData || []);
        setVideos(videosData || []);
      } catch (error) {
        console.error('Error loading player data:', error);
        setMessage('Failed to load profile data. Please try again.');
      }
    }

    loadPlayerData();
  }, [user, profile, reset]);

  const onSubmit = async (data: PlayerProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    setMessage('');

    try {
      // Update profile
      await supabaseClient.updateProfile(user.id, { 
        full_name: data.full_name
      });

      // Update player details
      await supabaseClient.updatePlayerProfile(user.id, {
        height: data.height,
        weight: data.weight,
        position: data.position,
        preferred_foot: data.preferred_foot,
        location: data.location,
        birth_date: data.birth_date,
        bio: data.bio,
        stats: data.stats
      });

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementSuccess = () => {
    setShowAchievementForm(false);
    // Reload achievements
    if (user) {
      supabaseClient.getPlayerAchievements(user.id)
        .then(setAchievements)
        .catch(console.error);
    }
  };

  const handleVideoSuccess = () => {
    setShowVideoForm(false);
    // Reload videos
    if (user) {
      supabaseClient.getPlayerVideos(user.id)
        .then(setVideos)
        .catch(console.error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-8 rounded-2xl"
      >
        <h2 className="text-2xl font-bold mb-6">Player Profile</h2>
      
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-1">Full Name</label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              />
              {errors.full_name && (
                <span className="text-sm text-red-500">{errors.full_name.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Bio</label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Position</label>
              <select
                {...register('position', { required: 'Position is required' })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              >
                <option value="">Select Position</option>
                <option value="Forward">Forward</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
              </select>
              {errors.position && (
                <span className="text-sm text-red-500">{errors.position.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Height (cm)</label>
              <input
                type="number"
                {...register('height', { 
                  required: 'Height is required',
                  min: { value: 100, message: 'Height must be at least 100cm' },
                  max: { value: 250, message: 'Height must be less than 250cm' }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              />
              {errors.height && (
                <span className="text-sm text-red-500">{errors.height.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Weight (kg)</label>
              <input
                type="number"
                {...register('weight', { 
                  required: 'Weight is required',
                  min: { value: 30, message: 'Weight must be at least 30kg' },
                  max: { value: 150, message: 'Weight must be less than 150kg' }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              />
              {errors.weight && (
                <span className="text-sm text-red-500">{errors.weight.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Preferred Foot</label>
              <select
                {...register('preferred_foot', { required: 'Preferred foot is required' })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              >
                <option value="">Select Foot</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </select>
              {errors.preferred_foot && (
                <span className="text-sm text-red-500">{errors.preferred_foot.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Location</label>
              <input
                {...register('location', { required: 'Location is required' })}
                placeholder="City, Country"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              />
              {errors.location && (
                <span className="text-sm text-red-500">{errors.location.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Birth Date</label>
              <input
                type="date"
                {...register('birth_date', { required: 'Birth date is required' })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              />
              {errors.birth_date && (
                <span className="text-sm text-red-500">{errors.birth_date.message}</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Player Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((stat) => (
                <div key={stat}>
                  <label className="block text-sm text-white/60 mb-1 capitalize">{stat}</label>
                  <input
                    type="number"
                    {...register(`stats.${stat}` as any, { 
                      required: `${stat} is required`,
                      min: { value: 0, message: `${stat} must be between 0 and 100` },
                      max: { value: 100, message: `${stat} must be between 0 and 100` }
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                  />
                  {errors.stats?.[stat] && (
                    <span className="text-sm text-red-500">{errors.stats[stat].message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <motion.button
                type="button"
                onClick={() => setShowAchievementForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Add Achievement
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-white/60">{achievement.description}</p>
                      {achievement.date && (
                        <p className="text-sm text-white/40 mt-1">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {achievement.verified && (
                      <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                        Verified
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Videos</h3>
              <motion.button
                type="button"
                onClick={() => setShowVideoForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Add Video
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <h4 className="font-medium">{video.title}</h4>
                  <p className="text-sm text-white/60">{video.description}</p>
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={video.url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {message}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 bg-[#FF3366] text-white rounded-lg hover:bg-[#FF6B6B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showAchievementForm && user && (
          <AchievementForm
            playerId={user.id}
            onSuccess={handleAchievementSuccess}
            onCancel={() => setShowAchievementForm(false)}
          />
        )}

        {showVideoForm && user && (
          <VideoForm
            playerId={user.id}
            onSuccess={handleVideoSuccess}
            onCancel={() => setShowVideoForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}