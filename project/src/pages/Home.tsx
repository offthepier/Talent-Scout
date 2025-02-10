import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 pt-32">
        <div className="absolute inset-0 bg-[#0A1128]/80 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 tracking-tight"
          >
            <span className="block text-white mb-4">DISCOVER</span>
            <span className="gradient-text">FUTURE STARS</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 mb-12"
          >
            The ultimate platform connecting talented players with scouts and clubs worldwide.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link to="/players">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#FF3366] text-white rounded-full text-lg font-medium hover:bg-[#FF6B6B] transition-colors flex items-center shadow-lg shadow-[#FF3366]/20"
              >
                <Search className="w-5 h-5 mr-2" />
                Start Scouting
              </motion.button>
            </Link>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 text-white rounded-full text-lg font-medium hover:bg-white/20 transition-colors flex items-center backdrop-blur-sm"
              >
                <Star className="w-5 h-5 mr-2" />
                Create Player Profile
              </motion.button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Users, title: '10,000+', subtitle: 'Active Players' },
              { icon: Search, title: '500+', subtitle: 'Professional Scouts' },
              { icon: Trophy, title: '1,000+', subtitle: 'Success Stories' }
            ].map(({ icon: Icon, title, subtitle }, index) => (
              <motion.div
                key={subtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + (index * 0.1) }}
                className="flex flex-col items-center"
              >
                <Icon className="w-8 h-8 mb-4 text-[#FF3366]" />
                <div className="text-3xl font-bold mb-2 text-white">{title}</div>
                <div className="text-white/60">{subtitle}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Why Choose <span className="gradient-text">TalentScout</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Advanced Analytics',
                description: 'Get detailed performance metrics and AI-driven insights.',
                icon: Trophy
              },
              {
                title: 'Global Network',
                description: 'Connect with scouts and clubs from around the world.',
                icon: Users
              },
              {
                title: 'Verified Profiles',
                description: 'Trust in verified statistics and achievements.',
                icon: Star
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-2xl"
              >
                <feature.icon className="w-10 h-10 text-[#FF3366] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}