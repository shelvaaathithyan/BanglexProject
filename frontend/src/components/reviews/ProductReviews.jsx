import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import API_BASE from '../../config/api';

const ProductReviews = ({ productId }) => {
  const [data, setData] = useState({ average: 0, total: 0, distribution: { 1:0, 2:0, 3:0, 4:0, 5:0 }, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/reviews/product/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0', marginTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '2rem' }}>Customer Reviews</h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ width: '300px', height: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <div style={{ flex: 1, height: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: '2rem 0', color: '#dc2626' }}>Error loading reviews: {error}</div>;
  }

  const { average, total, distribution, reviews } = data;

  return (
    <div style={{ padding: '3rem 0', marginTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '2rem' }}>Customer Reviews</h2>
      
      {total === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>No Reviews Yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Be the first customer to share your experience.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Analytics Summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px' }}>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{average}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '0.5rem 0' }}>
                {[1,2,3,4,5].map(star => (
                  <Star key={star} size={20} fill={average >= star ? '#f59e0b' : (average >= star - 0.5 ? '#f59e0b' : 'transparent')} color={average >= star - 0.5 ? '#f59e0b' : '#cbd5e1'} />
                ))}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Based on {total} Reviews</div>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              {[5,4,3,2,1].map(star => {
                const count = distribution[star] || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '40px', fontSize: '0.875rem', color: '#475569' }}>
                      {star} <Star size={12} fill="#94a3b8" color="#94a3b8" />
                    </div>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ height: '100%', backgroundColor: '#f59e0b', borderRadius: '99px' }} 
                      />
                    </div>
                    <div style={{ width: '30px', fontSize: '0.875rem', color: '#64748b', textAlign: 'right' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reviews.map(review => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>{review.customerName}</h4>
                      {review.verifiedPurchase && <CheckCircle size={14} color="#10b981" />}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} fill={review.rating >= star ? '#f59e0b' : 'transparent'} color={review.rating >= star ? '#f59e0b' : '#cbd5e1'} />
                    ))}
                  </div>
                </div>
                <h5 style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>{review.title}</h5>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{review.review}</p>
              </motion.div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default ProductReviews;
