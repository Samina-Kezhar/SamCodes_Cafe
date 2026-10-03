import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Coffee, Sparkles, Printer, Search, AlertCircle, ShoppingBag } from 'lucide-react';
import { playChime } from '../utils/audioAlert.js';

export function OrderTrackingModal({ isOpen, onClose, initialOrder }) {
  const [order, setOrder] = useState(initialOrder || null);
  const [searchId, setSearchId] = useState(initialOrder ? initialOrder.id : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch order by ID
  const fetchOrder = async (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please check your Order ID.');
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
            setOrder(data.payload);
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time updates from Coffee Stand Kitchen</p>
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

                {/* Status Message Banner */}
                <div
                  style={{
                    background: currentStep === 2
                      ? 'rgba(59, 130, 246, 0.15)'
                      : currentStep === 3
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'var(--primary-subtle)',
                    border: `1px solid ${currentStep === 2 ? '#3b82f6' : currentStep === 3 ? '#10b981' : 'var(--primary)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1.2rem',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                    {order.status === 'received' && '🟡 Order Received — Barista will begin brewing shortly.'}
                    {order.status === 'brewing' && '🔥 Brewing in Progress — Grinding fresh beans & preparing food!'}
                    {order.status === 'ready' && '🎉 Order is Ready! Your items are being served to your table.'}
                    {order.status === 'completed' && '✨ Completed! Thank you for visiting Coffee Stand Nikol.'}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Estimated Prep: ~{order.status === 'ready' || order.status === 'completed' ? 'Done' : '8-10 mins'}
                  </p>
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
                  <span>₹{(order.subtotal + order.tax).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Coupon Discount:</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.3rem' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{order.total.toFixed(2)}</span>
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
