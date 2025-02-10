import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Trophy } from 'lucide-react';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold mb-8 tracking-tight"
        >
          DISCOVER
          <br />
          <span className="gradient-text">FUTURE STARS</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/60 mb-12"
        >
          The ultimate platform connecting talented players with scouts and clubs worldwide.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#FF3366] text-white rounded-full text-lg font-medium hover:bg-[#FF6B6B] transition-colors flex items-center"
          >
            <Search className="w-5 h-5 mr-2" />
            Start Scouting
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 text-white rounded-full text-lg font-medium hover:bg-white/20 transition-colors flex items-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Create Player Profile
          </motion.button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
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
              <div className="text-3xl font-bold mb-2">{title}</div>
              <div className="text-white/60">{subtitle}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 floating">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </div>
      </div>
    </section>
  );
}