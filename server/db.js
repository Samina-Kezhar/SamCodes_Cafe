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
      estimated_prep_mins INTEGER DEFAULT 10,
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

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      favorite_item TEXT,
      source TEXT DEFAULT 'Verified Diner',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      current_stock REAL NOT NULL,
      unit TEXT NOT NULL,
      min_threshold REAL NOT NULL,
      status TEXT NOT NULL,
      last_restocked TEXT NOT NULL
    );
  `);

  // Seed menu items if empty, or refresh photos
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
  } else {
    // Update existing menu items with accurate matching photos & updated Cafena names
    const updatePhoto = db.prepare(`UPDATE menu_items SET name = ?, image = ?, customizable_json = ? WHERE id = ?`);
    for (const item of initialMenuItems) {
      updatePhoto.run(item.name, item.image, JSON.stringify(item.customizable || {}), item.id);
    }
  }

  // Ensure estimated_prep_mins column exists in orders
  try {
    db.prepare('ALTER TABLE orders ADD COLUMN estimated_prep_mins INTEGER DEFAULT 10').run();
  } catch {
    // Column already exists
  }

  // Migrate any legacy review or order records from Coffee Stand to Cafena
  try {
    db.prepare(`UPDATE reviews SET favorite_item = REPLACE(favorite_item, 'Coffee Stand', 'Cafena')`).run();
    db.prepare(`UPDATE reviews SET comment = REPLACE(comment, 'Coffee Stand', 'Cafena')`).run();
    db.prepare(`UPDATE orders SET items_json = REPLACE(items_json, 'Coffee Stand', 'Cafena')`).run();
  } catch (err) {
    console.error('Migration error:', err);
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

  // Seed reviews if empty
  const reviewsCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  if (reviewsCount.count === 0) {
    console.log('Seeding initial customer reviews...');
    const insertReview = db.prepare(`
      INSERT INTO reviews (name, rating, comment, favorite_item, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const sampleReviews = [
      {
        name: "Keval Patel",
        rating: 5,
        comment: "The place is amazing and the behaviour of staff and owner is very warm. The Biscoff frappe and paneer tikka panini are easily the best in Nikol hands down!",
        favorite_item: "Lotus Biscoff Dream Frappe",
        source: "Google Verified Diner",
        created_at: "2026-09-28T14:20:00.000Z"
      },
      {
        name: "Riya Shah",
        rating: 5,
        comment: "Best specialty coffee in East Ahmedabad! Loved the swan latte art and the evening ambiance under fairy lights. Super clean, cozy couches, and fast Wi-Fi for work.",
        favorite_item: "Artisan Rosetta Cappuccino",
        source: "Zomato Gold Diner",
        created_at: "2026-09-25T19:10:00.000Z"
      },
      {
        name: "Harsh Vardhan",
        rating: 4,
        comment: "Very premium aesthetic and quiet vibe. Prices are slightly higher than roadside cafes but 100% justified by the Arabica quality and Belgian dark chocolate waffles.",
        favorite_item: "Belgian Dark Choco Berry Waffle",
        source: "Google Local Guide",
        created_at: "2026-09-20T21:45:00.000Z"
      },
      {
        name: "Dr. Ananya Joshi",
        rating: 5,
        comment: "Such a lifesaver for late night coffee cravings! Being open until 12 AM midnight at The Allen Town makes this our gang's favorite hangout spot.",
        favorite_item: "Vietnamese Slow Drip Iced Coffee",
        source: "Verified Customer",
        created_at: "2026-09-18T23:30:00.000Z"
      },
      {
        name: "Bhavik Mehta",
        rating: 4,
        comment: "The Triple Cheese Melt Panini had the best cheese pull! Great customer service by the barista team. Highly recommend visiting during sunset.",
        favorite_item: "Triple Cheese Basil Pesto Melt",
        source: "Google Verified Diner",
        created_at: "2026-09-12T17:15:00.000Z"
      },
      {
        name: "Pooja Trivedi",
        rating: 5,
        comment: "Nutella Hazelnut Crunch frappe is pure bliss in a cup. Also love their pure vegetarian menu, everything feels super fresh and hygienic.",
        favorite_item: "Nutella Hazelnut Crunch Frappe",
        source: "Zomato Reviewer",
        created_at: "2026-09-08T16:40:00.000Z"
      },
      {
        name: "Chirag Suthar",
        rating: 3,
        comment: "The coffee and frappe taste great, but seating gets full quickly on weekend evenings around 9 PM. Better to reserve your table in advance!",
        favorite_item: "Cafena Signature Frappe",
        source: "Verified Diner",
        created_at: "2026-09-02T21:00:00.000Z"
      }
    ];

    for (const rev of sampleReviews) {
      insertReview.run(rev.name, rev.rating, rev.comment, rev.favorite_item, rev.source, rev.created_at);
    }
  }

  // Seed inventory if empty
  const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
  if (inventoryCount.count === 0) {
    console.log('Seeding initial cafe inventory...');
    const insertInv = db.prepare(`
      INSERT INTO inventory (id, item_name, category, current_stock, unit, min_threshold, status, last_restocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleInventory = [
      { id: "inv-01", item_name: "Chikmagalur Single-Estate Arabica Beans", category: "Coffee & Espresso", current_stock: 18.5, unit: "kg", min_threshold: 5.0, status: "adequate", last_restocked: "2026-10-02" },
      { id: "inv-02", item_name: "Fresh Whole Dairy Milk (Organic)", category: "Dairy & Milk", current_stock: 45.0, unit: "liters", min_threshold: 15.0, status: "adequate", last_restocked: "2026-10-04" },
      { id: "inv-03", item_name: "Oatly Barista Edition Oat Milk", category: "Dairy & Milk", current_stock: 3.5, unit: "liters", min_threshold: 6.0, status: "low", last_restocked: "2026-09-30" },
      { id: "inv-04", item_name: "Lotus Biscoff Spread & Cookie Jars", category: "Spreads & Toppings", current_stock: 8.0, unit: "kg", min_threshold: 3.0, status: "adequate", last_restocked: "2026-10-01" },
      { id: "inv-05", item_name: "Ferrero Nutella Hazelnut Spread", category: "Spreads & Toppings", current_stock: 5.5, unit: "kg", min_threshold: 2.5, status: "adequate", last_restocked: "2026-10-01" },
      { id: "inv-06", item_name: "Artisan Sourdough Multigrain Loaves", category: "Bakery & Bread", current_stock: 14.0, unit: "loaves", min_threshold: 5.0, status: "adequate", last_restocked: "2026-10-04" },
      { id: "inv-07", item_name: "Fresh Malai Paneer Blocks", category: "Kitchen Food", current_stock: 6.2, unit: "kg", min_threshold: 2.0, status: "adequate", last_restocked: "2026-10-04" },
      { id: "inv-08", item_name: "Belgian Dark Chocolate Ganache 70%", category: "Dessert Ingredients", current_stock: 2.2, unit: "kg", min_threshold: 4.0, status: "low", last_restocked: "2026-09-29" },
      { id: "inv-09", item_name: "Madagascar Vanilla Bean Gelato", category: "Dessert Ingredients", current_stock: 4.0, unit: "tubs (5L)", min_threshold: 2.0, status: "adequate", last_restocked: "2026-10-03" },
      { id: "inv-10", item_name: "Eco Recyclable Takeaway Hot/Cold Cups", category: "Packaging", current_stock: 420.0, unit: "cups", min_threshold: 150.0, status: "adequate", last_restocked: "2026-10-02" }
    ];

    for (const inv of sampleInventory) {
      insertInv.run(inv.id, inv.item_name, inv.category, inv.current_stock, inv.unit, inv.min_threshold, inv.status, inv.last_restocked);
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
            name: "Cafena Signature Frappe",
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
      "confirmed",
      new Date(Date.now() - 3600000).toISOString()
    );
  }
}
