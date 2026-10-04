import React from 'react';
import { ArrowRight, QrCode, Clock, Star, Sparkles, MapPin, Coffee, Utensils } from 'lucide-react';

export function Hero({ onOpenMenu, onOpenQRModal, onOpenTrackOrder }) {
  return (
    <section id="hero" className="hero-section">
      {/* Background Image Container */}
      <div className="hero-bg-wrapper">
        <img
          src="/images/hero-cafe.jpg"
          alt="Cafena Cozy Cafe Ambiance"
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="container hero-content">
        {/* Top Tagline / Roastery Badge */}
        <div className="hero-tag">
          <Sparkles size={15} style={{ color: 'var(--primary)' }} />
          <span>EST. 2023 • SPECIALTY COFFEE ROASTERS • THE ALLEN TOWN, NIKOL</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Where Every Sip <br />
          <span className="serif-accent">Tells an Artisanal Story.</span>
        </h1>

        {/* Narrative Description */}
        <p className="hero-description">
          Step into Nikol’s favorite neighborhood sanctuary. From 18-hour slow-dripped Vietnamese cold brews
          and hand-poured swan latte art to our signature Lotus Biscoff frappes and warm herb-toasted paninis,
          we craft every cup with single-estate Arabica beans roasted right here in India.
        </p>

        {/* Quick Cafe Feature Badges */}
        <div className="hero-feature-pills">
          <span className="hero-pill"><Coffee size={13} /> 100% Single-Origin Arabica</span>
          <span className="hero-pill"><Utensils size={13} /> 100% Pure Vegetarian</span>
          <span className="hero-pill"><MapPin size={13} /> Indoor AC & Outdoor Patio</span>
          <span className="hero-pill highlight"><Clock size={13} /> Open Till 12 AM Midnight</span>
        </div>

        {/* CTA Buttons */}
        <div className="hero-cta-group">
          <button
            onClick={onOpenMenu}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
          >
            <span>Explore Menu & Order</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onOpenQRModal}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
          >
            <QrCode size={18} style={{ color: 'var(--primary)' }} />
            <span>Scan Table QR</span>
          </button>

          <button
            onClick={onOpenTrackOrder}
            className="btn btn-outline"
            style={{ padding: '0.85rem 1.4rem', fontSize: '0.95rem' }}
          >
            <Clock size={16} />
            <span>Track Live Order</span>
          </button>
        </div>

        {/* Quick Highlights & Verified Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <h3>4.8 <span className="star-gold">★</span></h3>
            <p>1,400+ Verified Google & Zomato Reviews</p>
          </div>
          <div className="stat-item">
            <h3>100% <span>Roast</span></h3>
            <p>Chikmagalur Single-Estate Arabica</p>
          </div>
          <div className="stat-item">
            <h3>35+ <span>Brews</span></h3>
            <p>Frappes, Cold Brews & Artisan Bites</p>
          </div>
          <div className="stat-item">
            <h3 style={{ color: 'var(--success)' }}>Till 12 AM</h3>
            <p>Nikol’s Cozy Late-Night Haven</p>
          </div>
        </div>
      </div>
    </section>
  );
}
