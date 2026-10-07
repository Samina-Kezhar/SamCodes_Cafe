import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { CustomerMenuSection } from './components/CustomerMenuSection';
import { OffersSection } from './components/OffersSection';
import { ReviewsSection } from './components/ReviewsSection';
import { GallerySection } from './components/GallerySection';
import { VideosSection } from './components/VideosSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CoffeeLoader } from './components/CoffeeLoader';
import { QROrderingView } from './components/QROrderingView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { CartDrawer } from './components/CartDrawer';
import { QRModal } from './components/QRModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';

export function App() {
  // Current Part: 'part1_customer' | 'part2_qr_ordering' | 'part3_owner'
  const [currentPart, setCurrentPart] = useState('part1_customer');
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeTable, setActiveTable] = useState('Table 4');
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem('coffeestand_auth_token') || sessionStorage.getItem('coffeestand_auth_token');
      return !!token;
    } catch {
      return false;
    }
  });

  const [initialLoading, setInitialLoading] = useState(true);

  // Modals state (U01)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);

  // Unified Cart State (U01, U02)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeestand_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('coffeestand_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Sync cart across browser tabs / windows (U02)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'coffeestand_cart') {
        try {
          setCartItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddToCart = (newItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        if (item.id !== newItem.id) return false;
        if ((item.size || '') !== (newItem.size || '')) return false;
        if ((item.milk || '') !== (newItem.milk || '')) return false;
        const addonsA = (item.addons || []).map(a => typeof a === 'string' ? a : a.name).sort().join(',');
        const addonsB = (newItem.addons || []).map(a => typeof a === 'string' ? a : a.name).sort().join(',');
        return addonsA === addonsB;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (newItem.quantity || 1)
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCartItems((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const parsedQty = typeof newQty === 'number' ? newQty : item.quantity;
      if (parsedQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }
      const updated = [...prev];
      updated[index] = { ...item, quantity: parsedQty };
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('coffeestand_cart');
    } catch {
      // ignore
    }
  };

  // Dual Theme: 'warm-cream' (Artisanal Day Roastery) | 'midnight-roast' (Velvet Evening Lounge) (U10)
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

  // Verify owner authentication on startup (U03)
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('coffeestand_auth_token') || sessionStorage.getItem('coffeestand_auth_token');
      if (!token) {
        setIsOwnerAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && (data.authenticated || data.role === 'owner')) {
          setIsOwnerAuthenticated(true);
        } else {
          setIsOwnerAuthenticated(false);
          localStorage.removeItem('coffeestand_auth_token');
          sessionStorage.removeItem('coffeestand_auth_token');
          localStorage.removeItem('coffeestand_owner_auth');
          sessionStorage.removeItem('coffeestand_owner_auth');
        }
      } catch (err) {
        console.warn('Auth check skipped (offline or server starting):', err);
      }
    };
    verifyToken();
  }, []);

  // URL Query & Hash routing detection
  useEffect(() => {
    const parseUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let tableParam = searchParams.get('table');

      if (!tableParam && window.location.hash.includes('table=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          tableParam = hashParams.get('table');
        }
      }

      if (
        tableParam ||
        searchParams.has('order') ||
        window.location.hash.includes('order')
      ) {
        if (tableParam) {
          setActiveTable(decodeURIComponent(tableParam));
        }
        setCurrentPart('part2_qr_ordering');
        return;
      }

      if (
        searchParams.has('owner') ||
        searchParams.has('admin') ||
        searchParams.has('dashboard') ||
        window.location.hash.includes('owner') ||
        window.location.hash.includes('dashboard') ||
        window.location.hash.includes('admin') ||
        window.location.pathname.includes('/owner') ||
        window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/dashboard')
      ) {
        if (isOwnerAuthenticated) {
          setCurrentPart('part3_owner');
        } else {
          setIsOwnerAuthOpen(true);
        }
      }
    };

    parseUrl();
    window.addEventListener('hashchange', parseUrl);
    return () => window.removeEventListener('hashchange', parseUrl);
  }, [isOwnerAuthenticated]);

  // Fetch catalog & offers
  useEffect(() => {
    const fetchCatalogAndOffers = async () => {
      try {
        const [menuRes, offersRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/offers')
        ]);
        const menuData = await menuRes.json();
        if (menuData.success) {
          setMenuItems(menuData.items || []);
        }
        const offersData = await offersRes.json();
        if (offersData.success) {
          setOffers(offersData.offers || []);
        }
      } catch (err) {
        console.warn('Failed to load menu or offers:', err);
      } finally {
        setTimeout(() => setInitialLoading(false), 500);
      }
    };

    fetchCatalogAndOffers();
  }, []);

  const handleOpenOwnerDashboard = () => {
    if (isOwnerAuthenticated) {
      setCurrentPart('part3_owner');
    } else {
      setIsOwnerAuthOpen(true);
    }
  };

  const handleOwnerLogout = () => {
    try {
      localStorage.removeItem('coffeestand_auth_token');
      sessionStorage.removeItem('coffeestand_auth_token');
      localStorage.removeItem('coffeestand_owner_auth');
      sessionStorage.removeItem('coffeestand_owner_auth');
    } catch {
      // ignore
    }
    setIsOwnerAuthenticated(false);
    setCurrentPart('part1_customer');
    window.location.hash = '';
  };

  const handleAuthenticated = () => {
    setIsOwnerAuthenticated(true);
    setCurrentPart('part3_owner');
  };

  const handleApplyOffer = (code) => {
    setIsCartOpen(true);
  };

  // Render coffee loading animation on slow network or initial load
  if (initialLoading) {
    return <CoffeeLoader message="Roasting beans & brewing experience..." />;
  }

  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="app-root">
      {/* =============================================================== */}
      {/* PART 3 (QR ORDERING WEBSITE): STANDALONE CONTACTLESS ORDERING   */}
      {/* =============================================================== */}
      {currentPart === 'part2_qr_ordering' ? (
        <QROrderingView
          table={activeTable}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : currentPart === 'part3_owner' && isOwnerAuthenticated ? (
        /* =============================================================== */
        /* PART 2 (OWNER PANEL): SECURE MANAGEMENT DASHBOARD               */
        /* =============================================================== */
        <OwnerDashboard
          onCloseDashboard={() => {
            setCurrentPart('part1_customer');
            window.location.hash = '';
          }}
          onLogout={handleOwnerLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        /* =============================================================== */
        /* PART 1 (CUSTOMER SITE): PUBLIC BRAND EXPERIENCE WEBSITE         */
        /* =============================================================== */
        <>
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onOpenQR={() => setIsQRModalOpen(true)}
          />

          <main>
            {/* 1. Hero Landing with 3D Brand Animation */}
            <Hero3D
              onOpenMenu={() => {
                const el = document.getElementById('menu');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenReserve={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Interactive Menu Carousel Organized by Dish Types */}
            <CustomerMenuSection
              menuItems={menuItems}
              onAddToCart={handleAddToCart}
            />

            {/* 3. Special Offers & Deals (U01, U05) */}
            <OffersSection
              offers={offers}
              onApplyOffer={handleApplyOffer}
            />

            {/* 4. Photo Gallery */}
            <GallerySection />

            {/* 5. Cinematic Reels & Atmosphere */}
            <VideosSection />

            {/* 6. Café Heritage & Story */}
            <AboutSection />

            {/* 7. Customer Reviews & Feedback Submission Form */}
            <ReviewsSection />

            {/* 8. Table Reservation & Contact */}
            <ContactSection />

            {/* Footer */}
            <Footer />
          </main>

          {/* Cart Drawer (U01, U02) */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            activeTable={activeTable}
            onOrderPlaced={(order) => {
              setTrackedOrder(order);
              setIsTrackingModalOpen(true);
            }}
          />

          {/* Table QR Standee Modal (U01) */}
          <QRModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            initialTable={activeTable}
            onSelectTable={(table) => {
              setActiveTable(table);
            }}
          />

          {/* Order Tracking Modal (U01, U06, S08) */}
          <OrderTrackingModal
            isOpen={isTrackingModalOpen}
            onClose={() => setIsTrackingModalOpen(false)}
            initialOrder={trackedOrder}
          />
        </>
      )}

      {/* Owner Authentication Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}

export default App;
