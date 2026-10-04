import React from 'react';
import { Coffee, Heart, Award, Users, Star, Quote, CheckCircle2 } from 'lucide-react';
import { CafenaBrushStroke } from './CafenaDecorations';

export function AboutSection() {
  return (
    <section id="about" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        {/* Story Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}
        >
          {/* Story Text */}
          <div>
            <span className="section-tag">Our Craft & Origin</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.4rem' }}>
              Crafted with Passion in Nikol, Ahmedabad
            </h2>
            <CafenaBrushStroke style={{ marginBottom: '1.4rem' }} />

            <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              Cafena was born out of a simple belief: that a neighborhood café should feel like an artisanal sanctuary and a second home.
              Nestled at <strong>Shop GF.15, The Allen Town</strong> on Nikol Ring Road, we set out to bring world-class
              specialty coffee culture and gourmet comfort food to East Ahmedabad.
            </p>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.8rem', color: 'var(--text-muted)' }}>
              From slow-steeping 18-hour cold brews to hand-pouring intricate swan latte art, every cup is crafted
              with obsessively sourced Arabica beans. Whether you are bringing your laptop for a productive afternoon
              session or catching up with friends under our fairy-lit evening patio until midnight, our friendly baristas
              are here to welcome you.
            </p>

            {/* Core Values List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>100% Arabica Beans</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Single-estate roasted perfection</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Signature Frappes</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>House-churned thick indulgence</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Work-Friendly Vibe</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>High-speed WiFi & power outlets</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Open Till 12 AM</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ahmedabad’s favorite late hangout</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image & Atmosphere Stack */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
                alt="Cafena Barista counter"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>

            {/* Floating Quality Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '25px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.4rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Specialty Coffee Association
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Certified Roasting & Extraction Standards
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
