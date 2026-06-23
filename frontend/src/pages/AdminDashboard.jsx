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

  // Data state (empty for now, to be fetched from API later)
  const [revenueData, setRevenueData] = useState([]);
  const [churnData, setChurnData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentOverview, setPaymentOverview] = useState([]);

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

            <div className="admin-profile">
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
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
              <div className="admin-card-title">Today's Orders</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">0% from yesterday</div>
            </div>
            
            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Revenue Today</div>
              <div className="admin-metric-value">₹0</div>
              <div className="admin-metric-trend trend-neutral">0% from yesterday</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Pending Orders</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">View all pending</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Customers</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">0% this month</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Low Stock Alerts</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-down">View all alerts</div>
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

            {/* Sales by Category Progress Bars */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Sales By Category</div>
                <select className="admin-dropdown">
                  <option>This Month</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {categoryData.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No data available</div>}
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
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No recent orders</td>
                    </tr>
                  )}
                  {recentOrders.map((order, idx) => (
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
                {lowStockAlerts.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '1rem 0' }}>No low stock alerts</div>}
                {lowStockAlerts.map((item, idx) => (
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
                {topProducts.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '1rem 0' }}>No products sold yet</div>}
                {topProducts.map((item, idx) => (
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
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>0%</div>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>Active Churn Rate</div>
                  </div>
                </div>
                <div style={{ width: '55%', paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>RISK COHORTS</div>
                  {churnData.length === 0 && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>No data available</div>}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 500, marginTop: '0.5rem' }}>
                0% from last 90 days
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
                {notifications.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No new notifications</div>}
                {notifications.map((notif, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: '#3b82f6', background: '#dbeafe', padding: '0.3rem', borderRadius: '50%' }}><Bell size={12} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>{notif.msg}</div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{notif.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Overview */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Payment Overview</div>
                <select className="admin-dropdown"><option>This Month</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem' }}>
                {paymentOverview.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No payment data</div>}
                {paymentOverview.map((item, idx) => (
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
