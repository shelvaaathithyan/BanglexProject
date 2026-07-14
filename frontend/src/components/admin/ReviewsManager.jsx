import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MessageSquare, Star, CheckCircle, XCircle, Trash2, Eye, X } from 'lucide-react';
import API_BASE from '../../config/api';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection & Drawer
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewReview, setViewReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE}/api/reviews/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const statsRes = await fetch(`${API_BASE}/api/reviews/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.ok) setReviews(await res.json());
      if (statsRes.ok) setAnalytics(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (viewReview && viewReview.id === id) {
          setViewReview({ ...viewReview, status });
        }
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (viewReview && viewReview.id === id) setViewReview(null);
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    
    let endpoint = '';
    let method = 'POST';
    let body = { ids: selectedIds };

    if (action === 'Approve' || action === 'Reject') {
      endpoint = '/bulk-status';
      body.status = action === 'Approve' ? 'Approved' : 'Rejected';
    } else if (action === 'Delete') {
      if (!window.confirm(`Permanently delete ${selectedIds.length} reviews?`)) return;
      endpoint = '/bulk-delete';
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reviews${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setSelectedIds([]);
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredReviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map(r => r.id));
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch = r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.productId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Reviews Management</h2>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
              <MessageSquare size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Reviews</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{analytics.total}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%' }}>
              <Star size={24} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Avg Rating (Appr.)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{analytics.averageRating}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '50%' }}>
              <Star size={24} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Pending</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{analytics.pending}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by customer or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {['All', 'Pending', 'Approved', 'Rejected', 'Hidden'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: statusFilter === status ? '#f1f5f9' : 'white', cursor: 'pointer', borderRight: status !== 'Hidden' ? '1px solid #e2e8f0' : 'none', fontWeight: statusFilter === status ? 500 : 400, color: statusFilter === status ? '#0f172a' : '#64748b' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '0.875rem', color: '#475569', marginRight: '0.5rem' }}>{selectedIds.length} selected:</span>
            <button onClick={() => handleBulkAction('Approve')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>Approve</button>
            <button onClick={() => handleBulkAction('Reject')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>Reject</button>
            <button onClick={() => handleBulkAction('Delete')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredReviews.length} onChange={selectAll} />
              </th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Product ID</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Rating</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Title</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No reviews found.</td></tr>
            ) : (
              filteredReviews.map(review => (
                <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <input type="checkbox" checked={selectedIds.includes(review.id)} onChange={() => toggleSelection(review.id)} />
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {review.customerName}
                      {review.verifiedPurchase ? <CheckCircle size={14} color="#10b981" title="Verified Purchase" /> : <span style={{color: '#94a3b8', fontSize: '0.75rem'}}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }} title={review.productId}>
                    {review.productId.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={14} fill={review.rating >= star ? '#f59e0b' : 'transparent'} color={review.rating >= star ? '#f59e0b' : '#cbd5e1'} />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#0f172a' }}>{review.title.length > 30 ? review.title.substring(0, 30) + '...' : review.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500,
                      backgroundColor: review.status === 'Approved' ? '#dcfce7' : review.status === 'Rejected' ? '#fee2e2' : review.status === 'Hidden' ? '#f1f5f9' : '#fef3c7',
                      color: review.status === 'Approved' ? '#16a34a' : review.status === 'Rejected' ? '#dc2626' : review.status === 'Hidden' ? '#64748b' : '#d97706'
                    }}>
                      {review.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setViewReview(review)} style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', color: '#64748b' }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Drawer */}
      <AnimatePresence>
        {viewReview && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 }}
              onClick={() => setViewReview(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', backgroundColor: 'white', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Review Details</h3>
                <button onClick={() => setViewReview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Customer</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#0f172a', fontWeight: 500 }}>
                    {viewReview.customerName}
                    {viewReview.verifiedPurchase && <CheckCircle size={16} color="#10b981" title="Verified Purchase" />}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Rating & Date</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={18} fill={viewReview.rating >= star ? '#f59e0b' : 'transparent'} color={viewReview.rating >= star ? '#f59e0b' : '#cbd5e1'} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {new Date(viewReview.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Review content</div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{viewReview.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{viewReview.review}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>System Metadata</div>
                  <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Status:</strong> <span style={{ color: viewReview.status === 'Approved' ? '#10b981' : viewReview.status === 'Rejected' ? '#ef4444' : '#d97706' }}>{viewReview.status}</span></div>
                    <div><strong>Product ID:</strong> <span style={{ userSelect: 'all', fontFamily: 'monospace' }}>{viewReview.productId}</span></div>
                    <div><strong>Order ID:</strong> <span style={{ userSelect: 'all', fontFamily: 'monospace' }}>{viewReview.orderId}</span></div>
                    <div><strong>User ID:</strong> <span style={{ userSelect: 'all', fontFamily: 'monospace' }}>{viewReview.userId}</span></div>
                    <div><strong>Review ID:</strong> <span style={{ userSelect: 'all', fontFamily: 'monospace' }}>{viewReview.id}</span></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
                <button onClick={() => handleStatusChange(viewReview.id, 'Approved')} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleStatusChange(viewReview.id, 'Rejected')} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', backgroundColor: '#f8fafc', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleStatusChange(viewReview.id, 'Hidden')} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                  Hide
                </button>
                <button onClick={() => handleDelete(viewReview.id)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'white', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={16} /> Permanent Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsManager;
