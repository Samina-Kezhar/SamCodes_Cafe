import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon, X, Sparkles, Utensils, Image,
  Film, Info, PhoneCall, Sun, Moon, Star
} from 'lucide-react';
import { CafenaLogoStamp } from './CafenaDecorations';

export function Navbar({
  theme = 'warm-cream',
  onToggleTheme
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

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
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn-icon theme-toggle-btn"
            aria-label={theme === 'modern-latte' || theme === 'warm-cream' ? 'Switch to Midnight Dark Theme' : 'Switch to Clean Light Theme'}
            title={theme === 'modern-latte' || theme === 'warm-cream' ? 'Switch to Midnight Dark Theme' : 'Switch to Clean Light Theme'}
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-medium)',
              color: 'var(--text-main)',
              transition: 'all 0.25s ease'
            }}
          >
            {theme === 'modern-latte' || theme === 'warm-cream' ? (
              <Moon size={19} style={{ color: 'var(--primary)' }} />
            ) : (
              <Sun size={19} style={{ color: 'var(--accent-gold)' }} />
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

      {/* Mobile Drawer Menu */}
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

            <button
              onClick={() => { onToggleTheme(); setMobileMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', justifyContent: 'center', gap: '0.5rem' }}
            >
              {theme === 'modern-latte' || theme === 'warm-cream' ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--accent-gold)' }} />}
              <span>{theme === 'modern-latte' || theme === 'warm-cream' ? 'Switch to Midnight Dark Theme' : 'Switch to Clean Light Theme'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
