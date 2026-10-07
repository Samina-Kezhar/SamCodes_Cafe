import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Coffee, ShoppingBag, Search, Plus, Minus, Trash2,
  Clock, Check, MapPin, Tag, QrCode, Sparkles, CheckCircle2,
  AlertCircle, CreditCard, ChevronRight, ArrowRight, X, Sun, Moon, Info,
  Smartphone, ShieldCheck, HeartHandshake, Utensils, Star, MessageSquare,
  Flame, Bell, Hourglass
} from 'lucide-react';
import QRCode from 'qrcode';
import { CustomizationModal } from './CustomizationModal.jsx';
import { CafenaLogoStamp } from './CafenaDecorations';
import { MenuCategoryCarousel } from './MenuCategoryCarousel';

const ALL_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4', 'Counter / Takeaway'
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'signature_frappes', label: 'Signature Frappes', icon: '⭐', desc: 'Blended roastery frappes with rich cream and gourmet toppings' },
  { id: 'hot_coffee', label: 'Hot Specialty Coffee', icon: '☕', desc: 'Single-origin Arabica roasts, silky micro-foam, and hand-poured latte art' },
  { id: 'cold_brews', label: 'Cold Brews & Iced', icon: '❄️', desc: '18-hour slow-steeped cold brews and classic iced frappes' },
  { id: 'refreshers', label: 'Artisan Coolers', icon: '🍹', desc: 'Hibiscus botanical teas, sparkling coolers, and ceremonial matcha' },
  { id: 'sandwiches', label: 'Gourmet Paninis', icon: '🥪', desc: 'Grilled artisan sourdough with fresh pestos and melted cheeses' },
  { id: 'waffles_desserts', label: 'Waffles & Sweets', icon: '🧇', desc: 'Crispy Belgian waffles, sizzling brownies, and gelato pairings' },
  { id: 'snacks', label: 'Sides & Munchies', icon: '🍟', desc: 'Peri-peri crinkle fries and cheesy garlic pull-apart breads' }
];

