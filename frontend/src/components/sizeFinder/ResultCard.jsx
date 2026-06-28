import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, Star, RotateCcw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ result, onRetry }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const renderStars = (stars) => {
    const elements = [];
    for (let i = 1; i <= 5; i++) {
      elements.push(
        <Star 
          key={i} 
          size={18} 
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
    <motion.div 
      className="sf-result-container-v2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-result-header-v2">
        <CheckCircle2 size={48} color="#10b981" />
        <h2>Scan Complete</h2>
      </div>

      <div className="sf-size-display-v2">
        <span className="sf-size-label">Recommended Size</span>
        <div className="sf-size-value-giant">{result.size}</div>
        <div className="sf-size-quality">
           <div className="sf-stars-row">{renderStars(result.confidenceStars || 5)}</div>
           <span>{getQualityText(result.confidenceStars || 5)}</span>
        </div>
      </div>

      <hr className="sf-divider-subtle" />

      <div className="sf-result-metrics-grid">
        <div className="sf-rm-item">
          <span className="sf-rm-label">Diameter</span>
          <span className="sf-rm-value">{result.innerDiameter} mm</span>
        </div>
        <div className="sf-rm-item">
          <span className="sf-rm-label">Fit Profile</span>
          <span className="sf-rm-value">{result.fit || 'Comfort Fit'}</span>
        </div>
      </div>

      <hr className="sf-divider-subtle" />

      <div className="sf-result-actions-v2">
        <button className="sf-btn-primary sf-w-full" onClick={() => navigate('/category/glass-bangles')}>
          <ShoppingBag size={20} /> Shop Size {result.size}
        </button>
        
        <button className="sf-btn-secondary sf-w-full sf-mt-sm" onClick={onRetry}>
          <RotateCcw size={18} /> Scan Again
        </button>
      </div>

      <div className="sf-expandable-section sf-mt-xl">
        <button className="sf-expand-btn" onClick={() => setShowDetails(!showDetails)}>
          Measurement Details {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              className="sf-expand-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="sf-detail-row"><span>Lighting</span> <span>Optimal</span></div>
              <div className="sf-detail-row"><span>Pose</span> <span>Stable</span></div>
              <div className="sf-detail-row"><span>Calibration</span> <span>{result.confidenceStars === 5 ? 'High Accuracy' : 'Quick Scan'}</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ResultCard;
