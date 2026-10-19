import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TAROT_DECK, CARD_BACK_IMAGE } from '../data/tarotData';
import { optimizeCardImage } from '../utils/imageCompressor';

const LOCAL_STORAGE_KEY = 'mystic_custom_tarot_cards';
const ADMIN_STORAGE_KEY = 'mystic_admin_auth_session';
const VALID_ADMIN_PASSWORDS = ['mystic2026', 'admin8888', 'mystic'];

interface CustomCardsContextType {
  customCards: Record<string, string>;
  getCardImage: (cardId: number | string, defaultImage?: string) => string;
  isCardCustomized: (cardId: number | string) => boolean;
  cardBackImage: string;
  isCardBackCustomized: boolean;
  customizedCount: number;
  saveCardImage: (cardId: number | string, fileOrDataUrl: File | string) => Promise<string>;
  removeCardImage: (cardId: number | string) => Promise<void>;
  saveCardBackImage: (fileOrDataUrl: File | string) => Promise<string>;
  removeCardBackImage: () => Promise<void>;
  resetAllCards: () => Promise<void>;
  exportDeck: () => void;
  importDeck: (file: File) => Promise<number>;
  isCustomizerOpen: boolean;
  openCustomizer: (targetCardId?: number | 'back') => void;
  openCardBackCustomizer: () => void;
  closeCustomizer: () => void;
  focusedCardId: number | 'back' | null;
  isLoading: boolean;
  isAdmin: boolean;
  verifyAdminPassword: (password: string) => boolean;
  logoutAdmin: () => void;
}

const CustomCardsContext = createContext<CustomCardsContextType | null>(null);

function checkAdminAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'authenticated' ||
    localStorage.getItem(ADMIN_STORAGE_KEY) === 'authenticated'
  );
}

