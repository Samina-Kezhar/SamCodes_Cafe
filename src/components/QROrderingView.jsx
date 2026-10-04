import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee, ShoppingBag, ArrowLeft, Search, Plus, Minus, Trash2,
  Clock, Check, MapPin, Tag, QrCode, Sparkles, CheckCircle2,
  AlertCircle, CreditCard, ChevronRight, X, Sun, Moon, Info,
  Smartphone, ShieldCheck, HeartHandshake, Utensils, Star, MessageSquare
} from 'lucide-react';
import QRCode from 'qrcode';
import { CustomizationModal } from './CustomizationModal.jsx';
import { CafenaLogoStamp } from './CafenaDecorations';

const ALL_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4', 'Counter / Takeaway'
];

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'signature_frappes', label: 'Signature Frappes', icon: '⭐' },
  { id: 'hot_coffee', label: 'Hot Specialty Coffee', icon: '☕' },
  { id: 'cold_brews', label: 'Cold Brews & Iced', icon: '❄️' },
  { id: 'refreshers', label: 'Artisan Coolers', icon: '🍹' },
  { id: 'sandwiches', label: 'Gourmet Paninis', icon: '🥪' },
  { id: 'waffles_desserts', label: 'Waffles & Sweets', icon: '🧇' },
  { id: 'snacks', label: 'Sides & Munchies', icon: '🍟' }
];

