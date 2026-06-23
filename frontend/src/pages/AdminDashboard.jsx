import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Package, FolderOpen, Layers, ShoppingCart, CreditCard, 
  Archive, Users, Tag, Star, Radio, BarChart2, UsersRound, 
  Settings, FileText, Search, ExternalLink, Bell, CheckCircle, 
  ShoppingBag, HelpCircle, TrendingUp, TrendingDown, ArrowUpRight,
  ChevronRight, Heart
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Mock Data for Charts
  const revenueData = [
    { name: 'Jan', value: 10000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Apr', value: 24000 },
    { name: 'May', value: 38420 },
    { name: 'Jun', value: 42000 },
    { name: 'Jul', value: 48000 },
  ];

  const pipelineData = [
    { name: 'Molding Clay', value: 28, color: '#10b981' },
    { name: 'Kiln Firing', value: 26, color: '#f59e0b' },
    { name: 'Artisan Painting', value: 24, color: '#3b82f6' },
    { name: 'Packing', value: 22, color: '#8b5cf6' },
    { name: 'Shipped', value: 18, color: '#06b6d4' },
    { name: 'Delivered', value: 10, color: '#f43f5e' },
  ];

  const churnData = [
    { name: 'Low Risk', value: 642, color: '#10b981' },
    { name: 'Medium Risk', value: 406, color: '#f59e0b' },
    { name: 'High Risk', value: 198, color: '#ef4444' },
  ];

  const categoryData = [
    { name: 'Bangles', amount: '₹65,420', percent: 45, color: '#f43f5e' },
    { name: 'Terracotta Jewellery', amount: '₹42,180', percent: 29, color: '#f59e0b' },
    { name: 'Organisers & Decors', amount: '₹18,750', percent: 13, color: '#3b82f6' },
    { name: 'Gift Hampers', amount: '₹12,890', percent: 9, color: '#8b5cf6' },
    { name: 'Others', amount: '₹5,230', percent: 4, color: '#10b981' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="logo-accent">RaHa</span> Creations
          </div>
          <div className="admin-panel-text">Admin Panel</div>
        </div>

        <div className="admin-sidebar-content">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ marginBottom: '1.5rem', background: activeTab === 'dashboard' ? '#e11d48' : '#1e293b', color: 'white' }}
          >
            <div className="admin-nav-item-left">
              <Home size={18} /> Dashboard
            </div>
          </button>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Catalog</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Package size={18} /> Products</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><FolderOpen size={18} /> Categories</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Layers size={18} /> Services</div> <ChevronRight /></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Operations</div>
            <button className="admin-nav-item">
              <div className="admin-nav-item-left"><ShoppingCart size={18} /> Orders Pipeline</div>
              <span className="admin-nav-badge">6</span>
            </button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><CreditCard size={18} /> Payments Ledger</div></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Archive size={18} /> Inventory Control</div></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Customers & Marketing</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Users size={18} /> Customers Portal</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Tag size={18} /> Coupons & Referrals</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Star size={18} /> Reviews Management</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Radio size={18} /> Broadcast Notifications</div></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Analytics</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><BarChart2 size={18} /> Analytics & Reports</div> <ChevronRight /></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">System</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><UsersRound size={18} /> Users & Roles</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Settings size={18} /> Settings</div></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><FileText size={18} /> Activity Logs</div></button>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-help-icon"><HelpCircle size={18} /></div>
          <div className="admin-help-text">
            <div style={{ fontWeight: 600, color: '#f43f5e', fontSize: '0.8rem' }}>Need Help?</div>
            <div style={{ fontSize: '0.75rem' }}>Contact Support</div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search anything..." />
          </div>
          
          <div className="admin-header-right">
            <a href="/" className="admin-visit-store" target="_blank" rel="noreferrer">
              Visit Store <ExternalLink size={14} />
            </a>
            
            <div className="admin-notification">
              <Bell size={20} />
              <div className="admin-notification-badge">5</div>
            </div>

            <div className="admin-server-status">
              <div style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '50%', padding: '4px' }}>
                <CheckCircle size={12} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Server Status</div>
                <div style={{ color: '#16a34a' }}>Healthy</div>
              </div>
            </div>

            <div className="admin-profile">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
              <div className="admin-profile-info">
                <span className="admin-profile-name">Ananya R.</span>
                <span className="admin-profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="admin-content-scroll">
          
          {/* Top Metrics Row */}
          <div className="admin-metrics-grid">
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#f43f5e', background: '#ffe4e6' }}><ShoppingBag size={20} /></div>
              <div className="admin-card-title">Today's Orders</div>
              <div className="admin-metric-value">28</div>
              <div className="admin-metric-trend trend-up"><TrendingUp size={12} /> 12% from yesterday</div>
            </div>
            
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#8b5cf6', background: '#ede9fe' }}>₹</div>
              <div className="admin-card-title">Revenue Today</div>
              <div className="admin-metric-value">₹18,250</div>
              <div className="admin-metric-trend trend-up"><TrendingUp size={12} /> 15.6% from yesterday</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><Archive size={20} /></div>
              <div className="admin-card-title">Pending Orders</div>
              <div className="admin-metric-value">6</div>
              <div className="admin-metric-trend trend-neutral">View all pending</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#10b981', background: '#d1fae5' }}><Users size={20} /></div>
              <div className="admin-card-title">Customers</div>
              <div className="admin-metric-value">1,246</div>
              <div className="admin-metric-trend trend-up"><TrendingUp size={12} /> 8.4% this month</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#ef4444', background: '#fee2e2' }}><Package size={20} /></div>
              <div className="admin-card-title">Low Stock Alerts</div>
              <div className="admin-metric-value">12</div>
              <div className="admin-metric-trend trend-down">View all alerts</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ color: '#10b981', background: '#d1fae5' }}><CheckCircle size={20} /></div>
              <div className="admin-card-title">Server Health</div>
              <div className="admin-metric-value" style={{ color: '#10b981' }}>Healthy</div>
              <div className="admin-metric-trend" style={{ color: '#64748b' }}>All systems running</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="admin-charts-grid">
            {/* Revenue Line Chart */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Revenue Overview</div>
                <select className="admin-dropdown">
                  <option>This Year</option>
                </select>
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline Donut */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Orders Pipeline Overview</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <div style={{ width: '50%', height: '200px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} stroke="none" dataKey="value">
                        {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>128</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Total Orders</div>
                  </div>
                </div>
                <div style={{ width: '50%', paddingLeft: '1rem' }}>
                  {pipelineData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }}></div>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <div style={{ color: '#64748b' }}>{item.value} <span style={{ fontSize: '0.65rem' }}>({((item.value/128)*100).toFixed(1)}%)</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales by Category Progress Bars */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Sales By Category</div>
                <select className="admin-dropdown">
                  <option>This Month</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {categoryData.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                      <span style={{ color: '#64748b' }}>{cat.amount} <span style={{ fontWeight: 600 }}>{cat.percent}%</span></span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${cat.percent}%`, background: cat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="admin-tables-grid">
            {/* Recent Orders */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Recent Orders</div>
                <span className="view-all-link">View All Orders</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'RC2025-00129', name: 'Ananya R.', items: 3, amt: '₹1,196.00', status: 'Kiln Firing', color: '#f59e0b', bg: '#fef3c7', date: '20 May 2025' },
                    { id: 'RC2025-00128', name: 'Deepavali K.', items: 2, amt: '₹749.00', status: 'Molding Clay', color: '#10b981', bg: '#d1fae5', date: '20 May 2025' },
                    { id: 'RC2025-00127', name: 'Priya S.', items: 4, amt: '₹2,299.00', status: 'Artisan Painting', color: '#3b82f6', bg: '#dbeafe', date: '19 May 2025' },
                    { id: 'RC2025-00126', name: 'Kavya M.', items: 1, amt: '₹399.00', status: 'Packing', color: '#8b5cf6', bg: '#ede9fe', date: '19 May 2025' },
                    { id: 'RC2025-00125', name: 'Meera V.', items: 2, amt: '₹598.00', status: 'Shipped', color: '#06b6d4', bg: '#cffafe', date: '18 May 2025' },
                  ].map((order, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>
                        <div className="admin-avatar-cell">
                          <img src={`https://i.pravatar.cc/150?u=${idx}`} alt={order.name} />
                          {order.name}
                        </div>
                      </td>
                      <td>{order.items} items</td>
                      <td style={{ fontWeight: 600 }}>{order.amt}</td>
                      <td>
                        <span className="admin-status-pill" style={{ color: order.color, background: order.bg }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td style={{ textAlign: 'right', color: '#94a3b8', cursor: 'pointer' }}>⋮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alerts */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Low Stock Alerts</div>
                <span className="view-all-link">View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { name: 'Terracotta Floral Bangles', sub: 'Size 2.4', left: 3, reorder: 10, img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80' },
                  { name: 'Terracotta Necklace Set', sub: 'Premium', left: 2, reorder: 8, img: 'https://images.unsplash.com/photo-1599643478514-4a4204b41b8b?w=100&q=80' },
                  { name: 'Bangle Organizer Box', sub: 'Wooden', left: 4, reorder: 15, img: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=100&q=80' },
                  { name: 'Decorative Gift Tray', sub: 'Terracotta', left: 5, reorder: 12, img: 'https://images.unsplash.com/photo-1615486171448-4fb62c2f6d76?w=100&q=80' },
                ].map((item, idx) => (
                  <div className="admin-list-item" key={idx}>
                    <div className="admin-product-cell">
                      <img src={item.img} alt={item.name} />
                      <div className="admin-product-info">
                        <h4>{item.name}</h4>
                        <p>{item.sub}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Stock Left</div>
                      <div style={{ color: '#ef4444', fontWeight: 700 }}>{item.left}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Reorder Level</div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.reorder}</div>
                    </div>
                    <button className="btn-restock">Restock</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="admin-bottom-grid">
            {/* Top Selling Products */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Top Selling Products</div>
                <select className="admin-dropdown"><option>This Month</option></select>
              </div>
              <div>
                {[
                  { name: 'Terracotta Floral Bangles', sold: '245 Sold', price: '₹399.00', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80', rank: 1 },
                  { name: 'Beaded Terracotta Set', sold: '189 Sold', price: '₹1,299.00', img: 'https://images.unsplash.com/photo-1599643478514-4a4204b41b8b?w=100&q=80', rank: 2 },
                  { name: 'Terracotta Earrings', sold: '156 Sold', price: '₹149.00', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=80', rank: 3 },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#94a3b8' : '#cd7f32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>{item.rank}</div>
                      <img src={item.img} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                      <div className="admin-product-info">
                        <h4>{item.name}</h4>
                        <p>{item.sold}</p>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#0f172a' }}>{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Churn Analytics */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Customer Churn Analytics</div>
                <select className="admin-dropdown"><option>This 90 Days</option></select>
              </div>
              <div style={{ display: 'flex', height: '140px', alignItems: 'center' }}>
                <div style={{ width: '45%', height: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={churnData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} stroke="none" dataKey="value">
                        {churnData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>18%</div>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>Active Churn Rate</div>
                  </div>
                </div>
                <div style={{ width: '55%', paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>RISK COHORTS</div>
                  {churnData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }}></div>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.value} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.6rem' }}>({((item.value/1246)*100).toFixed(0)}%)</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#10b981', fontWeight: 500, marginTop: '0.5rem' }}>
                <TrendingDown size={12} /> 3% from last 90 days
              </div>
              <button style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}>
                Trigger Re-engagement Campaign
              </button>
            </div>

            {/* Today's Notifications */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Today's Notifications</div>
                <span className="view-all-link">View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#3b82f6', background: '#dbeafe', padding: '0.3rem', borderRadius: '50%' }}><ShoppingBag size={12} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>New order RC2025-00129 received</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>2 mins ago</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#f43f5e', background: '#ffe4e6', padding: '0.3rem', borderRadius: '50%' }}><CreditCard size={12} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>Payment received from Ananya R.</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>15 mins ago</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#f59e0b', background: '#fef3c7', padding: '0.3rem', borderRadius: '50%' }}><Archive size={12} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>Low stock alert for 3 products</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>32 mins ago</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#8b5cf6', background: '#ede9fe', padding: '0.3rem', borderRadius: '50%' }}><Star size={12} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>New review submitted for Bangles</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>1 hour ago</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#10b981', background: '#d1fae5', padding: '0.3rem', borderRadius: '50%' }}><Radio size={12} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>WhatsApp campaign sent successfully</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>2 hours ago</div>
                </div>
              </div>
            </div>

            {/* Payment Overview */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Payment Overview</div>
                <select className="admin-dropdown"><option>This Month</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem' }}>
                {[
                  { name: 'UPI Payments', amt: '₹32,650', percent: '64%', icon: <ArrowUpRight size={14} />, color: '#10b981', bg: '#d1fae5' },
                  { name: 'COD Payments', amt: '₹12,890', percent: '25%', icon: <Package size={14} />, color: '#f59e0b', bg: '#fef3c7' },
                  { name: 'Card Payments', amt: '₹4,780', percent: '9%', icon: <CreditCard size={14} />, color: '#3b82f6', bg: '#dbeafe' },
                  { name: 'Wallet Payments', amt: '₹1,230', percent: '2%', icon: <ShoppingBag size={14} />, color: '#f43f5e', bg: '#ffe4e6' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.4rem', borderRadius: '6px', color: item.color, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0f172a' }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{item.amt}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', width: '25px', textAlign: 'right' }}>{item.percent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>
            © 2025 RaHa Creations Admin Panel. All rights reserved. <span style={{ float: 'right' }}>Made with <Heart size={12} color="#f43f5e" fill="#f43f5e" style={{ display: 'inline', verticalAlign: 'middle' }} /> for handcrafted love</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
