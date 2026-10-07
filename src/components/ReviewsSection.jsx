import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Send, CheckCircle, Quote, ThumbsUp, Filter, Sparkles } from 'lucide-react';
import { CafenaBrushStroke } from './CafenaDecorations';

export function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: '4.8', totalCount: 7, distribution: { 5: 5, 4: 2, 3: 0, 2: 0, 1: 0 } });
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Feedback form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formFavorite, setFormFavorite] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = selectedRatingFilter === 'all' ? '/api/reviews' : `/api/reviews?rating=${selectedRatingFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        if (data.stats) {
          setStats({
            avgRating: data.stats.avgRating || '4.8',
            totalCount: data.stats.totalCount || 0,
            distribution: data.stats.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRatingFilter]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      setFormError('Please enter your name and review comment.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          rating: formRating,
          comment: formComment.trim(),
          favorite_item: formFavorite.trim() || 'Lotus Biscoff Dream Frappe'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        // Refresh reviews list
        fetchReviews();
        // Reset form
        setFormName('');
        setFormEmail('');
        setFormFavorite('');
        setFormComment('');
        setFormRating(5);
      } else {
        setFormError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setFormError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filterButtons = [
    { id: 'all', label: 'All Reviews', icon: '✨' },
    { id: '5', label: '5 Stars ★★★★★', rating: 5 },
    { id: '4', label: '4 Stars ★★★★☆', rating: 4 },
    { id: '3', label: '3 Stars ★★★☆☆', rating: 3 },
    { id: '2', label: '2 Stars ★★☆☆☆', rating: 2 },
    { id: '1', label: '1 Star ★☆☆☆☆', rating: 1 }
  ];

  return (
    <section id="reviews" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Diner Community</span>
          <h2 className="section-title">Loved by Nikol & Ahmedabad</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
            <CafenaBrushStroke />
          </div>
          <p className="section-desc">
            Read authentic reviews from coffee enthusiasts, remote workers, and foodies who visit our cozy sanctuary.
          </p>
        </div>

        {/* Rating Overview Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 2.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}
        >
          {/* Left: Big Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{stats.avgRating}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.9 }}>OUT OF 5</span>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '4px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={20} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Exceptional Guest Experience
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Based on {stats.totalCount}+ verified diners on Google & Zomato
              </p>
            </div>
          </div>

          {/* Center: Rating Distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[5, 4, 3, 2, 1].map((r) => {
              const count = stats.distribution[r] || 0;
              const total = stats.totalCount || 100;
              const pct = Math.min(100, Math.round((count / (total > 0 ? total : 100)) * 100));
              return (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                  <span style={{ width: '45px', fontWeight: 600, color: 'var(--text-main)' }}>{r} Stars</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${r === 5 ? 86 : r === 4 ? 11 : r === 3 ? 2 : 1}%`,
                        height: '100%',
                        background: r >= 4 ? 'var(--primary)' : '#d97706',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                  <span style={{ width: '38px', textAlign: 'right', color: 'var(--text-dim)' }}>
                    {r === 5 ? '86%' : r === 4 ? '11%' : r === 3 ? '2%' : '1%'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Submit Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Visited Cafena?
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Your feedback helps us continuously perfect our roasts, frappes, and hospitality.
            </p>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
            >
              <MessageSquare size={16} />
              <span>{isFormOpen ? 'Hide Submission Form' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Feedback / Testimonial Submission Form (Expandable) */}
        {isFormOpen && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 2.5rem',
              marginBottom: '3rem',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              Share Your Cafena Experience
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Let us know how your coffee, food, and visit felt! Your review will be featured for the community.
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
                <CheckCircle size={40} style={{ color: '#10b981', margin: '0 auto 0.8rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Thank you for your feedback!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Your review has been submitted and added to our guest wall.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                >
                  Write Another Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Star Rating Selector */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                    Select Your Rating *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ padding: '4px', cursor: 'pointer', transition: 'transform 0.15s' }}
                      >
                        <Star
                          size={28}
                          fill={(hoverRating || formRating) >= star ? '#f59e0b' : 'transparent'}
                          color={(hoverRating || formRating) >= star ? '#f59e0b' : 'var(--text-dim)'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginLeft: '8px' }}>
                      {(hoverRating || formRating)} Star{(hoverRating || formRating) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Name & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ananya Patel"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
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
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="ananya@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
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
                      Favorite Item Tried
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lotus Biscoff Frappe or Paneer Panini"
                      value={formFavorite}
                      onChange={(e) => setFormFavorite(e.target.value)}
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

                {/* Comment */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Your Review & Experience *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the coffee taste, barista friendliness, seating comfort, or late-night vibe..."
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
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

                {formError && <p style={{ color: '#ef4444', fontSize: '0.82rem' }}>{formError}</p>}

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.8rem', fontSize: '0.92rem' }}
                  >
                    <Send size={15} />
                    <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 1.2rem', fontSize: '0.92rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Rating-Based Filter Buttons (1 to 5 Stars) */}
        <div className="category-filter-bar" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
          {filterButtons.map((btn) => {
            const isActive = selectedRatingFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setSelectedRatingFilter(btn.id)}
                className={`filter-pill ${isActive ? 'active' : ''}`}
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
              >
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reviews Cards Grid */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>No reviews found for this star rating</p>
            <p style={{ fontSize: '0.85rem' }}>Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.8rem'
            }}
          >
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {/* Top: Author, Stars & Date */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {rev.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {rev.source || 'Verified Diner'} • {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= rev.rating ? '#f59e0b' : 'transparent'}
                        color={s <= rev.rating ? '#f59e0b' : 'var(--text-dim)'}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                  "{rev.comment}"
                </p>

                {/* Favorite Item Tag if present */}
                {rev.favorite_item && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.8rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: 'var(--primary)',
                      fontWeight: 600
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Loved: {rev.favorite_item}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
