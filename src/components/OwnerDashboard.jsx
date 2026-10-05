import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Coffee, Clock, DollarSign, CheckCircle, AlertCircle,
  Volume2, VolumeX, Printer, RefreshCw, Search, Filter, QrCode, Utensils,
  ChevronRight, Phone, MapPin, Eye, X, Check, ArrowRight, Sparkles, MessageSquare,
  Package, TrendingUp, Tag, Users, Star, Plus, Trash2, Edit3, ShieldCheck, LogOut, Download,
  Sun, Moon
} from 'lucide-react';
import { playChime } from '../utils/audioAlert.js';
import { CafenaLogoStamp } from './CafenaDecorations';

export function OwnerDashboard({ onCloseDashboard, onLogout, theme = 'modern-latte', onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'tables' | 'menu' | 'inventory' | 'offers' | 'customers'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    breakdown: { received: 0, brewing: 0, ready: 0, completed: 0, cancelled: 0 },
    avgPrepTimeMins: 9
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForKOT, setSelectedOrderForKOT] = useState(null);
  const [allTableCards, setAllTableCards] = useState([]);

  // Modals for admin actions
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'signature_frappes',
    price: 220,
    description: '',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    tags: ['Special'],
    is_veg: true,
    prep_time_mins: 8
  });

  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    code: '',
    title: '',
    tagline: '',
    discount: '15% OFF',
    discount_percent: 15,
    min_order: 250,
    description: '',
    badge: 'Special Deal'
  });

  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(5);

  // Safe fetch helper to ensure intermittent errors never break dashboard state
  const safeFetchJson = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return { success: false };
      return await res.json();
    } catch (err) {
      console.warn(`Fetch failed for ${url}:`, err);
      return { success: false };
    }
  };

  // Fetch initial dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData, menuData, contactData, qrData, invData, offersData, reviewsData] = await Promise.all([
        safeFetchJson('/api/orders'),
        safeFetchJson('/api/dashboard/stats'),
        safeFetchJson('/api/menu'),
        safeFetchJson('/api/contact'),
        safeFetchJson('/api/qr/tables'),
        safeFetchJson('/api/inventory'),
        safeFetchJson('/api/offers'),
        safeFetchJson('/api/reviews')
      ]);

      if (ordersData?.success) setOrders(ordersData.orders || []);
      if (statsData?.success) setStats(statsData.stats || stats);
      if (menuData?.success) setMenuItems(menuData.items || []);
      if (contactData?.success) setReservations(contactData.contacts || []);
      if (qrData?.success) setAllTableCards(qrData.tableCards || []);
      if (invData?.success) setInventory(invData.items || []);
      if (offersData?.success) setOffers(offersData.offers || []);
      if (reviewsData?.success) setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          try {
            ws.send(JSON.stringify({ type: 'IDENTIFY', role: 'owner' }));
          } catch {
            // ignore
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER') {
              setOrders((prev) => [data.payload, ...prev]);
              if (soundEnabled) playChime();
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
            } else if (data.type === 'MENU_ITEM_UPDATED') {
              setMenuItems((prev) =>
                prev.map((m) => (m.id === data.payload.id ? data.payload : m))
              );
            } else if (data.type === 'MENU_ITEM_ADDED') {
              setMenuItems((prev) => {
                if (prev.some((m) => m.id === data.payload.id)) return prev;
                return [...prev, data.payload];
              });
            } else if (data.type === 'MENU_ITEM_DELETED') {
              setMenuItems((prev) => prev.filter((m) => m.id !== data.payload.id));
            } else if (data.type === 'NEW_CONTACT_MESSAGE' || data.type === 'NEW_REVIEW' || data.type === 'INVENTORY_UPDATED') {
              fetchData();
            }
          } catch (err) {
            console.warn('WS message parse error:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
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

  // Add new menu item
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems((prev) => [...prev, data.item]);
        setIsAddItemOpen(false);
        setNewItem({
          name: '',
          category: 'signature_frappes',
          price: 220,
          description: '',
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
          tags: ['Special'],
          is_veg: true,
          prep_time_mins: 8
        });
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  // Update existing menu item
  const handleSaveEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems((prev) => prev.map((m) => (m.id === editingItem.id ? data.item : m)));
        setIsEditItemOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Failed to edit item:', err);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from the café menu?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenuItems((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Restock inventory item
  const handleRestockInventory = async () => {
    if (!selectedRestockItem) return;
    try {
      const res = await fetch(`/api/inventory/${selectedRestockItem.id}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_amount: parseFloat(restockAmount) })
      });
      const data = await res.json();
      if (data.success) {
        setInventory((prev) => prev.map((i) => (i.id === selectedRestockItem.id ? data.item : i)));
        setSelectedRestockItem(null);
        // Refresh stats
        const statsRes = await fetch('/api/dashboard/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Restock error:', err);
    }
  };

  // Create new offer
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer)
      });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) => [...prev, data.offer]);
        setIsAddOfferOpen(false);
        setNewOffer({
          code: '',
          title: '',
          tagline: '',
          discount: '15% OFF',
          discount_percent: 15,
          min_order: 250,
          description: '',
          badge: 'Special Deal'
        });
      }
    } catch (err) {
      console.error('Failed to add offer:', err);
    }
  };

  // Delete offer
  const handleDeleteOffer = async (id) => {
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (err) {
      console.error('Failed to update reservation:', err);
    }
  };

  // Filtered orders for kitchen display
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.id || '').toLowerCase().includes(q);
      const matchName = (order.customer_name || '').toLowerCase().includes(q);
      const matchTable = (order.table_number || '').toLowerCase().includes(q);
      return matchId || matchName || matchTable;
    }
    return true;
  });

  // Calculate table occupancy status
  const tableOccupancy = useMemo(() => {
    const activeTables = new Set(
      orders
        .filter((o) => ['received', 'brewing', 'ready'].includes(o.status))
        .map((o) => o.table_number)
    );

    const tables = [
      'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
      'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
      'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4'
    ];

    return tables.map((t) => {
      const activeOrder = orders.find(
        (o) => o.table_number === t && ['received', 'brewing', 'ready'].includes(o.status)
      );
      const hasReservation = reservations.some(
        (r) => r.status === 'confirmed' && r.preferred_date === new Date().toISOString().split('T')[0]
      );

      return {
        table: t,
        status: activeOrder ? 'occupied' : hasReservation ? 'reserved' : 'vacant',
        activeOrder
      };
    });
  }, [orders, reservations]);

  // Aggregate Customer Directory from orders and contacts
  const customerDatabase = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = (o.customer_phone || o.customer_name || 'Guest').trim();
      if (!map.has(key)) {
        map.set(key, {
          name: o.customer_name,
          phone: o.customer_phone,
          ordersCount: 1,
          totalSpent: o.total || 0,
          lastVisit: o.created_at
        });
      } else {
        const existing = map.get(key);
        existing.ordersCount += 1;
        existing.totalSpent += o.total || 0;
        if (new Date(o.created_at) > new Date(existing.lastVisit)) {
          existing.lastVisit = o.created_at;
        }
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: `Kitchen Orders (${stats.activeOrders})`, icon: Coffee },
    { id: 'tables', label: 'Tables & QR Cards', icon: QrCode },
    { id: 'menu', label: 'Menu Items', icon: Utensils },
    { id: 'inventory', label: `Inventory (${stats.lowStockCount} Low)`, icon: Package },
    { id: 'offers', label: 'Coupons & Deals', icon: Tag },
    { id: 'customers', label: 'Customers & Reviews', icon: Users }
  ];

  return (
    <div className="owner-dashboard-root" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* 1. Dashboard Header */}
      <header
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '0.8rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="cafena-nav-stamp-wrap" style={{ display: 'flex', alignItems: 'center' }}>
            <CafenaLogoStamp size={38} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                CAFENA • OWNER & KITCHEN CONSOLE
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: wsConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: wsConnected ? '#10b981' : '#ef4444'
                }}
              >
                {wsConnected ? '● Live WebSocket' : 'Connecting...'}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Shop GF.15, The Allen Town, Nikol • Kitchen Display System
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px' }}
            title={soundEnabled ? 'Order sound alert is on' : 'Order sound alert is muted'}
          >
            {soundEnabled ? <Volume2 size={16} style={{ color: '#10b981' }} /> : <VolumeX size={16} />}
            <span className="hide-on-mobile">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={fetchData}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px' }}
            title="Refresh dashboard data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span className="hide-on-mobile">Sync</span>
          </button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px' }}
              title="Toggle Day/Dark Theme"
            >
              {theme === 'modern-latte' || theme === 'warm-cream' ? <Moon size={15} style={{ color: 'var(--primary)' }} /> : <Sun size={15} style={{ color: 'var(--accent-gold)' }} />}
              <span className="hide-on-mobile">{theme === 'modern-latte' || theme === 'warm-cream' ? 'Dark' : 'Light'}</span>
            </button>
          )}

          {/* Return to Public Website */}
          <button
            onClick={onCloseDashboard}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            Café Website
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Lock management panel and logout"
          >
            <LogOut size={15} />
            <span className="hide-on-mobile">Lock Portal</span>
          </button>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.6rem 0' }}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`filter-pill ${isActive ? 'active' : ''}`}
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', gap: '7px', whiteSpace: 'nowrap' }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard Body */}
      <main className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem', maxWidth: '1360px' }}>
        {/* =============================================================== */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                      */}
        {/* =============================================================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Key Metrics Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.2rem'
              }}
            >
              {/* Metric 1: Total Revenue */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Revenue</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                  ₹{(stats.totalRevenue || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>+18% from yesterday</span>
              </div>

              {/* Metric 2: Active Kitchen Orders */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Kitchen Orders</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(234, 139, 57, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Coffee size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                  {stats.activeOrders}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Being prepared now</span>
              </div>

              {/* Metric 3: Completed Orders */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Completed Orders</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <CheckCircle size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                  {stats.completedOrders}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total {stats.totalOrders} placed today</span>
              </div>

              {/* Metric 4: Low Stock Warnings */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Low Stock Items</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <AlertCircle size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '0.4rem' }}>
                  {stats.lowStockCount}
                </div>
                <button onClick={() => setActiveTab('inventory')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'left' }}>
                  Restock Ingredients →
                </button>
              </div>
            </div>

            {/* Sales Trends & Peak Hours Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.8rem' }}>
              {/* Peak Hours Breakdown */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Peak Hours Distribution</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { slot: 'Morning Roastery Rush (9 AM - 12 PM)', pct: 68, orders: '32 orders' },
                    { slot: 'Afternoon Co-working (12 PM - 4 PM)', pct: 45, orders: '21 orders' },
                    { slot: 'Evening Ambiance Peak (5 PM - 9 PM)', pct: 92, orders: '54 orders' },
                    { slot: 'Late Night Chill (9 PM - 12 AM)', pct: 84, orders: '46 orders' }
                  ].map((peak) => (
                    <div key={peak.slot}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{peak.slot}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{peak.orders}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${peak.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent-caramel))', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Items */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Bestselling Creations</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    { name: 'Cafena Signature Frappe', count: '48 sold today', revenue: '₹13,440' },
                    { name: 'Lotus Biscoff Dream Frappe', count: '39 sold today', revenue: '₹12,090' },
                    { name: 'Paneer Tikka Herb Panini', count: '34 sold today', revenue: '₹8,840' },
                    { name: 'Artisan Rosetta Cappuccino', count: '28 sold today', revenue: '₹5,320' },
                    { name: 'Belgian Dark Choco Waffle', count: '22 sold today', revenue: '₹6,160' }
                  ].map((top, idx) => (
                    <div
                      key={top.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.8rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', width: '20px' }}>#{idx + 1}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{top.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{top.count}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{top.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: LIVE KITCHEN ORDERS                                       */}
        {/* =============================================================== */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `All (${orders.length})` },
                  { id: 'received', label: `New (${orders.filter((o) => o.status === 'received').length})` },
                  { id: 'brewing', label: `Brewing (${orders.filter((o) => o.status === 'brewing').length})` },
                  { id: 'ready', label: `Ready (${orders.filter((o) => o.status === 'ready').length})` },
                  { id: 'completed', label: `Completed (${orders.filter((o) => o.status === 'completed').length})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`filter-pill ${statusFilter === f.id ? 'active' : ''}`}
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="search-input-wrap" style={{ maxWidth: '280px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search order ID, guest, table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ padding: '0.5rem 0.8rem 0.5rem 2.2rem', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <Coffee size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>No orders matching filter</p>
                <p style={{ fontSize: '0.85rem' }}>New orders will appear here automatically with chime sound.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.4rem' }}>
                {filteredOrders.map((order) => {
                  const isReceived = order.status === 'received';
                  const isBrewing = order.status === 'brewing';
                  const isReady = order.status === 'ready';
                  const isCompleted = order.status === 'completed';

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: isReceived ? '2px solid #ef4444' : isBrewing ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.9rem',
                        boxShadow: 'var(--shadow-sm)',
                        position: 'relative'
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                              #{order.id}
                            </span>
                            <span
                              style={{
                                background: 'var(--primary-subtle)',
                                color: 'var(--primary)',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                padding: '3px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {order.table_number}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {order.customer_name} {order.customer_phone ? `(${order.customer_phone})` : ''}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isReady ? 'rgba(59, 130, 246, 0.15)' : isBrewing ? 'rgba(234, 139, 57, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCompleted ? '#10b981' : isReady ? '#3b82f6' : isBrewing ? 'var(--primary)' : '#ef4444'
                          }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Items List */}
                      <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{it.quantity}x</span>{' '}
                              <span>{it.name}</span>{' '}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({it.size || 'Regular'})</span>
                              {it.customizations && it.customizations.length > 0 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginLeft: '18px' }}>
                                  {it.customizations.join(', ')}
                                </div>
                              )}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>₹{it.itemTotal || it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Kitchen Preparation Notes */}
                      {order.kitchen_notes && (
                        <div style={{ background: 'rgba(234, 139, 57, 0.08)', borderLeft: '3px solid var(--primary)', padding: '6px 10px', fontSize: '0.78rem', color: 'var(--text-main)' }}>
                          <strong>Notes: </strong>{order.kitchen_notes}
                        </div>
                      )}

                      {/* Total & Payment */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          Total: ₹{order.total}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: order.payment_status === 'paid' ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                          {order.payment_method === 'upi' ? 'Online Paid ✓' : 'Pay at Counter'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '0.2rem' }}>
                        {isReceived && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'brewing')}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center' }}
                          >
                            Accept & Brew
                          </button>
                        )}

                        {isBrewing && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center', background: '#3b82f6', borderColor: '#3b82f6' }}
                          >
                            Mark Ready
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrderForKOT(order)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center', gap: '4px' }}
                        >
                          <Printer size={13} />
                          <span>KOT</span>
                        </button>

                        {!isCompleted && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            style={{ padding: '0.45rem', fontSize: '0.78rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
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

        {/* =============================================================== */}
        {/* TAB 3: TABLES & QR CODE CARDS                                   */}
        {/* =============================================================== */}
        {activeTab === 'tables' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Table Floor Map Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Café Floor & Table Status</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time seat occupancy and live orders</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Vacant</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Occupied</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> Reserved</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {tableOccupancy.map((t) => {
                  const isOcc = t.status === 'occupied';
                  const isRes = t.status === 'reserved';
                  const color = isOcc ? '#f59e0b' : isRes ? '#3b82f6' : '#10b981';

                  return (
                    <div
                      key={t.table}
                      style={{
                        background: 'var(--bg-surface)',
                        border: `1.5px solid ${color}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1.1rem',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {t.table}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
                        {t.status}
                      </span>
                      {isOcc && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Order #{t.activeOrder?.id} (₹{t.activeOrder?.total})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table Reservations Management */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Guest Table Reservations</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer booking requests submitted via website</span>
              </div>

              {reservations.length === 0 ? (
                <div style={{ background: 'var(--bg-surface)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  No active reservation requests.
                </div>
              ) : (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '0.8rem 1rem' }}>Guest Name</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Contact</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Party Size</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Date & Time</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Notes</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{r.name}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>{r.phone || r.email}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>{r.party_size} Guests</td>
                          <td style={{ padding: '0.8rem 1rem' }}>{r.preferred_date || 'Today'} {r.preferred_time}</td>
                          <td style={{ padding: '0.8rem 1rem', maxWidth: '220px', color: 'var(--text-muted)' }}>{r.message}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 139, 57, 0.15)', color: r.status === 'confirmed' ? '#10b981' : 'var(--primary)' }}>
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleUpdateReservationStatus(r.id, 'confirmed')}
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateReservationStatus(r.id, 'seated')}
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#10b981' }}
                              >
                                Seated
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Printable Table QR Cards Grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Assigned QR Tent Cards</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Print or download table QR codes for acrylic tent cards</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {allTableCards.map((card) => (
                  <div
                    key={card.table}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.4rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.8rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {card.table}
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                      <img src={card.qrDataUrl} alt={`${card.table} QR Code`} style={{ width: '160px', height: '160px' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Scan to Order directly at {card.table}
                    </span>

                    <a
                      href={card.qrDataUrl}
                      download={`cafena-qr-${card.table.toLowerCase().replace(/\s+/g, '-')}.png`}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', gap: '6px', width: '100%', justifyContent: 'center' }}
                    >
                      <Download size={14} />
                      <span>Download PNG</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: MENU MANAGEMENT                                           */}
        {/* =============================================================== */}
        {activeTab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Café Menu Management</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Update pricing, manage recipes, and toggle stock in real-time</span>
              </div>

              <button
                onClick={() => setIsAddItemOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Add New Menu Item</span>
              </button>
            </div>

            {/* Menu Items Table */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem 1rem' }}>Item</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Prep Time</th>
                    <th style={{ padding: '0.8rem 1rem' }}>In Stock</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.is_veg ? 'Pure Veg' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 800 }}>₹{item.price}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{item.prep_time_mins} mins</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <button
                          onClick={() => handleToggleStock(item.id)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: item.in_stock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.in_stock ? '#10b981' : '#ef4444'
                          }}
                        >
                          {item.in_stock ? 'In Stock ✓' : 'Sold Out ✕'}
                        </button>
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditItemOpen(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', gap: '4px' }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 5: INVENTORY TRACKING                                        */}
        {/* =============================================================== */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Raw Ingredients & Cafe Stock</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Keep track of Arabica beans, dairy, syrups, and packaging</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
              {inventory.map((inv) => {
                const isLow = inv.current_stock <= inv.min_threshold;
                return (
                  <div
                    key={inv.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: isLow ? '1.5px solid #ef4444' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{inv.item_name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.category}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: isLow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isLow ? '#ef4444' : '#10b981'
                        }}
                      >
                        {isLow ? 'LOW STOCK' : 'ADEQUATE'}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>Current Stock: <strong>{inv.current_stock} {inv.unit}</strong></span>
                        <span style={{ color: 'var(--text-dim)' }}>Min: {inv.min_threshold} {inv.unit}</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, (inv.current_stock / (inv.min_threshold * 2.5)) * 100)}%`,
                            height: '100%',
                            background: isLow ? '#ef4444' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last Restock: {inv.last_restocked}</span>
                      <button
                        onClick={() => setSelectedRestockItem(inv)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                      >
                        + Quick Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 6: COUPONS & OFFERS MANAGEMENT                              */}
        {/* =============================================================== */}
        {activeTab === 'offers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Discount Coupons & Offers</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage promo codes for student perks, combos, and happy hours</span>
              </div>

              <button
                onClick={() => setIsAddOfferOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.4rem' }}>
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                        {offer.code}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                        {offer.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '4px' }}>
                      {offer.discount}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {offer.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Min Order: ₹{offer.min_order}</span>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      style={{ color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 7: CUSTOMER DATABASE & REVIEWS                              */}
        {/* =============================================================== */}
        {activeTab === 'customers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Customer Directory */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Customer Directory</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Aggregated contacts and order history</span>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '0.8rem 1rem' }}>Customer Name</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Phone</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Orders Placed</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Total Spent</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDatabase.map((cust, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{cust.name}</td>
                        <td style={{ padding: '0.8rem 1rem' }}>{cust.phone || 'N/A'}</td>
                        <td style={{ padding: '0.8rem 1rem' }}>{cust.ordersCount} orders</td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 800 }}>₹{(cust.totalSpent || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                          {new Date(cust.lastVisit).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Reviews & Feedback Log */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Guest Feedback & Reviews Log</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time diner submissions from Part 1</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{rev.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= rev.rating ? '#f59e0b' : 'transparent'} color={s <= rev.rating ? '#f59e0b' : 'var(--text-dim)'} />
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      "{rev.comment}"
                    </p>

                    {rev.favorite_item && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Fav: {rev.favorite_item}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Kitchen Order Ticket (KOT) Print Modal */}
      {selectedOrderForKOT && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderForKOT(null)}>
          <div className="modal-card printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', background: '#fff', color: '#000', padding: '1.8rem' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>CAFENA</h3>
              <p style={{ fontSize: '0.75rem', margin: '2px 0' }}>The Allen Town • Nikol Ring Road</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '6px' }}>KITCHEN ORDER TICKET (KOT)</h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{selectedOrderForKOT.table_number}</div>
              <div style={{ fontSize: '0.75rem' }}>Order #{selectedOrderForKOT.id} • {new Date(selectedOrderForKOT.created_at).toLocaleTimeString()}</div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
              {(selectedOrderForKOT.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', margin: '4px 0' }}>
                  <span>{it.quantity}x {it.name} ({it.size || 'Regular'})</span>
                  <span style={{ fontWeight: 700 }}>₹{it.itemTotal || it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {selectedOrderForKOT.kitchen_notes && (
              <div style={{ fontSize: '0.8rem', margin: '6px 0', borderBottom: '1px dashed #000', paddingBottom: '6px' }}>
                <strong>INSTRUCTIONS: </strong>{selectedOrderForKOT.kitchen_notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1rem' }}>
              <span>TOTAL PAYABLE:</span>
              <span>₹{selectedOrderForKOT.total}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', justifyContent: 'center' }}>
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

      {/* 5. Add Menu Item Modal */}
      {isAddItemOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddItemOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add New Menu Creation</h3>
              <button onClick={() => setIsAddItemOpen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hazelnut Truffle Cold Brew"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  >
                    <option value="signature_frappes">Signature Frappes</option>
                    <option value="hot_coffee">Hot Specialty Coffee</option>
                    <option value="cold_brews">Cold Brews & Iced</option>
                    <option value="refreshers">Artisan Coolers</option>
                    <option value="sandwiches">Gourmet Paninis</option>
                    <option value="waffles_desserts">Waffles & Sweets</option>
                    <option value="snacks">Sides & Munchies</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Price (₹) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Description & Flavors</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, brewing technique, flavor profile..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Real Photo Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  Save & Publish Item
                </button>
                <button type="button" onClick={() => setIsAddItemOpen(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Menu Item Modal */}
      {isEditItemOpen && editingItem && (
        <div className="modal-backdrop" onClick={() => setIsEditItemOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit {editingItem.name}</h3>
              <button onClick={() => setIsEditItemOpen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Price (₹)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Prep Time (mins)</label>
                  <input
                    type="number"
                    value={editingItem.prep_time_mins}
                    onChange={(e) => setEditingItem({ ...editingItem, prep_time_mins: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Image URL</label>
                <input
                  type="text"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  Update Item
                </button>
                <button type="button" onClick={() => setIsEditItemOpen(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Quick Restock Inventory Modal */}
      {selectedRestockItem && (
        <div className="modal-backdrop" onClick={() => setSelectedRestockItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Restock {selectedRestockItem.item_name}</h3>
              <button onClick={() => setSelectedRestockItem(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Current Stock: <strong>{selectedRestockItem.current_stock} {selectedRestockItem.unit}</strong>
              </p>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  Amount to add ({selectedRestockItem.unit})
                </label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[5, 10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRestockAmount(amt)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <button onClick={handleRestockInventory} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  Confirm Restock
                </button>
                <button onClick={() => setSelectedRestockItem(null)} className="btn btn-secondary" style={{ padding: '0.75rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Create Offer Modal */}
      {isAddOfferOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddOfferOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Promo Coupon</h3>
              <button onClick={() => setIsAddOfferOpen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Coupon Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE25"
                    value={newOffer.code}
                    onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Discount Display</label>
                  <input
                    type="text"
                    placeholder="25% OFF"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Offer Title</label>
                <input
                  type="text"
                  placeholder="Diwali Festive Roastery Special"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Discount %</label>
                  <input
                    type="number"
                    value={newOffer.discount_percent}
                    onChange={(e) => setNewOffer({ ...newOffer, discount_percent: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Min Order (₹)</label>
                  <input
                    type="number"
                    value={newOffer.min_order}
                    onChange={(e) => setNewOffer({ ...newOffer, min_order: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Description</label>
                <textarea
                  rows={2}
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}>
                  Save Coupon
                </button>
                <button type="button" onClick={() => setIsAddOfferOpen(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
