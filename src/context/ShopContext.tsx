import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SHOP_ITEMS, ShopItem } from '../pages/ShopPage';

export interface PlanPrices {
  numerology: number;
  love: number;
  full: number;
}

export const DEFAULT_PLAN_PRICES: PlanPrices = {
  numerology: 9900,
  love: 9900,
  full: 19900,
};

export interface SiteBackgroundConfig {
  type: 'color' | 'image' | 'video';
  color: string;
  imageUrl: string;
  videoUrl: string;
  overlayOpacity: number;
  overlayColor: string;
  showNebulaClouds: boolean;
  headerGlassEnabled: boolean;
  headerGlassBlur: number;
  headerGlassOpacity: number;
  headerGlassBorderOpacity: number;
}

export const DEFAULT_SITE_BACKGROUND: SiteBackgroundConfig = {
  type: 'color',
  color: '#DAB3AA',
  imageUrl: '',
  videoUrl: '',
  overlayOpacity: 20,
  overlayColor: '#DAB3AA',
  showNebulaClouds: true,
  headerGlassEnabled: true,
  headerGlassBlur: 18,
  headerGlassOpacity: 28,
  headerGlassBorderOpacity: 35,
};

export interface MenuOrderItem {
  id: string;
  label: string;
  enabled: boolean;
}

export const DEFAULT_MENU_ORDER: MenuOrderItem[] = [
  { id: 'daily-horoscope', label: 'Өдрийн зурхай', enabled: true },
  { id: 'numerology', label: 'Тоон зурхай', enabled: true },
  { id: 'free', label: 'Таро уншлага', enabled: true },
  { id: 'love', label: 'Хайр & Харилцаа', enabled: true },
  { id: 'vip', label: 'Бүтэн уншлага', enabled: true },
  { id: 'horoscope', label: 'Ордны шинж', enabled: true },
  { id: 'shop', label: 'Дэлгүүр', enabled: true },
  { id: 'profile', label: 'Профайл', enabled: true },
];

export function formatPrice(amount: number): string {
  return `${(Number(amount) || 0).toLocaleString()}₮`;
}

export function formatShortPrice(amount: number): string {
  const num = Number(amount) || 0;
  if (num >= 1000) {
    const k = num / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return `${num}₮`;
}

interface ShopContextType {
  shopEnabled: boolean;
  items: ShopItem[];
  planPrices: PlanPrices;
  siteBackground: SiteBackgroundConfig;
  menuOrder: MenuOrderItem[];
  isLoading: boolean;
  toggleShopEnabled: (enabled?: boolean) => Promise<void>;
  saveShopItem: (item: Partial<ShopItem> & { title: string; price: number }) => Promise<ShopItem | null>;
  deleteShopItem: (id: string) => Promise<void>;
  updatePlanPrices: (prices: Partial<PlanPrices>) => Promise<void>;
  updateSiteBackground: (bg: Partial<SiteBackgroundConfig>) => Promise<SiteBackgroundConfig>;
  updateMenuOrder: (order: MenuOrderItem[]) => Promise<MenuOrderItem[]>;
  formatPrice: (amount: number) => string;
  formatShortPrice: (amount: number) => string;
  refreshShop: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | null>(null);

const LOCAL_SHOP_CONFIG_KEY = 'mystic_shop_config_v1';

function normalizeSiteBg(raw?: Partial<SiteBackgroundConfig> | null): SiteBackgroundConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SITE_BACKGROUND };
  return {
    type: raw.type === 'image' || raw.type === 'video' ? raw.type : 'color',
    color: typeof raw.color === 'string' && raw.color ? raw.color : DEFAULT_SITE_BACKGROUND.color,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : DEFAULT_SITE_BACKGROUND.imageUrl,
    videoUrl: typeof raw.videoUrl === 'string' ? raw.videoUrl : DEFAULT_SITE_BACKGROUND.videoUrl,
    overlayOpacity:
      typeof raw.overlayOpacity === 'number'
        ? Math.max(0, Math.min(90, raw.overlayOpacity))
        : DEFAULT_SITE_BACKGROUND.overlayOpacity,
    overlayColor:
      typeof raw.overlayColor === 'string' && raw.overlayColor
        ? raw.overlayColor
        : DEFAULT_SITE_BACKGROUND.overlayColor,
    showNebulaClouds:
      typeof raw.showNebulaClouds === 'boolean'
        ? raw.showNebulaClouds
        : DEFAULT_SITE_BACKGROUND.showNebulaClouds,
    headerGlassEnabled:
      typeof raw.headerGlassEnabled === 'boolean'
        ? raw.headerGlassEnabled
        : DEFAULT_SITE_BACKGROUND.headerGlassEnabled,
    headerGlassBlur:
      typeof raw.headerGlassBlur === 'number' && !isNaN(raw.headerGlassBlur)
        ? Math.max(0, Math.min(60, raw.headerGlassBlur))
        : DEFAULT_SITE_BACKGROUND.headerGlassBlur,
    headerGlassOpacity:
      typeof raw.headerGlassOpacity === 'number' && !isNaN(raw.headerGlassOpacity)
        ? Math.max(0, Math.min(95, raw.headerGlassOpacity))
        : DEFAULT_SITE_BACKGROUND.headerGlassOpacity,
    headerGlassBorderOpacity:
      typeof raw.headerGlassBorderOpacity === 'number' && !isNaN(raw.headerGlassBorderOpacity)
        ? Math.max(0, Math.min(95, raw.headerGlassBorderOpacity))
        : DEFAULT_SITE_BACKGROUND.headerGlassBorderOpacity,
  };
}

