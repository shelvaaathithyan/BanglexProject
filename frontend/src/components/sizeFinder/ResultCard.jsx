import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Star, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ result, onRetry }) => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleReturnHome = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/home');
    }, 400);
  };

  const renderStars = (stars) => {
    const elements = [];
    for (let i = 1; i <= 5; i++) {
      elements.push(
        <Star 
          key={i} 
          size={16} 
          fill={i <= stars ? "#d4af37" : "none"} 
          color={i <= stars ? "#d4af37" : "#cbd5e1"} 
        />
      );
    }
    return elements;
  };

  const getQualityText = (stars) => {
    if (stars === 5) return "Excellent Match";
    if (stars === 4) return "Very Good Match";
    if (stars === 3) return "Good Match";
    return "Fair Match";
  };

  return (
    <div className="sf-result-container-v4">
      <div className="sf-result-left-v4">
        {/* Success Animation */}
        <motion.div 
          className="sf-success-anim-v4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 size={56} color="#10b981" />
        </motion.div>

        <motion.h2 
          className="sf-heading-acme sf-result-heading-v4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Scan Complete
        </motion.h2>

        {/* Premium Recommendation Panel */}
        <motion.div 
          className="sf-recommendation-panel-v4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="sf-rp-glow"></div>
          <span className="sf-rp-label">Recommended Size</span>
          <div className="sf-rp-value">{result.size}</div>
        </motion.div>
      </div>

      <div className="sf-result-right-v4">

      {/* Metric Grid (Apple Health Style) */}
      <motion.div 
        className="sf-metric-grid-v4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="sf-metric-tile-v4">
          <span className="sf-tile-label">Diameter</span>
          <span className="sf-tile-value">{result.innerDiameter}<small>mm</small></span>
        </div>
        <div className="sf-metric-tile-v4">
          <span className="sf-tile-label">Circumference</span>
          <span className="sf-tile-value">{(result.innerDiameter * Math.PI).toFixed(1)}<small>mm</small></span>
        </div>
        <div className="sf-metric-tile-v4">
          <span className="sf-tile-label">Fit</span>
          <span className="sf-tile-value">{result.fit || 'Comfort'}</span>
        </div>
        <div className="sf-metric-tile-v4">
          <span className="sf-tile-label">Accuracy</span>
          <span className="sf-tile-value">98<small>%</small></span>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        className="sf-result-actions-v4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button className="sf-btn-primary sf-btn-shop-v4" onClick={handleReturnHome}>
          Return to home
        </button>
        <button className="sf-btn-secondary sf-btn-retry-v4" onClick={onRetry}>
          <RotateCcw size={18} /> Scan Again
        </button>
      </motion.div>
      </div>

      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#FAFAFA', // Assuming var(--bg-color) is light
              zIndex: 9999
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultCard;
