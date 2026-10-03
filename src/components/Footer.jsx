import React from 'react';
import { Coffee, MapPin, Phone, Clock, Heart, ArrowUp } from 'lucide-react';
import { InstagramIcon as Instagram } from './InstagramIcon';

export function Footer({ onOpenQRModal, onOpenTrackOrder }) {
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
            marginBottom: '3.5rem'
          }}
        >
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Coffee size={20} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text-main)' }}>
                COFFEE STAND
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.2rem' }}>
              Nikol’s premier artisan specialty coffee and frappe lounge. Handcrafting memories, rich roasts, and
              cozy conversations at The Allen Town until midnight every day.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <a
                href="https://www.instagram.com/coffeestand.nikol"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
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
                href="tel:06353935169"
                style={{
                  width: '38px',
                  height: '38px',
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
                  width: '38px',
                  height: '38px',
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
              <li><a href="#hero" className="hover-primary">Home & Welcome</a></li>
              <li><a href="#menu" className="hover-primary">Interactive QR Menu</a></li>
              <li><a href="#offers" className="hover-primary">Promotions & Student Deals</a></li>
              <li><a href="#gallery" className="hover-primary">Photo Gallery</a></li>
              <li><a href="#videos" className="hover-primary">Reels & Atmosphere</a></li>
              <li><a href="#about" className="hover-primary">Our Story & Reviews</a></li>
              <li><a href="#contact" className="hover-primary">Visit & Table Reservation</a></li>
            </ul>
          </div>

          {/* Col 3: QR & Ordering */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '1.2rem' }}>
              Direct Dining Service
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Already seated at Coffee Stand? Scan the acrylic tent card on your table to open the interactive menu and place orders straight to our baristas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={onOpenQRModal}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem' }}
              >
                Open Table QR Standee
              </button>
              <button
                onClick={onOpenTrackOrder}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem' }}
              >
                Track Live Order by ID
              </button>
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
            paddingTop: '1.8rem',
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
            © {new Date().getFullYear()} Coffee Stand Nikol. All rights reserved. Handcrafted for coffee lovers.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Price: ₹200–400 / person</span>
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
