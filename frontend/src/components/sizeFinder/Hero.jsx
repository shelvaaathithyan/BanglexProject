import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="sf-hero">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sf-hero-title"
      >
        Find Your Perfect Bangle Size
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="sf-hero-subtitle"
      >
        Let our AI analyze your hand and recommend the perfect bangle size in just a few seconds.<br />
        <span className="sf-hero-highlight">No measurements. No guessing. No data stored.</span>
      </motion.p>
    </div>
  );
};

export default Hero;
