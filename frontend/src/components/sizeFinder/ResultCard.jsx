import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, RotateCcw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ result, onRetry }) => {
  const navigate = useNavigate();

  const handleShop = () => {
    navigate(`/category/bangles?size=${result.size}`);
  };

  return (
    <motion.div 
      className="sf-result-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="sf-result-header">
        <CheckCircle size={48} color="#10b981" />
        <h2>Perfect!</h2>
        <p>We found your ideal size.</p>
      </div>

      <div className="sf-size-display">
        <span className="sf-size-label">Recommended Size</span>
        <span className="sf-size-value">{result.size}</span>
        <div className="sf-stars">
          ★★★★★ <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Excellent Match</span>
        </div>
      </div>

      <div className="sf-result-details">
        <div className="sf-detail-item">
          <span className="sf-detail-label">Estimated Inner Diameter</span>
          <span className="sf-detail-value">{result.innerDiameter} mm</span>
        </div>
        <div className="sf-detail-item">
          <span className="sf-detail-label">Fit</span>
          <span className="sf-detail-value">{result.fit}</span>
        </div>
        <div className="sf-detail-item">
          <span className="sf-detail-label">Confidence</span>
          <span className="sf-detail-value">{result.confidence}%</span>
        </div>
      </div>

      <div className="sf-result-actions">
        <button className="sf-btn-primary" onClick={handleShop}>
          <ShoppingBag size={18} /> Shop Size {result.size}
        </button>
        <button className="sf-btn-secondary" onClick={onRetry}>
          <RotateCcw size={18} /> Scan Again
        </button>
      </div>

      <div className="sf-disclaimer">
        <AlertCircle size={14} />
        <p>This recommendation is an AI-assisted estimate based on visible hand proportions. Actual fit may vary slightly depending on wrist shape, finger flexibility, and personal preference. For the highest accuracy, use the optional card calibration (coming soon).</p>
      </div>
    </motion.div>
  );
};

export default ResultCard;
