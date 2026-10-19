import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ShoppingBag,
  Star,
  Compass,
  Heart,
  Crown,
  BookOpen,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { useShop } from '../context/ShopContext';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onNavigateToAdmin?: () => void;
  userEmail: string | null;
  userName?: string | null;
  userPhoto?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  onNavigateToAdmin,
  userEmail,
  userName,
  userPhoto,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const { shopEnabled, planPrices, menuOrder, formatPrice, formatShortPrice } = useShop();

  // Base navigation catalog
  const baseNavCatalog: Record<
    string,
    { id: string; label: string; sub: string; icon: any }
  > = {
    'daily-horoscope': { id: 'daily-horoscope', label: 'Өдрийн зурхай', sub: 'Өнөөдрийн орд', icon: Star },
    numerology: { id: 'numerology', label: 'Тоон зурхай', sub: formatPrice(planPrices.numerology), icon: Compass },
    free: { id: 'free', label: 'Таро уншлага', sub: 'Үнэгүй уншлага', icon: Sparkles },
    love: { id: 'love', label: 'Хайр & Харилцаа', sub: formatPrice(planPrices.love), icon: Heart },
    vip: { id: 'vip', label: 'Бүтэн уншлага', sub: formatPrice(planPrices.full), icon: Crown },
    horoscope: { id: 'horoscope', label: 'Ордны шинж', sub: '12 орд, махбод', icon: BookOpen },
    shop: { id: 'shop', label: 'Дэлгүүр', sub: 'Бараа & зөвлөгөө', icon: ShoppingBag },
    profile: { id: 'profile', label: 'Профайл', sub: 'Хувийн танхим', icon: User },
  };

  // Build ordered navigation list based on Admin menuOrder configuration
  const orderedNavItems = (menuOrder && menuOrder.length > 0 ? menuOrder : Object.values(baseNavCatalog).map((i) => ({ id: i.id, label: i.label, enabled: true })))
    .filter((m) => m.enabled !== false && baseNavCatalog[m.id])
    .map((m) => ({
      ...baseNavCatalog[m.id],
      label: m.label || baseNavCatalog[m.id].label,
    }));

  const navItems = orderedNavItems.filter((item) => item.id !== 'shop' || shopEnabled);
  const firstMenuTabId = navItems[0]?.id || 'free';

  const handleToggleSound = () => {
    const newState = mysticAudio.toggleAmbient();
    setIsAudioActive(newState);
  };

  return (
    <header className="sticky top-0 z-40 w-full mystic-liquid-glass-navbar border-b border-[#C99C91]/40 transition-all shadow-[0_2px_12px_rgba(90,45,35,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark: ☾ M Y S T I C */}
        <button
          onClick={() => {
            onSelectTab(firstMenuTabId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-lg sm:text-xl font-mystic font-semibold tracking-[0.25em] transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-xl sm:text-2xl text-[#8E441D] leading-none group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(142,68,29,0.3)]">
            ☾
          </span>
          <span className="font-mystic font-bold text-[#230F16] tracking-[0.25em] group-hover:text-[#6C2B1D] transition-colors">
            M Y S T I C
          </span>
        </button>

        {/* Zone 2: Navigation Links (All 8 Primary Tabs) */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-[13px] font-sans font-medium overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 px-1.5 relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#230F16] font-bold'
                    : 'text-[#48222B] hover:text-[#230F16]'
                }`}
                title={item.sub}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8E441D]' : 'text-[#7A4E58]'}`} />
                <span>{item.label}</span>
                {item.id === 'numerology' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#8E441D]/15 text-[#8E441D] font-bold">
                    {formatShortPrice(planPrices.numerology)}
                  </span>
                )}
                {item.id === 'love' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#8E441D]/15 text-[#8E441D] font-bold">
                    {formatShortPrice(planPrices.love)}
                  </span>
                )}
                {item.id === 'vip' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D4AF37]/35 text-[#8E441D] font-bold">
                    {formatShortPrice(planPrices.full)}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7D3818] via-[#B25D28] to-[#7D3818] shadow-[0_0_6px_rgba(178,93,40,0.4)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Sound toggle, Profile & Сайтаас гарах button */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">

          <button
            onClick={handleToggleSound}
            title={isAudioActive ? 'Амбиент ая хаах' : 'Зөөлөн бясалгалын ая асаах'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isAudioActive
                ? 'border-[#8E441D] bg-[#8E441D]/15 text-[#3D1A23] shadow-[0_0_10px_rgba(142,68,29,0.3)]'
                : 'border-[#AB7C72]/40 text-[#542B34] hover:text-[#230F16] hover:border-[#8E441D]'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse text-[#8E441D]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className="px-3.5 py-1.5 text-xs font-sans font-bold text-[#2A1118] border border-[#8C4524]/40 hover:border-[#8C4524] hover:bg-[#8C4524]/10 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Avatar"
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-[#8E441D]" />
            )}
            <span className="truncate max-w-[100px]">
              {userName || (userEmail ? userEmail.split('@')[0] : 'Профайл')}
            </span>
          </button>

          {/* Сайтаас гарах (Logout) button */}
          {userEmail && (
            <button
              onClick={() => {
                if (onLogout) onLogout();
              }}
              title="Сайтаас гарах"
              className="p-2 text-xs font-serif font-bold text-[#8C2C1D] hover:text-[#521E10] border border-[#8C2C1D]/35 hover:border-[#8C2C1D] bg-white/60 hover:bg-white rounded-xl transition-all shrink-0 cursor-pointer flex items-center shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-[#8C2C1D]" />
            </button>
          )}
        </div>

        {/* Mobile controls & toggle button */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            onClick={handleToggleSound}
            className="p-2 text-[#5E3841] hover:text-[#2E141B]"
            aria-label="Toggle sound"
          >
            {isAudioActive ? <Volume2 className="w-5 h-5 text-[#4D2730]" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#4D2730] rounded-xl border border-[#A6786E]/40 bg-[#E8C8C0] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#DFB9AF] border-b border-[#C99C91]/60 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-3">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#8E441D] text-white font-bold shadow-md'
                      : 'bg-white/60 text-[#3D1A23] hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{item.label}</span>
                    <span className="text-[10px] opacity-80 block truncate">{item.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#C99C91]/40 flex items-center justify-between">
            <button
              onClick={() => {
                onSelectTab('profile');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-serif font-bold text-[#2A1118] flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#8E441D]" />
              <span>{userEmail || 'Хэрэглэгчийн танхим'}</span>
            </button>

            {userEmail ? (
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-serif font-bold text-rose-700 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Гарах</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-serif font-bold text-[#8E441D] underline"
              >
                Нэвтрэх
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
