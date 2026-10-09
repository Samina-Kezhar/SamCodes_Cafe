import React, { useState, useEffect, useRef } from 'react';
import {
  Coffee,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  Tag,
  Package,
  Star,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { InstagramLink } from './InstagramLink';

const ALL_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4',
  'Table 5', 'Table 6', 'Table 7', 'Table 8',
  'Table 9', 'Table 10', 'Table 11', 'Table 12',
  'Patio 1', 'Patio 2', 'Takeaway'
];

export function Part3Dashboard({ onNavigateToPart1, onNavigateToPart2 }) {
  const {
    orders,
    reservations,
    coupons,
    inventory,
    reviews,
    updateOrderStatus,
    updateReservation,
    restockInventory,
    submitReview,
    refreshAll,
    selectedTableForDashboard,
    setSelectedTableForDashboard
  } = useRestaurant();

  const [filterTable, setFilterTable] = useState('all');
  const [highlightedTable, setHighlightedTable] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const tableRefs = useRef({});

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: 'Cafena Manager',
    rating: 5,
    favorite_item: 'Artisan Rosetta Cappuccino',
    comment: 'Exceptional extraction balance and smooth texture throughout service.'
  });

  // Highlight table if navigated from Part 1 or Part 2
  useEffect(() => {
    if (selectedTableForDashboard) {
      setHighlightedTable(selectedTableForDashboard);
      setFilterTable('all');
      setTimeout(() => {
        if (tableRefs.current[selectedTableForDashboard]) {
          tableRefs.current[selectedTableForDashboard].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const timer = setTimeout(() => {
        setHighlightedTable(null);
        setSelectedTableForDashboard(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [selectedTableForDashboard, setSelectedTableForDashboard]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      setSuccessToast(`Order #${orderId} status set to ${newStatus.toUpperCase()}`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleTableBadgeClick = (tableName) => {
    setHighlightedTable(tableName);
    if (tableRefs.current[tableName]) {
      tableRefs.current[tableName].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedTable(null), 4000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const res = await submitReview({
      ...reviewForm,
      source: 'Verified Staff (Dashboard)'
    });
    if (res.success) {
      setSuccessToast('Review added to centralized stream!');
      setTimeout(() => setSuccessToast(null), 3000);
      setIsReviewOpen(false);
    }
  };

  // Group active & pending orders by table
  const ordersByTable = {};
  ALL_TABLES.forEach(t => { ordersByTable[t] = []; });
  orders.forEach(order => {
    const t = order.table_number || 'Takeaway';
    if (!ordersByTable[t]) ordersByTable[t] = [];
    ordersByTable[t].push(order);
  });

  // Group reservations by table
  const reservationsByTable = {};
  reservations.forEach(r => {
    const t = r.table_number || 'Table 1';
    if (!reservationsByTable[t]) reservationsByTable[t] = [];
    reservationsByTable[t].push(r);
  });

  // KPI Calculations
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const todayRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const lowStockCount = inventory.filter(i => i.current_stock <= i.min_threshold).length;
  const confirmedReservationsCount = reservations.filter(r => r.status === 'confirmed').length;

  return (
    <div className="part-view-container" style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(234, 139, 57, 0.12), rgba(110, 60, 20, 0.08))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(234, 139, 57, 0.15)', borderRadius: '20px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
            <span>PART 3 OF RESTAURANT MANAGEMENT SUITE</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            📊 Restaurant Management Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '650px' }}>
            Orders grouped by table flowing from Part 2, reservations from Part 1 linked to tables, active coupons, inventory levels, and customer reviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleManualRefresh}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.2rem' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            <span>Sync Real-Time</span>
          </button>
          <InstagramLink handleOrUrl="cafena.nikol" className="btn btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
            <span>@cafena.nikol</span>
          </InstagramLink>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <CheckCircle size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Stats Highlights Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>ACTIVE ORDERS (PART 2)</span>
            <ShoppingBag size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {activeOrdersCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
            ₹{todayRevenue} total volume
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>RESERVATIONS (PART 1)</span>
            <Calendar size={18} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {confirmedReservationsCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {reservations.length} total on record
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>ACTIVE COUPONS (PART 2)</span>
            <Tag size={18} style={{ color: '#eab308' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {coupons.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Applicable on all orders
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>INVENTORY STATUS (PART 2)</span>
            <Package size={18} style={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? '#ef4444' : 'var(--text-main)', marginTop: '6px' }}>
            {lowStockCount > 0 ? `${lowStockCount} Low` : 'Optimal'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {inventory.length} ingredients tracked
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>REVIEWS STREAM</span>
            <Star size={18} style={{ color: '#eab308' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {reviews.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
            Stored centrally
          </span>
        </div>
      </div>

      {/* =============================================================== */}
      {/* SECTION 1: ORDERS GROUPED BY TABLE (FLOWING LIVE FROM PART 2)    */}
      {/* =============================================================== */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Coffee size={22} style={{ color: 'var(--primary)' }} />
              <span>Orders Grouped by Table (Flowing from Part 2)</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Orders placed by table in Part 2 reflect in real time or on refresh with no data loss.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Table:</span>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="input-field"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="all">All Tables ({ALL_TABLES.length})</option>
              {ALL_TABLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Tables Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {ALL_TABLES
            .filter(t => filterTable === 'all' || t === filterTable)
            .map((tableName) => {
              const tableOrders = ordersByTable[tableName] || [];
              const tableReservations = reservationsByTable[tableName] || [];
              const activeOrders = tableOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
              const isOccupied = activeOrders.length > 0;
              const isReserved = tableReservations.some(r => r.status === 'confirmed');
              const isHighlighted = highlightedTable === tableName;

              return (
                <div
                  key={tableName}
                  ref={el => tableRefs.current[tableName] = el}
                  style={{
                    background: 'var(--bg-surface)',
                    border: isHighlighted
                      ? '2px solid var(--primary)'
                      : isOccupied
                      ? '1px solid rgba(234, 139, 57, 0.5)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    boxShadow: isHighlighted ? '0 0 20px rgba(234, 139, 57, 0.35)' : 'none',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  {/* Table Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {tableName}
                      </span>
                      {isOccupied ? (
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', background: 'rgba(234, 139, 57, 0.15)', color: 'var(--primary)', fontWeight: 700 }}>
                          {activeOrders.length} ACTIVE ORDER{activeOrders.length > 1 ? 'S' : ''}
                        </span>
                      ) : isReserved ? (
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}>
                          RESERVED (PART 1)
                        </span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', background: 'rgba(156, 163, 175, 0.15)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          AVAILABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reservations note if reserved */}
                  {tableReservations.filter(r => r.status === 'confirmed').length > 0 && (
                    <div style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: '#3b82f6' }}>
                      📅 <strong>Reserved:</strong> {tableReservations[0].name} ({tableReservations[0].party_size} guests) at {tableReservations[0].preferred_time}
                    </div>
                  )}

                  {/* Orders for this Table */}
                  {tableOrders.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '1rem 0', textAlign: 'center' }}>
                      No orders placed for {tableName} yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                      {tableOrders.map(order => (
                        <div key={order.id} style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.85rem',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              #{order.id} • {order.customer_name}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '8px',
                              background:
                                order.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' :
                                order.status === 'ready' ? 'rgba(59, 130, 246, 0.15)' :
                                order.status === 'brewing' ? 'rgba(234, 139, 57, 0.15)' :
                                'rgba(239, 68, 68, 0.15)',
                              color:
                                order.status === 'completed' ? '#10b981' :
                                order.status === 'ready' ? '#3b82f6' :
                                order.status === 'brewing' ? 'var(--primary)' :
                                '#ef4444'
                            }}>
                              {(order.status || 'received').toUpperCase()}
                            </span>
                          </div>

                          {/* Items breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '6px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {(order.items || []).map((it, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{it.quantity}x {it.name}</span>
                                <span>₹{(it.price || 0) * (it.quantity || 1)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Order Totals & Coupon */}
                          <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <div>
                              {order.coupon_code && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'block' }}>
                                  🎟️ {order.coupon_code} (-₹{order.discount || 0})
                                </span>
                              )}
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total:</span>
                            </div>
                            <span style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>₹{order.total}</span>
                          </div>

                          {/* Status transition controls */}
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                            {order.status !== 'brewing' && order.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'brewing')}
                                className="btn btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '0.72rem', flex: 1 }}
                              >
                                Brewing
                              </button>
                            )}
                            {order.status !== 'ready' && order.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'ready')}
                                className="btn btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '0.72rem', flex: 1 }}
                              >
                                Ready
                              </button>
                            )}
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                className="btn btn-primary"
                                style={{ padding: '2px 8px', fontSize: '0.72rem', flex: 1 }}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* =============================================================== */}
      {/* SECTION 2: RESERVATIONS FROM PART 1 (LINKED TO TABLES)          */}
      {/* =============================================================== */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={22} style={{ color: '#3b82f6' }} />
              <span>Reservations from Part 1 (Linked to Tables)</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Click on any table badge to highlight and focus that table in the Orders Grid above.
            </p>
          </div>

          <button
            onClick={onNavigateToPart1}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <span>Open Part 1 Reservations</span>
            <ExternalLink size={14} />
          </button>
        </div>

        {reservations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reservations recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '10px 12px' }}>ASSIGNED TABLE</th>
                  <th style={{ padding: '10px 12px' }}>GUEST NAME</th>
                  <th style={{ padding: '10px 12px' }}>PARTY SIZE</th>
                  <th style={{ padding: '10px 12px' }}>DATE & TIME</th>
                  <th style={{ padding: '10px 12px' }}>CONTACT</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleTableBadgeClick(res.table_number || 'Table 1')}
                        className="btn btn-secondary"
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: 'rgba(234, 139, 57, 0.12)',
                          borderColor: 'var(--primary)',
                          color: 'var(--primary)'
                        }}
                        title={`Jump to ${res.table_number || 'Table 1'}`}
                      >
                        {res.table_number || 'Table 1'} ↗
                      </button>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {res.name || res.guest_name}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {res.party_size || 2} Guests
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {res.preferred_date || res.date} at {res.preferred_time || res.time}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {res.phone || res.email || '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          res.status === 'seated' ? 'rgba(59, 130, 246, 0.15)' :
                          res.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' :
                          res.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                          'rgba(234, 139, 57, 0.15)',
                        color:
                          res.status === 'seated' ? '#3b82f6' :
                          res.status === 'confirmed' ? '#10b981' :
                          res.status === 'cancelled' ? '#ef4444' :
                          'var(--primary)'
                      }}>
                        {(res.status || 'confirmed').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {res.status !== 'seated' && (
                        <button
                          onClick={() => updateReservation(res.id, { status: 'seated' })}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        >
                          Seat Table
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =============================================================== */}
      {/* SECTIONS 3 & 4: COUPONS & INVENTORY STATUS (FLOWING FROM PART 2)*/}
      {/* =============================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Coupons from Part 2 */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} style={{ color: '#eab308' }} />
              <span>Active Coupons ({coupons.length})</span>
            </h2>
            <button onClick={onNavigateToPart2} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Manage in Part 2
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {coupons.map(c => (
              <div key={c.id} style={{
                background: 'var(--bg-surface)',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>{c.code}</span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min order: ₹{c.min_order || 0}</div>
                </div>
                <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '8px', background: 'rgba(234, 139, 57, 0.15)', color: 'var(--primary)', fontWeight: 700 }}>
                  {c.discount_percent ? `${c.discount_percent}% OFF` : c.discount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status from Part 2 */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} style={{ color: '#10b981' }} />
              <span>Ingredient Stock Status</span>
            </h2>
            <button onClick={onNavigateToPart2} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Manage in Part 2
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto' }}>
            {inventory.map(inv => {
              const isLow = inv.current_stock <= inv.min_threshold;
              return (
                <div key={inv.id} style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isLow ? '#ef4444' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{inv.item_name}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: isLow ? '#ef4444' : 'var(--text-main)', fontSize: '0.9rem' }}>
                      {inv.current_stock} {inv.unit}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: isLow ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {isLow ? '⚠️ Low Stock' : 'Adequate'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* SECTION 5: CENTRALIZED REVIEWS STREAM (ALL 3 PARTS)             */}
      {/* =============================================================== */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={22} style={{ color: '#eab308' }} />
              <span>Customer Reviews Stream ({reviews.length})</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Centrally stored across Part 1, Part 2, and Part 3.
            </p>
          </div>
          <button onClick={() => setIsReviewOpen(true)} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            + Post Review
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {reviews.slice(0, 6).map(rev => (
            <div key={rev.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{rev.name}</span>
                <div style={{ display: 'flex', color: '#eab308' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < rev.rating ? '#eab308' : 'none'} stroke={i < rev.rating ? '#eab308' : '#8c7e72'} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                {rev.favorite_item || 'Café Specialty'}
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal in Part 3 */}
      {isReviewOpen && (
        <div className="modal-backdrop" onClick={() => setIsReviewOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Add Review from Dashboard
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Stores in the centralized data layer and displays in all three parts.
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Reviewer Name *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Rating *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={24} fill={star <= reviewForm.rating ? '#eab308' : 'none'} stroke={star <= reviewForm.rating ? '#eab308' : '#8c7e72'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Item Mentioned</label>
                <input
                  type="text"
                  value={reviewForm.favorite_item}
                  onChange={(e) => setReviewForm({ ...reviewForm, favorite_item: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Comments *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsReviewOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Part3Dashboard;
