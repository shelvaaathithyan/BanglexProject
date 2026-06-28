import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, ShoppingBag, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ result, onRetry }) => {
  const navigate = useNavigate();

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
    <motion.div 
      className="sf-result-container-v3"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-result-header-v3">
        <CheckCircle2 size={40} color="#10b981" />
        <h2>Scan Complete</h2>
      </div>

      <div className="sf-result-giant-size">
        <span className="sf-size-label-v3">Recommended Size</span>
        <div className="sf-size-value-v3">{result.size}</div>
      </div>

      <div className="sf-result-summary-box">
        <h3>Measurement Summary</h3>
        <div className="sf-summary-grid">
          <div className="sf-summary-item">
            <span className="sf-summary-label">Diameter</span>
            <span className="sf-summary-value">{result.innerDiameter} mm</span>
          </div>
          <div className="sf-summary-item">
            <span className="sf-summary-label">Circumference</span>
            <span className="sf-summary-value">{(result.innerDiameter * Math.PI).toFixed(1)} mm</span>
          </div>
          <div className="sf-summary-item">
            <span className="sf-summary-label">Fit Type</span>
            <span className="sf-summary-value">{result.fit || 'Comfort Fit'}</span>
          </div>
          <div className="sf-summary-item">
            <span className="sf-summary-label">Recommendation</span>
            <span className="sf-summary-value">Highly Accurate</span>
          </div>
        </div>
      </div>

      <div className="sf-result-actions-v3">
        <button className="sf-btn-primary sf-btn-shop" onClick={() => navigate('/category/glass-bangles')}>
          <ShoppingBag size={20} /> Shop Size {result.size}
        </button>
        <button className="sf-btn-secondary" onClick={onRetry}>
          <RotateCcw size={18} /> Scan Again
        </button>
      </div>
    </motion.div>
  );
};

export default ResultCard;
