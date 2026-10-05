import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star, Flame } from 'lucide-react';

export function MenuCategoryCarousel({
  category,
  items = [],
  renderCardAction,
  onCardClick
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = 320;
    const scrollAmount = direction === 'left' ? -cardWidth * 1.5 : cardWidth * 1.5;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div className="menu-category-slider-section" id={`cat-${category.id}`} style={{ marginBottom: '3rem' }}>
      {/* Category Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
          paddingBottom: '0.6rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {category.icon && (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              {category.icon}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {category.label}
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'var(--primary-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {items.length} {items.length === 1 ? 'dish' : 'dishes'}
              </span>
            </div>
            {category.desc && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {category.desc}
              </p>
            )}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="btn-icon carousel-arrow-btn"
            aria-label={`Scroll ${category.label} left`}
            title="Previous dishes"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: canScrollLeft ? 'var(--text-main)' : 'var(--text-dim)',
              cursor: canScrollLeft ? 'pointer' : 'default',
              opacity: canScrollLeft ? 1 : 0.4,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="btn-icon carousel-arrow-btn"
            aria-label={`Scroll ${category.label} right`}
            title="Next dishes"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: canScrollRight ? 'var(--text-main)' : 'var(--text-dim)',
              cursor: canScrollRight ? 'pointer' : 'default',
              opacity: canScrollRight ? 1 : 0.4,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="menu-carousel-track"
        style={{
          display: 'flex',
          gap: '1.25rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '0.8rem',
          paddingTop: '4px'
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="menu-card menu-carousel-card"
            onClick={() => onCardClick && onCardClick(item)}
            style={{
              flex: '0 0 300px',
              maxWidth: '300px',
              scrollSnapAlign: 'start',
              cursor: onCardClick ? 'pointer' : 'default'
            }}
          >
            {/* Image Wrap */}
            <div className="menu-card-img-wrap" style={{ height: '190px' }}>
              <img
                src={item.image}
                alt={item.name}
                className="menu-card-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/images/cafena-hero-splash.jpg';
                }}
              />
              <div className="menu-card-badge-row">
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(item.tags || []).map((tag) => (
                    <span key={tag} className="badge-tag">{tag}</span>
                  ))}
                </div>
                <div className="veg-indicator" title="100% Pure Vegetarian"></div>
              </div>
            </div>

            {/* Card Body */}
            <div className="menu-card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '1.1rem' }}>
              <div>
                <div className="menu-card-title-row" style={{ alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h4 className="menu-card-title" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                    {item.name}
                  </h4>
                  <div className="menu-card-price" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                    ₹{item.price}
                  </div>
                </div>

                <p className="menu-card-desc" style={{ fontSize: '0.84rem', lineHeight: 1.5, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>
              </div>

              <div className="menu-card-footer" style={{ marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="prep-time">
                  <Clock size={13} />
                  <span>{item.prep_time_mins || 8} mins</span>
                </div>

                {renderCardAction && renderCardAction(item)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