export function QROrderingView({
  table = 'Table 4',
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

  // Cart state (Unified across customer website & QR ordering) (U02)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeestand_cart') || localStorage.getItem('coffeestand_qr_cart');
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
  const [activePlacedOrder, setActivePlacedOrder] = useState(() => {
    try {
      const savedOrder = localStorage.getItem('coffeestand_active_order');
      return savedOrder ? JSON.parse(savedOrder) : null;
    } catch {
      return null;
    }
  });

  // Current timestamp for live countdown calculation
  const [currentTimerTime, setCurrentTimerTime] = useState(Date.now());

  useEffect(() => {
    if (!activePlacedOrder || activePlacedOrder.status === 'completed' || activePlacedOrder.status === 'cancelled') {
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimerTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [activePlacedOrder]);

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
      localStorage.setItem('coffeestand_cart', JSON.stringify(cartItems));
      localStorage.setItem('coffeestand_qr_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Persist active order
  useEffect(() => {
    try {
      if (activePlacedOrder) {
        localStorage.setItem('coffeestand_active_order', JSON.stringify(activePlacedOrder));
      } else {
        localStorage.removeItem('coffeestand_active_order');
        localStorage.removeItem('coffeestand_active_order_token');
      }
    } catch {
      // ignore
    }
  }, [activePlacedOrder]);

  // Load menu and offers + WebSocket synchronization with Part 2 (Owner Panel)
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

    // Re-verify active order from server if exists with IDOR token (S08)
    if (activePlacedOrder?.id) {
      const token = activePlacedOrder.tracking_token || localStorage.getItem('coffeestand_active_order_token') || '';
      const url = token
        ? `/api/orders/${encodeURIComponent(activePlacedOrder.id)}?token=${encodeURIComponent(token)}`
        : `/api/orders/${encodeURIComponent(activePlacedOrder.id)}`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.order) {
            setActivePlacedOrder(data.order);
          }
        })
        .catch(() => {});
    }

    // Connect to WebSocket for instant bidirectional menu updates and order updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // 1. Instant Menu Updates from Owner Panel (Part 2)
            if (data.type === 'MENU_STOCK_CHANGED') {
              setMenuItems((prev) =>
                prev.map((item) =>
                  item.id === data.payload.id ? { ...item, in_stock: data.payload.in_stock } : item
                )
              );
            } else if (data.type === 'MENU_ITEM_UPDATED') {
              setMenuItems((prev) =>
                prev.map((item) => (item.id === data.payload.id ? data.payload : item))
              );
            } else if (data.type === 'MENU_ITEM_ADDED') {
              setMenuItems((prev) => {
                if (prev.some((m) => m.id === data.payload.id)) return prev;
                return [...prev, data.payload];
              });
            } else if (data.type === 'MENU_ITEM_DELETED') {
              setMenuItems((prev) => prev.filter((m) => m.id !== data.payload.id));
            }
            // 2. Real-time Order Workflow Updates from Kitchen
            else if (data.type === 'ORDER_UPDATED' && activePlacedOrder) {
              if (data.payload.id === activePlacedOrder.id) {
                setActivePlacedOrder((prev) => (prev ? { ...prev, ...data.payload } : data.payload));
              }
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        console.warn('WS error in QR view:', err);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
    };
  }, [activePlacedOrder?.id]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
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
  }, [menuItems, searchQuery, onlyVeg]);

  // Active category carousels
  const activeCategories = useMemo(() => {
    const dishCategories = CATEGORIES.filter((c) => c.id !== 'all');
    if (selectedCategory !== 'all') {
      return dishCategories.filter((c) => c.id === selectedCategory);
    }
    return dishCategories;
  }, [selectedCategory]);

  const hasAnyItems = useMemo(() => {
    return activeCategories.some((cat) => filteredItems.some((item) => item.category === cat.id));
  }, [activeCategories, filteredItems]);

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

  // Accurate Bill & Extra Charges Calculations
  const baseDishesSubtotal = cartItems.reduce((sum, item) => {
    const baseP = parseFloat(item.basePrice || item.price || 0);
    return sum + baseP * (item.quantity || 1);
  }, 0);

  const customizationsTotal = cartItems.reduce((sum, item) => {
    const addonsTotal = (item.addons || []).reduce((aSum, a) => aSum + (parseFloat(a.price) || 0), 0);
    const sizeExtra = parseFloat(item.sizePrice || 0);
    const milkExtra = parseFloat(item.milkPrice || 0);
    const extraPerUnit = addonsTotal + sizeExtra + milkExtra;
    return sum + extraPerUnit * (item.quantity || 1);
  }, 0);

  const subtotal = baseDishesSubtotal + customizationsTotal;
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

  // Place Order handler (Syncs directly to Owner Panel Part 2)
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

      // Success! Clear cart, store order and trigger real-time order tracking
      if (data.tracking_token) {
        localStorage.setItem('coffeestand_active_order_token', data.tracking_token);
      }
      setActivePlacedOrder({ ...data.order, tracking_token: data.tracking_token });
      setCartItems([]);
      setIsCartOpen(false);
      setShowOnlinePaymentModal(false);
      setFeedbackSubmitted(false);
      setFeedbackComment('');
    } catch (err) {
      setOrderError(err.message || 'Could not place order. Please check connection.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Real-time Timing & Countdown Calculations for Order Tracking (U06)
  const trackingTiming = useMemo(() => {
    if (!activePlacedOrder) return null;

    const estimatedMins = activePlacedOrder.estimated_prep_mins || 10;
    const createdAtMs = new Date(activePlacedOrder.created_at).getTime();
    const targetReadyMs = createdAtMs + estimatedMins * 60 * 1000;
    const elapsedMs = Math.max(0, currentTimerTime - createdAtMs);
    const remainingMs = Math.max(0, targetReadyMs - currentTimerTime);
    const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
    const minsRemaining = Math.floor(remainingSecs / 60);
    const secsRemaining = remainingSecs % 60;

    const formattedRemaining = remainingSecs === 0 ? '0:00' : `${minsRemaining}:${secsRemaining < 10 ? '0' : ''}${secsRemaining}`;
    const totalPrepMs = Math.max(1, estimatedMins * 60 * 1000);
    const progressPercent = Math.min(95, Math.max(5, Math.round((elapsedMs / totalPrepMs) * 100)));

    const readyTargetDate = new Date(targetReadyMs);
    const readyTimeStr = readyTargetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      estimatedMins,
      readyTimeStr,
      minsRemaining,
      secsRemaining,
      formattedRemaining,
      progressPercent,
      isFinishingUp: remainingSecs === 0 && (activePlacedOrder.status === 'received' || activePlacedOrder.status === 'brewing'),
      elapsedMins: Math.round(elapsedMs / 60000)
    };
  }, [activePlacedOrder, currentTimerTime]);

  return (
    <div className="qr-ordering-root" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* 1. Header Bar — Completely Standalone (No Part 1 link, No Part 2 owner access) */}
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
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {/* Café Brand & Contactless Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
            <CafenaLogoStamp size={38} />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                CAFENA
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                QR Table Menu
              </div>
            </div>
          </div>

          {/* Right Controls: Table Badge, Theme & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {/* Table Badge */}
            <button
              onClick={() => setIsSwitchTableOpen(true)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.65rem',
                fontSize: '0.8rem',
                gap: '4px',
                borderColor: 'var(--primary)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontWeight: 700
              }}
              title="Click to switch table number"
            >
              <MapPin size={14} />
              <span>{activeTable}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="btn-icon"
              style={{ width: '36px', height: '36px', background: 'var(--bg-surface-elevated)' }}
              title="Toggle Day/Evening Theme"
            >
              {theme === 'warm-cream' ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--accent-gold)' }} />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '6px', position: 'relative' }}
              title="View your cart"
            >
              <ShoppingBag size={16} />
              <span>Cart ({totalCartCount})</span>
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
                Orders placed here sync directly to the Kitchen Dashboard in real-time.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSwitchTableOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            Change Table
          </button>
        </div>

        {/* ========================================================================= */}
        {/* REAL-TIME ORDER TRACKING FEATURE WITH ESTIMATED TIME & REMAINING COUNTDOWN */}
        {/* ========================================================================= */}
        {activePlacedOrder && (
          <div
            className="order-tracking-banner"
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.8rem',
              marginBottom: '2.8rem',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Live Kitchen Tracker • {activePlacedOrder.table_number}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    ⚡ Real-time WebSocket
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '3px', margin: 0 }}>
                  Order #{activePlacedOrder.id}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: activePlacedOrder.status === 'completed'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : activePlacedOrder.status === 'ready'
                      ? 'rgba(59, 130, 246, 0.18)'
                      : activePlacedOrder.status === 'brewing'
                      ? 'rgba(234, 139, 57, 0.18)'
                      : 'rgba(245, 158, 11, 0.18)',
                    color: activePlacedOrder.status === 'completed'
                      ? '#10b981'
                      : activePlacedOrder.status === 'ready'
                      ? '#3b82f6'
                      : 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid currentColor',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="pulse-dot"></span>
                  <span>{activePlacedOrder.status.toUpperCase()}</span>
                </span>

                <button
                  onClick={() => setActivePlacedOrder(null)}
                  className="btn-icon"
                  style={{ width: '32px', height: '32px' }}
                  title="Dismiss tracker"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* DYNAMIC TIMING & REMAINING COUNTDOWN DISPLAY BOX */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.2rem',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Stage description */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {activePlacedOrder.status === 'received' && <Hourglass size={18} style={{ color: '#f59e0b' }} />}
                  {activePlacedOrder.status === 'brewing' && <Flame size={18} style={{ color: 'var(--primary)' }} />}
                  {activePlacedOrder.status === 'ready' && <Bell size={18} style={{ color: '#3b82f6' }} />}
                  {activePlacedOrder.status === 'completed' && <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {activePlacedOrder.status === 'received' && 'Stage 1: Order Queued in Kitchen'}
                    {activePlacedOrder.status === 'brewing' && 'Stage 2: Baristas Brewing & Preparing'}
                    {activePlacedOrder.status === 'ready' && 'Stage 3: Food & Drinks Ready!'}
                    {activePlacedOrder.status === 'completed' && 'Stage 4: Served & Enjoyed'}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {activePlacedOrder.status === 'received' && 'Your ticket has been sent to our espresso station. Preparation will start momentarily.'}
                  {activePlacedOrder.status === 'brewing' && 'Barista is pulling fresh shots, steaming milk, and pressing your paninis fresh.'}
                  {activePlacedOrder.status === 'ready' && `Your handcrafted order is ready and being delivered to ${activePlacedOrder.table_number}.`}
                  {activePlacedOrder.status === 'completed' && 'Order has been fulfilled. Thank you for visiting Cafena Nikol!'}
                </p>
              </div>

              {/* Right Column: Estimated Preparation Time & Remaining Countdown */}
              {trackingTiming && (
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Estimated Prep Time:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ~{trackingTiming.estimatedMins} minutes (Est. {trackingTiming.readyTimeStr})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Time Remaining:</span>
                    <span
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        color: activePlacedOrder.status === 'ready'
                          ? '#3b82f6'
                          : activePlacedOrder.status === 'completed'
                          ? '#10b981'
                          : 'var(--primary)'
                      }}
                    >
                      {activePlacedOrder.status === 'ready'
                        ? 'Ready Now! (0 mins)'
                        : activePlacedOrder.status === 'completed'
                        ? '00:00 (Completed)'
                        : `⏳ ${trackingTiming.formattedRemaining} remaining`}
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: activePlacedOrder.status === 'ready' || activePlacedOrder.status === 'completed'
                          ? '100%'
                          : `${trackingTiming.progressPercent}%`,
                        background: activePlacedOrder.status === 'completed'
                          ? '#10b981'
                          : activePlacedOrder.status === 'ready'
                          ? '#3b82f6'
                          : 'linear-gradient(90deg, var(--primary), var(--accent-gold))',
                        transition: 'width 1s linear'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '1.5rem 0' }}>
              {[
                { key: 'received', label: '1. Received', desc: 'Queued in Kitchen' },
                { key: 'brewing', label: '2. Brewing', desc: 'Crafting Fresh' },
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
                    />
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

            {/* Itemized Order Details */}
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem 1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <div>
                <strong>Items: </strong>
                {(activePlacedOrder.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', ')}
              </div>
              <div>
                <strong>Total: ₹{activePlacedOrder.total}</strong> ({activePlacedOrder.payment_method === 'upi' ? 'Online Paid' : 'Pay at Counter'})
              </div>
            </div>

            {/* Special Instructions */}
            {activePlacedOrder.kitchen_notes && (
              <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: 'var(--primary-subtle)', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                <strong style={{ color: 'var(--primary)' }}>Special Preparation Instructions: </strong>
                <span>"{activePlacedOrder.kitchen_notes}"</span>
              </div>
            )}

            {/* Integrated Customer Feedback */}
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

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          style={{ padding: '2px', cursor: 'pointer', background: 'none', border: 'none' }}
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
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
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
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
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'all') {
                    const el = document.getElementById(`cat-${cat.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
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

        {/* ========================================================================= */}
        {/* MENU DISPLAY AS CAROUSEL/SLIDER COMPONENTS ORGANIZED BY DISH TYPES        */}
        {/* ========================================================================= */}
        {!hasAnyItems ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No menu items found</p>
            <p style={{ fontSize: '0.9rem' }}>Try searching with a different keyword or reset filters.</p>
          </div>
        ) : (
          <div className="menu-carousels-container">
            {activeCategories.map((category) => {
              const categoryItems = filteredItems.filter((item) => item.category === category.id);
              if (categoryItems.length === 0) return null;

              return (
                <MenuCategoryCarousel
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  onCardClick={(item) => item.in_stock && setCustomizingItem(item)}
                  renderCardAction={(item) => (
                    item.in_stock ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomizingItem(item);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.84rem', gap: '5px' }}
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
                    )
                  )}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 2. Item Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 3. Switch Table Modal */}
      {isSwitchTableOpen && (
        <div className="modal-backdrop" onClick={() => setIsSwitchTableOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Select Dining Table</h3>
              </div>
              <button onClick={() => setIsSwitchTableOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Choose your table or seating location. Orders will be delivered straight to your seat:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {ALL_TABLES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveTable(t);
                      setIsSwitchTableOpen(false);
                    }}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: activeTable === t ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      color: activeTable === t ? '#fff' : 'var(--text-main)',
                      border: `1px solid ${activeTable === t ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cart Drawer with Itemized Extras & Full Updated Total Breakdown */}
      {isCartOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div
            className="cart-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.4rem 1.6rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Your Order Cart</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Serving at: <strong>{activeTable}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>Select coffee, frappes, or bites to start your table order.</p>
                </div>
              ) : (
                <>
                  {cartItems.map((item, idx) => {
                    const itemBase = parseFloat(item.basePrice || item.price || 0);
                    const addonsSum = (item.addons || []).reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
                    const sizeSum = parseFloat(item.sizePrice || 0);
                    const milkSum = parseFloat(item.milkPrice || 0);
                    const itemUnitTotal = itemBase + addonsSum + sizeSum + milkSum;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                              {item.name}
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Base Price: ₹{itemBase} • Size: {item.size || 'Regular'}
                            </span>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                            ₹{itemUnitTotal * item.quantity}
                          </span>
                        </div>

                        {/* Itemized Extra Charges Breakdown */}
                        {((item.customizations && item.customizations.length > 0) || (item.addons && item.addons.length > 0) || sizeSum > 0 || milkSum > 0) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Customization Details:</span>
                            {sizeSum > 0 && <span>• Size {item.size}: +₹{sizeSum}</span>}
                            {item.milk && <span>• Milk: {item.milk} {milkSum > 0 ? `(+₹${milkSum})` : ''}</span>}
                            {(item.addons || []).map((a, aIdx) => (
                              <span key={aIdx}>• {a.name}: +₹{a.price}</span>
                            ))}
                            <span style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                              Updated Unit Price: ₹{itemUnitTotal} each
                            </span>
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '2px 6px' }}>
                            <button
                              onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                              style={{ padding: '2px 6px', color: 'var(--text-main)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                              style={{ padding: '2px 6px', color: 'var(--text-main)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

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

            {/* Cart Footer & Bill Breakdown with Updated Total Price */}
            {cartItems.length > 0 && (
              <div style={{ padding: '1.4rem 1.6rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                {/* Transparent Bill Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Original Dish Subtotal:</span>
                    <span>₹{baseDishesSubtotal.toFixed(2)}</span>
                  </div>

                  {customizationsTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600 }}>
                      <span>Customization Extras & Toppings:</span>
                      <span>+₹{customizationsTotal.toFixed(2)}</span>
                    </div>
                  )}

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

                  {/* DISPLAY UPDATED TOTAL PRICE PROMINENTLY BEFORE CONFIRMATION */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: 'var(--text-main)',
                      paddingTop: '8px',
                      marginTop: '4px',
                      borderTop: '1.5px solid var(--border-medium)'
                    }}
                  >
                    <span>Final Updated Total:</span>
                    <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
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
                    style={{ width: '100%', padding: '0.88rem', fontSize: '1rem', fontWeight: 800, justifyContent: 'center' }}
                  >
                    <span>Proceed to UPI QR Payment (₹{grandTotal.toFixed(2)})</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.88rem', fontSize: '1rem', fontWeight: 800, justifyContent: 'center' }}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Scan UPI QR to Pay</h3>
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
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)', display: 'block' }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Payee: <strong>Cafena Nikol (HDFC Bank)</strong>
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: '2px', fontFamily: 'monospace' }}>
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
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 800, justifyContent: 'center' }}
              >
                <CheckCircle2 size={18} />
                <span>{submittingOrder ? 'Verifying & Placing...' : `I Have Paid • Place My Order (₹${grandTotal.toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar for Mobile View (Issue 7) */}
      {totalCartCount > 0 && !isCartOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 100,
            background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.2rem',
            cursor: 'pointer'
          }}
          onClick={() => setIsCartOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  background: '#fff',
                  color: 'var(--primary)',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {totalCartCount}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>View Order Cart</div>
              <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>{activeTable} • ₹{subtotal}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem' }}>
            <span>Checkout</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
