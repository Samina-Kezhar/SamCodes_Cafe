import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Coffee, Clock, DollarSign, CheckCircle, AlertCircle,
  Volume2, VolumeX, Printer, RefreshCw, Search, Filter, QrCode, Utensils,
  ChevronRight, Phone, MapPin, Eye, X, Check, ArrowRight, Sparkles, MessageSquare
} from 'lucide-react';
import { playChime } from '../utils/audioAlert.js';

export function OwnerDashboard({ onCloseDashboard }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'qr_tables' | 'reservations'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    breakdown: { received: 0, brewing: 0, ready: 0, completed: 0, cancelled: 0 }
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForKOT, setSelectedOrderForKOT] = useState(null);
  const [allTableCards, setAllTableCards] = useState([]);

  // Fetch initial dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes, menuRes, contactRes, qrRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/dashboard/stats'),
        fetch('/api/menu'),
        fetch('/api/contact'),
        fetch('/api/qr/tables')
      ]);

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      const menuData = await menuRes.json();
      const contactData = await contactRes.json();
      const qrData = await qrRes.json();

      if (ordersData.success) setOrders(ordersData.orders);
      if (statsData.success) setStats(statsData.stats);
      if (menuData.success) setMenuItems(menuData.items);
      if (contactData.success) setReservations(contactData.contacts);
      if (qrData.success) setAllTableCards(qrData.tableCards);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup WebSocket connection for real-time order notifications
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER') {
              setOrders((prev) => [data.payload, ...prev]);
              if (soundEnabled) playChime();
              // Update stats
              setStats((prev) => ({
                ...prev,
                totalOrders: prev.totalOrders + 1,
                activeOrders: prev.activeOrders + 1,
                totalRevenue: prev.totalRevenue + (data.payload.total || 0),
                breakdown: {
                  ...prev.breakdown,
                  received: (prev.breakdown?.received || 0) + 1
                }
              }));
            } else if (data.type === 'ORDER_UPDATED') {
              setOrders((prev) =>
                prev.map((o) => (o.id === data.payload.id ? data.payload : o))
              );
            } else if (data.type === 'MENU_STOCK_CHANGED') {
              setMenuItems((prev) =>
                prev.map((m) => (m.id === data.payload.id ? { ...m, in_stock: data.payload.in_stock } : m))
              );
            } else if (data.type === 'NEW_CONTACT_MESSAGE') {
              fetchData();
            }
          } catch (err) {
            console.warn('WS message parse error:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnect after 3s
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        console.warn('WS connect error:', err);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
    };
  }, [soundEnabled]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        // Refresh stats
        const statsRes = await fetch('/api/dashboard/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Toggle menu item stock
  const handleToggleStock = async (itemId) => {
    try {
      const res = await fetch(`/api/menu/${itemId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, in_stock: data.in_stock } : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        if (!['received', 'brewing'].includes(o.status)) return false;
      } else if (o.status !== statusFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (o.customer_name || '').toLowerCase().includes(q);
      const matchTable = (o.table_number || '').toLowerCase().includes(q);
      const matchId = (o.id || '').toLowerCase().includes(q);
      if (!matchName && !matchTable && !matchId) return false;
    }

    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'received':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '#f59e0b', text: 'Received (Queued)' };
      case 'brewing':
        return { bg: 'rgba(234, 139, 57, 0.2)', color: 'var(--primary)', border: 'var(--primary)', text: 'Brewing & Crafting' };
      case 'ready':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '#3b82f6', text: 'Ready for Serving' };
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '#10b981', text: 'Completed' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '#ef4444', text: 'Cancelled' };
      default:
        return { bg: 'var(--bg-surface-elevated)', color: '#fff', border: 'transparent', text: status };
    }
  };

  return (
    <div className="dashboard-container container">
      {/* Dashboard Top Header */}
      <div className="dash-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 18px var(--primary-glow)'
            }}
          >
            <LayoutDashboard size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Owner & Kitchen Order Dashboard</h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: wsConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: wsConnected ? '#10b981' : '#ef4444',
                  border: `1px solid ${wsConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: wsConnected ? '#10b981' : '#ef4444'
                  }}
                />
                {wsConnected ? 'Live Real-time Feed' : 'Connecting...'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Coffee Stand • Shop GF.15, The Allen Town, Nikol Ahmedabad
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            title={soundEnabled ? 'Order sound is enabled' : 'Order sound is muted'}
          >
            {soundEnabled ? <Volume2 size={16} style={{ color: 'var(--primary)' }} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          <button
            onClick={fetchData}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            title="Refresh feed"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onCloseDashboard}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
          >
            <span>Back to Café Website</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S REVENUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            ₹{stats.totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '2px' }}>
            5% GST included
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE IN KITCHEN</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats.activeOrders} Orders
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {stats.breakdown?.received || 0} Queued • {stats.breakdown?.brewing || 0} Brewing
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>READY FOR SERVICE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
            {stats.breakdown?.ready || 0} Orders
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Ready to be served to tables
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS COMPLETED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {stats.completedOrders} Orders
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Avg. prep time: ~10 mins
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid var(--border-medium)', marginBottom: '1.8rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'orders' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Coffee size={17} />
          <span>Live Orders Feed</span>
          <span style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'menu' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'menu' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Utensils size={17} />
          <span>Live Menu Stock Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('qr_tables')}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'qr_tables' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'qr_tables' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <QrCode size={17} />
          <span>Table QR Standees</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'reservations' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'reservations' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MessageSquare size={17} />
          <span>Reservations & Inquiries</span>
          <span style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
            {reservations.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LIVE ORDERS FEED */}
      {activeTab === 'orders' && (
        <div>
          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'active', label: '⚡ Active in Kitchen' },
                { id: 'received', label: 'Queued' },
                { id: 'brewing', label: 'Brewing' },
                { id: 'ready', label: 'Ready for Table' },
                { id: 'completed', label: 'Completed' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`filter-pill ${statusFilter === f.id ? 'active' : ''}`}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="search-input-wrap" style={{ maxWidth: '300px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search Table #, ID, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Coffee size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No orders match this filter.</p>
              <p style={{ fontSize: '0.85rem' }}>Orders placed via Table QR or online menu will appear here in real time!</p>
            </div>
          ) : (
            <div className="order-feed-grid">
              {filteredOrders.map((ord) => {
                const badge = getStatusBadgeStyle(ord.status);
                return (
                  <div key={ord.id} className={`order-card status-${ord.status}`}>
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.03em' }}>
                            {ord.id}
                          </span>
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              background: 'var(--bg-surface-elevated)',
                              color: 'var(--accent-gold)',
                              border: '1px solid var(--border-medium)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            📍 {ord.table_number}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '3px' }}>
                          {ord.customer_name} {ord.customer_phone ? `• ${ord.customer_phone}` : ''}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Placed at: {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem'
                      }}
                    >
                      {(ord.items || []).map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{it.quantity}x </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{it.name}</span>
                            {it.size && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}> ({it.size})</span>}
                            {it.customizations && it.customizations.length > 0 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {it.customizations.join(', ')}
                              </div>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            ₹{it.itemTotal || it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Kitchen Special Note if any */}
                    {ord.kitchen_notes && (
                      <div style={{ background: 'rgba(234, 139, 57, 0.1)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                        <strong>Chef Note:</strong> {ord.kitchen_notes}
                      </div>
                    )}

                    {/* Order Total & Payment Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Pay: <strong style={{ textTransform: 'uppercase' }}>{ord.payment_method}</strong> ({ord.payment_status})
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{ord.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Status Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      {ord.status === 'received' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'brewing')}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                          <span>🔥 Start Brewing</span>
                        </button>
                      )}

                      {ord.status === 'brewing' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'ready')}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#3b82f6' }}
                        >
                          <span>🔔 Ready to Serve</span>
                        </button>
                      )}

                      {ord.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'completed')}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#10b981' }}
                        >
                          <span>✅ Complete</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrderForKOT(ord)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.78rem' }}
                      >
                        <Printer size={13} />
                        <span>Print KOT</span>
                      </button>

                      {ord.status !== 'cancelled' && ord.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'cancelled')}
                          style={{ color: '#ef4444', fontSize: '0.75rem', padding: '0.5rem', background: 'transparent' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE MENU STOCK MANAGER */}
      {activeTab === 'menu' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Menu Item Stock Status (86 List)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click the toggle button to instantly mark any item as In Stock or Sold Out. Updates live for all scanning customers!
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.2rem'
            }}
          >
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>₹{item.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStock(item.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: item.in_stock ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: item.in_stock ? '#10b981' : '#ef4444',
                    border: `1px solid ${item.in_stock ? '#10b981' : '#ef4444'}`
                  }}
                >
                  {item.in_stock ? '🟢 In Stock' : '🔴 Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TABLE QR STANDEES BATCH */}
      {activeTab === 'qr_tables' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>All Table QR Standees</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Printable QR cards for every table at Coffee Stand Nikol. Customers scan these tent cards to order.
              </p>
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}>
              <Printer size={16} />
              <span>Print All Table Cards</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {allTableCards.map((card) => (
              <div
                key={card.table}
                style={{
                  background: '#fff',
                  color: '#1c1510',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1510' }}>
                  COFFEE STAND
                </div>
                <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '0.8rem' }}>
                  The Allen Town, Nikol
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    background: '#1c1510',
                    color: '#fff',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '0.8rem'
                  }}
                >
                  {card.table}
                </div>

                <img
                  src={card.qrDataUrl}
                  alt={card.table}
                  style={{ width: '150px', height: '150px', margin: '0 auto 0.8rem auto', display: 'block' }}
                />

                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1c1510', margin: 0 }}>
                  Scan with Camera to Order
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RESERVATIONS & INQUIRIES */}
      {activeTab === 'reservations' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Guest Table Bookings & Messages</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inquiries and table booking requests submitted via the website contact form.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map((res) => (
              <div
                key={res.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{res.name}</h4>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(234, 139, 57, 0.15)',
                        color: 'var(--accent-gold)'
                      }}
                    >
                      {res.inquiry_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Phone: <strong>{res.phone || 'N/A'}</strong> • Email: <strong>{res.email}</strong>
                  </div>

                  {res.preferred_date && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', marginTop: '4px' }}>
                      📅 Date: {res.preferred_date} • 🕒 Time: {res.preferred_time || 'Evening'} • 👥 Guests: {res.party_size} People
                    </div>
                  )}

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: 1.5 }}>
                    "{res.message}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <a
                    href={`tel:${res.phone}`}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    <Phone size={14} />
                    <span>Call Guest</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KOT Printable Modal */}
      {selectedOrderForKOT && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderForKOT(null)}>
          <div className="modal-card printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', background: '#fff', color: '#000' }}>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#000', margin: 0 }}>
                COFFEE STAND
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#666' }}>
                KITCHEN ORDER TICKET (KOT)
              </p>

              <div style={{ borderTop: '1px dashed #999', borderBottom: '1px dashed #999', margin: '0.8rem 0', padding: '0.6rem 0', textAlign: 'left', fontSize: '0.85rem' }}>
                <div><strong>Order:</strong> {selectedOrderForKOT.id}</div>
                <div><strong>Location:</strong> {selectedOrderForKOT.table_number}</div>
                <div><strong>Customer:</strong> {selectedOrderForKOT.customer_name}</div>
                <div><strong>Time:</strong> {new Date(selectedOrderForKOT.created_at).toLocaleTimeString()}</div>
              </div>

              <div style={{ textAlign: 'left', margin: '1rem 0' }}>
                {(selectedOrderForKOT.items || []).map((it, idx) => (
                  <div key={idx} style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 800 }}>{it.quantity}x {it.name} ({it.size || 'Regular'})</div>
                    {it.customizations && (
                      <div style={{ fontSize: '0.78rem', color: '#555' }}>
                        {it.customizations.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedOrderForKOT.kitchen_notes && (
                <div style={{ background: '#f5f5f5', padding: '6px', textAlign: 'left', fontSize: '0.8rem', border: '1px solid #ddd' }}>
                  <strong>Notes:</strong> {selectedOrderForKOT.kitchen_notes}
                </div>
              )}

              <div style={{ borderTop: '1px dashed #999', marginTop: '1rem', paddingTop: '0.8rem', textAlign: 'right', fontSize: '1.1rem', fontWeight: 800 }}>
                Total: ₹{selectedOrderForKOT.total.toFixed(2)}
              </div>
            </div>

            <div className="modal-footer" style={{ background: '#f8f8f8' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Printer size={15} />
                <span>Print Ticket</span>
              </button>
              <button onClick={() => setSelectedOrderForKOT(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
