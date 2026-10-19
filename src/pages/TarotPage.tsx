import React, { useState } from 'react';
import { TAROT_DECK, TarotCard, getCardDetailedSections } from '../data/tarotData';
import { TarotCardBack, TarotCardFront } from '../components/MysticVisuals';
import { RotateCw, Search, ArrowRight, CheckCircle2, Sparkles, Wand2, RotateCcw } from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { useCustomCards } from '../context/CustomCardsContext';

interface TarotPageProps {
  onStartReadingWithCards: (cards: { card: TarotCard; isUpright: boolean; position: string }[]) => void;
}

export const TarotPage: React.FC<TarotPageProps> = ({ onStartReadingWithCards }) => {
  const {
    getCardImage,
    isCardCustomized,
    cardBackImage,
  } = useCustomCards();

  const [spreadMode, setSpreadMode] = useState<'3cards' | '1card'>('3cards');
  const [drawnCards, setDrawnCards] = useState<{
    card: TarotCard;
    isUpright: boolean;
    position: string;
    isRevealed: boolean;
  }[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleStage, setShuffleStage] = useState<'idle' | 'split' | 'riffle' | 'fan'>('idle');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuit, setSelectedSuit] = useState<string>('all');
  const [previewCard, setPreviewCard] = useState<TarotCard | null>(null);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);

  const handleSpinDrawnCard = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    mysticAudio.playChime(639, 1.8);
    setSpinningIndex(idx);
    setTimeout(() => setSpinningIndex(null), 1600);
  };

  // Deal cards with multi-phase animation & sound
  const handleShuffleAndDeal = () => {
    setIsShuffling(true);
    setShuffleStage('split');
    mysticAudio.playCardShuffle();

    setTimeout(() => {
      setShuffleStage('riffle');
      mysticAudio.playCardShuffle();
    }, 500);

    setTimeout(() => {
      setShuffleStage('fan');
      mysticAudio.playCardFlip();
    }, 1000);

    setTimeout(() => {
      const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
      const count = spreadMode === '3cards' ? 3 : 1;
      const positions = spreadMode === '3cards'
        ? ['01. Өнгөрсөн үе (Өнгөрсөн туршлага)', '02. Одоо цаг (Одоогийн байдал)', '03. Ирээдүй (Цаашдын хандлага)']
        : ['Өдрийн зөвлөгөө'];

      const newDrawn = shuffled.slice(0, count).map((card, idx) => ({
        card,
        isUpright: Math.random() > 0.2,
        position: positions[idx],
        isRevealed: false,
      }));

      setDrawnCards(newDrawn);
      setIsShuffling(false);
      setShuffleStage('idle');
      mysticAudio.playChime(528, 2.2);
    }, 1600);
  };

  const handleRevealCard = (index: number) => {
    mysticAudio.playCardFlip();
    setDrawnCards((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isRevealed: true } : item))
    );
  };

  const handleRevealAll = () => {
    mysticAudio.playChime(639, 2);
    setDrawnCards((prev) => prev.map((item) => ({ ...item, isRevealed: true })));
  };

  const filteredCards = TAROT_DECK.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedSuit === 'custom') return matchesSearch && isCardCustomized(card.id);
    if (selectedSuit === 'all') return matchesSearch;
    if (selectedSuit === 'major') return matchesSearch && card.arcana === 'Major';
    return matchesSearch && card.suit === selectedSuit;
  });

  const allCardsRevealed = drawnCards.length > 0 && drawnCards.every((c) => c.isRevealed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl sm:text-5xl font-mystic font-bold text-[#230F16]">
          Таро Хөзрийн Уншлага
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Хөзөр холиод өөрийн асуултыг бодон 3 карт татаж, одоогийн болон ирээдүйн чиг хандлагаа энгийн, ойлгомжтой үгээр уншаарай.
        </p>
      </div>

      {/* Interactive Spread Area */}
      <section className="p-6 sm:p-12 rounded-3xl bg-[#FFF6F3]/90 border border-[#9C6E65]/35 shadow-xl space-y-10">
        {/* Spread Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#9C6E65]/20 pb-6">
          <div className="flex items-center gap-2 p-1 bg-white/70 rounded-full border border-[#9C6E65]/25">
            <button
              onClick={() => {
                setSpreadMode('3cards');
                setDrawnCards([]);
              }}
              className={`px-5 py-2 text-xs font-serif font-semibold rounded-full transition-all cursor-pointer ${
                spreadMode === '3cards'
                  ? 'bg-[#4D2630] text-white shadow-sm'
                  : 'text-[#5C3841] hover:text-[#2F171E]'
              }`}
            >
              3 Карт (Өнгөрсөн · Одоо · Ирээдүй)
            </button>
            <button
              onClick={() => {
                setSpreadMode('1card');
                setDrawnCards([]);
              }}
              className={`px-5 py-2 text-xs font-serif font-semibold rounded-full transition-all cursor-pointer ${
                spreadMode === '1card'
                  ? 'bg-[#4D2630] text-white shadow-sm'
                  : 'text-[#5C3841] hover:text-[#2F171E]'
              }`}
            >
              1 Карт (Өдрийн Зөвлөгөө)
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleShuffleAndDeal}
              disabled={isShuffling}
              className="px-6 py-2.5 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Хольж байна...' : 'Хөзөр хольж татах'}</span>
            </button>

            {drawnCards.length > 0 && !allCardsRevealed && !isShuffling && (
              <button
                onClick={handleRevealAll}
                className="px-4 py-2.5 rounded-full border border-[#8E5244] text-[#3D1E25] font-serif font-semibold text-xs uppercase tracking-wider hover:bg-[#8E5244]/10 transition-colors cursor-pointer"
              >
                Бүгдийг дэлгэх
              </button>
            )}
          </div>
        </div>

        {/* 3D Shuffling Animation Stage */}
        {isShuffling && (
          <div className="py-12 px-4 rounded-2xl bg-gradient-to-b from-[#16131B] via-[#0F1622] to-[#16131B] border border-[#DEB76A]/40 text-center relative overflow-hidden shadow-2xl animate-fadeIn">
            <div className="absolute inset-0 bg-[#E8C582]/10 blur-3xl pointer-events-none" />

            {/* Shuffling Deck Stack */}
            <div className="relative w-72 h-44 mx-auto flex items-center justify-center perspective-[1000px] mb-6">
              <div
                className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/60 bg-[#0E1520] shadow-2xl transition-all duration-500 transform ${
                  shuffleStage === 'split'
                    ? '-translate-x-16 rotate-[-18deg]'
                    : shuffleStage === 'riffle'
                    ? '-translate-x-4 rotate-[-6deg]'
                    : '-translate-x-12 rotate-[-12deg]'
                }`}
              >
                <TarotCardBack className="w-full h-full" />
              </div>

              <div
                className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/50 bg-[#121A26] shadow-xl transition-all duration-400 transform ${
                  shuffleStage === 'riffle' ? '-translate-y-4 rotate-[3deg]' : 'rotate-0'
                }`}
              >
                <TarotCardBack className="w-full h-full" />
              </div>

              <div
                className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/60 bg-[#0E1520] shadow-2xl transition-all duration-500 transform ${
                  shuffleStage === 'split'
                    ? 'translate-x-16 rotate-[18deg]'
                    : shuffleStage === 'riffle'
                    ? 'translate-x-4 rotate-[6deg]'
                    : 'translate-x-12 rotate-[12deg]'
                }`}
              >
                <TarotCardBack className="w-full h-full" />
              </div>

              <div className="absolute w-12 h-12 rounded-full bg-[#E8C582]/20 blur-xl animate-pulse" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#E8C582] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Хөзрүүд шинээр холигдож байна...</span>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <p className="text-xs text-[#DEC5A0] font-sans">
                {shuffleStage === 'split' && 'Таны энергийг мэдрэн хөзрүүдийг хувааж байна...'}
                {shuffleStage === 'riffle' && '78 хөзрийн энерги сүлжилдэн зохицож байна...'}
                {shuffleStage === 'fan' && 'Танд зориулсан хөзрүүд сонгогдож байна...'}
              </p>
            </div>
          </div>
        )}

        {/* Drawn Cards Display */}
        {!isShuffling && (
          <>
            {drawnCards.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-24 h-36 mx-auto rounded-xl border border-dashed border-[#8E5244]/50 bg-white/40 flex items-center justify-center text-3xl text-[#8E5244]">
                  ✦
                </div>
                <h3 className="text-xl font-mystic font-bold text-[#2F171E]">
                  Асуултаа сэтгэлдээ бодоод хөзрөө татна уу
                </h3>
                <p className="text-xs text-[#5C3841] max-w-md mx-auto">
                  Дээрх "Хөзөр хольж татах" товч дээр дарахад хөзрүүд дэлгэгдэх болно.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className={`grid gap-6 sm:gap-8 ${
                  spreadMode === '3cards' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 max-w-sm mx-auto'
                }`}>
                  {drawnCards.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-4">
                      <span className="text-xs uppercase font-serif tracking-widest text-[#4D2630] font-bold">
                        {item.position}
                      </span>

                      <div
                        onClick={() => !item.isRevealed && handleRevealCard(idx)}
                        className="w-56 h-84 relative cursor-pointer group"
                      >
                        {!item.isRevealed ? (
                          <div className="w-full h-full rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-xl">
                            <TarotCardBack />
                            <div className="absolute inset-x-0 bottom-4 flex justify-center">
                              <span className="text-[10px] text-white bg-[#4D2630] px-3.5 py-1 rounded-full font-serif font-bold uppercase tracking-wider shadow">
                                Дарж дэлгэх
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full animate-fadeIn shadow-2xl rounded-2xl overflow-hidden">
                            <TarotCardFront
                              name={item.card.name}
                              number={item.card.number}
                              cardId={item.card.id}
                              keywords={item.card.keywords}
                              isUpright={item.isUpright}
                              element={item.card.element}
                              symbolism={item.card.symbolism}
                            />
                          </div>
                        )}
                      </div>

                      {item.isRevealed && (
                        <div className="p-4 rounded-2xl bg-white border border-[#9C6E65]/25 text-center max-w-xs space-y-1.5 animate-fadeIn shadow-sm">
                          <div className="text-xs font-serif font-bold text-[#2F171E]">
                            {item.card.name}
                          </div>
                          <p className="text-xs text-[#523139] leading-relaxed">
                            {item.isUpright ? item.card.uprightMeaning : item.card.reversedMeaning}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {allCardsRevealed && (
                  <div className="pt-8 border-t border-[#9C6E65]/20 text-center space-y-4 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 text-xs text-[#3E2129] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Бүх картууд дэлгэгдлээ. Энэ уншлагыг хувийн дэлгэрэнгүй тайлал болгон нэгтгэх боломжтой.</span>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          onStartReadingWithCards(drawnCards);
                        }}
                        className="px-8 py-3.5 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>Эдгээр хөзрөөр хувийн бүрэн уншлага авах</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Tarot Encyclopedia */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#9C6E65]/20 pb-4">
          <div>
            <p className="text-xs uppercase font-serif tracking-widest text-[#8E5244] font-semibold">
              Цомог
            </p>
            <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E] mt-1">
              78 Хөзрийн Утга
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E5244] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Хөзрийн нэрээр хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-[#9C6E65]/30 rounded-xl pl-9 pr-4 py-2 text-xs text-[#2F171E] placeholder:text-[#9A7A80] focus:outline-none focus:border-[#8E5244]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/70 rounded-full border border-[#9C6E65]/25 overflow-x-auto">
              {[
                { id: 'all', label: 'Бүгд' },
                { id: 'major', label: 'Major Arcana' },
                { id: 'cups', label: 'Аяга' },
                { id: 'wands', label: 'Таяг' },
                { id: 'swords', label: 'Илд' },
                { id: 'pentacles', label: 'Зоос' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSuit(tab.id)}
                  className={`px-3 py-1.5 text-xs font-serif rounded-full transition-colors cursor-pointer ${
                    selectedSuit === tab.id
                      ? 'bg-[#4D2630] text-white font-bold'
                      : 'text-[#5C3841] hover:text-[#2F171E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCards.map((card) => {
            const cardImg = getCardImage(card.id, card.image);

            return (
              <div
                key={card.id}
                onClick={() => {
                  setPreviewCard(card);
                  mysticAudio.playChime(528, 1.2);
                }}
                className="group p-2.5 rounded-2xl bg-white/90 border border-[#9C6E65]/25 hover:border-[#8E5244] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-full aspect-[2/3] rounded-xl bg-[#0F1622] relative overflow-hidden border border-[#DEB76A]/40 group-hover:border-[#DEB76A]">
                  <img
                    src={cardImg}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Corner Number Badge */}
                  <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-[#E8C582] text-[9px] font-serif font-bold backdrop-blur-xs">
                      {card.romanNumeral || card.number}
                    </span>
                  </div>

                </div>

                <div className="mt-2 text-center">
                  <h4 className="text-xs font-serif font-bold text-[#2F171E] truncate">
                    {card.name}
                  </h4>
                  <p className="text-[10px] text-[#7A4E58] mt-0.5 truncate">
                    {card.nameEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Preview */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full rounded-3xl bg-[#FBF3F0] border border-[#9C6E65]/40 p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#2F171E]">
            <button
              onClick={() => setPreviewCard(null)}
              className="absolute top-5 right-5 text-[#6D424B] hover:text-[#2F171E] p-1.5 rounded-full border border-[#9C6E65]/30 bg-[#F4E4E0] cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-48 h-68 shrink-0 flex flex-col items-center gap-2">
                <TarotCardFront
                  name={previewCard.name}
                  number={previewCard.number}
                  cardId={previewCard.id}
                  image={previewCard.image}
                  keywords={previewCard.keywords}
                  isUpright={true}
                  element={previewCard.element}
                  symbolism={previewCard.symbolism}
                />
              </div>

              <div className="space-y-3 flex-1">
                <span className="text-xs uppercase font-serif tracking-widest text-[#8E5244] font-semibold">
                  {previewCard.arcana} Arcana · {previewCard.element}
                </span>
                <h3 className="text-2xl font-mystic font-bold text-[#2F171E]">
                  {previewCard.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewCard.keywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAD5CF] text-[#4A262E] font-serif font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
                {(() => {
                  const sections = getCardDetailedSections(previewCard, true);
                  return (
                    <div className="space-y-3 pt-2 text-xs text-[#3D1E25]">
                      {/* Core idea */}
                      <div className="p-2.5 rounded-xl bg-[#FFF2ED] border border-[#DEB76A]/40 text-[#6B2D1D] font-serif font-semibold">
                        ✦ {sections.coreIdea}
                      </div>

                      {/* 1. Хайр */}
                      <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                        <span className="font-serif font-bold text-[#8C3A27] flex items-center gap-1.5 text-xs">
                          <span>💖</span>
                          <span>Хайр дурлал & Харилцаа:</span>
                        </span>
                        <p className="text-[#3D1E25] font-sans leading-relaxed">
                          {sections.love}
                        </p>
                      </div>

                      {/* 2. Ажил мэргэжил */}
                      <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                        <span className="font-serif font-bold text-[#7A3E1D] flex items-center gap-1.5 text-xs">
                          <span>💼</span>
                          <span>Ажил мэргэжил & Санхүү:</span>
                        </span>
                        <p className="text-[#3D1E25] font-sans leading-relaxed">
                          {sections.career}
                        </p>
                      </div>

                      {/* 3. Мэдрэмж */}
                      <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                        <span className="font-serif font-bold text-[#5C2E3B] flex items-center gap-1.5 text-xs">
                          <span>🌊</span>
                          <span>Мэдрэмж & Дотоод сэтгэл зүй:</span>
                        </span>
                        <p className="text-[#3D1E25] font-sans leading-relaxed">
                          {sections.feelings}
                        </p>
                      </div>

                      {/* 4. Үйлдэл */}
                      <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                        <span className="font-serif font-bold text-[#2A4D38] flex items-center gap-1.5 text-xs">
                          <span>⚡</span>
                          <span>Үйлдэл & Зөвлөх алхам:</span>
                        </span>
                        <p className="text-[#3D1E25] font-sans leading-relaxed">
                          {sections.action}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="pt-4 border-t border-[#9C6E65]/20 flex items-center justify-end">
              <button
                onClick={() => setPreviewCard(null)}
                className="px-6 py-2 rounded-full bg-[#4D2630] text-white font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#3D1D25] cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
