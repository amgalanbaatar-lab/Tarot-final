import React, { useState, useEffect } from 'react';
import { useReading } from '../context/ReadingContext';
import { useShop } from '../context/ShopContext';
import { TAROT_DECK, TarotCard } from '../data/tarotData';
import { TarotCardFront, TarotCardBack } from '../components/MysticVisuals';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Crown,
  RotateCw,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  Wand2,
  Eye,
  Info,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { FormattedReading } from '../components/FormattedReading';

interface FreeReadingPageProps {
  onNavigateToLove: () => void;
  onNavigateToVip: () => void;
}

// All 78 cards placed on the reading table for free selection
interface TableCard {
  id: string;
  slotNumber: number;
  deckIndex: number;
  rotation: number;
  isUpright: boolean;
  isFlipping?: boolean;
}

type IntuitionMood = 'calm' | 'seeking' | 'passionate' | 'deep';

const INTUITION_MOODS: { id: IntuitionMood; label: string; desc: string; reversedBias: number }[] = [
  { id: 'calm', label: '🌿 Тайван ба Төвлөрсөн', desc: 'Тэнцвэртэй зөн совин', reversedBias: 0.35 },
  { id: 'seeking', label: '🌊 Эргэлзээ ба Эрэлхийлэл', desc: 'Далд зангилааг нээх', reversedBias: 0.52 },
  { id: 'passionate', label: '🔥 Хүсэл тэмүүлэл ба Догдлол', desc: 'Эрч хүчтэй өөрчлөлт', reversedBias: 0.42 },
  { id: 'deep', label: '🌙 Гүн бясалгал ба Зөн совин', desc: 'Дотоод ухамсрын дуу хоолой', reversedBias: 0.48 },
];

