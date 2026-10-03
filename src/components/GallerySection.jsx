import React, { useState } from 'react';
import { Camera, ZoomIn, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Warm Emerald Booths & Cafe Interior',
    category: 'vibe',
    image: '/images/hero-cafe.jpg',
    description: 'Cozy booths, warm vintage lighting, and quiet corners for conversation and deep work.'
  },
  {
    id: 2,
    title: 'Coffee Stand Signature Biscoff Frappe',
    category: 'frappes',
    image: '/images/signature-frappe.jpg',
    description: 'Rich blended espresso, spiced lotus biscuit crumble, and handcrafted caramel swirl.'
  },
  {
    id: 3,
    title: 'Artisan Swan Rosetta Latte Art',
    category: 'brews',
    image: '/images/latte-art.jpg',
    description: 'Poured with microfoam by our baristas using 100% single origin Indian Arabica.'
  },
  {
    id: 4,
    title: 'Golden Grilled Paneer Tikka Panini',
    category: 'food',
    image: '/images/paneer-panini.jpg',
    description: 'Artisan multigrain sourdough toasted with malai paneer, fresh basil pesto, and mozzarella.'
  },
  {
    id: 5,
    title: 'Belgian Dark Chocolate & Berry Waffle',
    category: 'food',
    image: '/images/belgian-waffle.jpg',
    description: 'Crispy warm waffle stack smothered in Belgian ganache and fresh orchard strawberries.'
  },
  {
    id: 6,
    title: 'Wild Berry Hibiscus & Peach Coolers',
    category: 'brews',
    image: '/images/iced-refresher.jpg',
    description: 'Sparkling botanicals, whole brewed hibiscus flowers, and aromatic mint.'
  },
  {
    id: 7,
    title: 'Fairy-Lit Evening Patio at The Allen Town',
    category: 'vibe',
    image: '/images/cafe-patio.jpg',
    description: 'Al fresco outdoor seating with string fairy lights, pleasant evening breeze, and coffee.'
  }
];

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="gallery" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Visual Experience</span>
          <h2 className="section-title">The Coffee Stand Gallery</h2>
          <p className="section-desc">
            A glimpse into our artisanal brewing rituals, delectable bites, and cozy cafe corners in Nikol.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="category-filter-bar" style={{ justifyContent: 'center' }}>
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'brews', label: 'Specialty Brews' },
            { id: 'frappes', label: 'Signature Frappes' },
            { id: 'food', label: 'Artisan Food' },
            { id: 'vibe', label: 'Ambience & Patio' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`filter-pill ${activeFilter === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '280px',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)'
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                className="gallery-hover-img"
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(18, 14, 11, 0.95) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.2rem',
                  transition: 'opacity 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{item.title}</h4>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(234, 139, 57, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <ZoomIn size={16} />
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="modal-backdrop" onClick={closeLightbox}>
          <div
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <img
              src={filtered[lightboxIndex].image}
              alt={filtered[lightboxIndex].title}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'contain',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
              }}
            />

            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#fff' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{filtered[lightboxIndex].title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-latte)', marginTop: '4px' }}>
                {filtered[lightboxIndex].description}
              </p>
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '-55px',
                top: '45%',
                transform: 'translateY(-50%)',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '-55px',
                top: '45%',
                transform: 'translateY(-50%)',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
