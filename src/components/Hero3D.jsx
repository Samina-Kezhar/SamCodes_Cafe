import React, { useState, useRef } from 'react';
import { ArrowRight, Calendar, Sparkles, Coffee, Star } from 'lucide-react';
import {
  CafenaBrushStroke,
  CafenaLogoStamp,
  BotanicalBranchSketch,
  CafePatioSketch,
  CoffeeCupSketch
} from './CafenaDecorations';

export function Hero3D({ onOpenMenu, onOpenReserve }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Smooth, realistic 3D tilt
    const rotateY = (mouseX / (rect.width / 2)) * 14;
    const rotateX = -(mouseY / (rect.height / 2)) * 14;

    // Specular light position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.6 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <section id="hero" className="hero-section">
      {/* Background Architectural & Botanical Line Art Sketches */}
      <CoffeeCupSketch className="hero-sketch-cup" />
      <BotanicalBranchSketch className="hero-sketch-branch" />
      <CafePatioSketch className="hero-sketch-patio" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-grid">
          {/* Left Column: Cafena Typography, Brush Stroke & CTAs */}
          <div className="hero-left">
            {/* Roastery Tag Pill */}
            <div className="hero-tag">
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
              <span>SPECIALTY COFFEE ROASTERS • THE ALLEN TOWN, NIKOL</span>
            </div>

            {/* Massive Cafena Display Heading */}
            <h1 className="cafena-display-title">
              CAFENA
            </h1>

            {/* Subtitle with curved golden brush underline */}
            <div className="hero-subtitle-wrap">
              <h2 className="hero-subtitle">
                BEST HANDCRAFTED <span className="highlight-caramel">COFFEE HOUSE</span>
              </h2>
              <CafenaBrushStroke className="hero-brush" />
            </div>

            {/* Narrative Description - essential, uncluttered copy */}
            <p className="hero-description">
              Single-estate Arabica roasts, signature frappes, and artisanal paninis handcrafted daily in Nikol.
            </p>

            {/* Action Buttons: View Menu & Reserve Table */}
            <div className="hero-cta-group">
              <button
                onClick={onOpenMenu}
                className="btn btn-primary hero-btn-view-menu"
                title="Browse handcrafted coffee, frappes & paninis"
                style={{ padding: '0.85rem 2.2rem', fontSize: '1rem', gap: '8px' }}
              >
                <Coffee size={18} />
                <span>VIEW MENU</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onOpenReserve}
                className="btn btn-secondary hero-btn-reserve"
                title="Reserve table at Cafena"
                style={{ padding: '0.85rem 1.9rem', fontSize: '0.95rem', gap: '8px' }}
              >
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <span>RESERVE TABLE</span>
              </button>
            </div>

            {/* Cafena Trust & Social Proof Highlights Strip */}
            <div className="cafena-trust-strip">
              <div className="cafena-trust-item">
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="#c7a17a" color="#c7a17a" />
                  ))}
                </div>
                <span className="cafena-trust-text"><strong>4.8</strong> (1,400+ Reviews)</span>
              </div>

              <div className="cafena-trust-divider">•</div>

              <div className="cafena-trust-item">
                <span className="pulse-dot"></span>
                <span className="cafena-trust-text">Open Daily Till <strong>12 AM Midnight</strong></span>
              </div>

              <div className="cafena-trust-divider">•</div>

              <div className="cafena-trust-item">
                <span className="cafena-trust-text"><strong>100%</strong> Arabica Roast</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Coffee Splash Showcase */}
          <div className="hero-right">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="hero-splash-scene"
            >
              <div
                className="hero-splash-card"
                style={{
                  transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
                  transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="hero-splash-img-wrap">
                  <img
                    src="/images/cafena-hero-splash.jpg"
                    alt="Cafena Artisanal Coffee Splash with Roasted Beans"
                    className="hero-splash-img"
                    loading="eager"
                  />
                  <div
                    className="brand-3d-glare"
                    style={{
                      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity * 0.45}) 0%, transparent 60%)`
                    }}
                  />
                </div>

                {/* Central 3D Brand Badge displaying the Café Brand Name in 3D */}
                <div
                  className="hero-3d-brand-badge"
                  style={{
                    transform: `translateZ(${isHovered ? 65 : 30}px)`
                  }}
                >
                  <CafenaLogoStamp size={40} />
                  <div className="hero-3d-brand-info">
                    <span className="hero-3d-brand-title">CAFENA</span>
                    <span className="hero-3d-brand-tag">SPECIALTY ROASTERY</span>
                  </div>
                </div>

                {/* Floating 3D Beans & Craft Badges */}
                <div
                  className="hero-splash-floating-tag tag-top-left"
                  style={{ transform: `translateZ(${isHovered ? 40 : 15}px)` }}
                >
                  <span style={{ fontSize: '1rem' }}>☕</span>
                  <span>100% Arabica</span>
                </div>

                <div
                  className="hero-splash-floating-tag tag-bottom-right"
                  style={{ transform: `translateZ(${isHovered ? 40 : 15}px)` }}
                >
                  <span style={{ fontSize: '1rem' }}>🔥</span>
                  <span>Fresh Roast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
