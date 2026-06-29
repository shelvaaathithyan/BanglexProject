import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, CreditCard, CheckCircle, XCircle, RefreshCw, 
  ChevronLeft, ChevronRight, Eye, MoreVertical, X, TrendingUp, TrendingDown, Clock, HelpCircle,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, YAxis } from 'recharts';
import API_BASE from '../../config/api';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']; // Violet, Blue, Green, Amber, Red

export default function PaymentsLedger() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  
  // Table State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  
  // Drawer
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, searchQuery, statusFilter, methodFilter, gatewayFilter]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_BASE}/payments/analytics`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch payment stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const query = new URLSearchParams({
        page,
        limit,
        search: searchQuery,
        status: statusFilter,
        method: methodFilter,
        gateway: gatewayFilter
      });
      const res = await fetch(`${API_BASE}/payments?${query}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleExport = (format) => {
    // In a real app, this would trigger a backend export generation
    alert(`Exporting report as ${format}... (Feature coming soon)`);
  };

  const openDrawer = (payment) => {
    setSelectedPayment(payment);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedPayment(null), 300); // Wait for transition
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="payments-ledger" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Payments Ledger</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Track all payment transactions and settlements</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search transactions, orders, customers..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '300px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <button 
            onClick={() => handleExport('CSV')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {loadingStats ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading statistics...</div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Today's Collection */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Collection</div>
                <div style={{ background: '#f5f3ff', padding: '0.5rem', borderRadius: '8px', color: '#8b5cf6' }}>
                  <CreditCard size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {stats?.summary?.todayCollection > 0 ? formatCurrency(stats.summary.todayCollection) : '₹0.00'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: parseFloat(stats?.summary?.todayGrowth) >= 0 ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                {parseFloat(stats?.summary?.todayGrowth) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stats?.summary?.todayGrowth}% vs yesterday
              </div>
            </div>

            {/* Successful Payments */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Successful Payments</div>
                <div style={{ background: '#ecfdf5', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
                  <CheckCircle size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {stats?.summary?.successfulPayments || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>
                {stats?.summary?.successRate || '0.0'}% Success Rate
              </div>
            </div>

            {/* Failed Payments */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed Payments</div>
                <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '8px', color: '#ef4444' }}>
                  <XCircle size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {stats?.summary?.failedPayments || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>
                {stats?.summary?.failureRate || '0.0'}% Failure Rate
              </div>
            </div>

            {/* Total Refunded */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Refunded</div>
                <div style={{ background: '#fffbeb', padding: '0.5rem', borderRadius: '8px', color: '#f59e0b' }}>
                  <RefreshCw size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {stats?.summary?.totalRefunded > 0 ? formatCurrency(stats.summary.totalRefunded) : '₹0.00'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                {stats?.summary?.refundCount || 0} Refunds Processed
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION - CHARTS & LISTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Payment Method Distribution */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5rem' }}>
                Payment Method Distribution
              </div>
              {stats?.methodDistribution?.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '140px', height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.methodDistribution}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {stats.methodDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    {stats.methodDistribution.map((method, i) => (
                      <div key={method.method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                          <span style={{ color: '#334155', fontWeight: 500 }}>{method.method}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <span style={{ color: '#94a3b8' }}>{method.percentage}%</span>
                          <span style={{ color: '#1e293b', fontWeight: 600, width: '60px', textAlign: 'right' }}>{formatCurrency(method.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No payment method statistics available.
                </div>
              )}
            </div>

            {/* Payment Insights (Replaces Gateway Status) */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5rem' }}>
                Payment Insights
              </div>
              {stats?.summary?.successfulPayments > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Highest Transaction</span>
                    <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(stats?.insights?.highestTransaction || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Average Order Value</span>
                    <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(stats?.insights?.averageOrderValue || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Most Used Method</span>
                    <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>{stats?.insights?.mostUsedMethod || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Refund Percentage</span>
                    <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>{stats?.insights?.refundPercentage || '0.0'}%</span>
                  </div>
                </div>
              ) : (
                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No payment analytics available.
                </div>
              )}
            </div>

            {/* Recent Failed Payments */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recent Failed Payments
                </div>
                {stats?.recentFailed?.length > 0 && (
                  <button style={{ background: 'transparent', border: 'none', color: '#e11d48', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                    View All
                  </button>
                )}
              </div>
              
              {stats?.recentFailed?.length > 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.recentFailed.map(failed => (
                    <div key={failed.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ marginTop: '0.2rem', color: '#ef4444' }}><XCircle size={16} /></div>
                        <div>
                          <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>{failed.customerName}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{failed.failureReason}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(failed.amount)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          {new Date(failed.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button style={{ marginTop: 'auto', width: '100%', padding: '0.75rem', background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                    View All Failed Payments
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No failed payments.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TABLE FILTERS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <select 
          value={gatewayFilter}
          onChange={e => setGatewayFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', outline: 'none', background: 'white' }}>
          <option value="">All Gateways</option>
          <option value="Razorpay">Razorpay</option>
        </select>

        <select 
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', outline: 'none', background: 'white' }}>
          <option value="">All Payment Methods</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Net Banking">Net Banking</option>
          <option value="Wallet">Wallet</option>
          <option value="COD">COD</option>
        </select>

        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', outline: 'none', background: 'white' }}>
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

        {(statusFilter || methodFilter || gatewayFilter || searchQuery) && (
          <button 
            onClick={() => { setStatusFilter(''); setMethodFilter(''); setGatewayFilter(''); setSearchQuery(''); }}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} /> Clear
          </button>
        )}
      </div>

      {/* TRANSACTIONS TABLE */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Gateway</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Method</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date & Time</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingPayments ? (
              <tr><td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading transactions...</td></tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '4rem', textAlign: 'center' }}>
                  <div style={{ color: '#cbd5e1', marginBottom: '1rem' }}><FileText size={48} style={{ margin: '0 auto' }} /></div>
                  <div style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem' }}>No payment transactions found</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>When customers place orders, their payments will appear here.</div>
                </td>
              </tr>
            ) : (
              payments.map(payment => {
                let statusColor, statusBg;
                switch(payment.status) {
                  case 'Completed': statusColor = '#10b981'; statusBg = '#ecfdf5'; break;
                  case 'Pending': statusColor = '#f59e0b'; statusBg = '#fffbeb'; break;
                  case 'Failed': statusColor = '#ef4444'; statusBg = '#fef2f2'; break;
                  case 'Refunded': statusColor = '#8b5cf6'; statusBg = '#f5f3ff'; break;
                  default: statusColor = '#64748b'; statusBg = '#f1f5f9';
                }

                return (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{payment.order?.orderNumber || 'N/A'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#1e293b', fontWeight: 500, fontSize: '0.9rem' }}>{payment.user ? `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() : 'Guest'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{payment.user?.email || 'No email'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#334155', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '16px', height: '16px', background: payment.gateway === 'Razorpay' ? '#0b66c2' : '#94a3b8', borderRadius: '4px', transform: 'rotate(45deg)' }}></div>
                      {payment.gateway}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#1e293b', fontWeight: 500, fontSize: '0.9rem' }}>{payment.method}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: statusBg, color: statusColor, padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <button onClick={() => openDrawer(payment)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loadingPayments && payments.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRecords)} of {totalRecords} transactions
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                style={{ padding: '0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: page === 1 ? '#cbd5e1' : '#334155', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  style={{ padding: '0.5rem 0.8rem', background: page === i + 1 ? '#e11d48' : 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: page === i + 1 ? 'white' : '#334155', cursor: 'pointer', fontWeight: 500 }}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)}
                style={{ padding: '0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: page === totalPages ? '#cbd5e1' : '#334155', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER COMPONENT */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', transition: 'opacity 0.3s' }} onClick={closeDrawer}></div>
          <div style={{ width: '500px', background: 'white', height: '100%', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', position: 'relative', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s forwards' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Payment Details</h2>
              <button onClick={closeDrawer} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {selectedPayment && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(selectedPayment.amount)}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{new Date(selectedPayment.createdAt).toLocaleString()}</div>
                    </div>
                    <span style={{ 
                      background: selectedPayment.status === 'Completed' ? '#ecfdf5' : selectedPayment.status === 'Failed' ? '#fef2f2' : selectedPayment.status === 'Refunded' ? '#f5f3ff' : '#fffbeb', 
                      color: selectedPayment.status === 'Completed' ? '#10b981' : selectedPayment.status === 'Failed' ? '#ef4444' : selectedPayment.status === 'Refunded' ? '#8b5cf6' : '#f59e0b', 
                      padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 
                    }}>
                      {selectedPayment.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Customer Information</h3>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{selectedPayment.user ? `${selectedPayment.user.firstName || ''} ${selectedPayment.user.lastName || ''}`.trim() : 'Guest Customer'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedPayment.user?.email || 'No email provided'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedPayment.user?.mobileNumber || 'No phone provided'}</div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Order Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Order ID</div>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{selectedPayment.order?.orderNumber || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Payment Method</div>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{selectedPayment.method}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                          View Associated Products &rarr;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gateway Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Gateway Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Gateway</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{selectedPayment.gateway}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Gateway Order ID</span>
                        <span style={{ color: '#1e293b', fontWeight: 500, fontFamily: 'monospace' }}>{selectedPayment.gatewayOrderId || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Gateway Payment ID</span>
                        <span style={{ color: '#1e293b', fontWeight: 500, fontFamily: 'monospace' }}>{selectedPayment.gatewayPaymentId || 'N/A'}</span>
                      </div>
                      {selectedPayment.paymentCapturedAt && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Captured At</span>
                          <span style={{ color: '#1e293b', fontWeight: 500 }}>{new Date(selectedPayment.paymentCapturedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPayment.status === 'Failed' && (
                    <div style={{ marginBottom: '1.5rem', background: '#fef2f2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> Failure Reason
                      </div>
                      <div style={{ color: '#7f1d1d', fontSize: '0.9rem' }}>{selectedPayment.failureReason || 'Transaction was declined by the bank or gateway.'}</div>
                    </div>
                  )}

                  {selectedPayment.status === 'Refunded' && (
                    <div style={{ marginBottom: '1.5rem', background: '#f5f3ff', border: '1px solid #c4b5fd', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#6d28d9', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16} /> Refund Details
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#5b21b6', fontSize: '0.9rem' }}>Refunded Amount:</span>
                        <span style={{ color: '#4c1d95', fontWeight: 600 }}>{formatCurrency(selectedPayment.refundAmount)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> Invoice
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
