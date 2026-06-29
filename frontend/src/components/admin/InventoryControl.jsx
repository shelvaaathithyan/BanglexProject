import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Package, AlertTriangle, CheckCircle, Clock,
  ChevronLeft, ChevronRight, RefreshCw, X, TrendingUp, Edit, History, Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import API_BASE from '../../config/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']; // Green, Amber, Red, Gray

export default function InventoryControl() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Table State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  
  // Modals
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({ productId: '', productName: '', currentStock: 0, newStock: 0, reason: '' });
  const [adjusting, setAdjusting] = useState(false);

  // Real-time Reservations (Updates every 30s)
  const [expiringReservations, setExpiringReservations] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const fetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/inventory/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const data = await res.json();
      setSummary(data.summary);
      setExpiringReservations(data.expiringReservations || []);
      setRecentMovements(data.recentMovements || []);
      setAlerts(data.alerts || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({
        page,
        limit,
        search: searchQuery,
        sort: sortField,
        order: sortOrder
      });
      const res = await fetch(`${API_BASE}/api/inventory/products?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalRecords(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    fetchDashboard();
    fetchProducts();
    
    // Poll dashboard every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchProducts]);

  const handleExportCSV = () => {
    // Basic CSV export for current products list
    if (products.length === 0) return;
    const headers = ['SKU', 'Name', 'Category', 'Stock', 'Reserved', 'Available', 'Sold'];
    const rows = products.map(p => [
      p.sku || 'N/A',
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.stock,
      p.reservedQuantity,
      p.availableQuantity,
      p.soldQuantity
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const openTimeline = async (productId) => {
    setSelectedProductId(productId);
    setIsTimelineOpen(true);
    setLoadingTimeline(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/inventory/movements/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimelineData(data);
      }
    } catch (err) {
      console.error('Timeline error:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const openAdjust = (product) => {
    setAdjustData({
      productId: product._id,
      productName: product.name,
      currentStock: product.stock,
      newStock: product.stock,
      reason: ''
    });
    setIsAdjustOpen(true);
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    setAdjusting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: adjustData.productId,
          newStock: Number(adjustData.newStock),
          reason: adjustData.reason
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to adjust stock');
      }
      setIsAdjustOpen(false);
      fetchDashboard();
      fetchProducts();
      alert('Stock adjusted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  // Local Countdown Component
  const Countdown = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
      }, 1000);
      return () => clearInterval(timer);
    }, [expiresAt]);

    const m = Math.floor(timeLeft / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);
    return <span style={{ color: timeLeft < 60000 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{m}m {s}s</span>;
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Failed to Load Dashboard</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{error}</p>
        <button 
          onClick={() => { setError(null); fetchDashboard(); fetchProducts(); }}
          style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: '2rem' }}>
        {/* Skeleton Loaders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: '120px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <div style={{ height: '400px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  // Chart data formatting
  const healthData = [
    { name: 'In Stock (>10)', value: summary.totalProducts - summary.lowStockItems, color: COLORS[0] },
    { name: 'Low Stock (1-10)', value: summary.lowStockItems, color: COLORS[1] },
    { name: 'Out of Stock (0)', value: alerts.filter(a => a.type === 'error').length, color: COLORS[2] }
  ].filter(d => d.value > 0);

  return (
    <div className="admin-tab-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Inventory Control</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Manage stock, reservations, and monitor warehouse health</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchDashboard}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <SummaryCard title="Total Products" value={summary.totalProducts} icon={<Package size={24} color="#3b82f6" />} bg="#eff6ff" />
        <SummaryCard title="Total Physical Stock" value={summary.totalStock} icon={<TrendingUp size={24} color="#10b981" />} bg="#ecfdf5" />
        <SummaryCard title="Reserved Stock" value={summary.reservedStock} icon={<Clock size={24} color="#f59e0b" />} bg="#fffbeb" />
        <SummaryCard title="Low Stock Items" value={summary.lowStockItems} icon={<AlertTriangle size={24} color="#ef4444" />} bg="#fef2f2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        {/* Main Content - Products Table */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Stock Overview</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search SKU or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', width: '250px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Product</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>SKU</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Physical</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Reserved</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Available</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</td></tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No products found in inventory.</p>
                    </td>
                  </tr>
                ) : (
                  products.map(product => {
                    let statusColor = '#10b981'; // Green
                    let statusText = 'In Stock';
                    let statusBg = '#d1fae5';
                    if (product.stock === 0) { statusColor = '#ef4444'; statusText = 'Out of Stock'; statusBg = '#fee2e2'; }
                    else if (product.stock <= 3) { statusColor = '#ef4444'; statusText = 'Critical'; statusBg = '#fee2e2'; }
                    else if (product.stock <= 10) { statusColor = '#f59e0b'; statusText = 'Low Stock'; statusBg = '#fef3c7'; }

                    return (
                      <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {product.images && product.images[0] ? (
                              <img src={product.images[0].replace(/\\/g, '/')} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} color="#94a3b8" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.9rem' }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>{product.sku || '-'}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{product.stock}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#f59e0b', fontWeight: 500 }}>{product.reservedQuantity}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: product.availableQuantity > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                          {product.availableQuantity}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: statusBg, color: statusColor }}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => openAdjust(product)} style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#3b82f6' }} title="Adjust Stock">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => openTimeline(product._id)} style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#8b5cf6' }} title="View Timeline">
                              <History size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Showing {Math.min((page - 1) * limit + 1, totalRecords)} to {Math.min(page * limit, totalRecords)} of {totalRecords} records
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={page === totalPages || totalPages === 0} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages || totalPages === 0 ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Health Chart */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Stock Health</h3>
            {healthData.length > 0 ? (
              <>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {healthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  {healthData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
                        <span style={{ color: '#475569', fontWeight: 500 }}>{entry.name}</span>
                      </div>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>No health data available.</p>
            )}
          </div>

          {/* Expiring Reservations */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f59e0b" /> Expiring Soon
            </h3>
            {expiringReservations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expiringReservations.map(res => (
                  <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#92400e' }}>{res.product?.name || 'Unknown'} (x{res.quantity})</div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309' }}>User: {res.user?.name || 'Guest'}</div>
                    </div>
                    <Countdown expiresAt={res.expiresAt} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No reservations expiring within 5 minutes.</p>
            )}
          </div>

          {/* Recent Movements */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Recent Movements</h3>
            {recentMovements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentMovements.map(mov => {
                  let MovIcon = CheckCircle;
                  let movColor = '#10b981';
                  if (mov.type === 'SALE') { MovIcon = TrendingDown; movColor = '#3b82f6'; }
                  else if (mov.type === 'ADMIN_EDIT') { MovIcon = Edit; movColor = '#8b5cf6'; }
                  else if (mov.type === 'RESERVATION') { MovIcon = Clock; movColor = '#f59e0b'; }

                  return (
                    <div key={mov._id} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ padding: '8px', background: `${movColor}20`, borderRadius: '50%', height: 'fit-content' }}>
                        <MovIcon size={16} color={movColor} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                          {mov.type} - {mov.product?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Qty: {mov.quantity} • {new Date(mov.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>No recent activity.</p>
            )}
          </div>

        </div>
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Adjust Stock</h2>
              <button onClick={() => setIsAdjustOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>
            <form onSubmit={submitAdjust}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Product</label>
                <input type="text" value={adjustData.productName} disabled style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Current Stock</label>
                  <input type="number" value={adjustData.currentStock} disabled style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>New Stock</label>
                  <input type="number" min="0" value={adjustData.newStock} onChange={(e) => setAdjustData({...adjustData, newStock: e.target.value})} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Reason</label>
                <select value={adjustData.reason} onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
                  <option value="">Select a reason</option>
                  <option value="Physical count mismatch">Physical count mismatch</option>
                  <option value="Damaged goods">Damaged goods</option>
                  <option value="Supplier restock">Supplier restock</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAdjustOpen(false)} style={{ flex: 1, padding: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={adjusting} style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: adjusting ? 0.7 : 1 }}>
                  {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {isTimelineOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Inventory Timeline</h2>
              <button onClick={() => setIsTimelineOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
              {loadingTimeline ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Loading timeline...</p>
              ) : timelineData.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>No movements recorded for this product.</p>
              ) : (
                <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingLeft: '24px' }}>
                  {timelineData.map((mov, i) => (
                    <div key={mov._id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-33px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: mov.type === 'SALE' ? '#3b82f6' : mov.type === 'RESERVATION' ? '#f59e0b' : '#10b981', border: '4px solid white' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{mov.type}</div>
                      <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '4px' }}>
                        Quantity: {mov.quantity} {mov.oldStock !== undefined && `(${mov.oldStock} → ${mov.newStock})`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{new Date(mov.createdAt).toLocaleString()}</div>
                      {mov.reason && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>"{mov.reason}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ title, value, icon, bg }) {
  return (
    <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{value}</div>
      </div>
    </div>
  );
}
