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
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Coffee Stand Realtime Kitchen Service' }));

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

// ----------------------------------------------------
// 3. ORDERS API
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

    // Broadcast status change in real time
    broadcast('ORDER_UPDATED', updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 4. QR CODE GENERATION API
// ----------------------------------------------------
app.get('/api/qr', async (req, res) => {
  try {
    const { table = '', url } = req.query;
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const targetUrl = url || `${protocol}://${host}/menu${table ? `?table=${encodeURIComponent(table)}` : ''}`;

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
        const targetUrl = `${protocol}://${host}/menu?table=${encodeURIComponent(table)}`;
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
// 5. CONTACT & RESERVATIONS API
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
    const { name, email, phone, inquiry_type = 'general', message, party_size = 2, preferred_date, preferred_time } = req.body;
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

    broadcast('NEW_CONTACT_MESSAGE', { id: result.lastInsertRowid, name, inquiry_type });

    res.status(201).json({ success: true, message: 'Message received successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 6. DASHBOARD ANALYTICS API
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

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalRevenue,
        breakdown,
        avgPrepTimeMins: 11
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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
    res.send('Coffee Stand API Server Running on port ' + PORT);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`☕ Coffee Stand Backend running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}/ws`);
});
