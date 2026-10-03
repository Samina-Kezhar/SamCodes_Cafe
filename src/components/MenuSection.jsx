import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Clock, Plus, Flame, Sparkles, MapPin, QrCode } from 'lucide-react';

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

export function MenuSection({ menuItems, onSelectItem, activeTable, onOpenQRModal }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Veg filter
      if (onlyVeg && !item.is_veg) {
        return false;
      }
      // Search query
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
      return 0; // default order
    });
  }, [menuItems, selectedCategory, searchQuery, onlyVeg, sortBy]);

  return (
    <section id="menu" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Interactive QR Menu</span>
          <h2 className="section-title">Handcrafted Brews & Bites</h2>
          <p className="section-desc">
            Freshly ground single-origin espresso, velvet frappes, and wholesome artisanal comfort food.
            Order directly from your table or takeaway.
          </p>
        </div>

        {/* Table Banner if active */}
        {activeTable ? (
          <div
            style={{
              background: 'linear-gradient(90deg, rgba(234, 139, 57, 0.2), rgba(16, 185, 129, 0.15))',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.4rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Ordering for: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{activeTable}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Your items will be prepared by our barista and served straight to your seat.
                </div>
              </div>
            </div>
            <button
              onClick={onOpenQRModal}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              Switch Table
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.4rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <QrCode size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Seated at a table? Select your table number or scan the tent card QR for direct table service.
              </span>
            </div>
            <button
              onClick={onOpenQRModal}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
            >
              Select Table
            </button>
          </div>
        )}

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

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No menu items found</p>
            <p style={{ fontSize: '0.9rem' }}>Try searching with a different keyword or category.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                {/* Image Wrap */}
                <div className="menu-card-img-wrap" onClick={() => item.in_stock && onSelectItem(item)} style={{ cursor: 'pointer' }}>
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
                        onClick={() => onSelectItem(item)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
                      >
                        <Plus size={15} />
                        <span>Customize & Add</span>
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
        )}
      </div>
    </section>
  );
}
