import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';

function parseMilk(m) {
  if (!m) return { name: '', price: 0 };
  if (typeof m === 'object') {
    const rawName = String(m.name || '');
    const cleanName = rawName.replace(/\s*\(\+₹?\d+\)/, '').trim();
    let price = Number(m.price);
    if (isNaN(price)) {
      const match = rawName.match(/\+\s*₹?(\d+)/);
      price = match ? parseInt(match[1], 10) : 0;
    }
    return { name: cleanName, price: price || 0, raw: m };
  }
  const match = String(m).match(/\+\s*₹?(\d+)/);
  const price = match ? parseInt(match[1], 10) : 0;
  const cleanName = String(m).replace(/\s*\(\+₹?\d+\)/, '').trim();
  return { name: cleanName, price: price || 0, raw: m };
}

export function CustomizationModal({ item, onClose, onAddToCart }) {
  const customizable = React.useMemo(() => {
    if (!item?.customizable) return {};
    if (typeof item.customizable === 'string') {
      try {
        return JSON.parse(item.customizable);
      } catch {
        return {};
      }
    }
    return item.customizable;
  }, [item?.customizable]);

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
    const cleanName = String(addon.name || '').replace(/\s*\(\+₹?\d+\)/, '').trim();
    const cleanPrice = Number(addon.price) || 0;
    if (selectedAddons.some((a) => a.name === cleanName)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== cleanName));
    } else {
      setSelectedAddons([...selectedAddons, { name: cleanName, price: cleanPrice }]);
    }
  };

  // Base price and dynamic extras calculation
  const basePrice = parseFloat(item.price || 0);
  const sizeExtra = parseFloat(selectedSize?.price || 0);
  const milkInfo = parseMilk(selectedMilk);
  const milkExtra = milkInfo.price;
  const addonsExtra = selectedAddons.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);

  const totalExtraCharges = sizeExtra + milkExtra + addonsExtra;
  const unitPrice = basePrice + totalExtraCharges;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const customizations = [];
    if (selectedSize && selectedSize.name) {
      customizations.push(`Size: ${selectedSize.name}${sizeExtra > 0 ? ` (+₹${sizeExtra})` : ''}`);
    }
    if (milkInfo.name) {
      customizations.push(`${milkInfo.name}${milkExtra > 0 ? ` (+₹${milkExtra})` : ''}`);
    }
    if (selectedSweetness) {
      customizations.push(selectedSweetness);
    }
    selectedAddons.forEach((a) => customizations.push(`${a.name} (+₹${a.price})`));

    onAddToCart({
      id: item.id,
      name: item.name,
      basePrice: basePrice,
      extraCharges: totalExtraCharges,
      price: unitPrice,
      unitPrice: unitPrice,
      size: selectedSize?.name || 'Regular',
      sizePrice: sizeExtra,
      milk: milkInfo.name,
      milkPrice: milkExtra,
      addons: selectedAddons,
      addonsPrice: addonsExtra,
      customizations,
      kitchenNotes,
      quantity,
      image: item.image,
      prep_time_mins: item.prep_time_mins || 8
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="veg-indicator"></span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{item.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Original Dish Price: <strong>₹{basePrice}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
          {/* Item Preview Image */}
          {item.image && (
            <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Description */}
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {item.description}
          </p>

          {/* Live Price Calculator Banner */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>Base Price + Customizations</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{basePrice}</span>
                {totalExtraCharges > 0 && (
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>+ ₹{totalExtraCharges} extras</span>
                )}
                <span>=</span>
                <strong style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>₹{unitPrice} / item</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>Current Total</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalPrice}</span>
            </div>
          </div>

          {/* Size Choice */}
          {sizes.length > 1 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                1. Select Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sizes.length}, 1fr)`, gap: '0.6rem' }}>
                {sizes.map((s) => {
                  const isSelected = selectedSize?.name === s.name;
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
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
                      <span style={{ fontSize: '0.78rem', color: s.price > 0 ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 700 }}>
                        {s.price > 0 ? `+₹${s.price}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {milks.length > 0 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                2. Milk Choice
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {milks.map((m) => {
                  const info = parseMilk(m);
                  const isSelected = (selectedMilk?.name || selectedMilk) === (m?.name || m);
                  return (
                    <button
                      key={info.name}
                      type="button"
                      onClick={() => setSelectedMilk(m)}
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      style={{ padding: '0.5rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{info.name}</span>
                      {info.price > 0 && (
                        <span style={{ color: isSelected ? '#fff' : 'var(--primary)', fontWeight: 700 }}>
                          +₹{info.price}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Options */}
          {sweetnessOptions.length > 0 && (
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                3. Sweetness Preference
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
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                4. Extra Add-ons & Flavors (Custom Modifications)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {addonsList.map((addon) => {
                  const cleanName = String(addon.name || '').replace(/\s*\(\+₹?\d+\)/, '').trim();
                  const cleanPrice = Number(addon.price) || 0;
                  const isChecked = selectedAddons.some((a) => a.name === cleanName);
                  return (
                    <div
                      key={cleanName}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        padding: '0.7rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'rgba(234, 139, 57, 0.12)' : 'var(--bg-surface-elevated)',
                        border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {cleanName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary)' }}>
                          +₹{cleanPrice}
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
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Special Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, less sweet, crisp toast, sauce on side..."
              value={kitchenNotes}
              onChange={(e) => setKitchenNotes(e.target.value)}
              className="search-input"
              style={{ padding: '0.65rem 1rem' }}
            />
          </div>
        </div>

        {/* Modal Footer with Quantity & Add Button */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="btn-icon"
              style={{ width: '38px', height: '38px', background: 'var(--bg-surface-elevated)' }}
              title="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="btn-icon"
              style={{ width: '38px', height: '38px', background: 'var(--bg-surface-elevated)' }}
              title="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.6rem', fontSize: '0.96rem', fontWeight: 700 }}
          >
            <span>Add to Order</span>
            <span style={{ marginLeft: '6px', fontWeight: 900 }}>• ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
