import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Video, X } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';

interface VideoFormData {
  title: string;
  description?: string;
  url: string;
  video_type: 'highlight' | 'match' | 'training';
  thumbnail_url?: string;
}

interface VideoFormProps {
  playerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VideoForm({ playerId, onSuccess, onCancel }: VideoFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<VideoFormData>();
  const videoUrl = watch('url');

  // Extract video ID from YouTube/Vimeo URLs
  const getVideoEmbedUrl = (url: string) => {
    try {
      const videoUrl = new URL(url);
      
      // YouTube
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        const videoId = videoUrl.hostname.includes('youtu.be')
          ? videoUrl.pathname.slice(1)
          : new URLSearchParams(videoUrl.search).get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Vimeo
      if (videoUrl.hostname.includes('vimeo.com')) {
        const videoId = videoUrl.pathname.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
      }
      
      return url;
    } catch {
      return url;
    }
  };

  const onSubmit = async (data: VideoFormData) => {
    setLoading(true);
    setError(null);

    try {
      const embedUrl = getVideoEmbedUrl(data.url);
      
      await supabaseClient.addPlayerVideo(playerId, {
        ...data,
        url: embedUrl
      });
      onSuccess();
    } catch (err) {
      console.error('Error adding video:', err);
      setError('Failed to add video. Please try again.');
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
          <Video className="w-6 h-6 text-[#FF3366]" />
          <h2 className="text-xl font-bold">Add Video</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="e.g., Match Highlights vs. Team X"
            />
            {errors.title && (
              <span className="text-sm text-red-500">{errors.title.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Type</label>
            <select
              {...register('video_type', { required: 'Type is required' })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            >
              <option value="">Select Type</option>
              <option value="highlight">Highlight</option>
              <option value="match">Full Match</option>
              <option value="training">Training</option>
            </select>
            {errors.video_type && (
              <span className="text-sm text-red-500">{errors.video_type.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="Describe your video..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Video URL (YouTube/Vimeo)</label>
            <input
              {...register('url', { 
                required: 'Video URL is required',
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/,
                  message: 'Please enter a valid YouTube or Vimeo URL'
                }
              })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="e.g., https://youtube.com/watch?v=..."
            />
            {errors.url && (
              <span className="text-sm text-red-500">{errors.url.message}</span>
            )}
          </div>

          {videoUrl && !errors.url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getVideoEmbedUrl(videoUrl)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-1">Thumbnail URL (Optional)</label>
            <input
              {...register('thumbnail_url')}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              placeholder="e.g., https://example.com/thumbnail.jpg"
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
              {loading ? 'Adding...' : 'Add Video'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}