import React from 'react';
import { getCardCoreIdea } from '../data/tarotData';

// Ornate Gold Foil & Midnight Navy Tarot Cards Fan (exact visual from Screenshot 2)
export const DarkGoldTarotFan: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative w-[300px] sm:w-[360px] h-[340px] sm:h-[400px] flex items-center justify-center select-none ${className}`}>
      {/* Glow aura behind cards */}
      <div className="absolute inset-0 bg-[#E8C582]/15 rounded-full blur-[60px] pointer-events-none" />

      {/* Card 1: Left tilted card */}
      <div className="absolute left-2 sm:left-4 w-48 sm:w-56 h-72 sm:h-84 rounded-2xl bg-[#0F1622] border border-[#DEB76A]/45 shadow-2xl transform -rotate-15 -translate-y-2 hover:-rotate-12 transition-transform duration-300 overflow-hidden flex flex-col justify-between p-3.5">
        <TarotCardInnerFoil roman="XVII" label="THE STAR" />
      </div>

      {/* Card 2: Center card */}
      <div className="absolute z-10 w-48 sm:w-56 h-72 sm:h-84 rounded-2xl bg-[#0D141F] border-2 border-[#E5C175]/60 shadow-[0_20px_45px_-10px_rgba(30,15,20,0.5)] hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col justify-between p-3.5">
        <TarotCardInnerFoil roman="XIX" label="THE SUN" isCenter />
      </div>

      {/* Card 3: Right tilted card */}
      <div className="absolute right-2 sm:right-4 w-48 sm:w-56 h-72 sm:h-84 rounded-2xl bg-[#0F1622] border border-[#DEB76A]/45 shadow-2xl transform rotate-15 translate-y-3 hover:rotate-12 transition-transform duration-300 overflow-hidden flex flex-col justify-between p-3.5">
        <TarotCardInnerFoil roman="X" label="WHEEL OF FORTUNE" />
      </div>
    </div>
  );
};

// Intricate Gold foil artwork inside card
const TarotCardInnerFoil: React.FC<{ roman: string; label: string; isCenter?: boolean }> = ({
  roman,
  label,
  isCenter = false,
}) => {
  return (
    <div className="w-full h-full rounded-xl border border-[#D8B062]/35 relative flex flex-col justify-between p-2.5 overflow-hidden">
      {/* Corner filigrees */}
      <div className="absolute top-1.5 left-1.5 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute top-1.5 right-1.5 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute bottom-1.5 left-1.5 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute bottom-1.5 right-1.5 text-[#E6C376]/80 text-[10px]">✦</div>

      {/* Top Roman numeral */}
      <div className="text-center">
        <span className="text-[10px] font-serif tracking-[0.25em] text-[#E8C582] font-semibold">
          {roman}
        </span>
      </div>

      {/* Center Sacred Sun / Moon / Orbit Mandala */}
      <div className="relative my-auto flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-32 sm:w-36 h-32 sm:h-36 text-[#E6C275] stroke-current fill-none">
          {/* Outer dotted orbit */}
          <circle cx="80" cy="80" r="70" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6" />
          <circle cx="80" cy="80" r="62" strokeWidth="0.8" opacity="0.8" />
          <circle cx="80" cy="80" r="46" strokeWidth="0.75" strokeDasharray="2,2" opacity="0.7" />

          {/* Crescent moons on top and bottom */}
          <path d="M 80 18 A 12 12 0 0 0 80 42 A 8 8 0 0 1 80 18" className="fill-[#E8C582]" />
          <path d="M 80 142 A 12 12 0 0 0 80 118 A 8 8 0 0 1 80 142" className="fill-[#E8C582]" />
          <path d="M 18 80 A 12 12 0 0 0 42 80 A 8 8 0 0 1 18 80" className="fill-[#E8C582]" />
          <path d="M 142 80 A 12 12 0 0 0 118 80 A 8 8 0 0 1 142 80" className="fill-[#E8C582]" />

          {/* Radiant Sunburst rays */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <line
                key={i}
                x1="80"
                y1="80"
                x2="80"
                y2={i % 2 === 0 ? "46" : "52"}
                strokeWidth={i % 2 === 0 ? "1.2" : "0.75"}
                transform={`rotate(${angle} 80 80)`}
                opacity={isCenter ? "0.95" : "0.8"}
              />
            );
          })}

          {/* Central radiant star */}
          <circle cx="80" cy="80" r="14" className="fill-[#0D141F]" strokeWidth="1" />
          <circle cx="80" cy="80" r="7" className="fill-[#E8C582]" />
        </svg>
      </div>

      {/* Bottom title */}
      <div className="text-center border-t border-[#D8B062]/25 pt-1">
        <span className="text-[9px] font-serif tracking-[0.2em] text-[#E8C582]/90 uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};

import { TarotArtwork } from './TarotArtwork';
import { useCustomCards } from '../context/CustomCardsContext';

// Tarot card back with dark luxury gold design and image support
export const TarotCardBack: React.FC<{ className?: string; imageSrc?: string }> = ({
  className = "w-full h-full",
  imageSrc
}) => {
  let customCardsHook: ReturnType<typeof useCustomCards> | null = null;
  try {
    customCardsHook = useCustomCards();
  } catch {}

  const effectiveSrc = customCardsHook?.getCardImage('back', imageSrc || "/tarot/card-back.png") || imageSrc || "/tarot/card-back.png";
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [effectiveSrc]);

  return (
    <div
      className={`relative rounded-2xl border border-[#DEB76A]/50 bg-gradient-to-br from-[#121A26] via-[#0E1520] to-[#0A0F17] overflow-hidden shadow-2xl flex flex-col justify-between items-center text-center select-none ${className}`}
    >
      {!imgFailed ? (
        <img
          src={effectiveSrc}
          alt="Tarot Card Back"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full p-2.5 flex flex-col justify-between items-center">
          <div className="text-[9px] tracking-[0.25em] text-[#E8C582]/80 uppercase font-serif mt-1">
            ☾ MYSTIC ☽
          </div>
          <div className="relative my-auto flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#E6C275]/85 stroke-current fill-none">
              <circle cx="50" cy="50" r="44" strokeWidth="0.75" strokeDasharray="2,2" />
              <circle cx="50" cy="50" r="38" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="28" strokeWidth="0.6" strokeDasharray="3,2" />
              <polygon points="50,14 81,68 19,68" strokeWidth="0.75" />
              <polygon points="50,86 81,32 19,32" strokeWidth="0.75" />
              <circle cx="50" cy="50" r="7" className="fill-[#E8C582]/30" />
              <path d="M 50 43 A 7 7 0 0 0 50 57 A 5 5 0 0 1 50 43" className="fill-[#E8C582]" />
            </svg>
          </div>
          <div className="text-[8px] tracking-widest text-[#E8C582]/70 mb-1 font-serif">
            TAROT DECK
          </div>
        </div>
      )}
      <div className="absolute inset-1.5 rounded-xl border border-[#DEB76A]/30 pointer-events-none" />
      <div className="absolute top-2 left-2 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute top-2 right-2 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute bottom-2 left-2 text-[#E6C376]/80 text-[10px]">✦</div>
      <div className="absolute bottom-2 right-2 text-[#E6C376]/80 text-[10px]">✦</div>
    </div>
  );
};

