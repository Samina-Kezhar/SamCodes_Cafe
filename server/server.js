import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
app.use(express.json());

// Serve static public folder (images, icons)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Broadcast to all connected WebSocket clients
export function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

wss.on('connection', (ws) => {
  // Send welcome ping
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Cafena Realtime Kitchen Service' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch {
      // ignore
    }
  });
});

// Helper to format order row from DB
function formatOrder(row) {
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]')
  };
}

// ----------------------------------------------------
// 1. MENU ENDPOINTS
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

app.post('/api/menu', (req, res) => {
  try {
    const {
      name,
      category = 'signature_frappes',
      price = 200,
      description = '',
      image = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      tags = ['New'],
      is_veg = true,
      in_stock = true,
      prep_time_mins = 8,
      customizable = {}
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const id = `item-${Date.now().toString(36)}`;
    const insert = db.prepare(`
      INSERT INTO menu_items (id, name, category, price, description, image, tags_json, is_veg, in_stock, prep_time_mins, customizable_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      name.trim(),
      category,
      parseFloat(price),
      description.trim(),
      image,
      JSON.stringify(tags),
      is_veg ? 1 : 0,
      in_stock ? 1 : 0,
      parseInt(prep_time_mins, 10),
      JSON.stringify(customizable)
    );

    const newItem = {
      id,
      name: name.trim(),
      category,
      price: parseFloat(price),
      description: description.trim(),
      image,
      tags,
      is_veg: Boolean(is_veg),
      in_stock: Boolean(in_stock),
      prep_time_mins: parseInt(prep_time_mins, 10),
      customizable
    };

    broadcast('MENU_ITEM_ADDED', newItem);
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image, in_stock, prep_time_mins } = req.body;
    const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updatedName = name !== undefined ? name : existing.name;
    const updatedCategory = category !== undefined ? category : existing.category;
    const updatedPrice = price !== undefined ? parseFloat(price) : existing.price;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedImg = image !== undefined ? image : existing.image;
    const updatedStock = in_stock !== undefined ? (in_stock ? 1 : 0) : existing.in_stock;
    const updatedPrep = prep_time_mins !== undefined ? parseInt(prep_time_mins, 10) : existing.prep_time_mins;

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

app.delete('/api/menu/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    broadcast('MENU_ITEM_DELETED', { id });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id/toggle', (req, res) => {
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
// 2. OFFERS & PROMOTIONS
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

app.post('/api/offers', (req, res) => {
  try {
    const { code, title, tagline = '', discount = '15% OFF', discount_percent = 15, discount_amount = 0, min_order = 200, description = '', badge = 'Special Deal', highlight = false } = req.body;
    if (!code || !title) {
      return res.status(400).json({ success: false, error: 'Code and Title are required' });
    }

    const id = `offer-${Date.now().toString(36)}`;
    const insert = db.prepare(`
      INSERT INTO offers (id, code, title, tagline, discount, discount_percent, discount_amount, min_order, description, badge, highlight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      code.trim().toUpperCase(),
      title.trim(),
      tagline,
      discount,
      parseFloat(discount_percent || 0),
      parseFloat(discount_amount || 0),
      parseFloat(min_order || 0),
      description,
      badge,
      highlight ? 1 : 0
    );

    const newOffer = { id, code: code.trim().toUpperCase(), title, tagline, discount, discount_percent, discount_amount, min_order, description, badge, highlight: Boolean(highlight) };
    broadcast('OFFERS_UPDATED', newOffer);
    res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/offers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
    broadcast('OFFERS_UPDATED', { deletedId: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 3. REVIEWS & TESTIMONIALS API
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

    // Compute stats
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

app.post('/api/reviews', (req, res) => {
  try {
    const { name, rating = 5, comment, favorite_item = 'Cafena Signature Frappe' } = req.body;
    if (!name || !comment) {
      return res.status(400).json({ success: false, error: 'Name and comment are required' });
    }

    const insert = db.prepare(`
      INSERT INTO reviews (name, rating, comment, favorite_item, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const result = insert.run(
      name.trim(),
      Math.min(5, Math.max(1, parseInt(rating, 10))),
      comment.trim(),
      (favorite_item || '').trim(),
      'Verified Customer',
      now
    );

    const newReview = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      rating: parseInt(rating, 10),
      comment: comment.trim(),
      favorite_item: (favorite_item || '').trim(),
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
// 4. INVENTORY TRACKING API
// ----------------------------------------------------
app.get('/api/inventory', (req, res) => {
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

app.patch('/api/inventory/:id/restock', (req, res) => {
  try {
    const { id } = req.params;
    const { add_amount = 5 } = req.body;
    const current = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    const newStock = Math.round((current.current_stock + parseFloat(add_amount)) * 100) / 100;
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
// 5. ORDERS API
// ----------------------------------------------------
app.get('/api/orders', (req, res) => {
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

app.get('/api/orders/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order: formatOrder(row) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', (req, res) => {
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

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    // Calculate subtotal
    let subtotal = 0;
    const validatedItems = items.map((item) => {
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const unitPrice = parseFloat(item.price || 0);
      const addonsTotal = (item.addons || []).reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
      const sizeExtra = item.sizePrice ? parseFloat(item.sizePrice) : 0;
      const effectiveUnitPrice = unitPrice + addonsTotal + sizeExtra;
      const itemTotal = effectiveUnitPrice * qty;
      subtotal += itemTotal;

      return {
        id: item.id,
        name: item.name,
        price: effectiveUnitPrice,
        quantity: qty,
        size: item.size || 'Regular',
        customizations: item.customizations || [],
        itemTotal
      };
    });

    // 5% GST on cafe beverages and snacks
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    let discount = 0;

    // Apply Coupon Code
    if (coupon_code) {
      const normalizedCode = coupon_code.trim().toUpperCase();
      const offer = db.prepare('SELECT * FROM offers WHERE code = ?').get(normalizedCode);
      if (offer && subtotal >= offer.min_order) {
        if (offer.discount_percent > 0) {
          discount = Math.round((subtotal * offer.discount_percent) / 100);
        } else if (offer.discount_amount > 0) {
          discount = offer.discount_amount;
        }
      }
    }

    const total = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);
    const orderId = 'CS-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO orders (
        id, customer_name, customer_phone, table_number, order_type,
        items_json, subtotal, tax, discount, coupon_code, total,
        payment_method, payment_status, status, kitchen_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      orderId,
      customer_name.trim(),
      customer_phone || '',
      table_number,
      order_type,
      JSON.stringify(validatedItems),
      subtotal,
      tax,
      discount,
      coupon_code || '',
      total,
      payment_method,
      payment_method === 'upi' ? 'paid' : 'pending',
      'received',
      kitchen_notes || '',
      now,
      now
    );

    const savedOrder = formatOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId));

    // Broadcast new order in real-time to owner dashboard!
    broadcast('NEW_ORDER', savedOrder);

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const newStatus = status || existing.status;
    const newPaymentStatus = payment_status || existing.payment_status;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE orders
      SET status = ?, payment_status = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, newPaymentStatus, now, id);

    const updatedOrder = formatOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));

    // Broadcast status change in real time to both dashboard and customer order tracker
    broadcast('ORDER_UPDATED', updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 6. QR CODE GENERATION API
// ----------------------------------------------------
app.get('/api/qr', async (req, res) => {
  try {
    const { table = '', url } = req.query;
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const targetUrl = url || `${protocol}://${host}/?table=${encodeURIComponent(table)}`;

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
// 7. CONTACT & RESERVATIONS API
// ----------------------------------------------------
app.get('/api/contact', (req, res) => {
  try {
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, inquiry_type = 'table_reservation', message, party_size = 2, preferred_date, preferred_time } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const insert = db.prepare(`
      INSERT INTO contacts (name, email, phone, inquiry_type, message, party_size, preferred_date, preferred_time, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', ?)
    `);

    const result = insert.run(
      name.trim(),
      email.trim(),
      phone || '',
      inquiry_type,
      message.trim(),
      parseInt(party_size || 2, 10),
      preferred_date || '',
      preferred_time || '',
      new Date().toISOString()
    );

    const newContact = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: email.trim(),
      phone: phone || '',
      inquiry_type,
      message: message.trim(),
      party_size: parseInt(party_size || 2, 10),
      preferred_date,
      preferred_time,
      status: 'unread',
      created_at: new Date().toISOString()
    };

    broadcast('NEW_CONTACT_MESSAGE', newContact);

    res.status(201).json({ success: true, message: 'Reservation request received successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/contact/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'confirmed' } = req.body;
    db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
    broadcast('RESERVATION_UPDATED', { id: parseInt(id, 10), status });
    res.json({ success: true, id, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 8. DASHBOARD ANALYTICS API
// ----------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const activeOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('received', 'brewing', 'ready')").get().count;
    const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").get().count;
    const revenueRow = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'cancelled'").get();
    const totalRevenue = Math.round((revenueRow.revenue || 0) * 100) / 100;

    // Status breakdown
    const breakdown = {
      received: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'received'").get().count,
      brewing: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'brewing'").get().count,
      ready: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'ready'").get().count,
      completed: completedOrders,
      cancelled: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'").get().count
    };

    // Inventory status
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM inventory WHERE current_stock <= min_threshold').get().count;

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalRevenue,
        breakdown,
        lowStockCount,
        avgPrepTimeMins: 9
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convenient aliases
app.get('/api/tables', (req, res) => {
  res.redirect('/api/qr/tables');
});
app.get('/api/coupons', (req, res) => {
  res.redirect('/api/offers');
});
app.get('/api/analytics', (req, res) => {
  res.redirect('/api/dashboard/stats');
});

// Serve frontend if built (production mode fallback)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('Cafena API Server Running on port ' + PORT);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`☕ Cafena Backend running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}/ws`);
});
