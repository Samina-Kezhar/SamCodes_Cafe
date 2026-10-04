import React from 'react';
import { Coffee, Sparkles } from 'lucide-react';

export function CoffeeLoader({ message = 'Brewing your experience...' }) {
  return (
    <div className="coffee-loader-container">
      <div className="coffee-loader-card">
        {/* Animated Coffee Cup */}
        <div className="coffee-cup-graphic">
          {/* Steam curls */}
          <div className="steam-container">
            <span className="steam-particle s1"></span>
            <span className="steam-particle s2"></span>
            <span className="steam-particle s3"></span>
          </div>

          {/* Cup Body */}
          <div className="cup-body">
            <div className="cup-liquid"></div>
            <div className="cup-crema"></div>
          </div>
          <div className="cup-handle"></div>
          <div className="cup-saucer"></div>
        </div>

        {/* Text Details */}
        <div className="loader-text-group">
          <div className="loader-brand-title">
            <span className="brand-name-main">CAFENA</span>
            <span className="brand-name-accent">STAND</span>
          </div>
          <p className="loader-message">
            <Sparkles size={14} className="spin-slow" style={{ color: 'var(--primary)', display: 'inline', marginRight: '6px' }} />
            {message}
          </p>
          <div className="loader-progress-bar">
            <div className="loader-progress-fill"></div>
          </div>
          <span className="loader-sub">The Allen Town • Nikol • Single-Estate Arabica</span>
        </div>
      </div>
    </div>
  );
}
