import React, { useState, useEffect } from 'react';
import {
  Coffee, ShoppingBag, QrCode, LayoutDashboard, Menu as MenuIcon,
  X, MapPin, Sparkles, Utensils, Tag, Image, Film, Info, PhoneCall,
  Sun, Moon
} from 'lucide-react';

export function Navbar({
  cartCount,
  onOpenCart,
  onOpenQRModal,
  activeTable,
  currentView,
  onToggleDashboard,
  activeOrdersCount = 0,
  theme = 'warm-cream',
  onToggleTheme
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Section Spy
      const sections = ['hero', 'menu', 'offers', 'gallery', 'videos', 'about', 'contact'];
      const scrollPos = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    if (currentView === 'dashboard') {
      onToggleDashboard();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'hero', label: 'Home', icon: Coffee },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: PhoneCall }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        {/* Brand Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}
          className="brand-logo"
          title="Coffee Stand Nikol"
        >
          <div className="brand-icon-wrap">
            <Coffee size={21} />
          </div>
          <div className="brand-text-container">
            <div className="brand-title-line">
              <span className="brand-name-main">COFFEE</span>
              <span className="brand-name-accent">STAND</span>
              <span className="brand-status-chip">
                <span className="pulse-dot"></span>
                Open till 12 AM
              </span>
            </div>
            <span className="brand-location-tag">
              The Allen Town • Nikol
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          {navLinks.map((link) => {
            const isActive = currentView !== 'dashboard' && activeSection === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.id); }}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Vertical Divider */}
        <div className="nav-divider" />

        {/* Right Action Controls */}
        <div className="nav-actions">
          {/* Active Table Badge (if selected or scanned) */}
          {activeTable && (
            <button
              onClick={onOpenQRModal}
              title="Click to switch table"
              className="btn-nav-action btn-table"
            >
              <MapPin size={13} style={{ color: 'var(--primary)' }} />
              <span>{activeTable}</span>
            </button>
          )}

          {/* Table QR Button */}
          <button
            onClick={onOpenQRModal}
            className="btn btn-secondary btn-nav-action"
            title="Scan or generate Table QR"
          >
            <QrCode size={15} style={{ color: 'var(--primary)' }} />
            <span className="hide-on-mobile">Table QR</span>
          </button>

          {/* Owner Dashboard Toggle Button */}
          <button
            onClick={onToggleDashboard}
            className={`btn btn-nav-action ${
              currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'
            }`}
            style={{
              position: 'relative',
              background: currentView === 'dashboard'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : undefined,
              borderColor: currentView === 'dashboard' ? '#10b981' : undefined
            }}
            title="Owner & Kitchen Live Order Dashboard"
          >
            <LayoutDashboard size={15} />
            <span className="hide-on-mobile">
              {currentView === 'dashboard' ? 'Café Site' : 'Dashboard'}
            </span>

            {/* Active kitchen orders badge */}
            {activeOrdersCount > 0 && currentView !== 'dashboard' && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                }}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Daytime Artisanal Cream vs Midnight Velvet Lounge) */}
          <button
            onClick={onToggleTheme}
            className="btn-icon theme-toggle-btn"
            aria-label={theme === 'warm-cream' ? 'Switch to Midnight Velvet Lounge' : 'Switch to Warm Artisanal Cream'}
            title={theme === 'warm-cream' ? 'Switch to Midnight Velvet Lounge' : 'Switch to Warm Artisanal Cream'}
            style={{
              width: '40px',
              height: '40px',
              background: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-medium)',
              color: 'var(--text-main)',
              transition: 'all 0.25s ease'
            }}
          >
            {theme === 'warm-cream' ? (
              <Moon size={18} style={{ color: 'var(--primary)' }} />
            ) : (
              <Sun size={18} style={{ color: 'var(--accent-gold)' }} />
            )}
          </button>

          {/* Cart Icon Button */}
          {currentView !== 'dashboard' && (
            <button
              onClick={onOpenCart}
              className="btn-icon"
              aria-label="View Shopping Cart"
              style={{
                width: '40px',
                height: '40px',
                background: cartCount > 0 ? 'var(--primary-subtle)' : undefined,
                borderColor: cartCount > 0 ? 'var(--primary)' : undefined
              }}
            >
              <ShoppingBag
                size={19}
                style={{ color: cartCount > 0 ? 'var(--primary)' : 'inherit' }}
              />
              {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.id); }}
                  className="mobile-nav-link"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComponent size={18} style={{ color: 'var(--primary)' }} />
                    <span>{link.label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>→</span>
                </a>
              );
            })}
          </div>

          {/* Quick Actions in Mobile Drawer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenQRModal(); }}
              className="btn btn-secondary"
              style={{ padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center' }}
            >
              <QrCode size={16} />
              <span>Table QR</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onToggleDashboard(); }}
              className="btn btn-primary"
              style={{ padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center' }}
            >
              <LayoutDashboard size={16} />
              <span>{currentView === 'dashboard' ? 'Café Site' : 'Dashboard'}</span>
            </button>
          </div>

          <button
            onClick={() => { onToggleTheme(); setMobileMenuOpen(false); }}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center', marginTop: '0.4rem', gap: '0.5rem' }}
          >
            {theme === 'warm-cream' ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--accent-gold)' }} />}
            <span>{theme === 'warm-cream' ? 'Switch to Evening Lounge (Dark)' : 'Switch to Day Roastery (Cream)'}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
