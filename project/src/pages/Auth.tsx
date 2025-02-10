import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/auth';

interface AuthFormData {
  email: string;
  password: string;
  role?: 'player' | 'scout' | 'club';
}

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isSignUp) {
        await signUp(data.email, data.password, data.role!);
      } else {
        await signIn(data.email, data.password);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <h2 className="text-4xl font-bold mb-8 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              {...register('email', { required: true })}
              type="email"
              placeholder="Email"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">Email is required</span>
            )}
          </div>

          <div>
            <input
              {...register('password', { required: true })}
              type="password"
              placeholder="Password"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">Password is required</span>
            )}
          </div>

          {isSignUp && (
            <div>
              <select
                {...register('role', { required: isSignUp })}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
              >
                <option value="">Select Role</option>
                <option value="player">Player</option>
                <option value="scout">Scout</option>
                <option value="club">Club</option>
              </select>
              {errors.role && (
                <span className="text-red-500 text-sm">Role is required</span>
              )}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-8 py-4 bg-[#FF3366] text-white rounded-lg text-lg font-medium hover:bg-[#FF6B6B] transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}