export const CustomCardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkAdminAuth());
  const [customCards, setCustomCards] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [focusedCardId, setFocusedCardId] = useState<number | 'back' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check admin session periodically or on storage change
  useEffect(() => {
    const check = () => setIsAdmin(checkAdminAuth());
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const verifyAdminPassword = useCallback((password: string): boolean => {
    if (VALID_ADMIN_PASSWORDS.includes(password.trim())) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
      localStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  // Sync with server on initial mount
  useEffect(() => {
    let isMounted = true;
    async function fetchServerCards() {
      try {
        const res = await fetch('/api/custom-cards');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.customCards && isMounted) {
            setCustomCards((prev) => {
              const merged = { ...prev, ...data.customCards };
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync custom cards from server, using local store:', err);
      }
    }
    fetchServerCards();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCustomizer = useCallback((targetCardId?: number | 'back') => {
    if (targetCardId !== undefined) {
      setFocusedCardId(targetCardId);
    }
    setIsCustomizerOpen(true);
  }, []);

  const openCardBackCustomizer = useCallback(() => {
    setFocusedCardId('back');
    setIsCustomizerOpen(true);
  }, []);

  const closeCustomizer = useCallback(() => {
    setIsCustomizerOpen(false);
    setFocusedCardId(null);
  }, []);

  const getCardImage = useCallback(
    (cardId: number | string, defaultImage?: string): string => {
      const key = String(cardId);
      if (key === 'back' || key === 'card-back') {
        return customCards['back'] || customCards['card-back'] || defaultImage || CARD_BACK_IMAGE;
      }
      if (customCards[key]) {
        return customCards[key];
      }
      if (defaultImage) {
        return defaultImage;
      }
      const numId = Number(cardId);
      const card = TAROT_DECK.find((c) => c.id === numId);
      return card?.image || (customCards['back'] || customCards['card-back'] || CARD_BACK_IMAGE);
    },
    [customCards]
  );

  const cardBackImage = customCards['back'] || customCards['card-back'] || CARD_BACK_IMAGE;
  const isCardBackCustomized = Boolean(customCards['back'] || customCards['card-back']);

  const isCardCustomized = useCallback(
    (cardId: number | string): boolean => {
      const key = String(cardId);
      if (key === 'back' || key === 'card-back') {
        return Boolean(customCards['back'] || customCards['card-back']);
      }
      return Boolean(customCards[key]);
    },
    [customCards]
  );

  const customizedCount = Object.keys(customCards).filter((k) => k !== 'card-back').length;

  const saveCardImage = useCallback(
    async (cardId: number | string, fileOrDataUrl: File | string): Promise<string> => {
      setIsLoading(true);
      try {
        let imageData: string;
        if (fileOrDataUrl instanceof File) {
          imageData = await optimizeCardImage(fileOrDataUrl);
        } else {
          imageData = fileOrDataUrl;
        }

        const key = String(cardId);

        // Optimistically update local state immediately
        setCustomCards((prev) => {
          const updated = { ...prev, [key]: imageData };
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage full, falling back to memory/server:', e);
          }
          return updated;
        });

        // Save to backend server API
        try {
          const res = await fetch('/api/custom-cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': 'mystic2026',
            },
            body: JSON.stringify({ cardId, imageData }),
          });
          if (res.ok) {
            const result = await res.json();
            if (result.imageUrl) {
              setCustomCards((prev) => {
                const updated = { ...prev, [key]: result.imageUrl };
                try {
                  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
              return result.imageUrl;
            }
          }
        } catch (serverErr) {
          console.warn('Server upload fallback to local dataUrl:', serverErr);
        }

        return imageData;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeCardImage = useCallback(
    async (cardId: number | string): Promise<void> => {
      const key = String(cardId);
      setCustomCards((prev) => {
        const next = { ...prev };
        delete next[key];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await fetch(`/api/custom-cards/${cardId}`, {
          method: 'DELETE',
          headers: { 'x-admin-token': 'mystic2026' },
        });
      } catch (err) {
        console.warn('Failed to delete on server:', err);
      }
    },
    []
  );

  const resetAllCards = useCallback(async (): Promise<void> => {
    setCustomCards({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    try {
      await fetch('/api/custom-cards', {
        method: 'DELETE',
        headers: { 'x-admin-token': 'mystic2026' },
      });
    } catch (err) {
      console.warn('Failed to reset all cards on server:', err);
    }
  }, []);

  const exportDeck = useCallback(() => {
    const dataStr = JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        customCards,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mystic-tarot-deck-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customCards]);

  const importDeck = useCallback(
    async (file: File): Promise<number> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            const cardsToImport = parsed.customCards || parsed;
            if (typeof cardsToImport !== 'object' || cardsToImport === null) {
              throw new Error('Файлын бүтэц буруу байна.');
            }

            const count = Object.keys(cardsToImport).length;
            setCustomCards(cardsToImport);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardsToImport));
            } catch {}

            // Save entries to server
            for (const [cardId, imageData] of Object.entries(cardsToImport)) {
              if (typeof imageData === 'string') {
                try {
                  await fetch('/api/custom-cards', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-admin-token': 'mystic2026',
                    },
                    body: JSON.stringify({ cardId, imageData }),
                  });
                } catch {}
              }
            }

            resolve(count);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Файл уншихад алдаа гарлаа.'));
        reader.readAsText(file);
      });
    },
    []
  );

  const saveCardBackImage = useCallback(
    async (fileOrDataUrl: File | string): Promise<string> => {
      return saveCardImage('back', fileOrDataUrl);
    },
    [saveCardImage]
  );

  const removeCardBackImage = useCallback(async (): Promise<void> => {
    await removeCardImage('back');
  }, [removeCardImage]);

  return (
    <CustomCardsContext.Provider
      value={{
        customCards,
        getCardImage,
        isCardCustomized,
        cardBackImage,
        isCardBackCustomized,
        customizedCount,
        saveCardImage,
        removeCardImage,
        saveCardBackImage,
        removeCardBackImage,
        resetAllCards,
        exportDeck,
        importDeck,
        isCustomizerOpen,
        openCustomizer,
        openCardBackCustomizer,
        closeCustomizer,
        focusedCardId,
        isLoading,
        isAdmin,
        verifyAdminPassword,
        logoutAdmin,
      }}
    >
      {children}
    </CustomCardsContext.Provider>
  );
};

export function useCustomCards(): CustomCardsContextType {
  const context = useContext(CustomCardsContext);
  if (!context) {
    throw new Error('useCustomCards must be used within a CustomCardsProvider');
  }
  return context;
}
