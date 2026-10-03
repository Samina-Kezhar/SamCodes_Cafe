import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Sparkles, ExternalLink, Film } from 'lucide-react';
import { InstagramIcon as Instagram } from './InstagramIcon';

const VIDEOS = [
  {
    id: 'vid-1',
    title: 'Crafting Our Signature Biscoff Frappe',
    subtitle: 'Step-by-step creation of Nikol’s most loved dessert frappe',
    thumbnail: '/images/signature-frappe.jpg',
    duration: '0:45',
    views: '14.2K Views on Instagram',
    instagramUrl: 'https://www.instagram.com/coffeestand.nikol/'
  },
  {
    id: 'vid-2',
    title: 'Swan Rosetta Latte Art in 60 Seconds',
    subtitle: 'Watch our barista pour intricate micro-foam rosettas',
    thumbnail: '/images/latte-art.jpg',
    duration: '0:58',
    views: '18.9K Views on Instagram',
    instagramUrl: 'https://www.instagram.com/coffeestand.nikol/'
  },
  {
    id: 'vid-3',
    title: 'Evening Ambiance at The Allen Town',
    subtitle: 'Fairy lights, acoustic lo-fi vibes & late-night coffee dates',
    thumbnail: '/images/cafe-patio.jpg',
    duration: '1:15',
    views: '22.5K Views on Instagram',
    instagramUrl: 'https://www.instagram.com/coffeestand.nikol/'
  }
];

export function VideosSection() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlayingAmbiance, setIsPlayingAmbiance] = useState(false);

  return (
    <section id="videos" style={{ padding: '80px 0', background: 'var(--bg-surface-elevated)', transition: 'background 0.35s ease' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Cinematic Reels</span>
          <h2 className="section-title">Café Ambiance & Stories</h2>
          <p className="section-desc">
            Take a look behind the espresso bar and experience the warm, vibrant atmosphere of Coffee Stand Nikol.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}
        >
          {VIDEOS.map((vid) => (
            <div
              key={vid.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
              }}
            >
              {/* Video Thumbnail with Play Button */}
              <div
                style={{
                  position: 'relative',
                  height: '240px',
                  background: 'var(--bg-surface-elevated)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveVideo(vid)}
              >
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.85)',
                    transition: 'transform 0.4s ease'
                  }}
                  className="gallery-hover-img"
                />

                {/* Duration Badge */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {vid.duration}
                </span>

                {/* Big Center Play Icon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(234, 139, 57, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 25px rgba(234, 139, 57, 0.6)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Play size={24} style={{ marginLeft: '4px' }} />
                </div>
              </div>

              {/* Video Info */}
              <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <Instagram size={14} />
                  <span>{vid.views}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{vid.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {vid.subtitle}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                  >
                    <Play size={14} />
                    <span>Watch Preview</span>
                  </button>

                  <a
                    href={vid.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <span>Instagram Reel</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Follow Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(234, 139, 57, 0.15), rgba(193, 53, 132, 0.15))',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 18px rgba(220, 39, 67, 0.4)'
              }}
            >
              <Instagram size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Follow @coffeestand.nikol on Instagram</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Tag us in your coffee stories for a chance to win free signature frappe vouchers every Friday!
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/coffeestand.nikol"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
          >
            <Instagram size={18} />
            <span>Visit @coffeestand.nikol</span>
          </a>
        </div>
      </div>

      {/* Video Preview Modal */}
      {activeVideo && (
        <div className="modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '700px', background: '#000', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111' }}>
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    marginBottom: '1rem',
                    animation: 'pulseGlow 2s infinite'
                  }}
                >
                  <Film size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                  {activeVideo.title}
                </h3>
                <p style={{ color: 'var(--accent-latte)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '1.5rem' }}>
                  {activeVideo.subtitle}
                </p>
                <a
                  href={activeVideo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  <Instagram size={16} />
                  <span>Watch High-Res Reel on Instagram</span>
                </a>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveVideo(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
