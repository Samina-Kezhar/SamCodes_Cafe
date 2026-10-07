import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Coffee, Sparkles, Printer, Search, AlertCircle, ShoppingBag } from 'lucide-react';
import { playChime } from '../utils/audioAlert.js';

export function OrderTrackingModal({ isOpen, onClose, initialOrder }) {
  const [order, setOrder] = useState(initialOrder || null);
  const [searchId, setSearchId] = useState(initialOrder ? initialOrder.id : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTimerTime, setCurrentTimerTime] = useState(Date.now());

  // Sync with initialOrder or localStorage when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (initialOrder) {
      setOrder(initialOrder);
      setSearchId(initialOrder.id);
    } else {
      const stored = localStorage.getItem('coffeestand_active_order');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrder(parsed);
          setSearchId(parsed.id);
        } catch {
          // ignore
        }
      }
    }
  }, [initialOrder, isOpen]);

  // 1-second interval for real-time countdown
  useEffect(() => {
    if (!isOpen || !order || order.status === 'ready' || order.status === 'completed' || order.status === 'cancelled') {
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimerTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, order]);

  // Compute timing & remaining countdown
  const orderTiming = React.useMemo(() => {
    if (!order) return null;
    const createdAt = new Date(order.created_at || Date.now()).getTime();
    const prepMins = order.estimated_prep_mins || 10;
    const targetReadyAt = createdAt + prepMins * 60 * 1000;
    const now = currentTimerTime;
    const elapsedMs = Math.max(0, now - createdAt);
    const remainingMs = Math.max(0, targetReadyAt - now);

    let progressPercent = 0;
    if (order.status === 'received') {
      progressPercent = 25;
    } else if (order.status === 'brewing') {
      const timeProgress = Math.min(95, 25 + Math.round((elapsedMs / (prepMins * 60 * 1000)) * 70));
      progressPercent = Math.max(35, timeProgress);
    } else if (order.status === 'ready') {
      progressPercent = 95;
    } else if (order.status === 'completed') {
      progressPercent = 100;
    }

    const secsRemaining = Math.max(0, Math.floor(remainingMs / 1000));
    const minsLeft = Math.floor(secsRemaining / 60);
    const secsLeft = secsRemaining % 60;
    const formattedRemaining = secsRemaining === 0 ? '0:00' : `${minsLeft}:${secsLeft < 10 ? '0' : ''}${secsLeft}`;

    const formattedTargetTime = new Date(targetReadyAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      prepMins,
      createdAt,
      targetReadyAt,
      formattedTargetTime,
      remainingMs,
      secsRemaining,
      formattedRemaining,
      progressPercent,
      isFinishingUp: secsRemaining === 0 && (order.status === 'received' || order.status === 'brewing'),
      elapsedMins: Math.round(elapsedMs / 60000)
    };
  }, [order, currentTimerTime]);

  // Fetch order by ID with IDOR tracking token support (S08)
  const fetchOrder = async (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = order?.tracking_token || localStorage.getItem('coffeestand_active_order_token') || '';
      const url = token
        ? `/api/orders/${encodeURIComponent(id.trim())}?token=${encodeURIComponent(token)}`
        : `/api/orders/${encodeURIComponent(id.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found. Please check your Order ID.');
      }
    } catch {
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time WebSocket listener for order updates
  useEffect(() => {
    if (!isOpen) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ORDER_UPDATED' && data.payload && order && data.payload.id === order.id) {
            setOrder((prev) => (prev ? { ...prev, ...data.payload } : data.payload));
            playChime();
          }
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn('WS error in tracker:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [order?.id, isOpen]);

  if (!isOpen) return null;

  const getStepIndex = (status) => {
    switch (status) {
      case 'received': return 0;
      case 'brewing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received by kitchen bar' },
    { label: 'Crafting & Brewing', desc: 'Barista preparing your order' },
    { label: 'Ready for Service', desc: 'Heading to your table / counter' },
    { label: 'Completed', desc: 'Enjoy your coffee experience!' }
  ];

  const currentStep = getStepIndex(order?.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Coffee size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Order Status</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time updates from Cafena Kitchen</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Search Box if not tracking an active order */}
          {!initialOrder && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. CS-1082)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="search-input"
                style={{ flex: 1, padding: '0.65rem 1rem' }}
              />
              <button
                type="button"
                onClick={() => fetchOrder(searchId)}
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.65rem 1.2rem' }}
              >
                <Search size={16} />
                <span>Track</span>
              </button>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {order ? (
            <>
              {/* Order Info Card */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                    {order.id}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    Customer: <strong>{order.customer_name}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serving To</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {order.table_number}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Payment: <strong style={{ textTransform: 'uppercase' }}>{order.payment_status} ({order.payment_method})</strong>
                  </div>
                </div>
              </div>

              {/* Live Status Stepper */}
              <div style={{ margin: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '1.5rem' }}>
                  {/* Progress Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '18px',
                      left: '20px',
                      right: '20px',
                      height: '3px',
                      background: 'var(--bg-surface-elevated)',
                      zIndex: 1
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(currentStep / 3) * 100}%`,
                        background: 'linear-gradient(90deg, var(--primary), #10b981)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {steps.map((st, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={st.label}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 2,
                          width: '80px',
                          textAlign: 'center'
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isDone ? (isCurrent ? 'var(--primary)' : '#10b981') : 'var(--bg-surface-elevated)',
                            border: `2px solid ${isDone ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: isCurrent ? '0 0 14px var(--primary-glow)' : undefined,
                            transition: 'all 0.3s'
                          }}
                        >
                          {idx < currentStep ? <CheckCircle size={18} /> : <span>{idx + 1}</span>}
                        </div>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isDone ? 'var(--text-main)' : 'var(--text-dim)',
                            marginTop: '6px',
                            lineHeight: 1.2
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status & Real-time Countdown Banner */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1.5px solid ${currentStep === 2 ? '#3b82f6' : currentStep === 3 ? '#10b981' : 'var(--primary)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)', margin: 0 }}>
                        {order.status === 'received' && '🟡 Order Received — Barista will begin brewing shortly.'}
                        {order.status === 'brewing' && '🔥 Brewing in Progress — Grinding fresh beans & preparing food!'}
                        {order.status === 'ready' && '🎉 Order is Ready! Your items are being served to your table.'}
                        {order.status === 'completed' && '✨ Completed! Thank you for visiting Cafena Nikol.'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                        Estimated Prep Time: <strong>~{orderTiming?.prepMins || 10} minutes</strong>
                        {orderTiming?.formattedTargetTime && order.status !== 'ready' && order.status !== 'completed' && (
                          <span> • Ready by <strong>{orderTiming.formattedTargetTime}</strong></span>
                        )}
                      </p>
                    </div>

                    {/* Live Countdown Chip */}
                    {order.status !== 'ready' && order.status !== 'completed' ? (
                      <div
                        style={{
                          background: 'rgba(234, 139, 57, 0.15)',
                          border: '1.5px solid var(--primary)',
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: 'var(--primary)'
                        }}
                      >
                        <Clock size={16} />
                        <span>
                          {orderTiming?.secsRemaining > 0
                            ? `⏳ ${orderTiming.formattedRemaining} remaining`
                            : '⚡ Almost ready now!'}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1.5px solid #10b981',
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#10b981'
                        }}
                      >
                        <CheckCircle size={16} />
                        <span>Order Ready!</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '6px',
                      background: 'var(--border-subtle)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${orderTiming?.progressPercent || 25}%`,
                        background: order.status === 'completed'
                          ? '#10b981'
                          : 'linear-gradient(90deg, var(--primary), var(--accent-caramel))',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Itemized Order Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Ordered Items
                </div>
                {(order.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.55rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700 }}>{it.quantity}x </span>
                      <span>{it.name}</span>
                      {it.size && <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}> ({it.size})</span>}
                      {it.customizations && it.customizations.length > 0 && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {it.customizations.join(', ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{it.itemTotal || it.price * it.quantity}</span>
                  </div>
                ))}

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', paddingTop: '0.4rem' }}>
                  <span>Subtotal + GST:</span>
                  <span>₹{((Number(order.subtotal) || 0) + (Number(order.tax) || 0)).toFixed(2)}</span>
                </div>
                {(Number(order.discount) || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Coupon Discount:</span>
                    <span>-₹{(Number(order.discount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.3rem' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{(Number(order.total) || 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p>Enter your 6-digit Order ID (printed on receipt or SMS) to check preparation status in real-time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {order && (
          <div className="modal-footer">
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            >
              <Printer size={15} />
              <span>Print Receipt / KOT</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
