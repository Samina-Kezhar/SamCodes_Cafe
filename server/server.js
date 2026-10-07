import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & seed
initDatabase();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static public folder (images, icons)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ----------------------------------------------------
// SECURITY & AUTH CONFIGURATION (S01, S02, S03)
// ----------------------------------------------------
const OWNER_SECRET = process.env.OWNER_AUTH_SECRET || crypto.randomBytes(32).toString('hex');
const OWNER_PIN = process.env.OWNER_PIN || '8899';

export function generateOwnerToken() {
  const timestamp = Date.now();
  const payload = `owner:${timestamp}`;
  const hmac = crypto.createHmac('sha256', OWNER_SECRET).update(payload).digest('hex');
  return Buffer.from(`${timestamp}:${hmac}`).toString('base64');
}

export function verifyOwnerToken(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [timestampStr, providedHmac] = decoded.split(':');
    if (!timestampStr || !providedHmac) return false;

    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 7 days
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = crypto.createHmac('sha256', OWNER_SECRET).update(`owner:${timestamp}`).digest('hex');
    const a = Buffer.from(providedHmac, 'hex');
    const b = Buffer.from(expectedHmac, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Express Auth Middleware
export function requireOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-owner-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = String(customHeader).trim();
  }

  if (verifyOwnerToken(token)) {
    req.user = { role: 'owner' };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Valid owner authentication token required'
  });
}

function isOwnerRequest(req) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-owner-token'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : customHeader;
  return verifyOwnerToken(token);
}

// ----------------------------------------------------
// RATE LIMITING MIDDLEWARE (S07)
// ----------------------------------------------------
function createRateLimiter({ windowMs = 60000, max = 30, message = 'Too many requests' }) {
  const requests = new Map();

  // Periodically clean expired keys
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests.entries()) {
      if (now - entry.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = requests.get(ip);

    if (!entry || now - entry.startTime > windowMs) {
      entry = { startTime: now, count: 1 };
      requests.set(ip, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ success: false, error: message });
    }
    next();
  };
}

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many login attempts. Please wait 15 minutes.'
});
const orderLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many orders placed from this address. Please wait a few minutes.'
});
const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many messages sent. Please contact us via phone or WhatsApp.'
});
const reviewLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many reviews submitted. Thank you for your feedback!'
});

// Input sanitization helper (S09)
function sanitizeText(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim()
    .slice(0, maxLength);
}

// ----------------------------------------------------
// WEBSOCKET SERVER & ROLE-AWARE BROADCASTS (S03, S06, F13)
// ----------------------------------------------------
export function broadcast(type, payload, targetRole = null) {
  const ownerMessage = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });

  // For ORDER_UPDATED, sanitize PII for public customer clients (S06)
  let publicMessage = ownerMessage;
  if (type === 'ORDER_UPDATED' && payload) {
    const sanitizedOrder = {
      id: payload.id,
      status: payload.status,
      payment_status: payload.payment_status,
      estimated_prep_mins: payload.estimated_prep_mins,
      updated_at: payload.updated_at
    };
    publicMessage = JSON.stringify({ type, payload: sanitizedOrder, timestamp: new Date().toISOString() });
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (targetRole && client.role !== targetRole) {
        return; // Only send to target role (e.g. 'owner')
      }
      try {
        if (client.role === 'owner') {
          client.send(ownerMessage);
        } else {
          client.send(publicMessage);
        }
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

// Heartbeat & zombie client detection (F13)
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.role = 'customer'; // Default role is strictly customer

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Cafena Realtime Service' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'IDENTIFY') {
        // Authenticate owner role using secure token (S03)
        if (data.role === 'owner') {
          if (verifyOwnerToken(data.token)) {
            ws.role = 'owner';
            ws.send(JSON.stringify({ type: 'IDENTIFIED', role: 'owner', success: true }));
          } else {
            ws.role = 'customer';
            ws.send(JSON.stringify({ type: 'AUTH_FAILED', error: 'Invalid owner credentials' }));
          }
        }
      } else if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch {
      // ignore malformed payloads
    }
  });
});

// Helper to format order row from DB
function formatOrder(row) {
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
    estimated_prep_mins: row.estimated_prep_mins || 10
  };
}

