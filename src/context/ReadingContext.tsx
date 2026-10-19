import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DrawnCard } from '../components/TarotShuffleDeck';
import { TAROT_DECK, TarotCard } from '../data/tarotData';
import { getUserOrderStatus, consumePlanOrder } from '../types/order';

export type OrderStatusType = 'none' | 'pending' | 'active' | 'rejected' | 'consumed';

export interface SavedReadingRecord {
  id: string;
  date: string;
  cards: string[];
  cardIds?: number[];
  summary: string;
  type: string;
  category?: 'tarot' | 'love' | 'full' | 'numerology' | 'horoscope';
  details?: Record<string, any>;
}

export function saveReadingToHistory(record: SavedReadingRecord) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('mystic_readings_history');
    const history: SavedReadingRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = history.filter((item) => item.id !== record.id);
    const updated = [record, ...filtered].slice(0, 60);
    localStorage.setItem('mystic_readings_history', JSON.stringify(updated));
    window.dispatchEvent(new Event('mystic_history_updated'));
  } catch (err) {
    console.error('Error saving reading to history:', err);
  }
}

export interface ReadingContextType {
  cards: DrawnCard[];
  setCards: (cards: DrawnCard[]) => void;
  userQuestion: string;
  setUserQuestion: (q: string) => void;
  userBirthDate: string;
  setUserBirthDate: (d: string) => void;
  hasDrawnCards: boolean;
  drawCards: () => DrawnCard[];
  resetCards: () => void;
  isNumerologyUnlocked: boolean;
  isLoveUnlocked: boolean;
  isVipUnlocked: boolean;
  isPaidLove: boolean;
  isPaidVip: boolean;
  numerologyOrderStatus: OrderStatusType;
  loveOrderStatus: OrderStatusType;
  vipOrderStatus: OrderStatusType;
  refreshOrderStatus: () => void;
  consumeReadingAccess: (planId: 'numerology' | 'love' | 'full', readingId?: string) => void;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

const STORAGE_KEY_CARDS = 'mystic_selected_3_cards_v3';
const STORAGE_KEY_QUESTION = 'mystic_user_question';
const STORAGE_KEY_BIRTHDATE = 'mystic_user_birthdate';

export function getDefault3Cards(): DrawnCard[] {
  return [
    {
      card: TAROT_DECK[0], // The Fool
      isUpright: true,
      position: '01. Өнгөрсөн суурь',
      isRevealed: true,
    },
    {
      card: TAROT_DECK[1], // The Magician
      isUpright: false,
      position: '02. Одоо цагийн нөхцөл',
      isRevealed: true,
    },
    {
      card: TAROT_DECK[19], // The Sun
      isUpright: true,
      position: '03. Ирээдүйн чиг хандлага',
      isRevealed: true,
    },
  ];
}

export const ReadingProvider: React.FC<{ children: ReactNode; userEmail?: string | null }> = ({
  children,
  userEmail,
}) => {
  const [cards, setCardsState] = useState<DrawnCard[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 3) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  const [userQuestion, setUserQuestionState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEY_QUESTION) || '';
  });

  const [userBirthDate, setUserBirthDateState] = useState<string>(() => {
    if (typeof window === 'undefined') return '1998-04-12';
    return localStorage.getItem(STORAGE_KEY_BIRTHDATE) || '1998-04-12';
  });

  const [numerologyOrderStatus, setNumerologyOrderStatus] = useState<OrderStatusType>('none');
  const [loveOrderStatus, setLoveOrderStatus] = useState<OrderStatusType>('none');
  const [vipOrderStatus, setVipOrderStatus] = useState<OrderStatusType>('none');

  const refreshOrderStatus = () => {
    try {
      const nStatus = getUserOrderStatus('numerology', userEmail);
      const lStatus = getUserOrderStatus('love', userEmail);
      const vStatus = getUserOrderStatus('full', userEmail);
      setNumerologyOrderStatus(nStatus.status);
      setLoveOrderStatus(lStatus.status);
      setVipOrderStatus(vStatus.status);
    } catch {
      setNumerologyOrderStatus('none');
      setLoveOrderStatus('none');
      setVipOrderStatus('none');
    }
  };

  const consumeReadingAccess = (planId: 'numerology' | 'love' | 'full', readingId?: string) => {
    consumePlanOrder(planId, readingId, userEmail);
    refreshOrderStatus();
  };

  useEffect(() => {
    refreshOrderStatus();
    const handleStorageOrOrder = () => refreshOrderStatus();
    window.addEventListener('mystic_orders_updated', handleStorageOrOrder);
    window.addEventListener('storage', handleStorageOrOrder);
    return () => {
      window.removeEventListener('mystic_orders_updated', handleStorageOrOrder);
      window.removeEventListener('storage', handleStorageOrOrder);
    };
  }, [userEmail]);

  const setCards = (newCards: DrawnCard[]) => {
    setCardsState(newCards);
    try {
      if (newCards.length > 0) {
        localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(newCards.slice(0, 3)));
      } else {
        localStorage.removeItem(STORAGE_KEY_CARDS);
      }
    } catch {}
  };

  const setUserQuestion = (q: string) => {
    setUserQuestionState(q);
    try {
      localStorage.setItem(STORAGE_KEY_QUESTION, q);
    } catch {}
  };

  const setUserBirthDate = (d: string) => {
    setUserBirthDateState(d);
    try {
      localStorage.setItem(STORAGE_KEY_BIRTHDATE, d);
    } catch {}
  };

  const drawCards = (): DrawnCard[] => {
    const nowSeed = Date.now();
    const questionHash = (userQuestion || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3);
    const positions = ['01. Өнгөрсөн суурь', '02. Одоо цагийн нөхцөл', '03. Ирээдүйн чиг хандлага'];

    const newDrawn: DrawnCard[] = chosen.map((c, idx) => {
      const pulse = Math.sin(nowSeed * 0.001 + questionHash + c.id * 13 + idx * 7);
      const isUpright = (pulse + (Math.random() * 2 - 1)) > -0.15;
      return {
        card: c,
        isUpright,
        position: positions[idx],
        isRevealed: true,
      };
    });

    setCards(newDrawn);
    return newDrawn;
  };

  const resetCards = () => {
    setCards([]);
  };

  const isNumerologyUnlocked = numerologyOrderStatus === 'active' || vipOrderStatus === 'active';
  const isLoveUnlocked = loveOrderStatus === 'active' || vipOrderStatus === 'active';
  const isVipUnlocked = vipOrderStatus === 'active';
  const hasDrawnCards = cards.length === 3 && cards.every((c) => c.isRevealed);

  return (
    <ReadingContext.Provider
      value={{
        cards,
        setCards,
        userQuestion,
        setUserQuestion,
        userBirthDate,
        setUserBirthDate,
        hasDrawnCards,
        drawCards,
        resetCards,
        isNumerologyUnlocked,
        isLoveUnlocked,
        isVipUnlocked,
        isPaidLove: isLoveUnlocked,
        isPaidVip: isVipUnlocked,
        numerologyOrderStatus,
        loveOrderStatus,
        vipOrderStatus,
        refreshOrderStatus,
        consumeReadingAccess,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = (): ReadingContextType => {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error('useReading must be used within a ReadingProvider');
  }
  return context;
};
