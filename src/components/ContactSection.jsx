import React, { useState } from 'react';
import { MapPin, Phone, Clock, Mail, Send, CheckCircle, Navigation, Calendar, Users } from 'lucide-react';
import { InstagramIcon as Instagram } from './InstagramIcon';

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
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      setErrorMessage(err.message || 'Something went wrong. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Visit & Connect</span>
          <h2 className="section-title">Come Say Hello at The Allen Town</h2>
          <p className="section-desc">
            Reserve a cozy table for work or celebration, or drop us a line with any questions.
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
          {/* Left: Contact Form / Table Reservation */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Reserve a Table or Send an Inquiry
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.6rem' }}>
              We will confirm your reservation request within 15 minutes during operating hours.
            </p>

            {submitted ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Request Received!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Thank you! The Coffee Stand team at Nikol has received your details and will get in touch with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Inquiry Type Radio / Selector */}
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
                    <option value="private_event">Private Party / Birthday Gathering</option>
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
                      placeholder="Keval Patel"
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
                    placeholder="keval@example.com"
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

                {/* Party Size & Date if Table Reservation */}
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
                          padding: '0.65rem 0.8rem',
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
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.6rem',
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
                          padding: '0.6rem 0.6rem',
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

                {/* Message */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Notes or Special Requests *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about seating preferences (indoor/patio), celebrations, or dietary requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
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
                  <span>{submitting ? 'Sending Request...' : 'Submit Reservation / Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Café Info & Map Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Contact Info Cards */}
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

              {/* Phone */}
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
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Call the Barista Bar
                  </h4>
                  <a
                    href="tel:06353935169"
                    style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    063539 35169
                  </a>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Available for orders, takeaway pickups & directions
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
                    Opening Hours
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Monday – Sunday: 9:00 AM – 12:00 AM Midnight
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                    🟢 Open Now until 12 AM
                  </span>
                </div>
              </div>

              {/* Pricing & Average Spend */}
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
                  <Instagram size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Social & Spend
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Price per person: <strong>₹200–400</strong>
                  </p>
                  <a
                    href="https://www.instagram.com/coffeestand.nikol"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    @coffeestand.nikol
                  </a>
                </div>
              </div>
            </div>

            {/* Google Directions Action Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-subtle), var(--bg-surface-elevated))',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Need Directions to Coffee Stand?
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Open directly in Google Maps for live turn-by-turn navigation.
                </p>
              </div>

              <a
                href="https://www.google.com/search?q=coffee+stand+nikol"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem', flexShrink: 0 }}
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
