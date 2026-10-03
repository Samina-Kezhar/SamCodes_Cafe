import React from 'react';
import { Coffee, Heart, Award, Users, Star, Quote, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    author: 'Keval Patel',
    rating: 5,
    source: 'Google Verified Review',
    text: 'The place is amazing and the behaviour of staff and owner is very friendly. Best frappe in Nikol hands down!',
    time: '2 weeks ago'
  },
  {
    author: 'Riya Shah',
    rating: 5,
    source: 'Google Verified Review',
    text: 'Best coffee, Amazing food, Beautiful ambience and phenomenal environment ❤️ The Biscoff frappe and paneer panini are out of this world.',
    time: '1 month ago'
  },
  {
    author: 'Harsh V.',
    rating: 4.5,
    source: 'Zomato Diner',
    text: 'Rate is a lil bit high but it’s 100% worth it! Super yummy waffles, perfect study atmosphere with fast wifi, and open till midnight.',
    time: '3 weeks ago'
  }
];

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
            alignItems: 'center',
            marginBottom: '5rem'
          }}
        >
          {/* Story Text */}
          <div>
            <span className="section-tag">Our Craft & Origin</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
              Crafted with Passion in Nikol, Ahmedabad
            </h2>

            <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              Coffee Stand was born out of a simple belief: that a neighborhood café should feel like a second home.
              Nestled at <strong>Shop GF.15, The Allen Town</strong> on Nikol Ring Road, we set out to bring world-class
              specialty coffee culture and gourmet comfort food to East Ahmedabad.
            </p>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.8rem', color: 'var(--text-muted)' }}>
              From slow-steeping 18-hour cold brews to hand-pouring intricate swan latte art, every cup is crafted
              with obsessively sourced Arabica beans. Whether you are bringing your laptop for a productive afternoon
              session or catching up with friends under our fairy-lit evening patio until midnight, our friendly baristas
              are here to make you smile.
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>High-speed WiFi & charging ports</div>
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
                src="/images/hero-cafe.jpg"
                alt="Coffee Stand Barista counter"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>

            {/* Floating Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '25px',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem 1.6rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>4.8 / 5.0 Rating</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Top Rated Specialty Cafe in Nikol (1,400+ Reviews)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">Community Love</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>What Our Guests Say</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Real reviews from coffee lovers and foodies across Ahmedabad.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.2rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          style={{
                            fill: i < Math.floor(rev.rating) ? 'var(--primary)' : 'none',
                            color: 'var(--primary)'
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{rev.time}</span>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{rev.text}"
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{rev.author}</h5>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{rev.source}</span>
                  </div>
                  <Quote size={20} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
