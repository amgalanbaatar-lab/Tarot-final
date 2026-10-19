import React, { useState, useEffect } from 'react';
import { TAROT_DECK, CARD_BACK_IMAGE } from '../data/tarotData';
import { useCustomCards } from '../context/CustomCardsContext';

interface TarotArtworkProps {
  cardId: number;
  className?: string;
  cardName?: string; // Картын нэрээр зураг дуудах боломжтой болгох үүднээс
}

export const TarotArtwork: React.FC<TarotArtworkProps> = ({ cardId, className = "w-24 h-24", cardName }) => {
  let customCardsHook: ReturnType<typeof useCustomCards> | null = null;
  try {
    customCardsHook = useCustomCards();
  } catch {
    // If used outside provider
  }

  // 78 картын мэдээллийг TAROT_DECK-с дуудах
  const card = TAROT_DECK.find((c) => {
    if (c.id === cardId) return true;
    if (cardName) {
      const cleanName = cardName.trim().toLowerCase();
      return (
        c.nameEn.toLowerCase() === cleanName ||
        c.name.toLowerCase() === cleanName ||
        c.name.toLowerCase().includes(cleanName)
      );
    }
    return false;
  });

  const effectiveCardId = card?.id ?? cardId;
  const activeCustomSrc = customCardsHook
    ? customCardsHook.getCardImage(effectiveCardId, card?.image)
    : card?.image || CARD_BACK_IMAGE;

  const [imgSrc, setImgSrc] = useState(activeCustomSrc);

  useEffect(() => {
    setImgSrc(activeCustomSrc);
  }, [activeCustomSrc]);

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <img
        src={imgSrc}
        alt={card?.name || `Tarot Card ID ${cardId}`}
        onError={() => {
          if (imgSrc !== CARD_BACK_IMAGE) {
            setImgSrc(CARD_BACK_IMAGE);
          }
        }}
        className="w-full h-full object-cover rounded-md shadow-md transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};