import React, { useState } from 'react';
import { Lock, X, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';
import { CafenaLogoStamp } from './CafenaDecorations';

export function OwnerAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const val = pin.trim().toLowerCase();
    // Default owner credentials: PIN '8899' or '1234' or password 'admin' or 'owner' or 'cafena'
    if (val === '8899' || val === '1234' || val === 'admin' || val === 'owner' || val === 'cafena' || val === 'coffee123') {
      if (rememberMe) {
        localStorage.setItem('coffeestand_owner_auth', 'true');
      } else {
        sessionStorage.setItem('coffeestand_owner_auth', 'true');
      }
      onAuthenticated();
      onClose();
    } else {
      setError('Invalid Owner PIN or Password. (Hint: 8899 or admin)');
    }
  };

  const handleQuickLogin = () => {
    localStorage.setItem('coffeestand_owner_auth', 'true');
    onAuthenticated();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '2.2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CafenaLogoStamp size={42} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Cafena Owner & Kitchen Console
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Authorized Personnel & Staff Access
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
          Enter the manager security PIN or master password to access live kitchen orders, menu pricing, inventory, and café analytics.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Owner PIN or Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter PIN (e.g. 8899)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2.8rem 0.75rem 1rem',
                  background: 'var(--bg-surface-elevated)',
                  border: error ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '1.05rem',
                  letterSpacing: showPassword ? 'normal' : '0.2em',
                  outline: 'none',
                  textAlign: showPassword ? 'left' : 'center'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember on this browser</span>
            </label>
            <span style={{ color: 'var(--primary)', cursor: 'default' }}>Default: 8899</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700, justifyContent: 'center' }}
          >
            <ShieldCheck size={18} />
            <span>Unlock Management Console</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>or for demonstration:</span>
            <button
              type="button"
              onClick={handleQuickLogin}
              className="btn btn-secondary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                justifyContent: 'center',
                gap: '8px',
                borderColor: 'var(--primary)',
                color: 'var(--primary)'
              }}
            >
              <Zap size={16} />
              <span>⚡ One-Click Owner Access (Demo Mode)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
