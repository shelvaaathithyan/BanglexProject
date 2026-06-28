import React from 'react';
import { Camera, Shield, Circle, Smartphone, Hand, Cpu, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const InfoCards = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="sf-info-section">
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="sf-section-title"
      >
        How It Works
      </motion.h3>
      
      <motion.div 
        className="sf-how-it-works-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="sf-step-card" variants={itemVariants}>
          <div className="sf-step-icon-wrap"><Hand size={24} /></div>
          <h4>1. Show Your Palm</h4>
          <p>Place your hand facing the camera.</p>
        </motion.div>
        <motion.div className="sf-step-card" variants={itemVariants}>
          <div className="sf-step-icon-wrap"><Smartphone size={24} /></div>
          <h4>2. Keep Steady</h4>
          <p>Hold your hand steady for a few seconds.</p>
        </motion.div>
        <motion.div className="sf-step-card" variants={itemVariants}>
          <div className="sf-step-icon-wrap"><Cpu size={24} /></div>
          <h4>3. AI Analysis</h4>
          <p>Our AI analyzes your hand landmarks locally.</p>
        </motion.div>
        <motion.div className="sf-step-card" variants={itemVariants}>
          <div className="sf-step-icon-wrap"><Zap size={24} /></div>
          <h4>4. Get Size</h4>
          <p>Receive your recommended Indian bangle size instantly.</p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="sf-features-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginTop: '3rem' }}
      >
        <motion.div className="sf-feature-card" variants={itemVariants}>
          <div className="sf-feature-icon-wrap"><Camera size={28} /></div>
          <h4>AI Hand Detection</h4>
          <p>Our AI detects your hand using advanced landmark recognition technology.</p>
        </motion.div>
        <motion.div className="sf-feature-card" variants={itemVariants}>
          <div className="sf-feature-icon-wrap"><Shield size={28} /></div>
          <h4>Privacy First</h4>
          <p>Everything runs directly inside your browser. Your images never leave your device.</p>
        </motion.div>
        <motion.div className="sf-feature-card" variants={itemVariants}>
          <div className="sf-feature-icon-wrap"><Circle size={28} /></div>
          <h4>Instant Recommendation</h4>
          <p>Receive the closest Indian bangle size within seconds.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InfoCards;
