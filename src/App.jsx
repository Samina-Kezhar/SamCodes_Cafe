import React, { useState, useEffect } from 'react';
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

export function App() {
  // Current Part: 'part1_customer' | 'part2_qr_ordering' | 'part3_owner'
  const [currentPart, setCurrentPart] = useState('part1_customer');
  const [menuItems, setMenuItems] = useState([]);
  const [activeTable, setActiveTable] = useState('Table 4');
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('coffeestand_owner_auth') === 'true' ||
             sessionStorage.getItem('coffeestand_owner_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [initialLoading, setInitialLoading] = useState(true);

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

  // Fetch catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success) {
          setMenuItems(data.items);
        }
      } catch (err) {
        console.warn('Failed to load menu items:', err);
      } finally {
        // Smooth brief coffee brewing loader
        setTimeout(() => setInitialLoading(false), 500);
      }
    };

    fetchCatalog();
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

  // Render coffee loading animation on slow network or initial load
  if (initialLoading) {
    return <CoffeeLoader message="Roasting beans & brewing experience..." />;
  }

  return (
    <div className="app-root">
      {/* =============================================================== */}
      {/* PART 2: STANDALONE QR CODE ORDERING SYSTEM (TABLE-SPECIFIC)     */}
      {/* =============================================================== */}
      {currentPart === 'part2_qr_ordering' ? (
        <QROrderingView
          table={activeTable}
          onBackToSite={() => {
            setCurrentPart('part1_customer');
            window.location.hash = '';
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : currentPart === 'part3_owner' && isOwnerAuthenticated ? (
        /* =============================================================== */
        /* PART 3: OWNER DASHBOARD (MANAGEMENT PANEL)                     */
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
        /* PART 1: CUSTOMER EXPERIENCE WEBSITE                            */
        /* =============================================================== */
        <>
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
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

            {/* 2. Interactive Menu (Browsing without ordering) */}
            <CustomerMenuSection menuItems={menuItems} />

            {/* 3. Photo Gallery */}
            <GallerySection />

            {/* 4. Cinematic Reels & Atmosphere */}
            <VideosSection />

            {/* 5. Café Heritage & Story */}
            <AboutSection />

            {/* 6. Customer Reviews & Feedback Submission Form */}
            <ReviewsSection />

            {/* 7. Table Reservation & Contact */}
            <ContactSection />

            {/* Footer with discreet Owner Access trigger */}
            <Footer
              onOpenOwnerAuth={handleOpenOwnerDashboard}
            />
          </main>
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
