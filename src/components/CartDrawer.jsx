import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Table 11', 'Table 12', 'Patio 1', 'Patio 2', 'Patio 3', 'Counter / Takeaway'
];

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  activeTable,
  onOrderPlaced
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState(activeTable || 'Table 4');
  const [orderType, setOrderType] = useState('dine_in');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Calculate pricing
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discount_percent > 0) {
      discount = Math.round((subtotal * appliedCoupon.discount_percent) / 100);
    } else if (appliedCoupon.discount_amount > 0) {
      discount = appliedCoupon.discount_amount;
    }
  }

  const grandTotal = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);

  const handleApplyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (data.success && data.offers) {
        const found = data.offers.find((o) => o.code === code);
        if (found) {
          if (subtotal < (found.min_order || 0)) {
            setCouponError(`Minimum order of ₹${found.min_order} required for ${found.code}`);
            return;
          }
          setAppliedCoupon(found);
          return;
        }
      }
      setCouponError('Invalid coupon code. Check our Offers section.');
    } catch {
      setCouponError('Could not validate coupon. Please try again.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          table_number: orderType === 'takeaway' ? 'Takeaway' : tableNumber,
          order_type: orderType,
          items: cartItems,
          coupon_code: appliedCoupon ? appliedCoupon.code : '',
          payment_method: paymentMethod,
          kitchen_notes: kitchenNotes.trim()
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      if (data.tracking_token) {
        localStorage.setItem('coffeestand_active_order_token', data.tracking_token);
      }
      localStorage.setItem('coffeestand_active_order', JSON.stringify(data.order));

      // Confetti burst!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClearCart();
      if (onOrderPlaced) {
        onOrderPlaced(data.order, data.tracking_token);
      }
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Error submitting order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={onClose} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Order Cart</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({cartItems.length} items)</span>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close cart drawer">
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.2rem auto',
                  color: 'var(--text-dim)'
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Browse our specialty frappes, hot brews, and paninis to add delicious items!
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="cart-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.name}</h4>
                    {item.size && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-gold)' }}>
                        Size: {item.size}
                      </span>
                    )}
                    {item.customizations && item.customizations.length > 0 && (
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.customizations.join(', ')}
                      </p>
                    )}
                    {item.kitchenNotes && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {item.kitchenNotes}
                      </p>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                      className="btn-icon"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="btn-icon"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(idx)}
                    style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Customer Order Details Form */}
          {cartItems.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
                Dining & Table Details
              </div>

              {/* Order Type Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: orderType === 'dine_in' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: orderType === 'dine_in' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  🍽️ Dine-in (Table Service)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: orderType === 'takeaway' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: orderType === 'takeaway' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  🥡 Takeaway / Pickup
                </button>
              </div>

              {/* Table Selector (if Dine In) */}
              {orderType === 'dine_in' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Select Your Table
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    {TABLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Patel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                  Phone Number (for order SMS updates)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 98250 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      background: paymentMethod === 'upi' ? 'rgba(234, 139, 57, 0.2)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      color: paymentMethod === 'upi' ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    ⚡ UPI / Table QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('counter')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      background: paymentMethod === 'counter' ? 'rgba(234, 139, 57, 0.2)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${paymentMethod === 'counter' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      color: paymentMethod === 'counter' ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    💵 Cash/Card at Counter
                  </button>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. BREW20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.8rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Check size={12} /> Coupon <strong>{appliedCoupon.code}</strong> applied!
                  </p>
                )}
                {couponError && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                    {couponError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Calculations & Submit */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                  <span>Offer Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: 800, fontSize: '1.15rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {submitError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.8rem' }}>
                <AlertCircle size={14} />
                <span>{submitError}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {submitting ? 'Placing Order...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
