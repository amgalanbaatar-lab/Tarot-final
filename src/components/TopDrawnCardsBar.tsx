import React from 'react';
import { useReading } from '../context/ReadingContext';
import { TarotCardFront } from './MysticVisuals';
import { Sparkles, HelpCircle, RotateCw } from 'lucide-react';
import { mysticAudio } from '../utils/audio';

interface TopDrawnCardsBarProps {
  onNavigateToFree?: () => void;
  showShuffleButton?: boolean;
}

export const TopDrawnCardsBar: React.FC<TopDrawnCardsBarProps> = ({
  onNavigateToFree,
  showShuffleButton = false,
}) => {
  const { cards, userQuestion, drawCards } = useReading();

  const handleShuffle = () => {
    mysticAudio.playCardShuffle();
    drawCards();
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full mb-8 rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-6 sm:p-8 text-[#2A1118] shadow-md text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E8C582]/30 border border-[#D4AF37]/50 flex items-center justify-center text-[#8E441D] mx-auto">
          <Sparkles className="w-6 h-6 text-[#8E441D]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-mystic font-bold text-[#2A1118]">
            Та 3 хөзрөө хараахан сонгоогүй байна
          </h2>
          <p className="text-xs sm:text-sm text-[#542B34] max-w-lg mx-auto">
            Хөзөр сонгох ширээнээс өөрийн зөн совингоор 3 хөзөр сонгох эсвэл шууд санамсаргүй 3 хөзөр татна уу.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {onNavigateToFree && (
            <button
              type="button"
              onClick={onNavigateToFree}
              className="px-5 py-2.5 rounded-full bg-[#8E441D] hover:bg-[#783715] text-white text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Хөзөр сонгох ширээнээс сонгох
            </button>
          )}
          <button
            type="button"
            onClick={handleShuffle}
            className="px-5 py-2.5 rounded-full border border-[#D4AF37]/60 bg-white/90 hover:bg-white text-[#2A1118] text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#8E441D]" />
            <span>Шууд 3 хөзөр татах</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8 rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-5 sm:p-7 text-[#2A1118] shadow-xl relative overflow-hidden">
      {/* Background celestial glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E8C582]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Single Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/30 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E8C582]/30 flex items-center justify-center text-[#8E441D]">
            <Sparkles className="w-4 h-4 text-[#8E441D]" />
          </div>
          <h2 className="text-lg sm:text-xl font-mystic font-bold text-[#2A1118]">
            Сонгосон 3 хөзрийн байрлал
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showShuffleButton ? (
            <button
              type="button"
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/50 bg-white/80 hover:bg-white text-xs text-[#6D3B47] font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#8E441D]" />
              <span>Хөзөр солих</span>
            </button>
          ) : onNavigateToFree ? (
            <button
              type="button"
              onClick={onNavigateToFree}
              className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/50 bg-white/80 hover:bg-white text-xs text-[#6D3B47] font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#8E441D]" />
              <span>Шинээр сонгох</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* User question strip if available */}
      {userQuestion && userQuestion.trim() && (
        <div className="mt-3.5 p-3 rounded-xl bg-white/80 border border-[#D4AF37]/35 flex items-start gap-2.5 text-xs text-[#542B34] relative z-10">
          <HelpCircle className="w-4 h-4 text-[#8E441D] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#8E441D] uppercase text-[10px] tracking-wider mr-1">
              Таны асуулт:
            </span>
            <span className="italic text-[#2A1118]">"{userQuestion.trim()}"</span>
          </div>
        </div>
      )}

      {/* 3 Cards Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 pt-5 relative z-10">
        {cards.map((item, index) => {
          const { card, isUpright, position } = item;
          return (
            <div
              key={`${card.id}-${index}`}
              className="flex flex-col items-center rounded-2xl border-2 border-[#D4AF37] bg-white overflow-hidden shadow-xl transition-all group min-h-[380px] sm:min-h-[440px] relative"
            >
              {/* 100% Full Bleed Large Card Image extending to all edges including bottom */}
              <div className="absolute inset-0 w-full h-full">
                <TarotCardFront
                  name={card.name}
                  image={card.image}
                  number={card.number}
                  cardId={card.id}
                  isUpright={isUpright}
                  element={card.element}
                  className="w-full h-full rounded-2xl"
                  showOverlayName={false}
                />
              </div>

              {/* Floating Position Pill */}
              <div className="absolute top-2.5 left-2.5 z-30 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#DEB76A]/60 shadow-md flex items-center gap-1.5 pointer-events-none">
                <span className="text-[11px] font-serif font-bold text-[#F5D77F] tracking-wide">
                  {position}
                </span>
              </div>

              {/* Floating Orientation Badge (Upright vs Reversed) */}
              <div
                className={`absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-md flex items-center gap-1 pointer-events-none text-[10px] font-serif font-bold tracking-wide ${
                  isUpright
                    ? 'bg-emerald-950/85 border-emerald-400/50 text-emerald-200'
                    : 'bg-amber-950/90 border-amber-400/60 text-amber-200'
                }`}
              >
                <span>{isUpright ? '✨ Эгц' : '🔄 Урвуу'}</span>
              </div>

              {/* Seamless Bottom Label with NO solid frame/box, image extends all the way to bottom edge */}
              <div className="absolute inset-x-0 bottom-0 z-20 pt-10 pb-3.5 px-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent text-center space-y-0.5 pointer-events-none">
                <h4 className="text-sm sm:text-base font-mystic font-bold text-[#FFF5F2] truncate drop-shadow-md">
                  {card.name}
                </h4>
                <p className="text-[11px] text-[#E8C582] font-serif font-bold drop-shadow-sm">
                  {card.nameEn || card.name} · {isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