// Canonical Tables (F07)
const VALID_TABLES = new Set([
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
  'Table 11', 'Table 12', 'Table 13', 'Table 14', 'Table 15',
  'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4',
  'Counter', 'Takeaway', 'Counter / Takeaway'
]);

function normalizeTableNumber(table) {
  if (!table || typeof table !== 'string') return 'Takeaway';
  const clean = table.trim();
  if (VALID_TABLES.has(clean)) return clean;
  // Match prefix like 'Table' or 'Patio'
  for (const valid of VALID_TABLES) {
    if (clean.toLowerCase() === valid.toLowerCase()) return valid;
  }
  return 'Takeaway';
}

// ----------------------------------------------------
// 0. AUTHENTICATION ENDPOINTS (S01)
// ----------------------------------------------------
app.post('/api/auth/login', loginLimiter, (req, res) => {
  try {
    const { pin, password } = req.body;
    const candidate = String(pin || password || '').trim();

    // Verify strictly against configured PIN using constant-time comparison
    const pinBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(OWNER_PIN);
    const isValid = pinBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(pinBuffer, expectedBuffer);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid Owner PIN or Password' });
    }

    const token = generateOwnerToken();
    res.json({
      success: true,
      token,
      role: 'owner',
      message: 'Authentication successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const isOwner = isOwnerRequest(req);
  if (!isOwner) {
    return res.status(401).json({ success: false, authenticated: false, role: 'guest' });
  }
  res.json({ success: true, authenticated: true, role: 'owner' });
});

// ----------------------------------------------------
// 1. MENU ENDPOINTS (S02, F11)
// ----------------------------------------------------
app.get('/api/menu', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM menu_items ORDER BY category, price ASC').all();
    const items = rows.map((r) => ({
      ...r,
      is_veg: Boolean(r.is_veg),
      in_stock: Boolean(r.in_stock),
      tags: JSON.parse(r.tags_json || '[]'),
      customizable: JSON.parse(r.customizable_json || '{}')
    }));
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/menu', requireOwnerAuth, (req, res) => {
  try {
    const {
      name,
      category = 'signature_frappes',
      price = 200,
      description = '',
      image = '/images/cafena-hero-splash.jpg',
      tags = ['New'],
      is_veg = true,
      in_stock = true,
      prep_time_mins = 8,
      customizable = {}
    } = req.body;

    const cleanName = sanitizeText(name, 100);
    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, error: 'Price must be a valid non-negative number' });
    }

    const numPrep = parseInt(prep_time_mins, 10);
    if (isNaN(numPrep) || numPrep < 1 || numPrep > 120) {
      return res.status(400).json({ success: false, error: 'Preparation time must be between 1 and 120 minutes' });
    }

    const id = `item-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const insert = db.prepare(`
      INSERT INTO menu_items (id, name, category, price, description, image, tags_json, is_veg, in_stock, prep_time_mins, customizable_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      cleanName,
      sanitizeText(category, 50),
      numPrice,
      sanitizeText(description, 500),
      sanitizeText(image, 500),
      JSON.stringify(Array.isArray(tags) ? tags : []),
      is_veg ? 1 : 0,
      in_stock ? 1 : 0,
      numPrep,
      JSON.stringify(customizable || {})
    );

    const newItem = {
      id,
      name: cleanName,
      category: sanitizeText(category, 50),
      price: numPrice,
      description: sanitizeText(description, 500),
      image: sanitizeText(image, 500),
      tags: Array.isArray(tags) ? tags : [],
      is_veg: Boolean(is_veg),
      in_stock: Boolean(in_stock),
      prep_time_mins: numPrep,
      customizable
    };

    broadcast('MENU_ITEM_ADDED', newItem);
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image, in_stock, prep_time_mins } = req.body;
    const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    let updatedPrice = existing.price;
    if (price !== undefined) {
      const parsed = parseFloat(price);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, error: 'Price must be a valid non-negative number' });
      }
      updatedPrice = parsed;
    }

    let updatedPrep = existing.prep_time_mins;
    if (prep_time_mins !== undefined) {
      const parsed = parseInt(prep_time_mins, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 120) {
        return res.status(400).json({ success: false, error: 'Prep time must be between 1 and 120 minutes' });
      }
      updatedPrep = parsed;
    }

    const updatedName = name !== undefined ? sanitizeText(name, 100) : existing.name;
    const updatedCategory = category !== undefined ? sanitizeText(category, 50) : existing.category;
    const updatedDesc = description !== undefined ? sanitizeText(description, 500) : existing.description;
    const updatedImg = image !== undefined ? sanitizeText(image, 500) : existing.image;
    const updatedStock = in_stock !== undefined ? (in_stock ? 1 : 0) : existing.in_stock;

    db.prepare(`
      UPDATE menu_items
      SET name = ?, category = ?, price = ?, description = ?, image = ?, in_stock = ?, prep_time_mins = ?
      WHERE id = ?
    `).run(updatedName, updatedCategory, updatedPrice, updatedDesc, updatedImg, updatedStock, updatedPrep, id);

    const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    const item = {
      ...updated,
      is_veg: Boolean(updated.is_veg),
      in_stock: Boolean(updated.in_stock),
      tags: JSON.parse(updated.tags_json || '[]'),
      customizable: JSON.parse(updated.customizable_json || '{}')
    };

    broadcast('MENU_ITEM_UPDATED', item);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/menu/:id', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    broadcast('MENU_ITEM_DELETED', { id });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id/toggle', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    const current = db.prepare('SELECT in_stock FROM menu_items WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    const newStock = current.in_stock ? 0 : 1;
    db.prepare('UPDATE menu_items SET in_stock = ? WHERE id = ?').run(newStock, id);

    broadcast('MENU_STOCK_CHANGED', { id, in_stock: Boolean(newStock) });
    res.json({ success: true, id, in_stock: Boolean(newStock) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 2. OFFERS & PROMOTIONS (S02, F12)
// ----------------------------------------------------
app.get('/api/offers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM offers').all();
    const offers = rows.map((r) => ({
      ...r,
      highlight: Boolean(r.highlight)
    }));
    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/offers', requireOwnerAuth, (req, res) => {
  try {
    const {
      code,
      title,
      tagline = '',
      discount = '15% OFF',
      discount_percent = 15,
      discount_amount = 0,
      min_order = 200,
      description = '',
      badge = 'Special Deal',
      highlight = false
    } = req.body;

    const cleanCode = sanitizeText(code, 30).toUpperCase();
    const cleanTitle = sanitizeText(title, 100);

    if (!cleanCode || !cleanTitle) {
      return res.status(400).json({ success: false, error: 'Code and Title are required' });
    }

    const dPercent = parseFloat(discount_percent || 0);
    const dAmount = parseFloat(discount_amount || 0);
    const mOrder = parseFloat(min_order || 0);

    if (dPercent < 0 || dPercent > 100) {
      return res.status(400).json({ success: false, error: 'Discount percent must be between 0 and 100' });
    }
    if (dAmount < 0 || mOrder < 0) {
      return res.status(400).json({ success: false, error: 'Amounts must be non-negative' });
    }

    // Check code uniqueness
    const existing = db.prepare('SELECT id FROM offers WHERE code = ?').get(cleanCode);
    if (existing) {
      return res.status(409).json({ success: false, error: `Coupon code "${cleanCode}" already exists` });
    }

    const id = `offer-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const insert = db.prepare(`
      INSERT INTO offers (id, code, title, tagline, discount, discount_percent, discount_amount, min_order, description, badge, highlight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      cleanCode,
      cleanTitle,
      sanitizeText(tagline, 150),
      sanitizeText(discount, 50),
      dPercent,
      dAmount,
      mOrder,
      sanitizeText(description, 300),
      sanitizeText(badge, 50),
      highlight ? 1 : 0
    );

    const newOffer = {
      id,
      code: cleanCode,
      title: cleanTitle,
      tagline: sanitizeText(tagline, 150),
      discount: sanitizeText(discount, 50),
      discount_percent: dPercent,
      discount_amount: dAmount,
      min_order: mOrder,
      description: sanitizeText(description, 300),
      badge: sanitizeText(badge, 50),
      highlight: Boolean(highlight)
    };

    broadcast('OFFERS_UPDATED', newOffer);
    res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/offers/:id', requireOwnerAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
    broadcast('OFFERS_UPDATED', { deletedId: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 3. REVIEWS & TESTIMONIALS API (S07, S09, F10)
// ----------------------------------------------------
app.get('/api/reviews', (req, res) => {
  try {
    const { rating } = req.query;
    let query = 'SELECT * FROM reviews';
    const params = [];

    if (rating && rating !== 'all') {
      query += ' WHERE rating = ?';
      params.push(parseInt(rating, 10));
    }
    query += ' ORDER BY created_at DESC';

    const reviews = db.prepare(query).all(...params);

    // Compute true stats from database (F10)
    const allReviews = db.prepare('SELECT rating FROM reviews').all();
    const totalCount = allReviews.length;
    const sumRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalCount > 0 ? (sumRating / totalCount).toFixed(1) : '5.0';

    const distribution = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length
    };

    res.json({
      success: true,
      reviews,
      stats: {
        avgRating,
        totalCount,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reviews', reviewLimiter, (req, res) => {
  try {
    const { name, rating = 5, comment, favorite_item = 'Cafena Signature Frappe' } = req.body;
    const cleanName = sanitizeText(name, 60);
    const cleanComment = sanitizeText(comment, 600);
    const cleanFav = sanitizeText(favorite_item, 80);

    if (!cleanName || !cleanComment) {
      return res.status(400).json({ success: false, error: 'Name and comment are required' });
    }

    const cleanRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO reviews (name, rating, comment, favorite_item, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      cleanName,
      cleanRating,
      cleanComment,
      cleanFav || 'House Special',
      'Verified Customer',
      now
    );

    const newReview = {
      id: Number(result.lastInsertRowid),
      name: cleanName,
      rating: cleanRating,
      comment: cleanComment,
      favorite_item: cleanFav || 'House Special',
      source: 'Verified Customer',
      created_at: now
    };

    broadcast('NEW_REVIEW', newReview);
    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 4. INVENTORY TRACKING API (S02, F08)
// ----------------------------------------------------
app.get('/api/inventory', requireOwnerAuth, (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM inventory ORDER BY category, item_name ASC').all();
    const lowStockCount = items.filter((i) => i.current_stock <= i.min_threshold).length;
    res.json({
      success: true,
      items,
      stats: {
        totalItems: items.length,
        lowStockCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/inventory/:id/restock', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { add_amount } = req.body;
    const current = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    const parsedAdd = parseFloat(add_amount);
    if (isNaN(parsedAdd) || parsedAdd <= 0) {
      return res.status(400).json({ success: false, error: 'Restock amount must be a positive number' });
    }

    const newStock = Math.round((current.current_stock + parsedAdd) * 100) / 100;
    const newStatus = newStock >= current.min_threshold ? 'adequate' : 'low';
    const now = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE inventory
      SET current_stock = ?, status = ?, last_restocked = ?
      WHERE id = ?
    `).run(newStock, newStatus, now, id);

    const updated = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    broadcast('INVENTORY_UPDATED', updated);
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 5. ORDERS API (S02, S04, S05, S08, F01-F06)
// ----------------------------------------------------
app.get('/api/orders', requireOwnerAuth, (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const rows = db.prepare(query).all(...params);
    const orders = rows.map(formatOrder);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order Tracking by ID (S08 - IDOR Protection)
app.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    if (!row) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isOwner = isOwnerRequest(req);
    // Allow if caller is authenticated owner OR holds matching order tracking_token
    if (!isOwner) {
      if (!token || token !== row.tracking_token) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Valid tracking token required for customer lookup'
        });
      }
    }

    const formatted = formatOrder(row);
    res.json({ success: true, order: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order Placement (S04, S05, S09, F01, F02, F03, F04, F05, F06)
app.post('/api/orders', orderLimiter, (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      table_number = 'Counter',
      order_type = 'dine_in',
      items = [],
      coupon_code = '',
      payment_method = 'counter',
      kitchen_notes = ''
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
    }
    if (items.length > 30) {
      return res.status(400).json({ success: false, error: 'Maximum 30 distinct items allowed per order' });
    }

    const cleanCustomerName = sanitizeText(customer_name, 60);
    if (!cleanCustomerName) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    const cleanPhone = sanitizeText(customer_phone, 20);
    const cleanNotes = sanitizeText(kitchen_notes, 250);
    const normalizedTable = normalizeTableNumber(table_number);
    const normalizedOrderType = normalizedTable.toLowerCase().includes('takeaway') ? 'takeaway' : (order_type || 'dine_in');

    // AUTHORITATIVE SERVER-SIDE PRICING & IN-STOCK VALIDATION (S04, F01, F02, F03)
    let subtotal = 0;
    const validatedItems = [];
    const inventoryDeductions = [];

    for (const item of items) {
      if (!item || !item.id) {
        return res.status(400).json({ success: false, error: 'Invalid item specification' });
      }

      // Query database for authoritative item definition
      const dbItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.id);
      if (!dbItem) {
        return res.status(400).json({ success: false, error: `Menu item with id "${item.id}" does not exist.` });
      }

      // In-Stock Validation (F01)
      if (!dbItem.in_stock) {
        return res.status(400).json({ success: false, error: `"${dbItem.name}" is currently sold out.` });
      }

      // Quantity bounds (F03)
      const qty = parseInt(item.quantity || 1, 10);
      if (isNaN(qty) || qty < 1 || qty > 20) {
        return res.status(400).json({ success: false, error: `Quantity for "${dbItem.name}" must be between 1 and 20.` });
      }

      const basePrice = dbItem.price;
      const customizable = JSON.parse(dbItem.customizable_json || '{}');

      // Size calculation
      let sizeExtra = 0;
      let selectedSizeName = 'Standard';
      if (item.size && Array.isArray(customizable.sizes)) {
        const foundSize = customizable.sizes.find((s) => s.name === item.size);
        if (foundSize) {
          sizeExtra = Math.max(0, parseFloat(foundSize.price) || 0);
          selectedSizeName = foundSize.name;
        }
      }

      // Milk pricing parity calculation (F02)
      let milkExtra = 0;
      let selectedMilkName = '';
      if (item.milk && Array.isArray(customizable.milk)) {
        const foundMilk = customizable.milk.find((m) => {
          if (typeof m === 'object') return m.name === item.milk;
          return m === item.milk;
        });
        if (foundMilk) {
          if (typeof foundMilk === 'object') {
            milkExtra = Math.max(0, parseFloat(foundMilk.price) || 0);
            selectedMilkName = foundMilk.name;
          } else {
            const match = String(foundMilk).match(/\+\s*₹?(\d+)/);
            milkExtra = match ? parseInt(match[1], 10) : 0;
            selectedMilkName = String(foundMilk).replace(/\s*\(\+₹?\d+\)/, '').trim();
          }
        }
      }

      // Addons calculation
      let addonsTotal = 0;
      const validAddons = [];
      if (Array.isArray(item.addons) && Array.isArray(customizable.addons)) {
        for (const reqAddon of item.addons) {
          const match = customizable.addons.find((a) => a.name === (reqAddon.name || reqAddon));
          if (match) {
            const addPrice = Math.max(0, parseFloat(match.price) || 0);
            addonsTotal += addPrice;
            validAddons.push({ name: match.name, price: addPrice });
          }
        }
      }

      const effectiveUnitPrice = basePrice + sizeExtra + milkExtra + addonsTotal;
      const itemTotal = effectiveUnitPrice * qty;
      subtotal += itemTotal;

      // Normalize customizations to array (Issue 2)
      let normalizedCustomizations = [];
      if (Array.isArray(item.customizations)) {
        normalizedCustomizations = item.customizations.map((c) => String(c).trim()).filter(Boolean);
      } else if (typeof item.customizations === 'string' && item.customizations.trim()) {
        normalizedCustomizations = [item.customizations.trim()];
      }

      validatedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        category: dbItem.category,
        price: effectiveUnitPrice,
        quantity: qty,
        size: selectedSizeName,
        sizePrice: sizeExtra,
        milk: selectedMilkName,
        milkPrice: milkExtra,
        addons: validAddons,
        addonsPrice: addonsTotal,
        customizations: normalizedCustomizations,
        kitchenNotes: sanitizeText(item.kitchenNotes || item.kitchen_notes || '', 200),
        prep_time_mins: dbItem.prep_time_mins || 8,
        itemTotal
      });

      // Prepare inventory deduction estimates with substitutions (Issue 11)
      if (dbItem.category.includes('coffee') || dbItem.category.includes('frappes') || dbItem.category.includes('cold_brews')) {
        inventoryDeductions.push({ id: 'inv-01', qty: 0.02 * qty }); // ~20g beans
        const isOatMilk = selectedMilkName && selectedMilkName.toLowerCase().includes('oat');
        if (isOatMilk) {
          inventoryDeductions.push({ id: 'inv-03', qty: 0.25 * qty }); // Oat milk
        } else if (selectedMilkName !== 'None' && selectedMilkName !== 'Black') {
          inventoryDeductions.push({ id: 'inv-02', qty: 0.25 * qty }); // Dairy milk
        }
      }
      if (dbItem.category.includes('sandwiches')) {
        inventoryDeductions.push({ id: 'inv-06', qty: 1 * qty }); // 1 panini loaf
        inventoryDeductions.push({ id: 'inv-07', qty: 0.1 * qty }); // 100g paneer
      }
      const itemNameLower = (dbItem.name || '').toLowerCase();
      if (itemNameLower.includes('biscoff')) {
        inventoryDeductions.push({ id: 'inv-04', qty: 0.03 * qty }); // Biscoff
      }
      if (itemNameLower.includes('nutella') || itemNameLower.includes('hazelnut')) {
        inventoryDeductions.push({ id: 'inv-05', qty: 0.03 * qty }); // Nutella
      }
      if (itemNameLower.includes('waffle') || itemNameLower.includes('brownie') || itemNameLower.includes('chocolate')) {
        inventoryDeductions.push({ id: 'inv-08', qty: 0.04 * qty }); // Chocolate ganache
      }
      if (itemNameLower.includes('gelato') || itemNameLower.includes('ice cream')) {
        inventoryDeductions.push({ id: 'inv-09', qty: 0.05 * qty }); // Gelato
      }
    }

    // 5% GST tax
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    let discount = 0;
    let validatedCoupon = '';

    // Coupon calculation & discount ceiling (F04)
    if (coupon_code) {
      const normalizedCode = sanitizeText(coupon_code, 30).toUpperCase();
      const offer = db.prepare('SELECT * FROM offers WHERE code = ?').get(normalizedCode);
      if (offer && subtotal >= (offer.min_order || 0)) {
        if (offer.discount_percent > 0) {
          discount = Math.round((subtotal * offer.discount_percent) / 100);
        } else if (offer.discount_amount > 0) {
          discount = offer.discount_amount;
        }
        discount = Math.min(subtotal, Math.max(0, discount)); // Cap discount at subtotal
        validatedCoupon = normalizedCode;
      }
    }

    const total = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);

    // Cryptographically secure, non-colliding order ID (F05)
    const orderSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderId = `CS-${Date.now().toString(36).toUpperCase()}-${orderSuffix}`;

    // Secure tracking token for IDOR protection (S08)
    const trackingToken = crypto.randomBytes(16).toString('hex');

    // Prep time calculation
    const maxPrep = Math.max(...validatedItems.map((it) => parseInt(it.prep_time_mins || 8, 10)), 8);
    const itemVolumeBuffer = Math.min(6, Math.max(0, (validatedItems.length - 1) * 2));
    const estimatedPrepMins = maxPrep + itemVolumeBuffer;

    // Payment status verification guard (S05)
    // UPI orders are marked 'pending_verification' until counter confirmation
    const paymentStatus = payment_method === 'upi' ? 'pending_verification' : 'pending';
    const now = new Date().toISOString();

    // ATOMIC DATABASE TRANSACTION (F06)
    // Node.js DatabaseSync uses explicit BEGIN, COMMIT, ROLLBACK
    db.exec('BEGIN');
    try {
      const insert = db.prepare(`
        INSERT INTO orders (
          id, customer_name, customer_phone, table_number, order_type,
          items_json, subtotal, tax, discount, coupon_code, total,
          payment_method, payment_status, status, kitchen_notes, estimated_prep_mins,
          created_at, updated_at, tracking_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        orderId,
        cleanCustomerName,
        cleanPhone,
        normalizedTable,
        normalizedOrderType,
        JSON.stringify(validatedItems),
        subtotal,
        tax,
        discount,
        validatedCoupon,
        total,
        payment_method === 'upi' ? 'upi' : 'counter',
        paymentStatus,
        'received',
        cleanNotes,
        estimatedPrepMins,
        now,
        now,
        trackingToken
      );

      // Decrement inventory stock safely
      const updateStockStmt = db.prepare(`
        UPDATE inventory
        SET current_stock = MAX(0, ROUND(current_stock - ?, 2)),
            status = CASE WHEN (current_stock - ?) <= min_threshold THEN 'low' ELSE 'adequate' END
        WHERE id = ?
      `);

      for (const dec of inventoryDeductions) {
        try {
          updateStockStmt.run(dec.qty, dec.qty, dec.id);
        } catch {
          // ignore deduction failure if inventory item not seeded
        }
      }

      db.exec('COMMIT');
    } catch (txError) {
      db.exec('ROLLBACK');
      throw txError;
    }

    const savedOrder = formatOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId));

    // Broadcast new order to owner kitchen console ONLY (S06)
    broadcast('NEW_ORDER', savedOrder, 'owner');

    res.status(201).json({
      success: true,
      order: savedOrder,
      tracking_token: trackingToken
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Order Status (S02, S06, S08)
app.patch('/api/orders/:id/status', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const validStatuses = new Set(['received', 'brewing', 'ready', 'completed', 'cancelled']);
    const validPaymentStatuses = new Set(['pending', 'pending_verification', 'paid', 'refunded']);

    const newStatus = status && validStatuses.has(status) ? status : existing.status;
    const newPaymentStatus = payment_status && validPaymentStatuses.has(payment_status)
      ? payment_status
      : existing.payment_status;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE orders
      SET status = ?, payment_status = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, newPaymentStatus, now, id);

    const updatedOrder = formatOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));

    // Broadcast order update (owners get full order, public gets sanitized PII-free payload) (S06)
    broadcast('ORDER_UPDATED', updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 6. QR CODE GENERATION API (F15)
// ----------------------------------------------------
app.get('/api/qr', async (req, res) => {
  try {
    const { table = '', url } = req.query;
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';

    // Restrict URL generation strictly to internal table endpoints (F15 - SSRF Protection)
    let targetUrl = `${protocol}://${host}/?table=${encodeURIComponent(normalizeTableNumber(table))}`;
    if (url && typeof url === 'string') {
      try {
        const parsed = new URL(url, `${protocol}://${host}`);
        if (parsed.host === host) {
          targetUrl = parsed.toString();
        }
      } catch {
        // ignore invalid URL and use default targetUrl
      }
    }

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1c1510',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      table: table || 'All Tables',
      targetUrl,
      qrDataUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qr/tables', async (req, res) => {
  try {
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';

    const tables = [
      'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
      'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
      'Patio 1', 'Patio 2', 'Patio 3', 'Patio 4', 'Counter / Takeaway'
    ];

    const tableCards = await Promise.all(
      tables.map(async (table) => {
        const targetUrl = `${protocol}://${host}/?table=${encodeURIComponent(table)}`;
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#1c1510',
            light: '#ffffff'
          }
        });
        return { table, targetUrl, qrDataUrl };
      })
    );

    res.json({ success: true, tableCards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 7. CONTACT & RESERVATIONS API (S02, S06, S07, S09, F09)
// ----------------------------------------------------
app.get('/api/contact', requireOwnerAuth, (req, res) => {
  try {
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contact', contactLimiter, (req, res) => {
  try {
    const { name, email, phone, inquiry_type = 'table_reservation', message, party_size = 2, preferred_date, preferred_time } = req.body;

    const cleanName = sanitizeText(name, 80);
    const cleanEmail = sanitizeText(email, 120);
    const cleanPhone = sanitizeText(phone, 25);
    let cleanMsg = sanitizeText(message, 1000);

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Valid name (minimum 2 characters) is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone || phoneDigits.length < 7) {
      return res.status(400).json({ success: false, error: 'Valid contact phone number is required' });
    }

    const cleanPartySize = Math.min(20, Math.max(1, parseInt(party_size || 2, 10)));
    const cleanInquiryType = sanitizeText(inquiry_type, 50) || 'table_reservation';
    const cleanDate = sanitizeText(preferred_date, 20);
    const cleanTime = sanitizeText(preferred_time, 20);

    // Validate date & time for table reservations and events
    if (cleanInquiryType === 'table_reservation' || cleanInquiryType === 'private_event') {
      if (!cleanDate) {
        return res.status(400).json({ success: false, error: 'Preferred reservation date is required' });
      }
      const todayStr = new Date().toISOString().slice(0, 10);
      if (cleanDate < todayStr) {
        return res.status(400).json({ success: false, error: 'Reservation date cannot be in the past' });
      }
      if (!cleanTime) {
        return res.status(400).json({ success: false, error: 'Preferred reservation time is required' });
      }
    }

    if (!cleanMsg) {
      cleanMsg = cleanInquiryType === 'table_reservation'
        ? `Table reservation for ${cleanPartySize} guest(s) on ${cleanDate || 'today'} at ${cleanTime || 'requested time'}`
        : `General inquiry regarding ${cleanInquiryType}`;
    }

    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO contacts (name, email, phone, inquiry_type, message, party_size, preferred_date, preferred_time, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', ?)
    `);

    const result = insert.run(
      cleanName,
      cleanEmail,
      cleanPhone,
      cleanInquiryType,
      cleanMsg,
      cleanPartySize,
      cleanDate,
      cleanTime,
      now
    );

    const newContact = {
      id: Number(result.lastInsertRowid),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      inquiry_type: cleanInquiryType,
      message: cleanMsg,
      party_size: cleanPartySize,
      preferred_date: cleanDate,
      preferred_time: cleanTime,
      status: 'unread',
      created_at: now
    };

    // Broadcast customer contact messages STRICTLY to authenticated owner (S06 - PII leak fix)
    broadcast('NEW_CONTACT_MESSAGE', newContact, 'owner');

    res.status(201).json({ success: true, message: 'Reservation request received successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/contact/:id/status', requireOwnerAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'confirmed' } = req.body;

    // Strict status enum validation including seated (F09)
    const validStatuses = new Set(['unread', 'confirmed', 'declined', 'completed', 'seated']);
    if (!validStatuses.has(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${[...validStatuses].join(', ')}` });
    }

    db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
    broadcast('RESERVATION_UPDATED', { id: parseInt(id, 10), status }, 'owner');
    res.json({ success: true, id, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 8. DASHBOARD ANALYTICS API (S02, F14)
// ----------------------------------------------------
app.get('/api/dashboard/stats', requireOwnerAuth, (req, res) => {
  try {
    // Single consolidated SQLite aggregate query with accurate Today Revenue (F14, Issue 12)
    const todayStart = new Date().toISOString().slice(0, 10);
    const aggregatedStats = db.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status IN ('received', 'brewing', 'ready') THEN 1 ELSE 0 END) as activeOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as countReceived,
        SUM(CASE WHEN status = 'brewing' THEN 1 ELSE 0 END) as countBrewing,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as countReady,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as countCancelled,
        SUM(CASE WHEN created_at >= ? AND payment_status = 'paid' AND status != 'cancelled' THEN total ELSE 0 END) as todayRevenue,
        SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total ELSE 0 END) as totalRevenue
      FROM orders
    `).get(todayStart);

    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM inventory WHERE current_stock <= min_threshold').get().count;

    res.json({
      success: true,
      stats: {
        totalOrders: aggregatedStats.totalOrders || 0,
        activeOrders: aggregatedStats.activeOrders || 0,
        completedOrders: aggregatedStats.completedOrders || 0,
        todayRevenue: Math.round((aggregatedStats.todayRevenue || 0) * 100) / 100,
        totalRevenue: Math.round((aggregatedStats.totalRevenue || 0) * 100) / 100,
        breakdown: {
          received: aggregatedStats.countReceived || 0,
          brewing: aggregatedStats.countBrewing || 0,
          ready: aggregatedStats.countReady || 0,
          completed: aggregatedStats.completedOrders || 0,
          cancelled: aggregatedStats.countCancelled || 0
        },
        lowStockCount,
        avgPrepTimeMins: 9
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convenient aliases
app.get('/api/tables', (req, res) => res.redirect('/api/qr/tables'));
app.get('/api/coupons', (req, res) => res.redirect('/api/offers'));
app.get('/api/analytics', requireOwnerAuth, (req, res) => res.redirect('/api/dashboard/stats'));

// Serve frontend if built (F16)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(200).send('Cafena API Server Running');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`☕ Cafena Backend running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}/ws`);
});