function normalizeMenuOrder(raw?: any): MenuOrderItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_MENU_ORDER];
  const validIds = new Set(DEFAULT_MENU_ORDER.map((m) => m.id));
  const seen = new Set<string>();
  const normalized: MenuOrderItem[] = [];

  for (const item of raw) {
    if (item && typeof item.id === 'string' && validIds.has(item.id) && !seen.has(item.id)) {
      const def = DEFAULT_MENU_ORDER.find((d) => d.id === item.id)!;
      seen.add(item.id);
      normalized.push({
        id: item.id,
        label: typeof item.label === 'string' && item.label.trim() ? item.label.trim() : def.label,
        enabled: item.enabled !== false,
      });
    }
  }

  for (const def of DEFAULT_MENU_ORDER) {
    if (!seen.has(def.id)) {
      normalized.push({ ...def });
    }
  }

  return normalized;
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopEnabled, setShopEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.shopEnabled === 'boolean') return parsed.shopEnabled;
      }
    } catch {}
    return true;
  });

  const [items, setItems] = useState<ShopItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items;
      }
    } catch {}
    return SHOP_ITEMS;
  });

  const [planPrices, setPlanPrices] = useState<PlanPrices>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.planPrices) {
          return {
            numerology: Number(parsed.planPrices.numerology) > 0 ? Number(parsed.planPrices.numerology) : DEFAULT_PLAN_PRICES.numerology,
            love: Number(parsed.planPrices.love) > 0 ? Number(parsed.planPrices.love) : DEFAULT_PLAN_PRICES.love,
            full: Number(parsed.planPrices.full) > 0 ? Number(parsed.planPrices.full) : DEFAULT_PLAN_PRICES.full,
          };
        }
      }
    } catch {}
    return DEFAULT_PLAN_PRICES;
  });

  const [siteBackground, setSiteBackground] = useState<SiteBackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.siteBackground) {
          return normalizeSiteBg(parsed.siteBackground);
        }
      }
    } catch {}
    return DEFAULT_SITE_BACKGROUND;
  });

  const [menuOrder, setMenuOrder] = useState<MenuOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.menuOrder) && parsed.menuOrder.length > 0) {
          return normalizeMenuOrder(parsed.menuOrder);
        }
      }
    } catch {}
    return [...DEFAULT_MENU_ORDER];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const persistLocal = (
    enabled: boolean,
    nextItems: ShopItem[],
    nextPrices: PlanPrices,
    nextBg: SiteBackgroundConfig,
    nextMenuOrder: MenuOrderItem[] = menuOrder
  ) => {
    try {
      // Avoid storing huge base64 videos directly in localStorage if not yet saved to server URL
      const safeBg: SiteBackgroundConfig = {
        ...nextBg,
        videoUrl:
          nextBg.videoUrl && nextBg.videoUrl.startsWith('data:video/') && nextBg.videoUrl.length > 2_000_000
            ? ''
            : nextBg.videoUrl,
      };
      localStorage.setItem(
        LOCAL_SHOP_CONFIG_KEY,
        JSON.stringify({
          shopEnabled: enabled,
          items: nextItems,
          planPrices: nextPrices,
          siteBackground: safeBg,
          menuOrder: nextMenuOrder,
        })
      );
      window.dispatchEvent(new Event('mystic_shop_updated'));
    } catch {}
  };

  const refreshShop = useCallback(async () => {
    try {
      const res = await fetch('/api/shop');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const nextEnabled = typeof data.shopEnabled === 'boolean' ? data.shopEnabled : true;
          const nextItems = Array.isArray(data.items) ? data.items : SHOP_ITEMS;
          const rawPrices = data.planPrices || {};
          const nextPrices: PlanPrices = {
            numerology: Number(rawPrices.numerology) > 0 ? Number(rawPrices.numerology) : DEFAULT_PLAN_PRICES.numerology,
            love: Number(rawPrices.love) > 0 ? Number(rawPrices.love) : DEFAULT_PLAN_PRICES.love,
            full: Number(rawPrices.full) > 0 ? Number(rawPrices.full) : DEFAULT_PLAN_PRICES.full,
          };
          const nextBg = normalizeSiteBg(data.siteBackground);
          let nextMenu = menuOrder;
          try {
            const menuRes = await fetch('/api/menu-order');
            if (menuRes.ok) {
              const menuData = await menuRes.json();
              if (menuData.success && Array.isArray(menuData.menuOrder)) {
                nextMenu = normalizeMenuOrder(menuData.menuOrder);
                setMenuOrder(nextMenu);
              }
            }
          } catch {}
          setShopEnabled(nextEnabled);
          setItems(nextItems);
          setPlanPrices(nextPrices);
          setSiteBackground(nextBg);
          persistLocal(nextEnabled, nextItems, nextPrices, nextBg, nextMenu);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshShop();
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(LOCAL_SHOP_CONFIG_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.shopEnabled === 'boolean') setShopEnabled(parsed.shopEnabled);
          if (Array.isArray(parsed.items)) setItems(parsed.items);
          if (parsed.planPrices) {
            setPlanPrices({
              numerology: Number(parsed.planPrices.numerology) > 0 ? Number(parsed.planPrices.numerology) : DEFAULT_PLAN_PRICES.numerology,
              love: Number(parsed.planPrices.love) > 0 ? Number(parsed.planPrices.love) : DEFAULT_PLAN_PRICES.love,
              full: Number(parsed.planPrices.full) > 0 ? Number(parsed.planPrices.full) : DEFAULT_PLAN_PRICES.full,
            });
          }
          if (parsed.siteBackground) {
            setSiteBackground((prev) => {
              const incoming = normalizeSiteBg(parsed.siteBackground);
              if (!incoming.videoUrl && prev.videoUrl) {
                return { ...incoming, videoUrl: prev.videoUrl };
              }
              return incoming;
            });
          }
          if (Array.isArray(parsed.menuOrder)) {
            setMenuOrder(normalizeMenuOrder(parsed.menuOrder));
          }
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('mystic_shop_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mystic_shop_updated', handleStorage);
    };
  }, [refreshShop]);

  const updateSiteBackground = useCallback(
    async (newBg: Partial<SiteBackgroundConfig>): Promise<SiteBackgroundConfig> => {
      setIsLoading(true);
      const updated = normalizeSiteBg({ ...siteBackground, ...newBg });
      setSiteBackground(updated);
      persistLocal(shopEnabled, items, planPrices, updated, menuOrder);

      try {
        const res = await fetch('/api/site-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'mystic2026',
          },
          body: JSON.stringify({ siteBackground: updated }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.siteBackground) {
            const serverBg = normalizeSiteBg(data.siteBackground);
            setSiteBackground(serverBg);
            persistLocal(shopEnabled, items, planPrices, serverBg, menuOrder);
            return serverBg;
          }
        }
      } catch (err) {
        console.warn('Could not sync site background to server:', err);
      } finally {
        setIsLoading(false);
      }
      return updated;
    },
    [siteBackground, shopEnabled, items, planPrices, menuOrder]
  );

  const updateMenuOrder = useCallback(
    async (newOrder: MenuOrderItem[]): Promise<MenuOrderItem[]> => {
      setIsLoading(true);
      const updated = normalizeMenuOrder(newOrder);
      setMenuOrder(updated);
      persistLocal(shopEnabled, items, planPrices, siteBackground, updated);

      try {
        const res = await fetch('/api/menu-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'mystic2026',
          },
          body: JSON.stringify({ menuOrder: updated }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.menuOrder)) {
            const serverOrder = normalizeMenuOrder(data.menuOrder);
            setMenuOrder(serverOrder);
            persistLocal(shopEnabled, items, planPrices, siteBackground, serverOrder);
            return serverOrder;
          }
        }
      } catch (err) {
        console.warn('Could not sync menu order to server:', err);
      } finally {
        setIsLoading(false);
      }
      return updated;
    },
    [shopEnabled, items, planPrices, siteBackground]
  );

  const updatePlanPrices = useCallback(
    async (newPrices: Partial<PlanPrices>) => {
      const updated: PlanPrices = {
        numerology:
          newPrices.numerology !== undefined && Number(newPrices.numerology) >= 0
            ? Number(newPrices.numerology)
            : planPrices.numerology,
        love:
          newPrices.love !== undefined && Number(newPrices.love) >= 0
            ? Number(newPrices.love)
            : planPrices.love,
        full:
          newPrices.full !== undefined && Number(newPrices.full) >= 0
            ? Number(newPrices.full)
            : planPrices.full,
      };
      setPlanPrices(updated);
      persistLocal(shopEnabled, items, updated, siteBackground, menuOrder);

      try {
        const res = await fetch('/api/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'mystic2026',
          },
          body: JSON.stringify({ planPrices: updated }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.planPrices) {
            setPlanPrices(data.planPrices);
            persistLocal(shopEnabled, items, data.planPrices, siteBackground, menuOrder);
          }
        }
      } catch (err) {
        console.warn('Could not sync plan prices to server:', err);
      }
    },
    [planPrices, shopEnabled, items, siteBackground, menuOrder]
  );

  const toggleShopEnabled = useCallback(
    async (enabled?: boolean) => {
      const target = typeof enabled === 'boolean' ? enabled : !shopEnabled;
      setShopEnabled(target);
      persistLocal(target, items, planPrices, siteBackground, menuOrder);

      try {
        const res = await fetch('/api/shop/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'mystic2026',
          },
          body: JSON.stringify({ shopEnabled: target }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setShopEnabled(data.shopEnabled);
            setItems(data.items);
            persistLocal(data.shopEnabled, data.items, data.planPrices || planPrices, siteBackground, menuOrder);
          }
        }
      } catch (err) {
        console.warn('Could not sync shop toggle to server:', err);
      }
    },
    [shopEnabled, items, planPrices, siteBackground, menuOrder]
  );

  const saveShopItem = useCallback(
    async (item: Partial<ShopItem> & { title: string; price: number }): Promise<ShopItem | null> => {
      setIsLoading(true);
      try {
        const categoryMap: Record<string, string> = {
          physical: 'Бодит бүтээгдэхүүн',
          digital: 'Цахим контент',
          consultation: 'Хувийн зөвлөгөө',
        };
        const cat = item.category || 'physical';
        const optimisticItem: ShopItem = {
          id: item.id || `item_${Date.now()}`,
          title: item.title.trim(),
          category: cat,
          categoryLabel: item.categoryLabel || categoryMap[cat] || 'Бодит бүтээгдэхүүн',
          price: Number(item.price) || 0,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
          badge: item.badge?.trim() || undefined,
          description: item.description?.trim() || '',
          features: Array.isArray(item.features) ? item.features.filter(Boolean) : [],
          imageUrl:
            item.imageUrl ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        };

        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === optimisticItem.id);
          const next = idx >= 0 ? prev.map((it, k) => (k === idx ? optimisticItem : it)) : [optimisticItem, ...prev];
          persistLocal(shopEnabled, next, planPrices, siteBackground, menuOrder);
          return next;
        });

        const res = await fetch('/api/shop/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'mystic2026',
          },
          body: JSON.stringify({ item: optimisticItem }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItems(data.items);
            persistLocal(data.shopEnabled, data.items, planPrices, siteBackground, menuOrder);
            return data.item || optimisticItem;
          }
        }
        return optimisticItem;
      } catch (err) {
        console.warn('Error saving shop item:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [shopEnabled, planPrices, siteBackground, menuOrder]
  );

  const deleteShopItem = useCallback(
    async (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        persistLocal(shopEnabled, next, planPrices, siteBackground, menuOrder);
        return next;
      });

      try {
        const res = await fetch(`/api/shop/items/${id}`, {
          method: 'DELETE',
          headers: { 'x-admin-token': 'mystic2026' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItems(data.items);
            persistLocal(data.shopEnabled, data.items, planPrices, siteBackground, menuOrder);
          }
        }
      } catch (err) {
        console.warn('Error deleting shop item:', err);
      }
    },
    [shopEnabled, planPrices, siteBackground, menuOrder]
  );

  return (
    <ShopContext.Provider
      value={{
        shopEnabled,
        items,
        planPrices,
        siteBackground,
        menuOrder,
        isLoading,
        toggleShopEnabled,
        saveShopItem,
        deleteShopItem,
        updatePlanPrices,
        updateSiteBackground,
        updateMenuOrder,
        formatPrice,
        formatShortPrice,
        refreshShop,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
};