export const TarotCardFront: React.FC<{
  name: string;
  image?: string;
  number?: string | number;
  cardId?: number;
  keywords?: string[];
  isUpright?: boolean;
  element?: string;
  symbolism?: string;
  className?: string;
  showOverlayName?: boolean;
}> = ({
  name,
  image,
  number,
  cardId,
  keywords = [],
  isUpright = true,
  element,
  symbolism,
  className = "w-full h-full",
  showOverlayName = false,
}) => {
  const numericId = typeof cardId === 'number' ? cardId : typeof number === 'number' ? number : 0;
  const [imgError, setImgError] = React.useState(false);

  let customCardsHook: ReturnType<typeof useCustomCards> | null = null;
  try {
    customCardsHook = useCustomCards();
  } catch {}

  const activeImage = customCardsHook
    ? customCardsHook.getCardImage(numericId, image)
    : image;

  React.useEffect(() => {
    setImgError(false);
  }, [activeImage]);

  return (
    <div
      className={`relative w-full h-full rounded-2xl border border-[#DEB76A]/60 bg-[#0C121D] overflow-hidden shadow-2xl transition-all duration-300 text-[#F5EBE6] select-none flex flex-col justify-between ${className}`}
    >
      {/* 100% Full-bleed background card artwork, rotated 180deg if reversed */}
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-500 overflow-hidden ${
          !isUpright ? 'rotate-180' : ''
        }`}
      >
        {activeImage && !imgError ? (
          <img
            src={activeImage}
            alt={name}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-[#162130] to-[#0A1018]">
            <TarotArtwork cardId={numericId} className="w-full h-full text-[#E8C582]" />
          </div>
        )}
      </div>

      {/* Four gold corner celestial stars */}
      <div className="absolute top-2 left-2 text-[#E6C376]/90 text-[10px] pointer-events-none z-20 drop-shadow">✦</div>
      <div className="absolute top-2 right-2 text-[#E6C376]/90 text-[10px] pointer-events-none z-20 drop-shadow">✦</div>
      <div className="absolute bottom-2 left-2 text-[#E6C376]/90 text-[10px] pointer-events-none z-20 drop-shadow">✦</div>
      <div className="absolute bottom-2 right-2 text-[#E6C376]/90 text-[10px] pointer-events-none z-20 drop-shadow">✦</div>

      {/* Top Overlay Badge: Roman / Arcana Number and Element */}
      <div className="relative z-20 flex items-center justify-between p-2.5 pointer-events-none">
        {number !== undefined && (
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-[#DEB76A]/40 text-[10px] sm:text-[11px] font-serif tracking-widest text-[#E8C582] font-bold shadow-sm">
            {`N° ${number}`}
          </span>
        )}
        {element && (
          <span className="ml-auto px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-[#DEB76A]/30 text-[9px] sm:text-[10px] text-[#DEC5A0] tracking-wide font-sans shadow-sm">
            {element}
          </span>
        )}
      </div>

      {/* Optional bottom overlay gradient ONLY if explicitly requested and not handled externally */}
      {showOverlayName && (
        <div className="relative z-20 mt-auto pt-7 pb-2 px-2 bg-gradient-to-t from-black/95 via-black/65 to-transparent flex flex-col items-center pointer-events-none">
          <h4 className="text-[11px] sm:text-xs font-serif font-bold text-[#FFF6F2] tracking-wide text-center drop-shadow-md leading-tight px-1 break-words">
            {name}
          </h4>
          <div className="mt-1 text-[9px] sm:text-[10px] text-[#E8C582] font-sans font-medium text-center leading-tight drop-shadow-sm">
            {getCardCoreIdea(numericId, isUpright)}
          </div>
        </div>
      )}
    </div>
  );
};

import { ConstellationCanvas } from './ConstellationCanvas';

// Full width Celestial Hero Background Graphic matching Screenshot 1 with dynamic golden constellations
export const CelestialHeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Soft warm nebula clouds */}
      <div className="absolute top-0 left-0 right-0 h-full bg-mystic-sky opacity-95" />
      <div className="absolute inset-0 bg-nebula-clouds opacity-80" />

      {/* Soft golden crescent moon in the center background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] opacity-25">
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#A86E58] fill-current">
          <path d="M 100 10 A 90 90 0 0 0 100 190 A 74 74 0 0 1 100 10" />
        </svg>
      </div>

      {/* Interactive & smooth golden constellation canvas layer */}
      <div className="absolute inset-0 pointer-events-auto">
        <ConstellationCanvas />
      </div>
    </div>
  );
};
