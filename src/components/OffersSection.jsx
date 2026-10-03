import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';

export function OffersSection({ offers, onApplyOffer }) {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <section id="offers" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Deals & Combos</span>
          <h2 className="section-title">Special Offers & Perks</h2>
          <p className="section-desc">
            Unlock exclusive discounts on our signature frappes, morning roasts, and late-night cravings in Nikol.
          </p>
        </div>

        {/* Offers Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.8rem'
          }}
        >
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.code;
            return (
              <div
                key={offer.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: offer.highlight ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: offer.highlight ? '0 8px 30px rgba(234, 139, 57, 0.15)' : 'var(--shadow-sm)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                {/* Highlight Glow Accent */}
                {offer.highlight && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-medium)'
                      }}
                    >
                      {offer.badge || 'Limited Time'}
                    </span>
                    <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    {offer.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.6rem' }}>
                    {offer.tagline}
                  </p>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {offer.description}
                  </p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>DISCOUNT CODE</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                        {offer.code}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(offer.code)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                      title="Copy promo code"
                    >
                      {isCopied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onApplyOffer(offer.code)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem' }}
                  >
                    <span>Claim Deal & Browse Menu</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
