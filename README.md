# ☕ Cafena — Handcrafted Specialty Coffee & Frappe Lounge
> **Location:** Shop GF.15, The Allen Town, Nikol Ring Road, Sardar Patel Ring Rd, Nikol, Ahmedabad, Gujarat 380049  
> **Contact:** [063539 35169](tel:06353935169) | **Instagram:** [@cafena.nikol](https://www.instagram.com/cafena.nikol)  
> **Hours:** Open Daily 9:00 AM – 12:00 AM Midnight | **Rating:** 4.8★ (Google & Zomato Verified, 1,400+ Reviews)  
> **Price per person:** ₹200–400

---

## 🌟 Overview

**Cafena** is a modern, production-ready, full-stack web application designed for Nikol’s favorite specialty coffee and frappe destination. Inspired by authentic artisanal European coffee houses and contemporary café culture, it pairs a **luxury artisanal café website** with a **seamless QR code-based table ordering system**, a **dual-theme system (Warm Crema Parchment & Midnight Velvet Roast)**, and a **real-time desktop/tablet Owner & Kitchen Management Dashboard**.

---

## 🚀 Key Features

### 1. 🍽️ Customer Website & Experience
- **Hero & Branding:** Warm roasted espresso dark mode, tagline *"Where Every Sip Tells a Story"*, live operating status badge (`🟢 Open till 12 AM`), and verified 4.3★ social proof.
- **Interactive QR Menu:**
  - 8 categories: *Signature Frappes, Hot Specialty Coffee, Cold Brews & Iced, Artisan Coolers, Gourmet Paninis, Waffles & Sweets, Sides & Munchies*.
  - Instant search & 100% Pure Veg filter.
  - Welcome banner automatically displaying the customer's active table (e.g., `📍 Ordering for: Table 4`).
- **Item Customization Modal:**
  - Dynamic size selection (Regular / Large with live price adjustment).
  - Milk alternatives (Full cream dairy, Oat milk, Almond milk, Soy).
  - Sweetness control (Signature sweet, Less sweet, Unsweetened).
  - Add-ons (Extra espresso shots, Whipped cream, Biscoff cookie crumble, Gelato scoops, Extra mozzarella).
  - Special kitchen instructions input.
- **Cart Drawer & Checkout:**
  - Table number selector or pre-filled from table QR scan.
  - Dine-in vs Takeaway toggle.
  - Coupon code engine (`BREW20` for 20% off, `COMBO349`, `STUDENT15`, `MIDNIGHT10`).
  - Transparent bill calculation with 5% GST and offer deductions.
  - UPI / QR payment or Cash at Counter.
  - Confetti celebration upon order placement!
- **Live Order Tracking Modal:**
  - 4-step progress stepper: *Order Placed → Barista Brewing → Ready for Service → Completed*.
  - Auto-advances in real time over WebSockets when the kitchen updates status.
  - Printable receipt / customer copy.
- **Promotions & Offers:** Copyable discount coupons with 1-click apply.
- **Photo Gallery:** High-resolution gallery with category filters and full-screen lightbox modal.
- **Cinematic Video Reels:** Video showcase of frappe crafting, swan rosetta latte art, and evening patio ambiance, linking to `@coffeestand.nikol`.
- **Our Story & Reviews:** Verified Google & Zomato testimonials highlighting warm hospitality, friendly staff, and the cozy co-working atmosphere.
- **Table Reservation & Contact:** Form for booking tables, birthday gatherings, or feedback, directly connected to the owner dashboard.

---

### 2. 📱 QR Code Menu System
- **Dynamic QR Code Generation:**
  - Generates instant PNG Data URLs for any table (Table 1 to 15, Patio 1 to 4, Counter Takeaway).
  - Preview styled acrylic café standee card: *"Coffee Stand - The Allen Town Nikol"*, Table Number badge, QR code, and instructions.
- **Printable Table Cards:** Formatted `@media print` layout so the owner can print durable standees for each table with 1 click.
- **Instant Scan Simulation:** Click to simulate scanning with pre-selected table.

---

### 3. 👨‍🍳 Real-Time Owner & Kitchen Dashboard (`/admin`)
- **Live WebSocket Feed:** Instant order delivery with zero page refreshes.
- **Audio Chime Synthesizer:** Built-in Web Audio API melodic café chime plays when a new order arrives.
- **KPI Metrics Strip:**
  - Today's Total Revenue (₹)
  - Active Orders in Kitchen (Queued / Brewing)
  - Ready for Table Delivery
  - Completed Orders & Average Prep Time
- **Kitchen Workflow Order Cards:**
  - `🔥 Start Brewing` (moves *Received → Brewing*)
  - `🔔 Ready to Serve` (moves *Brewing → Ready*)
  - `✅ Complete Order` (moves *Ready → Completed*)
  - `Cancel Order`
  - `🖨️ Print Kitchen Order Ticket (KOT)`
- **Menu Stock Manager (86 List):** Toggle any item In Stock / Sold Out in real time.
- **Table QR Standees Tab:** Batch view and print QR cards for all tables.
- **Reservations & Inquiries Tab:** Review table booking requests submitted through the contact form, with 1-tap phone dial to guests.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Vanilla CSS Design System |
| **Typography** | Google Fonts: *Outfit* (headings), *Plus Jakarta Sans* (UI & text) |
| **Icons** | Lucide React |
| **Effects** | Canvas Confetti, Web Audio API chime synthesizer |
| **Backend API** | Node.js Express 5 |
| **Real-time** | Pure WebSockets (`ws`) on `/ws` |
| **Database** | Native Node.js 24 SQLite (`node:sqlite`) with WAL mode |
| **QR Code** | `qrcode` engine (PNG data URL & batch generator) |

---

## 🗄️ Database Schema (`server/data/coffeestand.db`)

1. **`orders`**
   - `id` (TEXT PRIMARY KEY) — e.g. `CS-4628`
   - `customer_name` (TEXT NOT NULL)
   - `customer_phone` (TEXT)
   - `table_number` (TEXT NOT NULL) — e.g. `Table 4`, `Takeaway`
   - `order_type` (TEXT) — `dine_in` or `takeaway`
   - `items_json` (TEXT NOT NULL) — itemized array with customizations
   - `subtotal` (REAL), `tax` (REAL, 5% GST), `discount` (REAL), `coupon_code` (TEXT), `total` (REAL)
   - `payment_method` (TEXT) — `upi` or `counter`
   - `payment_status` (TEXT) — `pending` or `paid`
   - `status` (TEXT) — `received`, `brewing`, `ready`, `completed`, `cancelled`
   - `kitchen_notes` (TEXT)
   - `created_at` (TEXT), `updated_at` (TEXT)

2. **`menu_items`**
   - `id` (TEXT PRIMARY KEY)
   - `name` (TEXT NOT NULL), `category` (TEXT NOT NULL), `price` (REAL NOT NULL)
   - `description` (TEXT), `image` (TEXT), `tags_json` (TEXT)
   - `is_veg` (INTEGER), `in_stock` (INTEGER), `prep_time_mins` (INTEGER)
   - `customizable_json` (TEXT) — sizes, milk choices, sweetness, add-ons

3. **`offers`**
   - `id`, `code`, `title`, `tagline`, `discount`, `discount_percent`, `discount_amount`, `min_order`, `description`, `badge`, `highlight`

4. **`contacts`**
   - `id`, `name`, `email`, `phone`, `inquiry_type`, `message`, `party_size`, `preferred_date`, `preferred_time`, `status`, `created_at`

---

## 🚦 How to Run

### Prerequisites
- Node.js 22.5+ or 24+ (native SQLite support)
- npm 10+

### Installation
```bash
npm install
```

### Running in Development
Run both the Express backend and the Vite frontend concurrently:
```bash
npm run dev
```
- **Customer Website:** [http://localhost:5173/](http://localhost:5173/)
- **Owner Dashboard:** [http://localhost:5173/#dashboard](http://localhost:5173/#dashboard) (or click *Owner Dashboard* in header)
- **Table 4 QR Simulation:** [http://localhost:5173/#menu?table=Table%204](http://localhost:5173/#menu?table=Table%204)
- **Backend API & WebSockets:** [http://localhost:5000/api](http://localhost:5000/api)

### Running in Production
Build the optimized frontend bundle and start the unified server:
```bash
npm run build
npm start
```
The full application will be served directly at [http://localhost:5000/](http://localhost:5000/).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/menu` | Fetch all categorized menu items |
| `PATCH` | `/api/menu/:id/toggle` | Toggle item in stock / sold out |
| `GET` | `/api/offers` | Fetch active promotional deals |
| `GET` | `/api/orders` | Fetch orders (filter by `status`, `limit`) |
| `POST` | `/api/orders` | Place a new customer order |
| `GET` | `/api/orders/:id` | Fetch specific order details for live tracking |
| `PATCH` | `/api/orders/:id/status` | Update order workflow status |
| `GET` | `/api/qr?table=Table%204` | Generate QR code data URL for a table |
| `GET` | `/api/qr/tables` | Batch generate QR cards for all tables |
| `POST` | `/api/contact` | Submit table reservation or inquiry |
| `GET` | `/api/contact` | Fetch reservations for dashboard |
| `GET` | `/api/dashboard/stats` | Fetch real-time revenue and order metrics |
