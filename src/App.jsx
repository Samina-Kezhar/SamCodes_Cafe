import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { QRModal } from './components/QRModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OffersSection } from './components/OffersSection';
import { GallerySection } from './components/GallerySection';
import { VideosSection } from './components/VideosSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OwnerDashboard } from './components/OwnerDashboard';

export function App() {
  const [currentView, setCurrentView] = useState('site'); // 'site' | 'dashboard'
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeTable, setActiveTable] = useState('');
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeestand_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  // Dual Theme: 'warm-cream' (Artisanal Day Roastery) | 'midnight-roast' (Velvet Evening Lounge)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('coffeestand_theme') || 'warm-cream';
    } catch {
      return 'warm-cream';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('coffeestand_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'warm-cream' ? 'midnight-roast' : 'warm-cream'));
  };

  // Modals state
  const [customizingItem, setCustomizingItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activePlacedOrder, setActivePlacedOrder] = useState(null);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coffeestand_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Read URL query params on load (e.g. ?table=Table%204 or #menu?table=Table%204)
  useEffect(() => {
    const parseTableParam = () => {
      let params = new URLSearchParams(window.location.search);
      let table = params.get('table');

      // Also check hash (e.g., #menu?table=Table%204)
      if (!table && window.location.hash.includes('table=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          table = hashParams.get('table');
        }
      }

      if (table) {
        setActiveTable(decodeURIComponent(table));
      }

      // Check if URL specifies /admin or /dashboard
      if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/dashboard') || window.location.hash.includes('dashboard')) {
        setCurrentView('dashboard');
      }
    };

    parseTableParam();
  }, []);

  // Fetch initial menu and offers from backend API
  const fetchMenuAndOffers = async () => {
    try {
      const [menuRes, offersRes, statsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/offers'),
        fetch('/api/dashboard/stats')
      ]);

      const menuData = await menuRes.json();
      const offersData = await offersRes.json();
      const statsData = await statsRes.json();

      if (menuData.success) setMenuItems(menuData.items);
      if (offersData.success) setOffers(offersData.offers);
      if (statsData.success) setActiveOrdersCount(statsData.stats.activeOrders || 0);
    } catch (err) {
      console.warn('API fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchMenuAndOffers();

    // WebSocket listener for live updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'MENU_STOCK_CHANGED') {
            setMenuItems((prev) =>
              prev.map((item) =>
                item.id === data.payload.id ? { ...item, in_stock: data.payload.in_stock } : item
              )
            );
          } else if (data.type === 'NEW_ORDER') {
            setActiveOrdersCount((prev) => prev + 1);
          }
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn('WebSocket connection error:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (newItem) => {
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderPlaced = (order) => {
    setActivePlacedOrder(order);
    setIsTrackingModalOpen(true);
  };

  const handleApplyOffer = (code) => {
    setIsCartOpen(true);
    // Smooth scroll to menu if cart is empty
    if (cartItems.length === 0) {
      const menuEl = document.getElementById('menu');
      if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-root">
      {/* Global Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        activeTable={activeTable}
        onSelectTable={(table) => setActiveTable(table)}
        currentView={currentView}
        onToggleDashboard={() => setCurrentView((v) => (v === 'site' ? 'dashboard' : 'site'))}
        activeOrdersCount={activeOrdersCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View: Owner Dashboard or Customer Website */}
      {currentView === 'dashboard' ? (
        <OwnerDashboard onCloseDashboard={() => setCurrentView('site')} />
      ) : (
        <main>
          {/* 1. Hero Landing Section */}
          <Hero
            onOpenMenu={() => {
              const el = document.getElementById('menu');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onOpenTrackOrder={() => setIsTrackingModalOpen(true)}
          />

          {/* 2. Interactive Menu Section (QR Compatible) */}
          <MenuSection
            menuItems={menuItems}
            onSelectItem={(item) => setCustomizingItem(item)}
            activeTable={activeTable}
            onOpenQRModal={() => setIsQRModalOpen(true)}
          />

          {/* 3. Current Deals & Offers Section */}
          <OffersSection offers={offers} onApplyOffer={handleApplyOffer} />

          {/* 4. Photo Gallery Section */}
          <GallerySection />

          {/* 5. Video Showcase & Ambiance Reels Section */}
          <VideosSection />

          {/* 6. About Café Story & Values Section */}
          <AboutSection />

          {/* 7. Contact, Table Reservation & Location Section */}
          <ContactSection />

          {/* Footer */}
          <Footer
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onOpenTrackOrder={() => setIsTrackingModalOpen(true)}
          />
        </main>
      )}

      {/* Modals & Slide-Overs */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        activeTable={activeTable}
        onOrderPlaced={handleOrderPlaced}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        initialTable={activeTable || 'Table 4'}
        onSelectTable={(table) => {
          setActiveTable(table);
          // Update URL hash without reload
          window.location.hash = `menu?table=${encodeURIComponent(table)}`;
        }}
      />

      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        initialOrder={activePlacedOrder}
      />
    </div>
  );
}

export default App;
