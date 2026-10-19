import React from 'react';
import { useReading } from '../context/ReadingContext';
import { TarotCardFront } from './MysticVisuals';
import { Sparkles, RotateCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { mysticAudio } from '../utils/audio';

interface TopPersistentCardsBannerProps {
  onRedraw?: () => void;
  onNavigateToFree?: () => void;
}

export const TopPersistentCardsBanner: React.FC<TopPersistentCardsBannerProps> = ({
  onRedraw,
  onNavigateToFree,
}) => {
  const { cards, userQuestion, hasDrawnCards, drawCards } = useReading();

  const handleDrawNewCards = () => {
    mysticAudio.playChime(528, 1.5);
    drawCards();
    if (onRedraw) onRedraw();
  };

  return (
    <div className="w-full bg-[#1C0B16]/95 border-b border-[#E8BCB0]/30 shadow-md backdrop-blur-md relative z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
        {hasDrawnCards ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left: Summary title & user question */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4] shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#FADBD4]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#E8BCB0]">
                    Сонгогдсон 3 хөзөр
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Бэлэн</span>
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-mystic font-bold text-[#FFF5F2] line-clamp-1 max-w-md">
                  {userQuestion ? `"${userQuestion}"` : 'Амьдралын суурь чиг хандлага ба сонголт'}
                </h4>
              </div>
            </div>

            {/* Middle: 3 Card Preview Tray */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
              {cards.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl bg-[#291221]/80 border border-[#E8BCB0]/30 shadow-sm"
                >
                  <div className="w-8 sm:w-10 aspect-[2/3] rounded-md overflow-hidden shrink-0 border border-[#E8BCB0]/40 shadow-xs">
                    <TarotCardFront
                      name={item.card.name}
                      image={item.card.image}
                      number={item.card.number}
                      cardId={item.card.id}
                      keywords={item.card.keywords}
                      isUpright={item.isUpright}
                      element={item.card.element}
                      symbolism={item.card.symbolism}
                    />
                  </div>
                  <div className="min-w-0 pr-1 text-left">
                    <span className="text-[8px] sm:text-[9px] uppercase font-sans tracking-wider text-[#E8BCB0] block font-semibold truncate">
                      {item.position.replace(/^\d+\.\s*/, '')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-serif font-bold text-[#FFF5F2] block truncate">
                      {item.card.name}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                        item.isUpright
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.isUpright ? 'Шулуун' : 'Эргэсэн'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Quick action */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDrawNewCards}
                title="3 хөзөр дахин татах"
                className="px-3.5 py-1.5 rounded-lg border border-[#E8BCB0]/40 hover:border-[#E8BCB0] bg-[#E8BCB0]/10 hover:bg-[#E8BCB0]/20 text-[#FFF5F2] text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#E8BCB0]" />
                <span>Дахин татах</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Initial State */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/15 border border-[#E8BCB0]/30 flex items-center justify-center text-[#FADBD4]">
                <HelpCircle className="w-4 h-4 text-[#FADBD4]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#E8BCB0]">
                  ✦ ТАНЫ УНШЛАГЫН 3 ХӨЗӨР ✦
                </span>
                <p className="text-xs text-[#E4B5AA] font-sans">
                  Та 3 хөзрөө хараахан сонгоогүй байна. Доорх хэсэгт асуултаа тавьж хөзрөө сонгоорой.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-6 h-9 rounded border border-dashed border-[#E8BCB0]/50 flex items-center justify-center text-[9px] text-[#E8BCB0]">
                  1
                </div>
                <div className="w-6 h-9 rounded border border-dashed border-[#E8BCB0]/50 flex items-center justify-center text-[9px] text-[#E8BCB0]">
                  2
                </div>
                <div className="w-6 h-9 rounded border border-dashed border-[#E8BCB0]/50 flex items-center justify-center text-[9px] text-[#E8BCB0]">
                  3
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToFree) onNavigateToFree();
                  const target = document.getElementById('free-reading-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-1.5 rounded-lg bg-[#E8BCB0] hover:bg-[#f3cac0] text-[#1E0B16] text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Хөзөр сонгох
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