export function QROrderingView({
  table = 'Table 4',
  onBackToSite,
  theme = 'modern-latte',
  onToggleTheme
}) {
  const [activeTable, setActiveTable] = useState(table || 'Table 4');
  const [isSwitchTableOpen, setIsSwitchTableOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeestand_qr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);

  // Checkout & Payment state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('counter'); // 'counter' | 'online'
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Online Payment QR state
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);

  // Active Placed Order / Tracking state
  const [activePlacedOrder, setActivePlacedOrder] = useState(null);

  // Integrated Feedback / Testimonial state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const handleSubmitOrderFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim() || !activePlacedOrder) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activePlacedOrder.customer_name || 'Table Diner',
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          favorite_item: activePlacedOrder.items?.[0]?.name || 'House Special',
          source: `${activePlacedOrder.table_number} Verified Diner`
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit order feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('coffeestand_qr_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Load menu and offers
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [menuRes, offersRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/offers')
        ]);
        const mData = await menuRes.json();
        const oData = await offersRes.json();
        if (mData.success) setMenuItems(mData.items);
        if (oData.success) setOffers(oData.offers);
      } catch (err) {
        console.warn('Failed to load menu for QR view:', err);
      }
    };
    fetchCatalog();

    // Listen to WebSocket for live updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'MENU_STOCK_CHANGED') {
            setMenuItems((prev) =>
              prev.map((item) =>
                item.id === data.payload.id ? { ...item, in_stock: data.payload.in_stock } : item
              )
            );
          } else if (data.type === 'ORDER_UPDATED' && activePlacedOrder) {
            if (data.payload.id === activePlacedOrder.id) {
              setActivePlacedOrder(data.payload);
            }
          }
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn('WS error in QR view:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [activePlacedOrder]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (onlyVeg && !item.is_veg) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesTags = (item.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, onlyVeg]);

  // Cart operations
  const handleAddToCart = (newItem) => {
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCartItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const addonsTotal = (item.addons || []).reduce((aSum, a) => aSum + (parseFloat(a.price) || 0), 0);
    const sizeExtra = item.sizePrice ? parseFloat(item.sizePrice) : 0;
    const unitPrice = parseFloat(item.price || 0) + addonsTotal + sizeExtra;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  const tax = Math.round(subtotal * 0.05 * 100) / 100;

  // Coupon discount
  let discount = 0;
  if (appliedCoupon) {
    const offer = offers.find((o) => o.code === appliedCoupon);
    if (offer && subtotal >= (offer.min_order || 0)) {
      if (offer.discount_percent > 0) {
        discount = Math.round((subtotal * offer.discount_percent) / 100);
      } else if (offer.discount_amount > 0) {
        discount = offer.discount_amount;
      }
    }
  }

  const grandTotal = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Generate UPI QR Code when online payment is chosen
  useEffect(() => {
    if (paymentMethod === 'online' && grandTotal > 0) {
      // Standard Indian UPI Deep-link payload
      const upiId = 'cafena@hdfcbank';
      const payeeName = 'Cafena Nikol';
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Cafena ${activeTable}`)}`;

      QRCode.toDataURL(upiUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1c1510', light: '#ffffff' }
      })
        .then(setUpiQrDataUrl)
        .catch(console.error);
    }
  }, [paymentMethod, grandTotal, activeTable]);

  // Place Order handler
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    if (!customerName.trim()) {
      setOrderError('Please enter your name for the kitchen ticket.');
      return;
    }

    setOrderError('');
    setSubmittingOrder(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        table_number: activeTable,
        order_type: activeTable.toLowerCase().includes('takeaway') ? 'takeaway' : 'dine_in',
        items: cartItems,
        coupon_code: appliedCoupon,
        payment_method: paymentMethod === 'online' ? 'upi' : 'counter',
        kitchen_notes: kitchenNotes.trim()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success! Clear cart and show order tracker
      setActivePlacedOrder(data.order);
      setCartItems([]);
      setIsCartOpen(false);
      setShowOnlinePaymentModal(false);
    } catch (err) {
      setOrderError(err.message || 'Could not place order. Please check connection.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="qr-ordering-root" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* 1. Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-medium)',
          height: '76px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Back & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBackToSite}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px' }}
              title="Return to Customer Experience Website"
            >
              <ArrowLeft size={16} />
              <span className="hide-on-mobile">Café Website</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CafenaLogoStamp size={36} />
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                  CAFENA
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Contactless Table Ordering
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Table Badge, Theme & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Table Badge */}
            <button
              onClick={() => setIsSwitchTableOpen(true)}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.84rem',
                gap: '6px',
                borderColor: 'var(--primary)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontWeight: 700
              }}
              title="Click to switch table number"
            >
              <MapPin size={15} />
              <span>{activeTable}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>(Switch)</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="btn-icon"
              style={{ width: '40px', height: '40px', background: 'var(--bg-surface-elevated)' }}
              title="Toggle Day/Evening Theme"
            >
              {theme === 'warm-cream' ? <Moon size={18} style={{ color: 'var(--primary)' }} /> : <Sun size={18} style={{ color: 'var(--accent-gold)' }} />}
            </button>

            {/* Floating Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', gap: '8px', position: 'relative' }}
            >
              <ShoppingBag size={17} />
              <span>Cart ({totalCartCount})</span>
              {totalCartCount > 0 && (
                <span
                  style={{
                    background: '#fff',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Order Content */}
      <main className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
        {/* Table Banner Notice */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(199, 161, 122, 0.18), rgba(138, 90, 43, 0.1))',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                Seated at: <span style={{ color: 'var(--primary)' }}>{activeTable}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Your order is sent instantly to the kitchen display and served straight to your seat.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsSwitchTableOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              Change Table
            </button>
          </div>
        </div>

        {/* Live Order Tracker Banner (if active placed order exists) */}
        {activePlacedOrder && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.8rem',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Order Tracker • {activePlacedOrder.table_number}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  Order #{activePlacedOrder.id}
                </h3>
              </div>
              <span
                style={{
                  background: activePlacedOrder.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 139, 57, 0.15)',
                  color: activePlacedOrder.status === 'completed' ? '#10b981' : 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {activePlacedOrder.status.toUpperCase()}
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '1.5rem 0' }}>
              {[
                { key: 'received', label: '1. Received', desc: 'Sent to Kitchen' },
                { key: 'brewing', label: '2. Brewing', desc: 'Barista Preparing' },
                { key: 'ready', label: '3. Ready', desc: 'Serving to Table' },
                { key: 'completed', label: '4. Enjoyed', desc: 'Order Complete' }
              ].map((step, idx) => {
                const statusOrder = ['received', 'brewing', 'ready', 'completed'];
                const currentIdx = statusOrder.indexOf(activePlacedOrder.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.key} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: isPassed ? 'var(--primary)' : 'var(--border-subtle)',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    ></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : 600, color: isPassed ? 'var(--text-main)' : 'var(--text-dim)' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div>
                <strong>Items: </strong>
                {(activePlacedOrder.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', ')}
              </div>
              <div>
                <strong>Total: ₹{activePlacedOrder.total}</strong> ({activePlacedOrder.payment_method === 'upi' ? 'Online Paid' : 'Pay at Counter'})
              </div>
            </div>

            {/* Preparation / Kitchen Instructions Display After Checkout */}
            {activePlacedOrder.kitchen_notes && (
              <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: 'var(--primary-subtle)', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                <strong style={{ color: 'var(--primary)' }}>Your Special Preparation Instructions: </strong>
                <span>"{activePlacedOrder.kitchen_notes}"</span>
              </div>
            )}

            {/* Integrated Customer Feedback & Testimonial Submission */}
            <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)' }}>
              {feedbackSubmitted ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', padding: '1.2rem', textAlign: 'center' }}>
                  <CheckCircle2 size={26} style={{ color: '#10b981', margin: '0 auto 0.4rem auto' }} />
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>Thank you for your review!</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your feedback has been submitted directly to our kitchen & baristas.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrderFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <MessageSquare size={17} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Rate Your Dining Experience</span>
                    </div>

                    {/* Star Rating Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          style={{ padding: '2px', cursor: 'pointer' }}
                          title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            size={20}
                            fill={star <= feedbackRating ? '#f59e0b' : 'transparent'}
                            color={star <= feedbackRating ? '#f59e0b' : 'var(--text-dim)'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="How is your coffee & food? Leave feedback for the team..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.9rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.86rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={feedbackSubmitting || !feedbackComment.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.2rem', fontSize: '0.84rem', flexShrink: 0 }}
                    >
                      <span>{feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Available Offers & Combos Banner */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
            <Tag size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Available Table Deals & Offers
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}
          >
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                      {offer.code}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {offer.discount}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {offer.description} (Min ₹{offer.min_order})
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAppliedCoupon(offer.code);
                    setIsCartOpen(true);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', flexShrink: 0 }}
                >
                  {appliedCoupon === offer.code ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`filter-pill ${isActive ? 'active' : ''}`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Veg Toggle */}
        <div className="menu-controls">
          <div className="search-input-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search coffee, frappes, waffles, paninis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              userSelect: 'none'
            }}
          >
            <div className="veg-indicator" style={{ border: onlyVeg ? '1.5px solid #10b981' : undefined }}></div>
            <span>100% Pure Veg Menu</span>
          </label>
        </div>

        {/* Menu Cards Grid */}
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-card">
              {/* Image Wrap */}
              <div
                className="menu-card-img-wrap"
                onClick={() => item.in_stock && setCustomizingItem(item)}
                style={{ cursor: item.in_stock ? 'pointer' : 'default' }}
              >
                <img src={item.image} alt={item.name} className="menu-card-img" loading="lazy" />
                <div className="menu-card-badge-row">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(item.tags || []).map((tag) => (
                      <span key={tag} className="badge-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="veg-indicator" title="Pure Vegetarian"></div>
                </div>
              </div>

              {/* Card Body */}
              <div className="menu-card-body">
                <div className="menu-card-title-row">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <div className="menu-card-price">₹{item.price}</div>
                </div>

                <p className="menu-card-desc">{item.description}</p>

                <div className="menu-card-footer">
                  <div className="prep-time">
                    <Clock size={14} />
                    <span>{item.prep_time_mins || 8} mins</span>
                  </div>

                  {item.in_stock ? (
                    <button
                      onClick={() => setCustomizingItem(item)}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
                    >
                      <Plus size={15} />
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#ef4444',
                        fontWeight: 700,
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      Sold Out Today
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 2. Switch Table Modal */}
      {isSwitchTableOpen && (
        <div className="modal-backdrop" onClick={() => setIsSwitchTableOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Select Your Table</h3>
              </div>
              <button onClick={() => setIsSwitchTableOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Select your table number or area matching the tent card on your table:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {ALL_TABLES.map((t) => {
                  const isCurrent = activeTable === t;
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveTable(t);
                        setIsSwitchTableOpen(false);
                      }}
                      className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.65rem 0.4rem', fontSize: '0.84rem', justifyContent: 'center' }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 4. Slide-out Cart Drawer with Instructions & Payment Options */}
      {isCartOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div
            className="cart-drawer-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              animation: 'slideInRight 0.3s ease'
            }}
          >
            {/* Cart Header */}
            <div style={{ padding: '1.4rem 1.6rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Your Table Order
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                  Serving to {activeTable}
                </span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>Select delicious brews or bites from the menu to begin.</p>
                </div>
              ) : (
                <>
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Size: {item.size || 'Regular'} • ₹{item.price} each
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      {/* Customizations tags */}
                      {((item.customizations && item.customizations.length > 0) || (item.addons && item.addons.length > 0)) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(item.customizations || []).map((c, cIdx) => (
                            <span key={cIdx} style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                              {c}
                            </span>
                          ))}
                          {(item.addons || []).map((a, aIdx) => (
                            <span key={aIdx} style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                              +{a.name} (₹{a.price})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '2px 6px' }}>
                          <button
                            onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                            style={{ padding: '2px 6px', color: 'var(--text-main)' }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                            style={{ padding: '2px 6px', color: 'var(--text-main)' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Preparation Instructions / Barista Notes Field */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                      Item Preparation Instructions for Barista / Chef
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Extra hot, less sweet, no ice, serve waffles after panini..."
                      value={kitchenNotes}
                      onChange={(e) => setKitchenNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Customer Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rohan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                        Phone (for SMS update)
                      </label>
                      <input
                        type="tel"
                        placeholder="98250 12345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                      Payment Method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('counter')}
                        style={{
                          padding: '0.75rem 0.5rem',
                          border: paymentMethod === 'counter' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: paymentMethod === 'counter' ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Utensils size={18} style={{ color: paymentMethod === 'counter' ? 'var(--primary)' : 'var(--text-dim)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Pay at Counter</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cash/Card After Meal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        style={{
                          padding: '0.75rem 0.5rem',
                          border: paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: paymentMethod === 'online' ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Smartphone size={18} style={{ color: paymentMethod === 'online' ? 'var(--primary)' : 'var(--text-dim)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Online UPI QR</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPay / PhonePe / Paytm</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer & Bill Breakdown */}
            {cartItems.length > 0 && (
              <div style={{ padding: '1.4rem 1.6rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                {/* Bill Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>GST (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                      <span>Discount ({appliedCoupon}):</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Total Amount:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {orderError && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{orderError}</p>
                )}

                {/* Submit Order Action */}
                {paymentMethod === 'online' ? (
                  <button
                    onClick={() => setShowOnlinePaymentModal(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700, justifyContent: 'center' }}
                  >
                    <span>Proceed to UPI QR Payment (₹{grandTotal.toFixed(2)})</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700, justifyContent: 'center' }}
                  >
                    <span>{submittingOrder ? 'Placing Order...' : `Confirm Order for ${activeTable} (₹${grandTotal.toFixed(2)})`}</span>
                    <Check size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Online Payment Modal with Bank Transfer / UPI QR Code */}
      {showOnlinePaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowOnlinePaymentModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Scan UPI QR to Pay</h3>
              </div>
              <button onClick={() => setShowOnlinePaymentModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                {upiQrDataUrl ? (
                  <img src={upiQrDataUrl} alt="UPI Payment QR Code" style={{ width: '220px', height: '220px' }} />
                ) : (
                  <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Generating QR...
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Payee: <strong>Cafena Nikol (HDFC Bank)</strong>
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '2px', fontFamily: 'monospace' }}>
                  UPI ID: cafena@hdfcbank
                </div>
              </div>

              <div style={{ width: '100%', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  UPI Reference / UTR Number (Optional confirmation):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 428190382910"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submittingOrder}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center' }}
              >
                <CheckCircle2 size={18} />
                <span>{submittingOrder ? 'Verifying & Placing...' : 'I Have Paid • Place My Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
