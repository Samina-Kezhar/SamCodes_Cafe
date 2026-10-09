import React, { useState } from 'react';
import {
  Utensils,
  Tag,
  Package,
  ShoppingBag,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  Percent,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { InstagramLink } from './InstagramLink';

const MENU_CATEGORIES = [
  { id: 'signature_frappes', label: 'Signature Frappes' },
  { id: 'specialty_coffee', label: 'Specialty Coffee' },
  { id: 'hot_classics', label: 'Hot Classics' },
  { id: 'cold_brews', label: 'Cold Brews' },
  { id: 'artisanal_paninis', label: 'Artisanal Paninis' },
  { id: 'gourmet_waffles', label: 'Gourmet Waffles' },
  { id: 'sides', label: 'Quick Bites & Sides' }
];

const TABLES_LIST = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4',
  'Table 5', 'Table 6', 'Table 7', 'Table 8',
  'Table 9', 'Table 10', 'Table 11', 'Table 12',
  'Patio 1', 'Patio 2', 'Takeaway'
];

export function Part2Operations({ onNavigateToDashboard }) {
  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    coupons,
    createCoupon,
    deleteCoupon,
    inventory,
    addInventoryItem,
    updateInventoryItem,
    restockInventory,
    deleteInventoryItem,
    reviews,
    submitReview,
    placeTableOrder,
    setSelectedTableForDashboard
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'coupons' | 'inventory' | 'ordering' | 'reviews'
  const [successToast, setSuccessToast] = useState(null);

  // ----------------------------------------------------
  // 1. MENU ITEM FORM & EDIT STATE
  // ----------------------------------------------------
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'signature_frappes',
    price: '',
    prep_time_mins: 10,
    is_veg: true,
    in_stock: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80'
  });
  const [menuSearch, setMenuSearch] = useState('');
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const handleAddMenuSubmit = async (e) => {
    e.preventDefault();
    if (!menuFormData.name.trim() || !menuFormData.price) return;
    const res = await addMenuItem({
      ...menuFormData,
      name: menuFormData.name.trim(),
      price: parseFloat(menuFormData.price) || 0,
      prep_time_mins: parseInt(menuFormData.prep_time_mins, 10) || 10
    });
    if (res.success) {
      setSuccessToast(`Menu item "${menuFormData.name}" added successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setMenuFormData({
        name: '',
        category: 'signature_frappes',
        price: '',
        prep_time_mins: 10,
        is_veg: true,
        in_stock: true,
        description: '',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80'
      });
    }
  };

  const handleSaveMenuEdit = async () => {
    if (!editingMenuItem) return;
    const res = await updateMenuItem(editingMenuItem.id, {
      ...editingMenuItem,
      price: parseFloat(editingMenuItem.price) || 0
    });
    if (res.success) {
      setSuccessToast(`Updated item "${editingMenuItem.name}"!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setEditingMenuItem(null);
    }
  };

  // ----------------------------------------------------
  // 2. COUPON FORM STATE
  // ----------------------------------------------------
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    title: '',
    discount_percent: 15,
    min_order: 250,
    description: '',
    badge: 'Special Deal'
  });

  const handleAddCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim() || !couponFormData.title.trim()) return;
    const res = await createCoupon({
      ...couponFormData,
      code: couponFormData.code.trim().toUpperCase(),
      discount: `${couponFormData.discount_percent}% OFF`,
      discount_percent: parseFloat(couponFormData.discount_percent) || 0,
      min_order: parseFloat(couponFormData.min_order) || 0
    });
    if (res.success) {
      setSuccessToast(`Coupon "${couponFormData.code.toUpperCase()}" created and active!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setCouponFormData({
        code: '',
        title: '',
        discount_percent: 15,
        min_order: 250,
        description: '',
        badge: 'Special Deal'
      });
    }
  };

  // ----------------------------------------------------
  // 3. INVENTORY FORM & RESTOCK STATE
  // ----------------------------------------------------
  const [invFormData, setInvFormData] = useState({
    item_name: '',
    category: 'Coffee & Espresso',
    current_stock: 10,
    unit: 'kg',
    min_threshold: 3
  });
  const [restockAmount, setRestockAmount] = useState({});

  const handleAddInvSubmit = async (e) => {
    e.preventDefault();
    if (!invFormData.item_name.trim()) return;
    const res = await addInventoryItem({
      ...invFormData,
      item_name: invFormData.item_name.trim(),
      current_stock: parseFloat(invFormData.current_stock) || 0,
      min_threshold: parseFloat(invFormData.min_threshold) || 1
    });
    if (res.success) {
      setSuccessToast(`Inventory item "${invFormData.item_name}" tracked!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setInvFormData({
        item_name: '',
        category: 'Coffee & Espresso',
        current_stock: 10,
        unit: 'kg',
        min_threshold: 3
      });
    }
  };

  const handleRestockClick = async (id) => {
    const amount = parseFloat(restockAmount[id] || 5);
    if (!amount || amount <= 0) return;
    const res = await restockInventory(id, amount);
    if (res.success) {
      setSuccessToast(`Restocked ${res.item.item_name} (+${amount} ${res.item.unit})!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setRestockAmount(prev => ({ ...prev, [id]: '' }));
    }
  };

  // ----------------------------------------------------
  // 4. TABLE ORDERING STATE (FLOWS TO PART 3 DASHBOARD)
  // ----------------------------------------------------
  const [orderTable, setOrderTable] = useState('Table 4');
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderCart, setOrderCart] = useState([]); // [{ item, quantity }]
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [placedOrderResult, setPlacedOrderResult] = useState(null);

  const addItemToOrder = (item) => {
    setOrderCart(prev => {
      const idx = prev.findIndex(p => p.item.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeOrderItem = (itemId) => {
    setOrderCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  // Calculations for order
  const orderSubtotal = orderCart.reduce((sum, p) => sum + (p.item.price * p.quantity), 0);
  const matchedCoupon = coupons.find(c => c.code.toUpperCase() === appliedCouponCode.trim().toUpperCase());
  let couponDiscount = 0;
  if (matchedCoupon && orderSubtotal >= (matchedCoupon.min_order || 0)) {
    if (matchedCoupon.discount_percent > 0) {
      couponDiscount = Math.round((orderSubtotal * matchedCoupon.discount_percent) / 100);
    } else if (matchedCoupon.discount_amount > 0) {
      couponDiscount = matchedCoupon.discount_amount;
    }
  }
  const orderTax = Math.round(orderSubtotal * 0.05 * 100) / 100;
  const orderTotal = Math.max(0, Math.round((orderSubtotal + orderTax - couponDiscount) * 100) / 100);

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (orderCart.length === 0) {
      alert('Please add at least one menu item to the order.');
      return;
    }
    if (!orderCustomerName.trim()) {
      alert('Please provide customer name.');
      return;
    }

    const payload = {
      table_number: orderTable,
      customer_name: orderCustomerName.trim(),
      customer_phone: orderPhone.trim() || '98250 12345',
      items: orderCart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        size: 'Standard'
      })),
      coupon_code: matchedCoupon ? matchedCoupon.code : '',
      payment_method: 'counter'
    };

    const res = await placeTableOrder(payload);
    if (res.success) {
      setPlacedOrderResult(res.order);
      setSuccessToast(`Order #${res.order.id} placed for ${orderTable}! Flowing to Part 3 Dashboard.`);
      setTimeout(() => setSuccessToast(null), 5000);
      setOrderCart([]);
      setOrderCustomerName('');
      setOrderPhone('');
      setAppliedCouponCode('');
    } else {
      alert(`Error placing order: ${res.error}`);
    }
  };

  // ----------------------------------------------------
  // 5. REVIEW FORM STATE
  // ----------------------------------------------------
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    favorite_item: 'Lotus Biscoff Dream Frappe',
    comment: ''
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || reviewForm.comment.trim().length < 5) return;
    const res = await submitReview({
      ...reviewForm,
      source: 'Verified Diner (Part 2 Operations)'
    });
    if (res.success) {
      setSuccessToast(`Thank you! Review published centrally.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setReviewForm({
        name: '',
        rating: 5,
        favorite_item: 'Lotus Biscoff Dream Frappe',
        comment: ''
      });
    }
  };

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
            <span>PART 2 OF RESTAURANT MANAGEMENT SUITE</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            🍽️ Menu, Coupons & Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '650px' }}>
            Manage the café catalog, promotions, and ingredient stocks. Place table orders that flow live into the Part 3 Dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('menu')}
          className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}
        >
          <Utensils size={16} /> Menu Items ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`btn ${activeTab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}
        >
          <Tag size={16} /> Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}
        >
          <Package size={16} /> Inventory Tracker ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('ordering')}
          className={`btn ${activeTab === 'ordering' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}
        >
          <ShoppingBag size={16} /> Table Ordering (Flow to Dashboard)
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem' }}
        >
          <Star size={16} /> Customer Reviews ({reviews.length})
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: MENU ITEMS (ADD & EDIT)                                     */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Add Menu Item Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Add New Menu Item
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Newly added items appear immediately in the menu, table ordering, and dashboard.
            </p>

            <form onSubmit={handleAddMenuSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Dark Chocolate Frappe"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Category *</label>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  >
                    {MENU_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="260"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Prep Time (mins)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={menuFormData.prep_time_mins}
                    onChange={(e) => setMenuFormData({ ...menuFormData, prep_time_mins: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Availability</label>
                  <select
                    value={menuFormData.in_stock ? '1' : '0'}
                    onChange={(e) => setMenuFormData({ ...menuFormData, in_stock: e.target.value === '1' })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  >
                    <option value="1">In Stock</option>
                    <option value="0">Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Rich single-estate espresso blend with creamy texture..."
                  value={menuFormData.description}
                  onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 700 }}>
                + Add Dish to Catalog
              </button>
            </form>
          </div>

          {/* Menu Catalog Grid */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Active Menu Catalog ({menuItems.length})
              </h2>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search dish..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="input-field"
                  style={{ padding: '0.45rem 0.75rem 0.45rem 2rem', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {menuItems
                .filter(i => (i.name || '').toLowerCase().includes(menuSearch.toLowerCase()))
                .map((item) => (
                  <div key={item.id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.name}</span>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: item.in_stock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: item.in_stock ? '#10b981' : '#ef4444',
                          fontWeight: 700
                        }}>
                          {item.in_stock ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ₹{item.price} • {item.category} • ~{item.prep_time_mins || 8}m prep
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setEditingMenuItem(item)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: COUPONS & OFFERS (CREATE & APPLY)                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Create Coupon Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Create New Coupon
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Coupons created here are instantly applicable to table orders and visible on the dashboard.
            </p>

            <form onSubmit={handleAddCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BREW25"
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% Weekend Roast Special"
                  value={couponFormData.title}
                  onChange={(e) => setCouponFormData({ ...couponFormData, title: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Discount % *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={couponFormData.discount_percent}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discount_percent: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.min_order}
                    onChange={(e) => setCouponFormData({ ...couponFormData, min_order: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  placeholder="Applicable on all specialty hot and cold drinks"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 700 }}>
                + Launch Coupon Promotion
              </button>
            </form>
          </div>

          {/* Active Coupons Directory */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              Active Café Coupons ({coupons.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {coupons.map((c) => (
                <div key={c.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(234, 139, 57, 0.15)', color: 'var(--primary)', borderRadius: '8px', fontWeight: 700 }}>
                        {c.discount_percent ? `${c.discount_percent}% OFF` : c.discount}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Min Order: ₹{c.min_order || 0} • {c.description || 'Valid for all tables'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setAppliedCouponCode(c.code);
                        setActiveTab('ordering');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Use on Order
                    </button>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: INVENTORY TRACKING (ADD & UPDATE)                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Add Inventory Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Add Inventory Item
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Track raw coffee beans, dairy, packaging, and bakery ingredients with minimum thresholds.
            </p>

            <form onSubmit={handleAddInvSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Single-Estate Arabica Beans"
                  value={invFormData.item_name}
                  onChange={(e) => setInvFormData({ ...invFormData, item_name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Category *</label>
                  <input
                    type="text"
                    placeholder="Coffee & Espresso"
                    value={invFormData.category}
                    onChange={(e) => setInvFormData({ ...invFormData, category: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Unit (e.g. kg, liters, cups)</label>
                  <input
                    type="text"
                    placeholder="kg"
                    value={invFormData.unit}
                    onChange={(e) => setInvFormData({ ...invFormData, unit: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Current Stock *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={invFormData.current_stock}
                    onChange={(e) => setInvFormData({ ...invFormData, current_stock: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Low Stock Threshold *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={invFormData.min_threshold}
                    onChange={(e) => setInvFormData({ ...invFormData, min_threshold: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.7rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 700 }}>
                + Track New Inventory Item
              </button>
            </form>
          </div>

          {/* Inventory Table & Restock */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              Stock Level Tracker ({inventory.length} Items)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
              {inventory.map((inv) => {
                const isLow = inv.current_stock <= inv.min_threshold;
                return (
                  <div key={inv.id} style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${isLow ? '#ef4444' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {inv.item_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {inv.category} • Min Alert: {inv.min_threshold} {inv.unit}
                        </div>
                      </div>

                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isLow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isLow ? '#ef4444' : '#10b981'
                      }}>
                        {inv.current_stock} {inv.unit} {isLow ? '⚠️ LOW STOCK' : 'ADEQUATE'}
                      </span>
                    </div>

                    {/* Restock input & actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <input
                        type="number"
                        placeholder="+Qty"
                        value={restockAmount[inv.id] || ''}
                        onChange={(e) => setRestockAmount({ ...restockAmount, [inv.id]: e.target.value })}
                        style={{ width: '70px', padding: '3px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                      />
                      <button
                        onClick={() => handleRestockClick(inv.id)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(inv.id)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 6px', fontSize: '0.78rem', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: TABLE ORDERING (FLOWS DIRECTLY TO PART 3 DASHBOARD)         */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'ordering' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Select Items from Menu */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              1. Select Dishes for Table
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Choose items from your catalog. Click to add to the order.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', maxHeight: '520px', overflowY: 'auto' }}>
              {menuItems.map((item) => (
                <div key={item.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      ₹{item.price}
                    </span>
                  </div>

                  <button
                    onClick={() => addItemToOrder(item)}
                    className="btn btn-primary"
                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Table Assignment */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              2. Review & Place Table Order
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Orders appear on the assigned table in the Part 3 Dashboard with zero data loss.
            </p>

            <form onSubmit={handlePlaceOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Table *</label>
                  <select
                    value={orderTable}
                    onChange={(e) => setOrderTable(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  >
                    {TABLES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Shah"
                    value={orderCustomerName}
                    onChange={(e) => setOrderCustomerName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Customer Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 98250 12345"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              {/* Order Cart Items */}
              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', minHeight: '120px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                  Ordered Items ({orderCart.length}):
                </span>
                {orderCart.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>No items added yet. Click "+ Add" on any dish.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {orderCart.map(({ item, quantity }) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>{quantity}x {item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600 }}>₹{item.price * quantity}</span>
                          <button
                            type="button"
                            onClick={() => removeOrderItem(item.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply Coupon */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Apply Coupon Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. BREW20"
                    value={appliedCouponCode}
                    onChange={(e) => setAppliedCouponCode(e.target.value.toUpperCase())}
                    className="input-field"
                    style={{ flex: 1, padding: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}
                  />
                  {matchedCoupon && (
                    <span style={{ color: '#10b981', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <Check size={14} /> Applied!
                    </span>
                  )}
                </div>
              </div>

              {/* Total Calculation */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{orderSubtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                    <span>Coupon Discount:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>GST Tax (5%):</span>
                  <span>₹{orderTax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{orderTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}
              >
                Confirm & Place Order for {orderTable}
              </button>

              {placedOrderResult && (
                <div style={{ background: 'rgba(234, 139, 57, 0.12)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--primary)' }}>
                    ✅ Order #{placedOrderResult.id} is live!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTableForDashboard(placedOrderResult.table_number);
                      if (onNavigateToDashboard) onNavigateToDashboard(placedOrderResult.table_number);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>View on Part 3 Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5: CUSTOMER REVIEWS (CENTRAL DATA LAYER)                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Submit Review Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Submit Customer Review
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Customer reviews submitted here are stored in the shared database and displayed across all parts.
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ananya Joshi"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Favorite Dish Tried</label>
                <select
                  value={reviewForm.favorite_item}
                  onChange={(e) => setReviewForm({ ...reviewForm, favorite_item: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                >
                  {menuItems.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Review & Dining Experience *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How was the Arabica roast and vibe?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.7rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 700 }}>
                Publish Review
              </button>
            </form>
          </div>

          {/* Centralized Reviews Stream */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              Centralized Reviews Stream ({reviews.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rev.name}</span>
                    <div style={{ display: 'flex', color: '#eab308' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? '#eab308' : 'none'} stroke={i < rev.rating ? '#eab308' : '#8c7e72'} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {rev.favorite_item || 'Café Special'}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingMenuItem && (
        <div className="modal-backdrop" onClick={() => setEditingMenuItem(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Edit Menu Item: {editingMenuItem.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Item Name</label>
                <input
                  type="text"
                  value={editingMenuItem.name}
                  onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Price (₹)</label>
                  <input
                    type="number"
                    value={editingMenuItem.price}
                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Stock Status</label>
                  <select
                    value={editingMenuItem.in_stock ? '1' : '0'}
                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, in_stock: e.target.value === '1' })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  >
                    <option value="1">In Stock</option>
                    <option value="0">Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  value={editingMenuItem.description || ''}
                  onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button onClick={() => setEditingMenuItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveMenuEdit} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Part2Operations;
