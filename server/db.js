import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initialMenuItems, initialOffers } from './menuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'coffeestand.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance concurrent reading/writing
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      tags_json TEXT,
      is_veg INTEGER DEFAULT 1,
      in_stock INTEGER DEFAULT 1,
      prep_time_mins INTEGER DEFAULT 10,
      customizable_json TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      table_number TEXT NOT NULL,
      order_type TEXT DEFAULT 'dine_in',
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      discount REAL DEFAULT 0,
      coupon_code TEXT,
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'counter',
      payment_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'received',
      kitchen_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      inquiry_type TEXT DEFAULT 'general',
      message TEXT NOT NULL,
      party_size INTEGER DEFAULT 2,
      preferred_date TEXT,
      preferred_time TEXT,
      status TEXT DEFAULT 'unread',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT,
      discount TEXT,
      discount_percent REAL,
      discount_amount REAL,
      min_order REAL,
      description TEXT,
      badge TEXT,
      highlight INTEGER DEFAULT 0
    );
  `);

  // Seed menu items if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  if (countRow.count === 0) {
    console.log('Seeding initial menu items...');
    const insertMenu = db.prepare(`
      INSERT INTO menu_items (id, name, category, price, description, image, tags_json, is_veg, in_stock, prep_time_mins, customizable_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of initialMenuItems) {
      insertMenu.run(
        item.id,
        item.name,
        item.category,
        item.price,
        item.description,
        item.image,
        JSON.stringify(item.tags || []),
        item.is_veg,
        item.in_stock,
        item.prep_time_mins,
        JSON.stringify(item.customizable || {})
      );
    }
  }

  // Seed offers if empty
  const offersCount = db.prepare('SELECT COUNT(*) as count FROM offers').get();
  if (offersCount.count === 0) {
    console.log('Seeding initial offers...');
    const insertOffer = db.prepare(`
      INSERT INTO offers (id, code, title, tagline, discount, discount_percent, discount_amount, min_order, description, badge, highlight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const offer of initialOffers) {
      insertOffer.run(
        offer.id,
        offer.code,
        offer.title,
        offer.tagline,
        offer.discount,
        offer.discount_percent || 0,
        offer.discount_amount || 0,
        offer.min_order,
        offer.description,
        offer.badge,
        offer.highlight ? 1 : 0
      );
    }
  }

  // Seed sample realistic orders if empty
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  if (ordersCount.count === 0) {
    console.log('Seeding initial sample orders for dashboard demonstration...');
    const now = new Date();
    
    const sampleOrders = [
      {
        id: "CS-" + Math.floor(1000 + Math.random() * 9000),
        customer_name: "Aarav Patel",
        customer_phone: "98250 12345",
        table_number: "Table 4",
        order_type: "dine_in",
        items: [
          {
            id: "frap-01",
            name: "Coffee Stand Signature Frappe",
            price: 280,
            quantity: 2,
            size: "Regular",
            customizations: ["Regular Milk", "Less Sweet", "Extra Whipped Cream (+₹30)"],
            itemTotal: 620
          },
          {
            id: "food-01",
            name: "Paneer Tikka Herb Panini",
            price: 260,
            quantity: 1,
            size: "Full Panini",
            customizations: ["Extra Mozzarella Cheese (+₹40)"],
            itemTotal: 300
          }
        ],
        subtotal: 920,
        tax: 46,
        discount: 100,
        coupon_code: "BREW20",
        total: 866,
        payment_method: "upi",
        payment_status: "paid",
        status: "brewing",
        kitchen_notes: "Please make the panini extra crisp, with side mint dip.",
        minutesAgo: 6
      },
      {
        id: "CS-" + Math.floor(1000 + Math.random() * 9000),
        customer_name: "Pooja Shah",
        customer_phone: "97123 45678",
        table_number: "Table 8",
        order_type: "dine_in",
        items: [
          {
            id: "frap-02",
            name: "Lotus Biscoff Dream Frappe",
            price: 310,
            quantity: 1,
            size: "Large (+₹50)",
            customizations: ["Oat Milk (+₹50)", "Extra Biscoff Cookie (+₹30)"],
            itemTotal: 440
          },
          {
            id: "dessert-01",
            name: "Belgian Dark Choco Berry Waffle",
            price: 280,
            quantity: 1,
            size: "Full Stack",
            customizations: ["Extra Gelato Scoop (+₹50)"],
            itemTotal: 330
          }
        ],
        subtotal: 770,
        tax: 38.5,
        discount: 0,
        coupon_code: "",
        total: 808.5,
        payment_method: "counter",
        payment_status: "pending",
        status: "received",
        kitchen_notes: "Serve waffle hot with extra chocolate sauce if possible!",
        minutesAgo: 2
      },
      {
        id: "CS-" + Math.floor(1000 + Math.random() * 9000),
        customer_name: "Rohan Mehta",
        customer_phone: "99099 88776",
        table_number: "Table 2",
        order_type: "dine_in",
        items: [
          {
            id: "hot-01",
            name: "Artisan Rosetta Cappuccino",
            price: 190,
            quantity: 2,
            size: "Standard",
            customizations: ["Full Cream Dairy", "Brown Sugar on side"],
            itemTotal: 380
          },
          {
            id: "side-02",
            name: "Cheesy Garlic Herb Pull-Apart Bread",
            price: 210,
            quantity: 1,
            size: "Standard",
            customizations: [],
            itemTotal: 210
          }
        ],
        subtotal: 590,
        tax: 29.5,
        discount: 0,
        coupon_code: "",
        total: 619.5,
        payment_method: "cash",
        payment_status: "paid",
        status: "ready",
        kitchen_notes: "Barista art rosetta requested.",
        minutesAgo: 14
      },
      {
        id: "CS-" + Math.floor(1000 + Math.random() * 9000),
        customer_name: "Dr. Ananya Joshi",
        customer_phone: "98980 11223",
        table_number: "Takeaway",
        order_type: "takeaway",
        items: [
          {
            id: "cold-01",
            name: "Vietnamese Slow Drip Iced Coffee",
            price: 240,
            quantity: 2,
            size: "Standard",
            customizations: ["Traditional Sweet"],
            itemTotal: 480
          }
        ],
        subtotal: 480,
        tax: 24,
        discount: 50,
        coupon_code: "STUDENT15",
        total: 454,
        payment_method: "upi",
        payment_status: "paid",
        status: "completed",
        kitchen_notes: "Packed securely for bike takeaway.",
        minutesAgo: 38
      }
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_phone, table_number, order_type, items_json, subtotal, tax, discount, coupon_code, total, payment_method, payment_status, status, kitchen_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const order of sampleOrders) {
      const orderDate = new Date(now.getTime() - order.minutesAgo * 60000).toISOString();
      insertOrder.run(
        order.id,
        order.customer_name,
        order.customer_phone,
        order.table_number,
        order.order_type,
        JSON.stringify(order.items),
        order.subtotal,
        order.tax,
        order.discount,
        order.coupon_code,
        order.total,
        order.payment_method,
        order.payment_status,
        order.status,
        order.kitchen_notes,
        orderDate,
        orderDate
      );
    }
  }

  // Seed sample contact messages
  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
  if (contactCount.count === 0) {
    const insertContact = db.prepare(`
      INSERT INTO contacts (name, email, phone, inquiry_type, message, party_size, preferred_date, preferred_time, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertContact.run(
      "Keval Trivedi",
      "keval.t@example.com",
      "09876543210",
      "table_reservation",
      "Looking to reserve a table for 4 friends this Saturday evening around 8:00 PM for a casual birthday catchup.",
      4,
      "2026-10-04",
      "20:00",
      "unread",
      new Date(Date.now() - 3600000).toISOString()
    );
  }
}
