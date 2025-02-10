import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';

interface AchievementFormData {
  title: string;
  description?: string;
  achievement_date?: string;
  achievement_type: 'award' | 'certification' | 'milestone';
  issuer?: string;
}

interface AchievementFormProps {
  playerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AchievementForm({ playerId, onSuccess, onCancel }: AchievementFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<AchievementFormData>();

  const onSubmit = async (data: AchievementFormData) => {
    setLoading(true);
    setError(null);

    try {
      await supabaseClient.addPlayerAchievement(playerId, {
        ...data,
        achievement_date: data.achievement_date || new Date().toISOString()
      });
      onSuccess();
    } catch (err) {
      console.error('Error adding achievement:', err);
      setError('Failed to add achievement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#0A1128] p-6 rounded-xl max-w-lg w-full relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-[#FF3366]" />
          <h2 className="text-xl font-bold">Add Achievement</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="e.g., Regional Championship Winner"
            />
            {errors.title && (
              <span className="text-sm text-red-500">{errors.title.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Type</label>
            <select
              {...register('achievement_type', { required: 'Type is required' })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            >
              <option value="">Select Type</option>
              <option value="award">Award</option>
              <option value="certification">Certification</option>
              <option value="milestone">Milestone</option>
            </select>
            {errors.achievement_type && (
              <span className="text-sm text-red-500">{errors.achievement_type.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="Describe your achievement..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Date</label>
            <input
              type="date"
              {...register('achievement_date')}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Issuer</label>
            <input
              {...register('issuer')}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="e.g., Regional Football Association"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-[#FF3366] text-white rounded-lg hover:bg-[#FF6B6B] transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Achievement'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}