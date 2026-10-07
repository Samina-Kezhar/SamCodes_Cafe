import React, { useState } from 'react';
import { MapPin, Phone, Clock, Mail, Send, CheckCircle, Navigation, Calendar, Users, MessageCircle } from 'lucide-react';
import { InstagramIcon as Instagram } from './InstagramIcon';
import { CafenaBrushStroke } from './CafenaDecorations';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry_type: 'table_reservation',
    party_size: 2,
    preferred_date: '',
    preferred_time: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    const trimmedName = formData.name.trim();
    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.inquiry_type !== 'general') {
      if (!formData.preferred_date) {
        setErrorMessage('Please choose a preferred reservation date.');
        return;
      }
      if (formData.preferred_date < todayStr) {
        setErrorMessage('Reservation date cannot be in the past. Please select today or a future date.');
        return;
      }
      if (!formData.preferred_time) {
        setErrorMessage('Please choose a preferred reservation time.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: trimmedName,
          email: formData.email.trim()
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiry_type: 'table_reservation',
        party_size: 2,
        preferred_date: '',
        preferred_time: '',
        message: ''
      });
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please call or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Visit & Reserve</span>
          <h2 className="section-title">Reserve a Table at The Allen Town</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
            <CafenaBrushStroke />
          </div>
          <p className="section-desc">
            Book your favorite corner for deep work, a peaceful coffee date, or celebration with friends.
          </p>
        </div>

        {/* Contact Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'flex-start'
          }}
        >
          {/* Left: Table Reservation Form */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Reserve Your Table
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.6rem' }}>
              We will confirm your reservation request within 15 minutes during operating hours.
            </p>

            {submitted ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Reservation Request Received!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Thank you! The Cafena team at Nikol has received your details and will get in touch with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                >
                  Reserve Another Table
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Inquiry Type Selector */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                    Type of Request
                  </label>
                  <select
                    value={formData.inquiry_type}
                    onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value="table_reservation">Table Reservation (Dine-in / Meeting)</option>
                    <option value="private_event">Private Gathering / Birthday Celebration</option>
                    <option value="general">General Inquiry or Feedback</option>
                  </select>
                </div>

                {/* Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Keval Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="098250 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="patel@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Party Size, Date, Time */}
                {formData.inquiry_type !== 'general' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Guests (Party)
                      </label>
                      <select
                        value={formData.party_size}
                        onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.6rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((num) => (
                          <option key={num} value={num}>{num} Person{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.5rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.preferred_time}
                        onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.5rem',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Notes or Seating Preferences (Optional — Indoor AC / Patio)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about seating preferences (indoor/outdoor patio), celebrations, or dietary requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {errorMessage && (
                  <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700 }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Sending Request...' : 'Confirm Table Reservation Request'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Café Info, Social Media & Connect Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.4rem'
              }}
            >
              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(234, 139, 57, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Café Location
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    Shop GF.15, The Allen Town, Nikol Ring Road, Cross Road, Sardar Patel Ring Rd, Nikol, Ahmedabad, Gujarat 380049
                  </p>
                </div>
              </div>

              {/* Phone & WhatsApp Quick Connect */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    flexShrink: 0
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Direct Barista Line & WhatsApp
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                    <a
                      href="tel:06353935169"
                      style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      063539 35169
                    </a>
                    <a
                      href="https://wa.me/916353935169?text=Hi%20Coffee%20Stand%20Nikol%2C%20I%20would%20like%20to%20inquire%20about%20a%20table%20reservation."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '3px 10px', fontSize: '0.78rem', gap: '5px', color: '#10b981' }}
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Available for reservations, takeaway pickups & directions
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(234, 139, 57, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Operating Hours
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Monday – Sunday: 9:00 AM – 12:00 AM Midnight
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                    🟢 Open Daily until 12 AM Midnight
                  </span>
                </div>
              </div>

              {/* Instagram & Social Media Links */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(193, 53, 132, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c13584',
                    flexShrink: 0
                  }}
                >
                  <Instagram size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Follow Us on Social Media
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <a
                      href="https://www.instagram.com/cafena.nikol"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      <Instagram size={14} style={{ color: '#c13584' }} />
                      <span>@cafena.nikol</span>
                    </a>
                    <a
                      href="https://wa.me/916353935169"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      <MessageCircle size={14} style={{ color: '#10b981' }} />
                      <span>WhatsApp Community</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Directions Action Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-subtle), var(--bg-surface-elevated))',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Need Live Navigation?
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Tap below to open directly in Google Maps for live turn-by-turn routing.
                </p>
              </div>

              <a
                href="https://www.google.com/search?q=coffee+stand+nikol"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', fontSize: '0.86rem', flexShrink: 0 }}
              >
                <Navigation size={16} />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
