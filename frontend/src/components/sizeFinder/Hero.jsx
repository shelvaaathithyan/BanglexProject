import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Camera } from 'lucide-react';

const Hero = ({ setHasPermission }) => {
  return (
    <div className="sf-hero-new">
      <div className="sf-hero-content">
        <div className="sf-badge-top">
          <Sparkles size={14} color="#d4af37" /> AI POWERED
        </div>
        <h1 className="sf-title">
          Find Your<br />Perfect <span className="sf-highlight">Bangle Size</span>
        </h1>
        <p className="sf-subtitle">
          Let our AI analyze your hand and recommend the perfect bangle size in just a few seconds.
        </p>
        
        <div className="sf-badges">
          <span className="sf-badge"><CheckCircle size={14} color="#d4af37" /> No measurements</span>
          <span className="sf-badge"><CheckCircle size={14} color="#d4af37" /> No guessing</span>
          <span className="sf-badge"><CheckCircle size={14} color="#d4af37" /> No data stored</span>
        </div>

        <div className="sf-cta-wrapper">
          <button className="sf-btn-golden" onClick={() => setHasPermission('prompt')}>
            <Camera size={18} /> Start Size Scan
          </button>
          <span className="sf-cta-hint">✨ It's quick, easy & completely private</span>
        </div>
      </div>
      <div className="sf-hero-image-wrapper">
        {/* Decorative elements */}
        <div className="sf-blob sf-blob-1"></div>
        <div className="sf-blob sf-blob-2"></div>
        <img 
          src="https://images.unsplash.com/photo-1599643478524-fb66f7ca194a?q=80&w=1000&auto=format&fit=crop" 
          alt="AI Hand Measurement" 
          className="sf-hero-image"
        />
      </div>
    </div>
  );
};

export default Hero;
