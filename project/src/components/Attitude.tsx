import React from 'react';
import { motion } from 'framer-motion';

const attitudes = [
  {
    number: '01',
    title: 'Innovation First',
    description: 'We push boundaries and challenge conventions to create unique digital experiences.'
  },
  {
    number: '02',
    title: 'Pixel Perfect',
    description: 'Every detail matters. We craft with precision and care for flawless execution.'
  },
  {
    number: '03',
    title: 'User Focused',
    description: 'We create intuitive experiences that engage and delight users.'
  }
];

export function Attitude() {
  return (
    <section id="attitude" className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-title mb-16"
        >
          OUR<br />
          <span className="gradient-text">ATTITUDE</span>
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {attitudes.map((attitude, index) => (
            <motion.div
              key={attitude.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="text-8xl font-bold text-white/10 absolute -top-10 -left-4">
                {attitude.number}
              </div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">{attitude.title}</h3>
              <p className="text-white/60">{attitude.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}