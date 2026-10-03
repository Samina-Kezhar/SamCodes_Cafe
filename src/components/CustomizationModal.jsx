import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

export function CustomizationModal({ item, onClose, onAddToCart }) {
  const customizable = item?.customizable || {};
  const sizes = customizable.sizes || [{ name: 'Standard', price: 0 }];
  const milks = customizable.milk || [];
  const sweetnessOptions = customizable.sweetness || [];
  const addonsList = customizable.addons || [];

  const [selectedSize, setSelectedSize] = useState(sizes[0] || { name: 'Standard', price: 0 });
  const [selectedMilk, setSelectedMilk] = useState(milks[0] || '');
  const [selectedSweetness, setSelectedSweetness] = useState(sweetnessOptions[0] || '');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Calculate item unit price with size and addons
  const basePrice = item.price;
  const sizeExtra = selectedSize.price || 0;
  const addonsExtra = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const unitPrice = basePrice + sizeExtra + addonsExtra;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const customizations = [];
    if (selectedMilk) customizations.push(selectedMilk);
    if (selectedSweetness) customizations.push(selectedSweetness);
    selectedAddons.forEach((a) => customizations.push(`${a.name} (+₹${a.price})`));

    onAddToCart({
      id: item.id,
      name: item.name,
      basePrice: item.price,
      price: unitPrice,
      size: selectedSize.name,
      sizePrice: sizeExtra,
      addons: selectedAddons,
      customizations,
      kitchenNotes,
      quantity,
      image: item.image
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="veg-indicator"></span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customize your drink & taste</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Item Preview Image */}
          {item.image && (
            <div style={{ width: '100%', height: '170px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Description */}
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description}</p>

          {/* Size Choice */}
          {sizes.length > 1 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                Select Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sizes.length}, 1fr)`, gap: '0.6rem' }}>
                {sizes.map((s) => {
                  const isSelected = selectedSize.name === s.name;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(234, 139, 57, 0.15)' : 'var(--bg-surface-elevated)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</span>
                      {s.price > 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>+₹{s.price}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {milks.length > 0 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                Milk Choice
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {milks.map((milk) => {
                  const isSelected = selectedMilk === milk;
                  return (
                    <button
                      key={milk}
                      type="button"
                      onClick={() => setSelectedMilk(milk)}
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      {milk}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Options */}
          {sweetnessOptions.length > 0 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                Sweetness Level
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sweetnessOptions.map((sweet) => {
                  const isSelected = selectedSweetness === sweet;
                  return (
                    <button
                      key={sweet}
                      type="button"
                      onClick={() => setSelectedSweetness(sweet)}
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      {sweet}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons List */}
          {addonsList.length > 0 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                Extra Add-ons & Toppings
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'rgba(234, 139, 57, 0.12)' : 'var(--bg-surface-elevated)',
                        border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', color: isChecked ? '#fff' : 'var(--text-muted)' }}>
                        {addon.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                          +₹{addon.price}
                        </span>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-medium)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}
                        >
                          {isChecked && <Check size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Notes */}
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Special Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. extra hot, crisp toast, sauce on side..."
              value={kitchenNotes}
              onChange={(e) => setKitchenNotes(e.target.value)}
              className="search-input"
              style={{ padding: '0.65rem 1rem' }}
            />
          </div>
        </div>

        {/* Modal Footer with Quantity & Add Button */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="btn-icon"
              style={{ width: '36px', height: '36px' }}
            >
              <Minus size={16} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="btn-icon"
              style={{ width: '36px', height: '36px' }}
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.98rem' }}
          >
            <span>Add to Order</span>
            <span style={{ marginLeft: '4px', fontWeight: 800 }}>• ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