export const FreeReadingPage: React.FC<FreeReadingPageProps> = ({
  onNavigateToLove,
  onNavigateToVip,
}) => {
  const {
    cards,
    setCards,
    userBirthDate,
    setUserBirthDate,
  } = useReading();
  const { planPrices, formatPrice } = useShop();

  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'gather' | 'riffle' | 'spread'>('idle');
  const [tableCards, setTableCards] = useState<TableCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [intuitionMood, setIntuitionMood] = useState<IntuitionMood>('calm');
  const [shuffleGeneration, setShuffleGeneration] = useState<number>(1);
  const [flyingCard, setFlyingCard] = useState<{
    cardIndex: number;
    targetSlot: number;
  } | null>(null);

  // Initialize full table deck of all 78 face-down cards
  useEffect(() => {
    generateTableCards('calm', 1);
  }, []);

  // Keep selectedIndices synchronized if cards are cleared externally
  useEffect(() => {
    if (cards.length === 0 && selectedIndices.length > 0) {
      setSelectedIndices([]);
    }
  }, [cards.length]);

  const generateTableCards = (mood: IntuitionMood = intuitionMood, gen: number = shuffleGeneration) => {
    const moodConfig = INTUITION_MOODS.find((m) => m.id === mood) || INTUITION_MOODS[0];
    const totalCount = TAROT_DECK.length; // Full 78-card Tarot deck
    const shuffledIndices = Array.from({ length: totalCount }, (_, idx) => idx);

    // Fisher-Yates true random shuffle of all 78 cards
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    const list: TableCard[] = [];
    const nowSeed = Date.now();
    for (let i = 0; i < totalCount; i++) {
      // Subtle organic hand-placed angle so the grid remains clean and aligned
      const rotation = ((i % 5) - 2) * 0.6;
      const pulse = Math.sin(nowSeed * 0.001 + i * 9.7);
      const isUpright = (Math.random() * 0.7 + (pulse + 1) * 0.15) > moodConfig.reversedBias;
      list.push({
        id: `deck-${gen}-card-${i}-${shuffledIndices[i]}`,
        slotNumber: i + 1,
        deckIndex: shuffledIndices[i],
        rotation,
        isUpright,
      });
    }
    setTableCards(list);
  };

  // Perform full card shuffle & reset: all previously selected or revealed cards return to the deck
  const handleShuffle = () => {
    if (isShuffling) return;

    // Immediately return all previously selected / revealed cards back into the deck
    setSelectedIndices([]);
    setCards([]);
    setFlyingCard(null);
    setReadingResult('');

    const nextGen = shuffleGeneration + 1;
    setShuffleGeneration(nextGen);
    setIsShuffling(true);
    setShufflePhase('gather');
    mysticAudio.playCardShuffle();

    setTimeout(() => {
      setShufflePhase('riffle');
      mysticAudio.playCardShuffle();
    }, 400);

    setTimeout(() => {
      setShufflePhase('spread');
      // Mix all 78 cards into brand-new random positions
      generateTableCards(intuitionMood, nextGen);
    }, 800);

    setTimeout(() => {
      setShufflePhase('idle');
      setIsShuffling(false);
      mysticAudio.playChime(528, 1.5);
    }, 1250);
  };

  // User clicks any of the 78 face-down cards on the table to draw up to 3 cards freely
  const handlePickCard = (cardIndex: number) => {
    if (isShuffling || flyingCard !== null || selectedIndices.includes(cardIndex)) return;
    if (cards.length >= 3 || selectedIndices.length >= 3) {
      mysticAudio.playChime(396, 1);
      return;
    }

    const nextSlot = cards.length; // 0, 1, or 2
    mysticAudio.playCardFlip();

    // Trigger flying animation
    setFlyingCard({ cardIndex, targetSlot: nextSlot });

    // Pick card from deck and determine Upright vs Reversed based on user's intuition mood & click timing
    const tableItem = tableCards[cardIndex];
    const pickedCardDef = TAROT_DECK[tableItem?.deckIndex % TAROT_DECK.length] || TAROT_DECK[cardIndex % TAROT_DECK.length];
    const moodConfig = INTUITION_MOODS.find((m) => m.id === intuitionMood) || INTUITION_MOODS[0];
    const clickRhythm = ((Date.now() % 1000) / 1000) * 0.4 + (tableItem?.isUpright ? 0.45 : 0.15);
    const landedUpright = clickRhythm >= moodConfig.reversedBias;

    const positions = [
      '01. Өнгөрсөн үе (Past)',
      '02. Одоо цаг (Present)',
      '03. Ирээдүй (Future)',
    ];

    setTimeout(() => {
      setSelectedIndices((prev) => [...prev, cardIndex]);
      setFlyingCard(null);

      const newDrawn = [
        ...cards,
        {
          card: pickedCardDef,
          isUpright: landedUpright,
          position: positions[nextSlot],
          isRevealed: true,
        },
      ];
      setCards(newDrawn);
      mysticAudio.playChime(639, 1.8);
    }, 450);
  };

  const handleResetDeck = () => {
    handleShuffle();
  };

  // Generate dynamic 3-card reading via server API
  const handleStartReading = async () => {
    if (cards.length < 3) {
      mysticAudio.playChime(261, 1);
      return;
    }
    mysticAudio.playChime(528, 2);
    setIsLoading(true);
    setTimeout(() => {
      document.getElementById('free-reading-loading')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    let finalReading = '';
    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: userBirthDate,
          plan: 'free',
          category: 'Ерөнхий амьдралын суурь',
          tarotCards: cards.slice(0, 3).map((c) => ({
            name: c.card.name,
            number: c.card.number,
            upright: c.isUpright,
            position: c.position,
            meaning: c.isUpright ? c.card.uprightMeaning : c.card.reversedMeaning,
          })),
        }),
      });

      const data = await response.json();
      if (data.reading) {
        finalReading = data.reading;
        setReadingResult(data.reading);
      } else {
        throw new Error('No reading');
      }
    } catch {
      const c1 = cards[0];
      const c2 = cards[1];
      const c3 = cards[2];
      const c1Label = `${c1?.card.name || 'Тэнүүлч'} — ${c1?.isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}`;
      const c2Label = `${c2?.card.name || 'Илбэчин'} — ${c2?.isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}`;
      const c3Label = `${c3?.card.name || 'Нар'} — ${c3?.isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}`;
      const m1 = c1 ? (c1.isUpright ? c1.card.uprightMeaning : c1.card.reversedMeaning) : '';
      const m2 = c2 ? (c2.isUpright ? c2.card.uprightMeaning : c2.card.reversedMeaning) : '';
      const m3 = c3 ? (c3.isUpright ? c3.card.uprightMeaning : c3.card.reversedMeaning) : '';
      finalReading = `1. 🌿 Өнгөрсөн суурь (${c1Label}):\n${m1 || 'Таны өнгөрсөн замнал, хуримтлуулсан туршлага танд өнөөдрийн үнэт суурийг бэлэглэжээ.'}\n\n2. 💎 Одоо цагийн нөхцөл (${c2Label}):\n${m2 || 'Одоо танд дотоод авьяас, шинэ боломж нээгдэж байна. Өөрийн зөн совиндоо итгэн алхам хийгээрэй.'}\n\n3. ⚡ Ирээдүйн чиг хандлага (${c3Label}):\n${m3 || 'Ойрын хугацаанд итгэл найдвар, гэрэл гэгээ дэлгэгдэж таны хүчин чармайлт бодит үр дүнгээ өгөх болно.'}\n\n🔮 Таны мэдрэмж ба зөн совинд өгөх гол зөвлөмж:\nХөзрүүдийн эгц болон урвуу байрлалын огтлолцол нь гадаад үйл явдал болон дотоод сэтгэл зүйн тэнцвэрийг харуулж байна.\n\n🕊 Өдрийн сэтгэлийн батламж:\n"Би өөрийн дотоод хүчиндээ бүрэн итгэж, амьдралынхаа зөв мөчлөгт зоригтой урагшилж байна."`;
      setReadingResult(finalReading);
    } finally {
      try {
        const nowStr = new Date().toLocaleDateString('mn-MN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const historyItem = {
          id: `tarot_${Date.now()}`,
          date: nowStr,
          cards: cards.slice(0, 3).map((c) => `${c.card.name}${c.isUpright ? '' : ' (Урвуу)'}`),
          cardIds: cards.slice(0, 3).map((c) => c.card.id),
          summary: finalReading.slice(0, 180) + '...',
          type: 'Таро 3 Хөзрийн Суурь Уншлага',
          category: 'tarot',
          details: {
            content: finalReading,
          },
        };
        const existing = JSON.parse(localStorage.getItem('mystic_readings_history') || '[]');
        localStorage.setItem('mystic_readings_history', JSON.stringify([historyItem, ...existing.slice(0, 59)]));
        window.dispatchEvent(new Event('mystic_history_updated'));
      } catch {}
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('free-reading-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  const handleCopy = () => {
    if (readingResult) {
      navigator.clipboard.writeText(readingResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const slotLabels = [
    { title: '01. Өнгөрсөн үе', sub: 'Өнгөрсөн суурь' },
    { title: '02. Одоо цаг', sub: 'Одоогийн нөхцөл' },
    { title: '03. Ирээдүй', sub: 'Цаашдын хандлага' },
  ];

  return (
    <div id="free-reading-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Single Clean Page Title & Introduction */}
      <div className="text-center space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#2A1118]">
          Таро 3 Хөзрийн Суурь Уншлага
        </h1>
        <p className="text-sm sm:text-base text-[#542B34] max-w-2xl mx-auto leading-relaxed">
          "Хөзөр холих" товчийг дарж 78 хөзрийг сүлэлдүүлэн, ширээн дээрх бүх 78 хөзрөөс өөрийн зөн совингоороо <strong>дурын 3 хөзрөө</strong> сонгон өнгөрсөн, одоо, ирээдүйн тайллаа уншаарай.
        </p>

        {/* Optional Birth date selector to enrich personalized reading */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-[#542B34]">
          <Calendar className="w-4 h-4 text-[#8E441D]" />
          <span className="font-serif font-semibold">Төрсөн огноо:</span>
          <input
            type="date"
            value={userBirthDate}
            onChange={(e) => setUserBirthDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 bg-white/90 text-[#2F171E] font-sans font-medium text-xs focus:outline-none focus:border-[#8E441D]"
          />
        </div>
      </div>

      {/* =========================================================================
          ZONE 1: 3 TARGET SLOTS (EDGE-TO-EDGE LUXURIOUS CARD BOXES)
          ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Glow corner aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8C582]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/30 relative z-10">
          <h2 className="text-lg sm:text-xl font-mystic font-bold text-[#2A1118]">
            Сонгосон 3 хөзрийн байрлал (Өнгөрсөн · Одоо · Ирээдүй)
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-xs font-serif font-bold text-[#6D3B47] px-3.5 py-1.5 rounded-full bg-white/80 border border-[#D4AF37]/40">
              {cards.length} / 3 хөзөр сонгогдсон
            </span>
            {cards.length > 0 && (
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#D4AF37]/50 text-xs font-serif font-bold text-[#6D3B47] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Холих / Шинээр эхлэх</span>
              </button>
            )}
          </div>
        </div>

        {/* The 3 Target Edge-to-Edge Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          {slotLabels.map((slot, idx) => {
            const drawn = cards[idx];
            const isTargeted = flyingCard?.targetSlot === idx;

            return (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-2xl border-2 transition-all duration-300 min-h-[380px] sm:min-h-[440px] justify-between relative overflow-hidden ${
                  drawn
                    ? 'border-[#D4AF37] bg-white shadow-xl p-0'
                    : isTargeted
                    ? 'border-[#8E441D] bg-[#FDF0EC] scale-102 shadow-md animate-pulse p-4'
                    : 'border-dashed border-[#D4AF37]/50 bg-white/60 hover:border-[#D4AF37] p-4'
                }`}
              >
                {drawn ? (
                  /* 100% Full Bleed Card View extending to the very bottom edge with NO bottom frame/box */
                  <div className="absolute inset-0 w-full h-full animate-fadeIn overflow-hidden rounded-2xl">
                    <TarotCardFront
                      name={drawn.card.name}
                      image={drawn.card.image}
                      number={drawn.card.number}
                      cardId={drawn.card.id}
                      isUpright={drawn.isUpright}
                      keywords={drawn.card.keywords}
                      className="w-full h-full rounded-2xl"
                      showOverlayName={false}
                    />

                    {/* Floating Slot Role Badge at Top Left */}
                    <div className="absolute top-2.5 left-2.5 z-30 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#DEB76A]/60 shadow-md flex items-center gap-1.5 pointer-events-none">
                      <span className="text-[11px] font-serif font-bold text-[#F5D77F] tracking-wide">
                        {slot.title}
                      </span>
                    </div>

                    {/* Floating Upright/Reversed Orientation Badge at Top Right */}
                    <div
                      className={`absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-md flex items-center gap-1 pointer-events-none text-[10px] font-serif font-bold tracking-wide ${
                        drawn.isUpright
                          ? 'bg-emerald-950/85 border-emerald-400/50 text-emerald-200'
                          : 'bg-amber-950/90 border-amber-400/60 text-amber-200'
                      }`}
                    >
                      <span>{drawn.isUpright ? '✨ Эгц' : '🔄 Урвуу'}</span>
                    </div>

                    {/* Seamless Bottom Name Label with NO solid frame/box, card image fills 100% to bottom edge */}
                    <div className="absolute inset-x-0 bottom-0 z-20 pt-10 pb-3.5 px-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center space-y-0.5 pointer-events-none">
                      <h4 className="text-xs sm:text-sm font-mystic font-bold text-[#FFF5F2] truncate drop-shadow-md">
                        {drawn.card.name}
                      </h4>
                      <p className="text-[10px] text-[#E8C582] font-serif font-bold drop-shadow-sm">
                        {drawn.card.nameEn} · {drawn.isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Empty Waiting State */
                  <div className="w-full h-full flex flex-col justify-between items-center text-center">
                    <div className="w-full text-center pb-2 border-b border-[#D4AF37]/25 mb-2">
                      <span className="text-xs font-serif font-bold text-[#2A1118] block tracking-wide">
                        {slot.title}
                      </span>
                      <span className="text-[10px] text-[#7A4E58] uppercase font-sans tracking-wider">
                        {slot.sub}
                      </span>
                    </div>

                    <div className="my-auto py-8 flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#E8C582]/25 border border-[#D4AF37]/40 flex items-center justify-center text-[#8E441D]">
                        <Layers className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-serif font-bold text-[#6D3B47]">
                        {idx + 1}-р хөзөр хүлээгдэж байна
                      </span>
                      <p className="text-[11px] text-[#8C626C] max-w-[180px] leading-relaxed">
                        Доорх хөзөр сонгох ширээнээс дарж энд байршуулна уу
                      </p>
                    </div>

                    <div className="w-full pt-2 border-t border-dashed border-[#D4AF37]/20 text-[10px] text-[#8C626C] font-serif">
                      3 хөзөр сонгогдоно
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start Reading Action Button */}
        {cards.length === 3 && (
          <div className="text-center pt-4 relative z-10 animate-fadeIn">
            <button
              onClick={handleStartReading}
              disabled={isLoading}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-[#8E441D] via-[#A65427] to-[#8E441D] hover:from-[#783715] hover:to-[#783715] text-[#FFF6F3] font-serif font-bold text-sm uppercase tracking-widest shadow-xl transition-all cursor-pointer inline-flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#FCEBE6]" />
                  <span>Картуудын нууцыг тайлж байна...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FCEBE6]" />
                  <span>🔮 3 Хөзрийн Тайлал Унших</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          ZONE 2: FULL 78-CARD SCROLLABLE DECK TABLE & SHUFFLE / RESET
          ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-5 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-mystic font-bold text-[#2A1118] flex items-center gap-2 flex-wrap">
              <Wand2 className="w-5 h-5 text-[#8E441D]" />
              <span>Хөзөр сонгох ширээ</span>
              <span className="text-xs font-serif font-bold px-2.5 py-0.5 rounded-full bg-[#FAF0E1] border border-[#D4AF37]/50 text-[#8E441D]">
                Нийт {tableCards.length} хөзөр · {Math.max(0, 3 - cards.length)} сонголт үлдсэн
              </span>
            </h2>
            <p className="text-xs text-[#5C343E]">
              Ширээг доош гүйлгэн бүх 78 хөзрөөс өөрийн зөн совин татсан дурын 3 хөзрөө чөлөөтэй сонгоно уу.
            </p>
          </div>

          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className="px-6 py-3 rounded-full bg-[#2A1118] hover:bg-[#3E1A24] text-[#FBEBE6] font-serif font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 active:scale-95"
          >
            <RotateCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>🔀 Холих</span>
          </button>
        </div>

        {/* Intuition & Feeling Selector that influences Upright vs Reversed card orientation */}
        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/40 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-serif font-bold text-[#2A1118] uppercase tracking-wider">
              ✨ Таны одоогийн дотоод мэдрэмж (Хөзөр эгц эсвэл урвуу буухад нөлөөлнө):
            </span>
            <span className="text-[11px] text-[#7A4E58]">
              Мэдрэмжээ сонгоод 78 хөзрөөс 3 хөзрөө татна уу
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {INTUITION_MOODS.map((m) => {
              const active = intuitionMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setIntuitionMood(m.id);
                    const nextGen = shuffleGeneration + 1;
                    setShuffleGeneration(nextGen);
                    setSelectedIndices([]);
                    setCards([]);
                    setReadingResult('');
                    generateTableCards(m.id, nextGen);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#FAF0E1] to-[#FFFDF9] border-[#8E441D] shadow-sm ring-1 ring-[#8E441D]/30'
                      : 'bg-white/75 border-[#D4AF37]/30 hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="text-xs font-serif font-bold text-[#2A1118]">{m.label}</div>
                  <div className="text-[10px] text-[#7A4E58] mt-0.5">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shuffling Status Overlay notice */}
        {isShuffling && (
          <div className="p-3.5 rounded-xl bg-[#FAF0E1] border-2 border-[#D4AF37]/60 text-center text-xs font-serif font-bold text-[#4D2630] animate-pulse shadow-xs">
            ✨ Бүх 78 хөзөр буцаж багцлагдан, таны энергиэр санамсаргүй байрлалд шинээр холигдож байна...
          </div>
        )}

        {/* Scrollable Full 78-Card Table Container: 3-4 per row on mobile, 8-12 per row on desktop */}
        <div className="relative rounded-2xl bg-[#FFFDF9]/90 border-2 border-[#D4AF37]/40 p-3 sm:p-5 max-h-[480px] sm:max-h-[540px] overflow-y-auto overflow-x-auto shadow-inner">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5 sm:gap-3 place-items-center">
            {tableCards.map((tc, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const isFlying = flyingCard?.cardIndex === idx;

              if (isSelected && !isFlying) {
                // Card has been drawn to one of the 3 slots above
                return (
                  <div
                    key={tc.id}
                    className="w-full aspect-[2/3] max-w-[84px] rounded-xl border border-dashed border-[#D4AF37]/45 bg-[#FAF0E1]/40 flex flex-col items-center justify-center text-[10px] font-serif font-bold text-[#8E441D]/55 select-none"
                  >
                    <span>#{tc.slotNumber}</span>
                    <span className="text-[9px]">Авсан</span>
                  </div>
                );
              }

              return (
                <div
                  key={tc.id}
                  onClick={() => handlePickCard(idx)}
                  style={{
                    transform: isShuffling
                      ? shufflePhase === 'gather'
                        ? 'scale(0.75) rotate(0deg)'
                        : shufflePhase === 'riffle'
                        ? `translate(${idx % 2 === 0 ? '-14px' : '14px'}, ${idx % 3 === 0 ? '-8px' : '8px'}) rotate(${idx % 2 === 0 ? '-8deg' : '8deg'}) scale(0.92)`
                        : `rotate(${tc.rotation}deg) scale(1)`
                      : isFlying
                      ? 'translateY(-90px) scale(1.12) rotate(0deg)'
                      : `rotate(${tc.rotation}deg)`,
                    transition: isFlying
                      ? 'all 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : isShuffling
                      ? 'all 0.35s ease-in-out'
                      : 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  className={`w-full aspect-[2/3] max-w-[84px] rounded-xl cursor-pointer transition-transform select-none shadow-md relative group ${
                    isFlying
                      ? 'z-40 ring-3 ring-[#D4AF37] shadow-2xl'
                      : cards.length >= 3
                      ? 'opacity-75 hover:opacity-100'
                      : 'hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:z-20'
                  }`}
                  title={`${tc.slotNumber}-р хөзрийг сонгох`}
                >
                  <TarotCardBack className="w-full h-full rounded-xl" />
                  {/* Subtle card number badge on the table */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/65 border border-[#DEB76A]/50 text-[9px] font-serif font-bold text-[#F5D77F] pointer-events-none">
                    {tc.slotNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guidance bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A4E58] pt-2 border-t border-[#D4AF37]/25 font-sans font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#8E441D] shrink-0" />
            <span>Ширээг дээш доош гүйлгэж 78 хөзрөөс дурын 3 хөзрөө сонгоорой.</span>
          </div>
          <span className="text-[11px] font-serif font-bold text-[#8E441D]">
            "Холих" товч дарвал бүх 78 хөзөр шинээр байрлалаа солино
          </span>
        </div>
      </div>

      {/* =========================================================================
          MYSTIC LOADING STATE ("Картуудын нууцыг тайлж байна...")
          ========================================================================= */}
      {isLoading && (
        <div
          id="free-reading-loading"
          className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/60 p-8 sm:p-12 shadow-2xl text-center space-y-5 animate-fadeIn"
        >
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-[#FAF0E1] border-2 border-[#C59B27] flex items-center justify-center text-[#8E441D] shadow-md relative z-10">
              <Sparkles className="w-8 h-8 animate-spin text-[#8E441D]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#2A1118]">
              Картуудын нууцыг тайлж байна...
            </h3>
            <p className="text-xs sm:text-sm text-[#542B34] max-w-md mx-auto font-sans">
              Таны сонгосон 3 хөзрийн бэлгэдэл, байрлал болон дотоод энергийн уялдааг уншиж байна.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONE 3: READING RESULT DISPLAY
          ========================================================================= */}
      {!isLoading && readingResult && (
        <div
          id="free-reading-result"
          className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/55 p-6 sm:p-10 shadow-2xl space-y-8 animate-fadeIn"
        >
          {/* Single Clean Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30">
            <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2A1118]">
              Сонгосон 3 хөзрийн дэлгэрэнгүй тайлал
            </h2>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl border border-[#D4AF37]/45 bg-[#FFFDF9] hover:bg-[#FAF1E4] text-xs font-serif font-bold text-[#6D3B47] flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Хуулагдлаа' : 'Тайлал хуулах'}</span>
            </button>
          </div>

          {/* Reading Text formatted cleanly in warm light parchment */}
          <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl border border-[#C59B27]/40 shadow-inner">
            <FormattedReading content={readingResult} theme="light" hideMainBanner={true} />
          </div>

          {/* Direct Teasers to Love & Full Reading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            {/* Love Reading Card */}
            <div
              onClick={onNavigateToLove}
              className="p-6 rounded-2xl border-2 border-[#BA7765]/40 bg-gradient-to-br from-[#FFF5F2] to-[#FCEBE6] hover:border-[#8E441D] cursor-pointer transition-all shadow-md hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-serif tracking-widest text-[#8E441D] font-bold flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#8E441D]" />
                  <span>Хайр дурлалын багц</span>
                </span>
                <span className="text-xs font-serif font-bold text-white bg-[#8E441D] px-2.5 py-0.5 rounded-full">
                  {formatPrice(planPrices.love)}
                </span>
              </div>
              <h4 className="text-lg font-mystic font-bold text-[#2A1118] group-hover:text-[#8E441D] transition-colors mb-2">
                Хайр дурлал, сэтгэл зүйн 8 шатлалт гүнзгий тайлал →
              </h4>
              <p className="text-xs text-[#5C343E] leading-relaxed">
                Татсан 3 хөзөртөө тулгуурлан хосын сэтгэл зүй, ирэх саруудын чиг хандлага, далд саадыг бүрэн тайлуулаарай.
              </p>
            </div>

            {/* Full Reading Card */}
            <div
              onClick={onNavigateToVip}
              className="p-6 rounded-2xl border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#FFFDF8] via-[#FFF9EE] to-[#FCF3DC] hover:border-[#B87A42] cursor-pointer transition-all shadow-md hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-serif tracking-widest text-[#B87A42] font-bold flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#B87A42]" />
                  <span>Бүтэн уншлага</span>
                </span>
                <span className="text-xs font-serif font-bold text-white bg-[#B87A42] px-2.5 py-0.5 rounded-full">
                  {formatPrice(planPrices.full)}
                </span>
              </div>
              <h4 className="text-lg font-mystic font-bold text-[#2A1118] group-hover:text-[#B87A42] transition-colors mb-2">
                Амьдралын Гүнзгийрүүлсэн Тайлал →
              </h4>
              <p className="text-xs text-[#5C343E] leading-relaxed">
                Ажил мэргэжил, санхүү, эрүүл мэнд, амьдралын эргэлтийн цэг болон таны хувийн асуултад шууд хариулсан цогц уншлага.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
