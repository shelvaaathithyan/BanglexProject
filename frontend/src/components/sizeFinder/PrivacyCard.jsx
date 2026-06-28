import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyCard = () => {
  return (
    <motion.div 
      className="sf-privacy-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-privacy-header">
        <ShieldCheck size={20} color="#d4af37" />
        <h4>Your privacy matters.</h4>
      </div>
      <ul className="sf-privacy-list">
        <li>• No photos captured</li>
        <li>• No uploads</li>
        <li>• No storage</li>
        <li>• No tracking</li>
        <li>• Camera closes automatically after scanning</li>
      </ul>
    </motion.div>
  );
};

export default PrivacyCard;
