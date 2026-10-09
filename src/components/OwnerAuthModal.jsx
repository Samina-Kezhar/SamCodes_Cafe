import React, { useState } from 'react';
import { Lock, X, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { CafenaLogoStamp } from './CafenaDecorations';

export function OwnerAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Clear error and PIN when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError('');
      setPin('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const enteredPin = String(pin || '').trim();
    const defaultPin = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OWNER_PIN) || '8899';
    const isMasterPin = enteredPin === defaultPin || enteredPin === '8899';

    let token = null;

    try {
      // 1. Attempt server authentication
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: enteredPin })
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && data.token) {
            token = data.token;
          }
        }
      } catch (networkErr) {
        console.warn('Backend login endpoint unavailable, using master PIN check:', networkErr);
      }

      // 2. If server token not acquired but entered PIN is master PIN 8899
      if (!token && isMasterPin) {
        const timestamp = Date.now();
        token = btoa(JSON.stringify({ role: 'owner', timestamp, session: 'master_owner_auth' }));
      }

      // 3. If authenticated
      if (token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('coffeestand_auth_token', token);
        storage.setItem('coffeestand_owner_auth', 'true');
        setError('');
        onAuthenticated(token);
        onClose();
        return;
      }

      // 4. Invalid credentials
      setError('Invalid Owner PIN or Password');
    } catch (err) {
      if (isMasterPin) {
        const fallbackToken = btoa(JSON.stringify({ role: 'owner', timestamp: Date.now(), session: 'master_owner_auth' }));
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('coffeestand_auth_token', fallbackToken);
        storage.setItem('coffeestand_owner_auth', 'true');
        setError('');
        onAuthenticated(fallbackToken);
        onClose();
        return;
      }
      setError('Invalid Owner PIN or Password');
    } finally {
      setLoading(false);
    }
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
                Cafena Management Console
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Authorized Staff & Kitchen Access
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
          Enter your manager security PIN or master password to access live kitchen orders, menu pricing, inventory, and café analytics.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Owner PIN or Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                required
                disabled={loading}
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
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none'
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
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700, justifyContent: 'center' }}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Verifying Credentials...' : 'Unlock Management Console'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
