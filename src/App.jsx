import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Utensils,
  LayoutDashboard,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Part1Reservations } from './components/Part1Reservations';
import { Part2Operations } from './components/Part2Operations';
import { Part3Dashboard } from './components/Part3Dashboard';
import { InstagramLink } from './components/InstagramLink';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { CustomerMenuSection } from './components/CustomerMenuSection';
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
import { CafenaLogoStamp } from './components/CafenaDecorations';

function AppContent() {
  const {
    reservations,
    orders,
    menuItems,
    coupons,
    inventory,
    setSelectedTableForDashboard
  } = useRestaurant();

  // Current view: 'part1_reservations' | 'part2_operations' | 'part3_dashboard' | 'part1_customer' | 'part2_qr_ordering' | 'part3_owner'
  const [currentPart, setCurrentPart] = useState(() => {
    try {
      const hash = (window.location.hash || '').toLowerCase();
      const search = window.location.search.toLowerCase();
      if (search.includes('table=') || hash.includes('order') || hash.includes('qr')) return 'part2_qr_ordering';
      if (search.includes('owner') || hash.includes('owner') || hash.includes('admin')) return 'part3_owner';
      if (hash.includes('part1') || hash.includes('reservation')) return 'part1_reservations';
      if (hash.includes('part2') || hash.includes('operation') || hash.includes('inventory') || hash.includes('menu-admin')) return 'part2_operations';
      if (hash.includes('part3') || hash.includes('dashboard')) return 'part3_dashboard';
      if (hash.includes('customer') || hash.includes('home')) return 'part1_customer';

      // Default to Part 1: Reservations (interconnected restaurant suite entry)
      return localStorage.getItem('coffeestand_suite_part') || 'part1_reservations';
    } catch {
      return 'part1_reservations';
    }
  });

  const [activeTable, setActiveTable] = useState('Table 4');
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem('coffeestand_auth_token') || sessionStorage.getItem('coffeestand_auth_token');
      const hasFlag = localStorage.getItem('coffeestand_owner_auth') === 'true' || sessionStorage.getItem('coffeestand_owner_auth') === 'true';
      return !!(token || hasFlag);
    } catch {
      return false;
    }
  });

  const [initialLoading, setInitialLoading] = useState(true);

  // Modals state for customer ordering
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState('');

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeestand_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('coffeestand_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cartItems]);

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
    const cleanItem = {
      ...newItem,
      quantity: Number(newItem.quantity) || 1,
      price: Number(newItem.price) || 0,
      size: newItem.size || 'Regular',
      customizations: Array.isArray(newItem.customizations)
        ? newItem.customizations
        : (newItem.customizations ? [newItem.customizations] : [])
    };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        if (item.id !== cleanItem.id) return false;
        if ((item.size || '') !== (cleanItem.size || '')) return false;
        if ((item.milk || '') !== (cleanItem.milk || '')) return false;
        const addonsA = (item.addons || []).map(a => typeof a === 'string' ? a : a.name).sort().join(',');
        const addonsB = (cleanItem.addons || []).map(a => typeof a === 'string' ? a : a.name).sort().join(',');
        return addonsA === addonsB;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (Number(updated[existingIndex].quantity) || 1) + cleanItem.quantity
        };
        return updated;
      }
      return [...prev, cleanItem];
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

  // Theme: 'warm-cream' | 'midnight-roast'
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

  // Save active part to localStorage for easy persistence across reloads
  useEffect(() => {
    try {
      if (currentPart.startsWith('part')) {
        localStorage.setItem('coffeestand_suite_part', currentPart);
      }
    } catch {
      // ignore
    }
  }, [currentPart]);

  // URL Hash & Query Routing
  useEffect(() => {
    const parseUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let tableParam = searchParams.get('table');
      const hash = (window.location.hash || '').toLowerCase();

      if (!tableParam && hash) {
        const hashStr = hash.replace(/^#\/?/, '');
        const hashQueryIdx = hashStr.indexOf('?');
        const hashQuery = hashQueryIdx >= 0 ? hashStr.slice(hashQueryIdx + 1) : hashStr;
        const hashParams = new URLSearchParams(hashQuery);
        tableParam = hashParams.get('table');
      }

      const pathname = window.location.pathname.toLowerCase();

      // Route: QR Ordering View
      if (
        tableParam ||
        searchParams.has('order') ||
        hash.includes('order') ||
        searchParams.has('qr') ||
        hash.includes('qr') ||
        pathname === '/qr' ||
        pathname === '/order'
      ) {
        if (tableParam) {
          setActiveTable(decodeURIComponent(tableParam));
        }
        setCurrentPart('part2_qr_ordering');
        return;
      }

      // Route: Owner Dashboard
      if (
        searchParams.has('owner') ||
        searchParams.has('admin') ||
        hash.includes('owner') ||
        hash.includes('admin') ||
        pathname.includes('/owner') ||
        pathname.includes('/admin')
      ) {
        const hasAuth = isOwnerAuthenticated ||
          localStorage.getItem('coffeestand_owner_auth') === 'true' ||
          sessionStorage.getItem('coffeestand_owner_auth') === 'true';

        if (hasAuth) {
          setIsOwnerAuthenticated(true);
          setCurrentPart('part3_owner');
        } else {
          setIsOwnerAuthOpen(true);
        }
        return;
      }

      // Route: 3-Part Interconnected Suite Parts
      if (hash.includes('part1') || hash.includes('reservation')) {
        setCurrentPart('part1_reservations');
        return;
      }
      if (hash.includes('part2') || hash.includes('operation') || hash.includes('inventory') || hash.includes('menu-admin')) {
        setCurrentPart('part2_operations');
        return;
      }
      if (hash.includes('part3') || hash.includes('dashboard')) {
        setCurrentPart('part3_dashboard');
        return;
      }
      if (hash.includes('customer') || hash.includes('home')) {
        setCurrentPart('part1_customer');
        return;
      }
    };

    parseUrl();
    window.addEventListener('hashchange', parseUrl);
    window.addEventListener('popstate', parseUrl);
    return () => {
      window.removeEventListener('hashchange', parseUrl);
      window.removeEventListener('popstate', parseUrl);
    };
  }, [isOwnerAuthenticated]);

  // Initial loading timer
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenOwnerDashboard = () => {
    if (isOwnerAuthenticated) {
      setCurrentPart('part3_owner');
      window.location.hash = 'owner';
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
    setCurrentPart('part3_dashboard');
    window.location.hash = 'part3';
  };

  const handleAuthenticated = () => {
    setIsOwnerAuthenticated(true);
    setCurrentPart('part3_owner');
    window.location.hash = 'owner';
  };

  const handleCloseOwnerAuth = () => {
    setIsOwnerAuthOpen(false);
    if (!isOwnerAuthenticated) {
      if (window.location.hash.includes('owner') || window.location.hash.includes('admin')) {
        window.location.hash = 'part3';
      }
    }
  };

  const handleBackToCustomerSite = () => {
    setCurrentPart('part1_customer');
    if (window.location.search.includes('table=') || window.location.search.includes('order') || window.location.search.includes('qr')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (window.location.hash.includes('table=') || window.location.hash.includes('order') || window.location.hash.includes('qr')) {
      window.location.hash = 'customer';
    }
  };

  if (initialLoading) {
    return <CoffeeLoader message="Brewing interconnected restaurant system..." />;
  }

  // Active metrics for suite switcher badges
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const lowStockCount = inventory.filter(i => (i.current_stock || 0) <= (i.min_threshold || 5)).length;

  return (
    <div className="app-root">
      {/* =================================================================== */}
      {/* TOP SUITE NAVIGATION & INTERCONNECTION MASTER SWITCHER              */}
      {/* =================================================================== */}
      <header
        className="suite-master-bar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--bg-surface-glass, rgba(28, 24, 21, 0.96))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-medium, rgba(199, 161, 122, 0.3))',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          padding: '0.6rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CafenaLogoStamp size={34} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 900, fontFamily: 'var(--font-display, inherit)', letterSpacing: '0.06em', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                CAFENA
              </span>
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(234, 139, 57, 0.16)',
                color: 'var(--primary)',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                3-Part Suite
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Interconnected Restaurant Operations
            </div>
          </div>
        </div>

        {/* Center Suite Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--bg-base)',
            padding: '4px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}
          aria-label="Restaurant Suite Navigation"
        >
          {/* Part 1: Reservations Tab */}
          <button
            onClick={() => {
              setCurrentPart('part1_reservations');
              window.location.hash = 'part1';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.48rem 0.85rem',
              borderRadius: 'var(--radius-btn, 6px)',
              border: currentPart === 'part1_reservations' ? '1px solid var(--primary)' : '1px solid transparent',
              background: currentPart === 'part1_reservations' ? 'var(--primary)' : 'transparent',
              color: currentPart === 'part1_reservations' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: currentPart === 'part1_reservations' ? '0 2px 8px var(--primary-glow)' : 'none'
            }}
            title="Part 1: Table Reservations (Create, View, Edit, Cancel)"
          >
            <Calendar size={14} />
            <span>Part 1: Reservations</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: currentPart === 'part1_reservations' ? 'rgba(0,0,0,0.25)' : 'var(--primary-subtle)',
                color: currentPart === 'part1_reservations' ? '#ffffff' : 'var(--primary)',
                fontWeight: 800
              }}
            >
              {reservations.length}
            </span>
          </button>

          {/* Part 2: Operations Tab */}
          <button
            onClick={() => {
              setCurrentPart('part2_operations');
              window.location.hash = 'part2';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.48rem 0.85rem',
              borderRadius: 'var(--radius-btn, 6px)',
              border: currentPart === 'part2_operations' ? '1px solid var(--primary)' : '1px solid transparent',
              background: currentPart === 'part2_operations' ? 'var(--primary)' : 'transparent',
              color: currentPart === 'part2_operations' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: currentPart === 'part2_operations' ? '0 2px 8px var(--primary-glow)' : 'none'
            }}
            title="Part 2: Menu, Coupons, Inventory & Table Ordering"
          >
            <Utensils size={14} />
            <span>Part 2: Menu, Coupons & Inventory</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: currentPart === 'part2_operations' ? 'rgba(0,0,0,0.25)' : 'var(--primary-subtle)',
                color: currentPart === 'part2_operations' ? '#ffffff' : 'var(--primary)',
                fontWeight: 800
              }}
            >
              {menuItems.length}
            </span>
          </button>

          {/* Part 3: Dashboard Tab */}
          <button
            onClick={() => {
              setCurrentPart('part3_dashboard');
              window.location.hash = 'part3';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.48rem 0.85rem',
              borderRadius: 'var(--radius-btn, 6px)',
              border: currentPart === 'part3_dashboard' ? '1px solid var(--primary)' : '1px solid transparent',
              background: currentPart === 'part3_dashboard' ? 'var(--primary)' : 'transparent',
              color: currentPart === 'part3_dashboard' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: currentPart === 'part3_dashboard' ? '0 2px 8px var(--primary-glow)' : 'none'
            }}
            title="Part 3: Unified Dashboard (Live Table Orders, Linked Reservations, Coupons, Inventory, Reviews)"
          >
            <LayoutDashboard size={14} />
            <span>Part 3: Dashboard</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: currentPart === 'part3_dashboard' ? 'rgba(0,0,0,0.25)' : (activeOrdersCount > 0 ? '#10b981' : 'var(--primary-subtle)'),
                color: currentPart === 'part3_dashboard' ? '#ffffff' : (activeOrdersCount > 0 ? '#ffffff' : 'var(--primary)'),
                fontWeight: 800
              }}
            >
              {activeOrdersCount} live
            </span>
          </button>

          {/* Customer Site Tab */}
          <button
            onClick={() => {
              setCurrentPart('part1_customer');
              window.location.hash = 'customer';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.48rem 0.85rem',
              borderRadius: 'var(--radius-btn, 6px)',
              border: currentPart === 'part1_customer' ? '1px solid var(--primary)' : '1px solid transparent',
              background: currentPart === 'part1_customer' ? 'var(--primary)' : 'transparent',
              color: currentPart === 'part1_customer' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Public Customer Experience Website"
          >
            <Globe size={14} />
            <span>Customer Site</span>
          </button>
        </nav>

        {/* Right Tools & Sync Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Live Data Layer Synced Beacon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(21, 128, 61, 0.12)',
              border: '1px solid rgba(21, 128, 61, 0.3)',
              color: 'var(--success, #15803d)',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
            title="Shared SQLite & WebSocket data layer synchronized across Part 1, Part 2 & Part 3"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#15803d',
                boxShadow: '0 0 6px #15803d',
                display: 'inline-block'
              }}
            />
            <span>Data Layer Live</span>
          </div>

          {/* Validated Instagram Link */}
          <InstagramLink
            handleOrUrl="cafena.nikol"
            style={{
              padding: '4px 9px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            showIcon={true}
            iconSize={14}
          />

          {/* Dual Theme Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title={theme === 'midnight-roast' ? 'Switch to Day Roastery (Warm Crema)' : 'Switch to Velvet Night (Dark Roast)'}
            aria-label="Toggle theme"
          >
            {theme === 'midnight-roast' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* QR Ordering Shortcut */}
          <button
            onClick={() => {
              setActiveTable('Table 4');
              setCurrentPart('part2_qr_ordering');
              window.location.hash = 'order';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="Open Table 4 Contactless QR Ordering"
          >
            <QrCode size={13} />
            <span>QR Ordering</span>
          </button>

          {/* Owner Dashboard Shortcut */}
          <button
            onClick={handleOpenOwnerDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              borderRadius: '6px',
              background: isOwnerAuthenticated ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              border: isOwnerAuthenticated ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              color: isOwnerAuthenticated ? 'var(--primary)' : 'var(--text-main)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 700
            }}
            title="Owner & Staff PIN Portal (PIN: 8899)"
          >
            <ShieldCheck size={13} />
            <span>{isOwnerAuthenticated ? 'Owner Panel' : 'Owner PIN'}</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* VIEW ROUTER FOR THE THREE LINKED PARTS & SPECIALIZED VIEWS           */}
      {/* =================================================================== */}
      {currentPart === 'part1_reservations' ? (
        /* PART 1: RESERVATIONS (Table reservations create, view, edit, cancel, link to Part 3) */
        <Part1Reservations
          onNavigateToDashboard={() => {
            setCurrentPart('part3_dashboard');
            window.location.hash = 'part3';
          }}
        />
      ) : currentPart === 'part2_operations' ? (
        /* PART 2: MENU, COUPONS & INVENTORY (Add/edit menu, coupons, inventory, reviews, table orders) */
        <Part2Operations
          onNavigateToDashboard={() => {
            setCurrentPart('part3_dashboard');
            window.location.hash = 'part3';
          }}
        />
      ) : currentPart === 'part3_dashboard' ? (
        /* PART 3: DASHBOARD (Orders by table from Part 2, Reservations from Part 1, coupons, inventory, reviews) */
        <Part3Dashboard
          onNavigateToPart1={() => {
            setCurrentPart('part1_reservations');
            window.location.hash = 'part1';
          }}
          onNavigateToPart2={() => {
            setCurrentPart('part2_operations');
            window.location.hash = 'part2';
          }}
        />
      ) : currentPart === 'part2_qr_ordering' ? (
        /* QR ORDERING WEBSITE: CONTACTLESS ORDERING */
        <QROrderingView
          table={activeTable}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBackToCustomerSite={handleBackToCustomerSite}
        />
      ) : currentPart === 'part3_owner' && isOwnerAuthenticated ? (
        /* OWNER SECURE MANAGEMENT DASHBOARD */
        <OwnerDashboard
          onCloseDashboard={() => {
            setCurrentPart('part3_dashboard');
            window.location.hash = 'part3';
          }}
          onLogout={handleOwnerLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenQrOrdering={(table) => {
            if (table) setActiveTable(table);
            setCurrentPart('part2_qr_ordering');
          }}
        />
      ) : (
        /* CUSTOMER PUBLIC WEBSITE */
        <>
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main>
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

            <CustomerMenuSection menuItems={menuItems} />
            <GallerySection />
            <VideosSection />
            <AboutSection />
            <ReviewsSection />
            <ContactSection />

            <Footer
              onOpenOwnerLogin={handleOpenOwnerDashboard}
            />
          </main>

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            activeTable={activeTable}
            initialCoupon={selectedCoupon}
            onOrderPlaced={(order) => {
              setTrackedOrder(order);
              setIsTrackingModalOpen(true);
            }}
          />

          {/* Table QR Standee Modal */}
          <QRModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            initialTable={activeTable}
            onSelectTable={(table) => {
              setActiveTable(table);
            }}
          />

          {/* Order Tracking Modal */}
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
        onClose={handleCloseOwnerAuth}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}

export function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}

export default App;
