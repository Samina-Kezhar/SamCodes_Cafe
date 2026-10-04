import React, { useState, useEffect } from 'react';
import { X, QrCode, Printer, Download, ExternalLink, Check, Coffee, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { CafenaLogoStamp } from './CafenaDecorations';

const TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Table 11', 'Table 12', 'Table 13', 'Table 14', 'Table 15',
  'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4', 'Counter / Takeaway'
];

export function QRModal({ isOpen, onClose, initialTable = 'Table 4', onSelectTable }) {
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const origin = window.location.origin;
    const url = `${origin}/#menu?table=${encodeURIComponent(selectedTable)}`;

    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1c1510',
        light: '#ffffff'
      }
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [selectedTable, isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    onSelectTable(selectedTable);
    onClose();
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `cafena-qr-${selectedTable.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-caramel))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Table QR Menu Standee</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan with smartphone camera to open menu</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Table Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Select Table to Generate QR Card:
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {TABLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Printable Acrylic Café Standee Card Preview */}
          <div
            style={{
              background: '#fff',
              color: '#1a140f',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.8rem',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              border: '4px solid #ea8b39',
              position: 'relative'
            }}
          >
            {/* Top Standee Branding */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <CafenaLogoStamp size={36} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, color: '#1a140f', letterSpacing: '0.04em', margin: 0 }}>
                CAFENA
              </h2>
            </div>

            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
              The Allen Town • Nikol Ring Road • Ahmedabad
            </p>

            {/* Table Number Pill */}
            <div
              style={{
                display: 'inline-block',
                background: '#1a140f',
                color: '#fbf8f4',
                padding: '6px 18px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '0.04em',
                marginBottom: '1.2rem'
              }}
            >
              📍 {selectedTable.toUpperCase()}
            </div>

            {/* High-Res QR Code Image */}
            {qrDataUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1.2rem 0' }}>
                <img
                  src={qrDataUrl}
                  alt={`QR for ${selectedTable}`}
                  style={{
                    width: '210px',
                    height: '210px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    padding: '8px',
                    background: '#fff'
                  }}
                />
              </div>
            )}

            {/* Call to action message */}
            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a140f', marginBottom: '4px' }}>
              SCAN TO VIEW MENU & ORDER DIRECTLY
            </p>
            <p style={{ fontSize: '0.76rem', color: '#666' }}>
              No app needed • Instant kitchen preparation • Free High-Speed WiFi
            </p>
          </div>

          {/* Quick Simulation Link */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSimulateScan}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.96rem' }}
            >
              <ExternalLink size={16} />
              <span>Simulate Scanning ({selectedTable}) Menu</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleDownload}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Download size={15} />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Print Standee Card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
