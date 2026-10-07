import React, { useState, useMemo } from 'react';
import { Search, Clock, Sparkles, Info, X, Coffee, Utensils } from 'lucide-react';
import { CafenaBrushStroke } from './CafenaDecorations';
import { MenuCategoryCarousel } from './MenuCategoryCarousel';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'signature_frappes', label: 'Signature Frappes', icon: '⭐', desc: 'Velvety blended frappes with espresso, rich cream, and gourmet toppings' },
  { id: 'hot_coffee', label: 'Hot Specialty Coffee', icon: '☕', desc: 'Single-origin Arabica roasts, silky microfoam, and artisanal latte art' },
  { id: 'cold_brews', label: 'Cold Brews & Iced', icon: '❄️', desc: '18-hour slow steeped cold brews and refreshing iced coffee creations' },
  { id: 'refreshers', label: 'Artisan Coolers', icon: '🍹', desc: 'Botanical iced teas, sparkling fruit coolers, and Japanese ceremonial matcha' },
  { id: 'sandwiches', label: 'Gourmet Paninis', icon: '🥪', desc: 'Toasted artisan sourdough with savory fillings, pesto, and melted cheeses' },
  { id: 'waffles_desserts', label: 'Waffles & Sweets', icon: '🧇', desc: 'Freshly baked golden Belgian waffles, brownies, and gelato pairings' },
  { id: 'snacks', label: 'Sides & Munchies', icon: '🍟', desc: 'Crispy seasoned crinkle fries and cheesy pull-apart garlic breads' }
];

export function CustomerMenuSection({ menuItems = [], onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewingDetailItem, setViewingDetailItem] = useState(null);

  // Filter items based on search and veg preferences
  const processedItems = useMemo(() => {
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
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [menuItems, searchQuery, onlyVeg, sortBy]);

  // Group items by category for carousels
  const activeCategories = useMemo(() => {
    const dishCategories = CATEGORIES.filter((c) => c.id !== 'all');
    if (selectedCategory !== 'all') {
      return dishCategories.filter((c) => c.id === selectedCategory);
    }
    return dishCategories;
  }, [selectedCategory]);

  const hasAnyItems = useMemo(() => {
    return activeCategories.some((cat) => processedItems.some((item) => item.category === cat.id));
  }, [activeCategories, processedItems]);

  return (
    <section id="menu" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header with Cafena Typography and Brush Accent */}
        <div className="section-header">
          <span className="section-tag">Craft & Heritage Menu</span>
          <h2 className="section-title">Handcrafted Brews & Bites</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
            <CafenaBrushStroke />
          </div>
          <p className="section-desc">
            Explore our curated selection of single-origin roasts, signature chilled frappes, and wholesome artisanal comfort food.
          </p>
        </div>

        {/* Category Filter Pills Bar */}
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

        {/* Search & Utility Bar */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Veg Only Toggle */}
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

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default">Default Recommendation</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Carousel Sliders Organized by Dish Types */}
        {!hasAnyItems ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No menu items found</p>
            <p style={{ fontSize: '0.9rem' }}>Try searching with a different keyword or reset filters.</p>
          </div>
        ) : (
          <div className="menu-carousels-container">
            {activeCategories.map((category) => {
              const categoryItems = processedItems.filter((item) => item.category === category.id);
              if (categoryItems.length === 0) return null;

              return (
                <MenuCategoryCarousel
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  onCardClick={(item) => setViewingDetailItem(item)}
                  renderCardAction={(item) => (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDetailItem(item);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', gap: '5px' }}
                      >
                        <Info size={13} style={{ color: 'var(--primary)' }} />
                        <span>Profile</span>
                      </button>
                      {onAddToCart && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '4px' }}
                        >
                          <span>+ Order</span>
                        </button>
                      )}
                    </div>
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Flavor Profile Detail Modal */}
      {viewingDetailItem && (
        <div className="modal-backdrop" onClick={() => setViewingDetailItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Coffee size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{viewingDetailItem.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{viewingDetailItem.price} • Pure Vegetarian</span>
                </div>
              </div>
              <button onClick={() => setViewingDetailItem(null)} className="btn-icon" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '240px' }}>
                <img
                  src={viewingDetailItem.image}
                  alt={viewingDetailItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/cafena-hero-splash.jpg';
                  }}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  About this Creation
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {viewingDetailItem.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>Craft Preparation Time</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>~{viewingDetailItem.prep_time_mins || 8} minutes</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>Serving Temperature</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {viewingDetailItem.category.includes('hot') ? 'Hot (~65°C)' : 'Chilled / On Ice'}
                  </span>
                </div>
              </div>

              {viewingDetailItem.customizable && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                    Available Barista Customizations (For Dine-in / Takeaway)
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(viewingDetailItem.customizable.sizes || []).map((s) => (
                      <span key={s.name} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
                        {s.name} {s.price > 0 ? `(+₹${s.price})` : ''}
                      </span>
                    ))}
                    {(viewingDetailItem.customizable.milk || []).map((m) => {
                      const name = typeof m === 'object' ? m.name : m;
                      const price = typeof m === 'object' ? m.price : 0;
                      return (
                        <span key={name} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
                          {name} {price > 0 ? `(+₹${price})` : ''}
                        </span>
                      );
                    })}
                    {(viewingDetailItem.customizable.addons || []).map((a) => (
                      <span key={a.name} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
                        + {a.name} (+₹{a.price})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setViewingDetailItem(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.4rem', fontSize: '0.88rem' }}
              >
                Close
              </button>
              {onAddToCart && (
                <button
                  onClick={() => {
                    onAddToCart(viewingDetailItem);
                    setViewingDetailItem(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.4rem', fontSize: '0.88rem' }}
                >
                  Add to Order • ₹{viewingDetailItem.price}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
