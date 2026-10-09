import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  ArrowRight,
  Plus,
  Search,
  Star,
  Sparkles,
  Phone,
  Mail,
  Filter
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { InstagramLink } from './InstagramLink';

const AVAILABLE_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4',
  'Table 5', 'Table 6', 'Table 7', 'Table 8',
  'Table 9', 'Table 10', 'Table 11', 'Table 12',
  'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4'
];

export function Part1Reservations({ onNavigateToDashboard }) {
  const {
    reservations,
    createReservation,
    updateReservation,
    cancelReservation,
    reviews,
    submitReview,
    setSelectedTableForDashboard
  } = useRestaurant();

  // Form state
  const [formData, setFormData] = useState({
    table_number: 'Table 4',
    guest_name: '',
    phone: '',
    email: '',
    party_size: 2,
    date: new Date().toISOString().slice(0, 10),
    time: '19:30',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit modal state
  const [editingReservation, setEditingReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    name: '',
    rating: 5,
    favorite_item: 'Lotus Biscoff Dream Frappe',
    comment: ''
  });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Phone validation
  const validatePhone = (num) => {
    const digits = (num || '').replace(/\D/g, '');
    let core = digits;
    if (digits.length === 11 && digits.startsWith('0')) core = digits.slice(1);
    else if (digits.length === 12 && digits.startsWith('91')) core = digits.slice(2);
    return core.length === 10 && /^[6-9]/.test(core);
  };

  // Form submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.guest_name.trim() || formData.guest_name.trim().length < 2) {
      errors.guest_name = 'Guest name is required (minimum 2 characters).';
    }

    if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.date) {
      errors.date = 'Reservation date is required.';
    }

    if (!formData.time) {
      errors.time = 'Reservation time is required.';
    } else {
      const [h, m] = formData.time.split(':').map(Number);
      const totalMins = h * 60 + m;
      if (totalMins < 9 * 60 || totalMins > 23 * 60 + 30) {
        errors.time = 'Reservations are only available during café hours (9:00 AM – 11:30 PM).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const result = await createReservation({
      guest_name: formData.guest_name.trim(),
      name: formData.guest_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.guest_name.trim().toLowerCase().replace(/\s+/g, '')}@example.com`,
      table_number: formData.table_number,
      party_size: Number(formData.party_size) || 2,
      preferred_date: formData.date,
      preferred_time: formData.time,
      message: formData.message.trim(),
      status: 'confirmed'
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessToast(`Table reservation confirmed for ${formData.guest_name} at ${formData.table_number}!`);
      setTimeout(() => setSuccessToast(null), 5000);
      setFormData({
        table_number: 'Table 4',
        guest_name: '',
        phone: '',
        email: '',
        party_size: 2,
        date: new Date().toISOString().slice(0, 10),
        time: '19:30',
        message: ''
      });
    } else {
      setFormErrors({ submit: result.error || 'Failed to save reservation.' });
    }
  };

  // Edit reservation handlers
  const handleOpenEdit = (res) => {
    setEditingReservation(res);
    setEditFormData({
      guest_name: res.name || res.guest_name || '',
      table_number: res.table_number || 'Table 1',
      party_size: res.party_size || 2,
      date: res.preferred_date || res.date || '',
      time: res.preferred_time || res.time || '',
      phone: res.phone || '',
      email: res.email || '',
      status: res.status || 'confirmed'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReservation) return;
    const res = await updateReservation(editingReservation.id, editFormData);
    if (res.success) {
      setEditingReservation(null);
      setSuccessToast(`Reservation updated for ${editFormData.table_number}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      const res = await cancelReservation(id);
      if (res.success) {
        setSuccessToast('Reservation successfully cancelled.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    }
  };

  const handleViewTableOnDashboard = (tableName) => {
    setSelectedTableForDashboard(tableName);
    if (onNavigateToDashboard) {
      onNavigateToDashboard(tableName);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewFormData.name.trim() || reviewFormData.comment.trim().length < 5) return;
    const res = await submitReview({
      ...reviewFormData,
      source: 'Verified Diner (Reservations)'
    });
    if (res.success) {
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setIsReviewModalOpen(false);
        setReviewFormData({
          name: '',
          rating: 5,
          favorite_item: 'Lotus Biscoff Dream Frappe',
          comment: ''
        });
      }, 1500);
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      (r.name || r.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.table_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="part-view-container" style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(234, 139, 57, 0.12), rgba(110, 60, 20, 0.08))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(234, 139, 57, 0.15)', borderRadius: '20px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
            <span>PART 1 OF RESTAURANT MANAGEMENT SUITE</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            📅 Table Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Create, view, edit, and cancel café table reservations. Every reservation seamlessly links to its assigned table on the Part 3 Dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.2rem' }}
          >
            <Star size={16} style={{ color: '#eab308' }} />
            <span>Submit Review</span>
          </button>
          <InstagramLink
            handleOrUrl="cafena.nikol"
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.2rem' }}
          >
            <span>@cafena.nikol</span>
          </InstagramLink>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <CheckCircle size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Grid Layout: Create Reservation Form (Left) & Reservations Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Create Reservation Form */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={20} style={{ color: 'var(--primary)' }} />
            <span>Create New Reservation</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Select table, guest name, party size, date, and operating time.
          </p>

          {formErrors.submit && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Table Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Assigned Table *
              </label>
              <select
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
              >
                {AVAILABLE_TABLES.map((t) => (
                  <option key={t} value={t}>{t} (Café Dining)</option>
                ))}
              </select>
            </div>

            {/* Guest Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Guest Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Keval Patel"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
              />
              {formErrors.guest_name && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.guest_name}</span>}
            </div>

            {/* Party Size & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Party Size *
                </label>
                <select
                  value={formData.party_size}
                  onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 98250 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                />
                {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. keval@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
              />
              {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.email}</span>}
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                />
                {formErrors.date && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.date}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Time (9 AM - 11:30 PM) *
                </label>
                <input
                  type="time"
                  min="09:00"
                  max="23:30"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                />
                {formErrors.time && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{formErrors.time}</span>}
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Seating Notes / Preferences
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Window seat, anniversary celebration, high chair needed"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {isSubmitting ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
            </button>
          </form>
        </div>

        {/* Reservations Directory / Table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                📋 All Table Reservations ({reservations.length})
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Filter, edit, cancel, and link directly to assigned tables.
              </p>
            </div>

            {/* Search & Status Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search guest or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="seated">Seated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* List of Reservations */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '550px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredReservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Calendar size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <p>No reservations found matching your criteria.</p>
              </div>
            ) : (
              filteredReservations.map((res) => (
                <div
                  key={res.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {res.name || res.guest_name}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              res.status === 'seated'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : res.status === 'confirmed'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : res.status === 'cancelled'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(234, 139, 57, 0.15)',
                            color:
                              res.status === 'seated'
                                ? '#3b82f6'
                                : res.status === 'confirmed'
                                ? '#10b981'
                                : res.status === 'cancelled'
                                ? '#ef4444'
                                : 'var(--primary)'
                          }}
                        >
                          {(res.status || 'confirmed').toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={13} /> {res.party_size || 2} Guests
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {res.preferred_date || res.date}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {res.preferred_time || res.time}
                        </span>
                        {res.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} /> {res.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Table Badge with Link to Part 3 Dashboard */}
                    <button
                      onClick={() => handleViewTableOnDashboard(res.table_number || 'Table 1')}
                      title={`View ${res.table_number || 'Table 1'} on Dashboard`}
                      className="btn btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: 'rgba(234, 139, 57, 0.12)',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)'
                      }}
                    >
                      <span>{res.table_number || 'Table 1'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {res.message && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                      <em>Note:</em> {res.message}
                    </div>
                  )}

                  {/* Actions: Edit, Cancel, Mark Seated */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                    {res.status !== 'seated' && res.status !== 'cancelled' && (
                      <button
                        onClick={() => updateReservation(res.id, { status: 'seated' })}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                      >
                        Mark Seated
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(res)}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    {res.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.78rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section in Part 1 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              ⭐ Recent Customer Reviews ({reviews.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Reviews entered in any part of the application flow here and to the Part 3 Dashboard.
            </p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            + Add Diner Review
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {reviews.slice(0, 4).map((rev) => (
            <div key={rev.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rev.name}</span>
                <div style={{ display: 'flex', color: '#eab308' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? '#eab308' : 'none'} stroke={i < rev.rating ? '#eab308' : '#8c7e72'} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                {rev.favorite_item || 'Signature Coffee'}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Reservation Modal */}
      {editingReservation && (
        <div className="modal-backdrop" onClick={() => setEditingReservation(null)}>
          <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Edit Reservation #{editingReservation.id}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Guest Name</label>
                <input
                  type="text"
                  value={editFormData.guest_name}
                  onChange={(e) => setEditFormData({ ...editFormData, guest_name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Table Number</label>
                  <select
                    value={editFormData.table_number}
                    onChange={(e) => setEditFormData({ ...editFormData, table_number: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  >
                    {AVAILABLE_TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editFormData.party_size}
                    onChange={(e) => setEditFormData({ ...editFormData, party_size: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Time</label>
                  <input
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => setEditingReservation(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Share Your Diner Review
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Your feedback is stored centrally and appears across all three management views.
            </p>

            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#10b981' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4>Thank you! Review published.</h4>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya Shah"
                    value={reviewFormData.name}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Rating *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star size={24} fill={star <= reviewFormData.rating ? '#eab308' : 'none'} stroke={star <= reviewFormData.rating ? '#eab308' : '#8c7e72'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Favorite Dish/Beverage</label>
                  <input
                    type="text"
                    placeholder="e.g. Lotus Biscoff Dream Frappe"
                    value={reviewFormData.favorite_item}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, favorite_item: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Your Review *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the coffee quality, taste, and experience..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '0.65rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Part1Reservations;
