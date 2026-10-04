import React from 'react';
import { MapPin, Phone, Clock, ArrowUp, Lock, MessageCircle } from 'lucide-react';
import { InstagramIcon as Instagram } from './InstagramIcon';
import { CafenaLogoStamp } from './CafenaDecorations';

export function Footer({ onOpenOwnerAuth }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-root">
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.1rem' }}>
              <CafenaLogoStamp size={44} />
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: '#ffffff', lineHeight: 1 }}>
                  CAFENA
                </h3>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                  Artisanal Specialty Roastery & Cafe
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.2rem' }}>
              Nikol’s premier artisan specialty coffee and frappe lounge. Handcrafting memories, rich single-estate roasts, and
              cozy conversations at The Allen Town until midnight every day.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <a
                href="https://www.instagram.com/coffeestand.nikol"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  transition: 'all 0.2s'
                }}
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/916353935169"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  transition: 'all 0.2s'
                }}
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="tel:06353935169"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  transition: 'all 0.2s'
                }}
                aria-label="Phone"
              >
                <Phone size={18} />
              </a>
              <a
                href="https://www.google.com/search?q=coffee+stand+nikol"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  transition: 'all 0.2s'
                }}
                aria-label="Google Location"
              >
                <MapPin size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '1.2rem' }}>
              Explore Café
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><a href="#hero" className="hover-primary">Home & Roastery</a></li>
              <li><a href="#menu" className="hover-primary">Artisanal Menu</a></li>
              <li><a href="#gallery" className="hover-primary">Visual Gallery</a></li>
              <li><a href="#videos" className="hover-primary">Cinematic Reels</a></li>
              <li><a href="#about" className="hover-primary">Our Story & Heritage</a></li>
              <li><a href="#reviews" className="hover-primary">Guest Testimonials</a></li>
              <li><a href="#contact" className="hover-primary">Reserve a Table</a></li>
            </ul>
          </div>

          {/* Col 3: Café Ambiance & Experience */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '1.2rem' }}>
              Café Atmosphere
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.8rem' }}>
              Designed for serene co-working, soulful conversations, and late-night unwinding. Enjoy chilled indoor AC seating or our starlit outdoor patio.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <span>✓ High-Speed Fiber Wi-Fi</span>
              <span>✓ Starlit Open-Air Patio</span>
              <span>✓ 100% Pure Vegetarian</span>
            </div>
          </div>

          {/* Col 4: Location & Hours */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '1.2rem' }}>
              Location & Hours
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                <span>Shop GF.15, The Allen Town, Nikol Ring Road, Cross Road, SP Ring Rd, Nikol, Ahmedabad 380049</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <a href="tel:06353935169" style={{ color: 'var(--text-main)', fontWeight: 600 }}>063539 35169</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Daily: 9:00 AM – 12:00 AM Midnight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.6rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-dim)'
          }}
        >
          <div>
            © {new Date().getFullYear()} Cafena Nikol. All rights reserved. Handcrafted with pride.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {/* Staff / Owner Access Link */}
            <button
              onClick={onOpenOwnerAuth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                opacity: 0.8
              }}
              title="Restricted Café Management Portal"
            >
              <Lock size={12} />
              <span>Owner Portal</span>
            </button>

            <span>•</span>

            <button
              onClick={scrollToTop}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent-gold)',
                fontWeight: 600
              }}
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
