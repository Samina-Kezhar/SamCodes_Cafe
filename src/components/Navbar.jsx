import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon, X, Sparkles, Utensils, Image,
  Film, Info, PhoneCall, Sun, Moon, Star, ShoppingBag
} from 'lucide-react';
import { CafenaLogoStamp } from './CafenaDecorations';

export function Navbar({
  theme = 'warm-cream',
  onToggleTheme,
  onOpenCart,
  cartCount = 0
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Prevent background body scrolling when mobile menu is open (U08)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = ['hero', 'menu', 'gallery', 'videos', 'about', 'reviews', 'contact'];
      const scrollPos = window.scrollY + 130;
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
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'videos', label: 'Reels' },
    { id: 'about', label: 'Our Story' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        {/* Brand Logo with authentic Cafena Seal */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}
          className="brand-logo"
          title="Cafena Artisanal Coffee Nikol"
        >
          <div className="cafena-nav-stamp-wrap">
            <CafenaLogoStamp size={48} />
          </div>
          <div className="brand-text-container">
            <div className="brand-title-line">
              <span className="brand-name-main">CAFENA</span>
              <span className="brand-status-chip">
                <span className="pulse-dot"></span>
                Open till 12 AM
              </span>
            </div>
            <span className="brand-location-tag">
              The Allen Town • Nikol, Ahmedabad
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
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

        {/* Right Action Controls */}
        <div className="nav-actions">
          {/* Cart Drawer Trigger button (U01) */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="btn-icon"
              aria-label="View Order Cart"
              title="View Order Cart"
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--bg-surface-elevated)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-main)',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <ShoppingBag size={19} style={{ color: 'var(--primary)' }} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    padding: '2px 5px',
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: 1
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn-icon theme-toggle-btn"
            aria-label={theme === 'midnight-roast' ? 'Switch to Clean Day Theme' : 'Switch to Midnight Dark Theme'}
            title={theme === 'midnight-roast' ? 'Switch to Clean Day Theme' : 'Switch to Midnight Dark Theme'}
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-medium)',
              color: 'var(--text-main)',
              transition: 'all 0.25s ease'
            }}
          >
            {theme === 'midnight-roast' ? (
              <Sun size={19} style={{ color: 'var(--accent-gold)' }} />
            ) : (
              <Moon size={19} style={{ color: 'var(--primary)' }} />
            )}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (U08) */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(link.id); }}
                className="mobile-nav-link"
              >
                <span>{link.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {onOpenCart && (
              <button
                onClick={() => { onOpenCart(); setMobileMenuOpen(false); }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ShoppingBag size={16} />
                <span>View Order Cart ({cartCount})</span>
              </button>
            )}

            <button
              onClick={() => { onToggleTheme(); setMobileMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center', gap: '0.5rem' }}
            >
              {theme === 'midnight-roast' ? <Sun size={16} style={{ color: 'var(--accent-gold)' }} /> : <Moon size={16} style={{ color: 'var(--primary)' }} />}
              <span>{theme === 'midnight-roast' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
