/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FreeReadingPage } from './pages/FreeReadingPage';
import { LoveReadingPage } from './pages/LoveReadingPage';
import { VipReadingPage } from './pages/VipReadingPage';
import { DailyHoroscopePage } from './pages/DailyHoroscopePage';
import { NumerologyPage } from './pages/NumerologyPage';
import { HoroscopePage } from './pages/HoroscopePage';
import { ShopPage, ShopItem } from './pages/ShopPage';
import { ProfilePage } from './pages/ProfilePage';
import { SecretAdminPage } from './pages/SecretAdminPage';
import { AuthModal, UserAccount } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TarotCard } from './data/tarotData';
import { getUserActivePlan, OrderPlan } from './types/order';
import { CustomCardsProvider } from './context/CustomCardsContext';
import { ReadingProvider } from './context/ReadingContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { TarotCardCustomizerModal } from './components/TarotCardCustomizerModal';

const SiteBackgroundLayer: React.FC = () => {
  const { siteBackground } = useShop();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = siteBackground.color || '#DAB3AA';
    }
  }, [siteBackground.color]);

  const safeColor = siteBackground.color || '#DAB3AA';
  const safeOverlayColor = siteBackground.overlayColor || '#DAB3AA';
  const safeOpacity = Math.max(0, Math.min(90, Number(siteBackground.overlayOpacity ?? 20))) / 100;

  const glassEnabled = siteBackground.headerGlassEnabled !== false;
  const glassBlur = Math.max(0, Math.min(60, Number(siteBackground.headerGlassBlur ?? 18)));
  const glassOpacity = Math.max(0, Math.min(95, Number(siteBackground.headerGlassOpacity ?? 28))) / 100;
  const glassBorderOpacity = Math.max(0, Math.min(95, Number(siteBackground.headerGlassBorderOpacity ?? 35))) / 100;

  return (
    <>
      <style>{`
        .mystic-dynamic-bg-base { background-color: ${safeColor}; }
        .mystic-dynamic-bg-overlay { background-color: ${safeOverlayColor}; opacity: ${safeOpacity}; }
        .mystic-liquid-glass-header {
          ${
            glassEnabled
              ? `
          background: linear-gradient(135deg, rgba(255, 250, 246, ${Math.min(0.95, glassOpacity + 0.14)}), rgba(248, 228, 220, ${glassOpacity}));
          backdrop-filter: blur(${glassBlur}px) saturate(160%);
          -webkit-backdrop-filter: blur(${glassBlur}px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, ${glassBorderOpacity});
          box-shadow: 0 12px 36px -8px rgba(42, 17, 24, 0.14), inset 0 1px 1px 0 rgba(255, 255, 255, ${Math.min(0.9, glassBorderOpacity + 0.25)});
          `
              : `
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: 1px solid transparent;
          box-shadow: none;
          `
          }
          transition: all 0.3s ease;
        }
        .mystic-liquid-glass-navbar {
          ${
            glassEnabled
              ? `
          background: linear-gradient(180deg, rgba(229, 194, 184, ${Math.max(0.55, Math.min(0.96, glassOpacity + 0.45))}), rgba(218, 179, 170, ${Math.max(0.45, Math.min(0.92, glassOpacity + 0.35))}));
          backdrop-filter: blur(${glassBlur}px) saturate(170%);
          -webkit-backdrop-filter: blur(${glassBlur}px) saturate(170%);
          box-shadow: 0 4px 24px rgba(55, 22, 30, 0.1), inset 0 1px 0 rgba(255, 255, 255, ${glassBorderOpacity});
          `
              : `
          background-color: rgba(223, 185, 175, 0.95);
          backdrop-filter: blur(8px);
          `
          }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mystic-dynamic-bg-base transition-colors duration-500">
        {siteBackground.type === 'image' && siteBackground.imageUrl && (
          <img
            src={siteBackground.imageUrl}
            alt=""
            className="w-full h-full object-cover select-none"
          />
        )}

        {siteBackground.type === 'video' && siteBackground.videoUrl && (
          <video
            key={siteBackground.videoUrl}
            src={siteBackground.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover select-none"
          />
        )}

        {(siteBackground.type === 'image' || siteBackground.type === 'video') && safeOpacity > 0 && (
          <div className="absolute inset-0 mystic-dynamic-bg-overlay transition-opacity duration-300" />
        )}

        {siteBackground.showNebulaClouds && (
          <div className="absolute inset-0 bg-nebula-clouds opacity-60" />
        )}
      </div>
    </>
  );
};

function isSecretAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path === '/admin/' ||
    path === '/secret-admin' ||
    path === '/secret-admin/' ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash === '#secret-admin' ||
    hash === '#/secret-admin' ||
    search.includes('admin=1') ||
    search.includes('admin=true')
  );
}

export default function App() {
  const [isSecretAdmin, setIsSecretAdmin] = useState<boolean>(() => isSecretAdminUrl());
  const [currentTab, setCurrentTab] = useState<string>('free');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activePlan, setActivePlan] = useState<'numerology' | 'love' | 'full' | null>(null);

  // Shop item checkout state
  const [shopCheckoutItem, setShopCheckoutItem] = useState<ShopItem | null>(null);
  const [isShopCheckoutOpen, setIsShopCheckoutOpen] = useState(false);

  // Watch URL path/hash for /secret-admin navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setIsSecretAdmin(isSecretAdminUrl());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateBackToSite = () => {
    window.history.pushState({}, '', '/');
    setIsSecretAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore authenticated user and active plan on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('mystic_user_account');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name?.includes('Анужин') || u.email?.includes('anujin')) {
          localStorage.removeItem('mystic_user_account');
          setCurrentUser(null);
        } else {
          setCurrentUser(u);
        }
      } catch {
        localStorage.removeItem('mystic_user_account');
      }
    }
  }, []);

  // Sync plan whenever user, orders or storage changes
  useEffect(() => {
    const syncActivePlan = () => {
      const plan = getUserActivePlan(currentUser?.email);
      setActivePlan(plan as any);
      if (!plan) {
        localStorage.removeItem('mystic_active_plan');
      }
    };

    syncActivePlan();
    window.addEventListener('mystic_orders_updated', syncActivePlan);
    window.addEventListener('storage', syncActivePlan);

    return () => {
      window.removeEventListener('mystic_orders_updated', syncActivePlan);
      window.removeEventListener('storage', syncActivePlan);
    };
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('mystic_user_account');
    localStorage.removeItem('mystic_current_user_email');
    localStorage.removeItem('mystic_current_user_name');
    setCurrentUser(null);
    setActivePlan(null);
  };

  // If viewing secret admin panel via dedicated URL (/admin or /secret-admin)
  if (isSecretAdmin) {
    return (
      <ShopProvider>
        <CustomCardsProvider>
          <SecretAdminPage
            onBackToSite={navigateBackToSite}
            onPlanActivated={(planId: OrderPlan, email: string) => {
              setActivePlan(planId as any);
              if (!currentUser) {
                setCurrentUser({
                  name: email.split('@')[0],
                  email: email,
                  provider: 'email',
                });
              }
            }}
          />
          <TarotCardCustomizerModal />
        </CustomCardsProvider>
      </ShopProvider>
    );
  }

  // Otherwise display the public customer site
  return (
    <ShopProvider>
      <CustomCardsProvider>
        <ReadingProvider userEmail={currentUser?.email}>
          <div className="min-h-screen flex flex-col relative text-[#2F171E] selection:bg-[#BA7765]/25 selection:text-[#2F171E]">
            {/* Dynamic Site Background (Color, Image, or Video configured from Admin) */}
            <SiteBackgroundLayer />

            {/* Header */}
            <Header
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              onOpenAuth={() => setIsAuthOpen(true)}
              onLogout={handleLogout}
              userEmail={currentUser?.email || null}
              userName={currentUser?.name || null}
              userPhoto={currentUser?.photoUrl || null}
            />

          {/* Main Content Pages for all 8 Menus */}
          <main className="flex-1 relative">
            {/* 1. Daily Horoscope (Өдөр тутмын зурхай) */}
            {currentTab === 'daily-horoscope' && (
              <DailyHoroscopePage />
            )}

            {/* 2. Numerology (Тоон зурхай - 9,900₮) */}
            {currentTab === 'numerology' && (
              <NumerologyPage
                currentUserEmail={currentUser?.email}
                currentUserName={currentUser?.name}
              />
            )}

            {/* 3. Free Tarot (Хөзөр холих, сонгох, суурь тайлбар) */}
            {(currentTab === 'free' || currentTab === 'home') && (
              <FreeReadingPage
                onNavigateToLove={() => {
                  setCurrentTab('love');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToVip={() => {
                  setCurrentTab('vip');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 4. Love Reading (9,900₮) */}
            {currentTab === 'love' && (
              <LoveReadingPage
                onNavigateToFree={() => {
                  setCurrentTab('free');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToVip={() => {
                  setCurrentTab('vip');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                currentUserEmail={currentUser?.email}
                currentUserName={currentUser?.name}
              />
            )}

            {/* 5. VIP Ultimate (19,900₮) */}
            {currentTab === 'vip' && (
              <VipReadingPage
                onNavigateToFree={() => {
                  setCurrentTab('free');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                currentUserEmail={currentUser?.email}
                currentUserName={currentUser?.name}
              />
            )}

            {/* 6. Horoscope (Ерөнхий зурхай) */}
            {currentTab === 'horoscope' && (
              <HoroscopePage />
            )}

            {/* 7. Shop (Бараа бүтээгдэхүүн, цахим контент) */}
            {currentTab === 'shop' && (
              <ShopPage
                onOrderProduct={(item) => {
                  setShopCheckoutItem(item);
                  setIsShopCheckoutOpen(true);
                }}
              />
            )}

            {/* 8. Profile (Хэрэглэгчийн хадгалсан уншлага, daily horoscope, тоон зурхайн түүх) */}
            {currentTab === 'profile' && (
              <ProfilePage
                currentUser={currentUser}
                activePlan={activePlan}
                onOpenAuth={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
                onNavigateToTab={setCurrentTab}
              />
            )}
          </main>

          {/* Footer */}
          <Footer
            onSelectTab={setCurrentTab}
          />

          {/* Auth Modal with Google Sign In */}
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            currentUser={currentUser}
            onLoginSuccess={(user) => setCurrentUser(user)}
            onLogout={handleLogout}
          />

          {/* Shop Item Checkout Modal */}
          {shopCheckoutItem && (
            <CheckoutModal
              isOpen={isShopCheckoutOpen}
              onClose={() => {
                setIsShopCheckoutOpen(false);
                setShopCheckoutItem(null);
              }}
              plan={{
                id: 'shop' as any,
                name: shopCheckoutItem.title,
                price: `${shopCheckoutItem.price.toLocaleString()}₮`,
                amount: shopCheckoutItem.price,
              }}
              currentUserEmail={currentUser?.email}
              currentUserName={currentUser?.name}
              onOrderSubmitted={() => {
                setIsShopCheckoutOpen(false);
                setShopCheckoutItem(null);
                setCurrentTab('profile');
              }}
            />
          )}

          {/* Tarot Card Customizer Modal */}
          <TarotCardCustomizerModal />
        </div>
      </ReadingProvider>
    </CustomCardsProvider>
    </ShopProvider>
  );
}
