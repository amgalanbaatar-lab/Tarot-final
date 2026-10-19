import React, { useState, useEffect } from 'react';
import { TarotCard, TAROT_DECK, getCardDetailedSections } from '../data/tarotData';
import { TarotCardFront, TarotCardBack } from './MysticVisuals';
import { RotateCw, Sparkles, Wand2, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { useCustomCards } from '../context/CustomCardsContext';

export interface DrawnCard {
  card: TarotCard;
  isUpright: boolean;
  position: string;
  isRevealed: boolean;
}

interface TarotShuffleDeckProps {
  cards: DrawnCard[];
  onCardsChange: (cards: DrawnCard[]) => void;
  plan?: 'free' | 'love' | 'full';
  userName?: string;
  userBirthDate?: string;
  userQuestion?: string;
  userCategory?: string;
  autoReveal?: boolean;
}

export const TarotShuffleDeck: React.FC<TarotShuffleDeckProps> = ({
  cards,
  onCardsChange,
  plan = 'free',
  userName = '',
  userBirthDate = '',
  userQuestion = '',
  userCategory = '',
  autoReveal = true,
}) => {
  const { cardBackImage } = useCustomCards();
  const [isShuffling, setIsShuffling] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'split' | 'riffle' | 'fan' | 'gather'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedCardForModal, setSelectedCardForModal] = useState<DrawnCard | null>(null);

  const cardCount = plan === 'love' ? 5 : plan === 'full' ? 7 : 3;

  const getSpreadPositions = (count: number) => {
    if (count === 1) return ['Өдрийн зөвлөгөө'];
    if (count === 5) {
      return [
        '01. Өнгөрсөн харилцаа',
        '02. Одоогийн сэтгэл зүй',
        '03. Далд тээглүүр',
        '04. Ирээдүйн чиг хандлага',
        '05. Танд өгөх гол зөвлөгөө',
      ];
    }
    if (count === 7) {
      return [
        '01. Өнгөрсөн суурь',
        '02. Одоо цагийн нөхцөл',
        '03. Далд айдас / итгэл найдварууд',
        '04. Гадаад орчны нөлөө',
        '05. Ирээдүйн боломж',
        '06. Сэтгэлийн тэнцвэр',
        '07. Эцсийн үр дүн',
      ];
    }
    return [
      '01. Өнгөрсөн үе (Past)',
      '02. Одоо цаг (Present)',
      '03. Ирээдүй (Future)',
    ];
  };

  // Perform dynamic and personalized shuffle
  const performShuffle = () => {
    if (isShuffling) return;

    setIsShuffling(true);
    setShufflePhase('split');
    setStatusMessage('Таны энергийг шингээн хөзрүүдийг хувааж байна...');
    mysticAudio.playCardShuffle();

    // Phase 1 -> Phase 2 (Riffle shuffle)
    setTimeout(() => {
      setShufflePhase('riffle');
      setStatusMessage('Хөзрүүд хоорондоо сүлжилдэн шинээр холигдож байна...');
      mysticAudio.playCardShuffle();
    }, 600);

    // Phase 2 -> Phase 3 (Fan & gather)
    setTimeout(() => {
      setShufflePhase('fan');
      setStatusMessage('Таны тавьсан асуултад тохирох хөзрүүдийг сонгож байна...');
      mysticAudio.playCardFlip();
    }, 1200);

    // Finalize deal
    setTimeout(() => {
      setShufflePhase('gather');
      setStatusMessage('Хөзрүүд дэлгэгдэхэд бэлэн боллоо!');
      mysticAudio.playChime(528, 2.2);

      // Seeded random mix combined with timestamp
      const combinedSeed = `${userName}_${userBirthDate}_${userQuestion}_${userCategory}_${Date.now()}`;
      let hash = 0;
      for (let i = 0; i < combinedSeed.length; i++) {
        hash = (hash << 5) - hash + combinedSeed.charCodeAt(i);
        hash |= 0;
      }

      // Shuffled deck
      const deckCopy = [...TAROT_DECK];
      for (let i = deckCopy.length - 1; i > 0; i--) {
        const j = Math.abs(Math.floor((Math.sin(hash + i) * 10000) % (i + 1)));
        [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
      }

      const positions = getSpreadPositions(cardCount);
      const drawn: DrawnCard[] = deckCopy.slice(0, cardCount).map((card, idx) => {
        // Intuition-seeded upright vs reversed orientation (~55% upright, ~45% reversed)
        const intuitionWave = Math.sin(hash + idx * 11 + (Date.now() % 1000) * 0.1);
        const isUpright = intuitionWave > -0.15;
        return {
          card,
          isUpright,
          position: positions[idx] || `Байрлал ${idx + 1}`,
          isRevealed: autoReveal,
        };
      });

      onCardsChange(drawn);
      setIsShuffling(false);
      setShufflePhase('idle');
      setStatusMessage('');
    }, 1800);
  };

  const handleToggleCardReveal = (idx: number) => {
    mysticAudio.playCardFlip();
    const updated = cards.map((c, i) => (i === idx ? { ...c, isRevealed: !c.isRevealed } : c));
    onCardsChange(updated);
  };

  const handleRevealAll = () => {
    mysticAudio.playChime(639, 2);
    const updated = cards.map((c) => ({ ...c, isRevealed: true }));
    onCardsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top action strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEB76A]/25 pb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-[#C79446]" />
          <span className="text-xs uppercase font-serif tracking-[0.2em] gold-kicker">
            Тарогийн хөзрүүд ({cards.length} карт)
          </span>
          {userName?.trim() && (
            <span className="text-xs text-[#7A4E58] font-sans">
              · <span className="text-[#8C5420] font-bold">{userName.trim()}</span>-д зориулсан
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {cards.some((c) => !c.isRevealed) && (
            <button
              type="button"
              onClick={handleRevealAll}
              className="text-xs text-[#5C3841] hover:text-[#2F171E] px-3.5 py-1.5 rounded-full border border-[#DEB76A]/40 hover:border-[#C79446] bg-white/80 transition-all font-serif font-medium cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-[#C79446]" />
              <span>Бүгдийг дэлгэх</span>
            </button>
          )}

          <button
            type="button"
            onClick={performShuffle}
            disabled={isShuffling}
            className="text-xs text-white bg-gradient-to-r from-[#4D2630] via-[#5C2B38] to-[#4D2630] border border-[#DEB76A]/45 hover:border-[#DEB76A]/90 px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all font-serif font-semibold cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#EAC675] ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'Хольж байна...' : 'Шинээр хольж татах'}</span>
          </button>
        </div>
      </div>

      {/* SHUFFLE ANIMATION STAGE (Visible while shuffling) */}
      {/* SHUFFLE ANIMATION STAGE (Brighter, softer luminous warm aesthetics) */}
      {isShuffling && (
        <div className="py-10 px-4 rounded-3xl bg-gradient-to-b from-[#FFF5F1] via-[#FDF0EC] to-[#FFF8F5] border border-[#DEB76A]/45 text-center relative overflow-hidden shadow-lg animate-fadeIn">
          {/* Soft warm aura glow */}
          <div className="absolute inset-0 bg-[#E8C582]/15 blur-3xl pointer-events-none" />

          {/* Shuffling Deck Stack */}
          <div className="relative w-72 h-44 mx-auto flex items-center justify-center perspective-[1000px] mb-6">
            {/* Left deck half */}
            <div
              className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/60 bg-[#FAF1ED] shadow-xl transition-all duration-500 transform ${
                shufflePhase === 'split'
                  ? '-translate-x-16 rotate-[-18deg] scale-105'
                  : shufflePhase === 'riffle'
                  ? '-translate-x-4 rotate-[-6deg]'
                  : shufflePhase === 'fan'
                  ? '-translate-x-12 rotate-[-12deg]'
                  : 'translate-x-0 rotate-0'
              }`}
            >
              <TarotCardBack className="w-full h-full" />
            </div>

            {/* Middle interleaving card 1 */}
            <div
              className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/50 bg-[#F5E6E1] shadow-lg transition-all duration-400 delay-75 transform ${
                shufflePhase === 'riffle'
                  ? '-translate-y-4 rotate-[3deg] scale-102'
                  : shufflePhase === 'fan'
                  ? 'rotate-0 -translate-y-6'
                  : 'translate-y-0 rotate-0'
              }`}
            >
              <TarotCardBack className="w-full h-full" />
            </div>

            {/* Middle interleaving card 2 */}
            <div
              className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/50 bg-[#F5E6E1] shadow-lg transition-all duration-300 delay-150 transform ${
                shufflePhase === 'riffle'
                  ? 'translate-y-2 rotate-[-4deg]'
                  : shufflePhase === 'fan'
                  ? 'translate-x-6 rotate-[8deg]'
                  : 'translate-y-0 rotate-0'
              }`}
            >
              <TarotCardBack className="w-full h-full" />
            </div>

            {/* Right deck half */}
            <div
              className={`absolute w-24 h-36 rounded-xl border border-[#DEB76A]/60 bg-[#FAF1ED] shadow-xl transition-all duration-500 transform ${
                shufflePhase === 'split'
                  ? 'translate-x-16 rotate-[18deg] scale-105'
                  : shufflePhase === 'riffle'
                  ? 'translate-x-4 rotate-[6deg]'
                  : shufflePhase === 'fan'
                  ? 'translate-x-12 rotate-[12deg]'
                  : 'translate-x-0 rotate-0'
              }`}
            >
              <TarotCardBack className="w-full h-full" />
            </div>

            {/* Center golden flash */}
            <div className="absolute w-16 h-16 rounded-full bg-[#E8C582]/30 blur-xl animate-pulse" />
          </div>

          {/* Status prose */}
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#8E441D] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C79446] animate-spin" />
              <span>Хөзөр холих үйл явц</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C79446] animate-spin" />
            </div>
            <p className="text-sm text-[#46232D] font-sans font-medium transition-all duration-300">
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      {/* CARDS DISPLAY GRID (Visible when not shuffling) */}
      {!isShuffling && (
        <div className="space-y-4">
          <div
            className={`grid gap-5 ${
              cards.length <= 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : cards.length <= 5
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7'
            }`}
          >
            {cards.map((item, idx) => {
              const isRevealed = item.isRevealed;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center space-y-2.5 group transition-all"
                >
                  {/* Position Tag */}
                  <span className="text-[11px] uppercase font-serif tracking-wider text-[#8E5244] font-bold text-center line-clamp-1">
                    {item.position}
                  </span>

                  {/* Card Container with clean, smooth flip animation */}
                  <div
                    onClick={() => handleToggleCardReveal(idx)}
                    className="w-full aspect-[2/3] max-w-[210px] sm:max-w-none relative cursor-pointer perspective-[1000px]"
                    title="Дарж хөзрийг эргүүлэх / нээх"
                  >
                    <div
                      className={`w-full h-full relative transition-transform duration-600 ease-out preserve-3d rounded-2xl ${
                        isRevealed ? 'rotate-y-180' : 'rotate-y-0 hover:scale-[1.02]'
                      } ${isRevealed ? 'shadow-xl' : 'shadow-md'}`}
                    >
                      {/* Back face (shown before flip: rotateY(0)) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-lg border border-[#DEB76A]/45">
                        <TarotCardBack
                          imageSrc={item.card.cardBackImage || '/tarot/card-back.png'}
                          className="w-full h-full"
                        />
                        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] text-[#2F171E] bg-[#FFF2ED] px-2.5 py-0.5 rounded-full font-serif font-bold tracking-wider shadow-xs">
                            Дарж нээх
                          </span>
                        </div>
                      </div>

                      {/* Front face (shown after flip: rotateY(180deg)) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl rotate-y-180">
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
                    </div>
                  </div>

                  {/* Under-Card Summary Box */}
                  {isRevealed ? (
                    <div className="w-full p-2.5 rounded-xl bg-[#FFFDF9] border border-[#C59B27]/35 text-center space-y-1.5 shadow-sm">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-serif font-bold text-[#2F171E] leading-snug px-1 text-center break-words">
                          {item.card.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-serif font-bold border ${
                            item.isUpright
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {item.isUpright ? '✨ Эгц байрлал' : '🔄 Урвуу байрлал'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5C3841] line-clamp-2 leading-relaxed font-sans">
                        {item.isUpright ? item.card.uprightMeaning : item.card.reversedMeaning}
                      </p>
                      <div className="flex items-center justify-center pt-1 border-t border-[#9C6E65]/15">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCardForModal(item);
                          }}
                          className="text-[11px] text-[#8E5244] hover:text-[#4D2630] font-serif font-semibold cursor-pointer py-1 px-3 rounded-full bg-[#FFF2ED] border border-[#DEB76A]/40 hover:border-[#DEB76A] inline-flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Дэлгэрэнгүй тайлбар үзэх →</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#7A4E58] text-center italic font-serif">
                      Нууцлагдсан карт
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#7A4E58]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8E5244]" />
              <span>Карт дээр дарж эргүүлж харах боломжтой.</span>
            </span>
            <button
              type="button"
              onClick={performShuffle}
              className="text-[#8E5244] hover:text-[#4D2630] font-serif font-semibold cursor-pointer hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Өөр картууд татах</span>
            </button>
          </div>
        </div>
      )}

      {/* CARD DETAIL MODAL */}
      {selectedCardForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCardForModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-[#FFF6F3] border-2 border-[#8E5244] p-6 sm:p-8 shadow-2xl space-y-6 text-[#2F171E] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#9C6E65]/25 pb-4">
              <div>
                <div className="text-[10px] uppercase font-serif tracking-widest text-[#8E5244] font-bold">
                  {selectedCardForModal.position}
                </div>
                <h3 className="text-2xl font-mystic font-bold text-[#2F171E] mt-0.5">
                  {selectedCardForModal.card.name}
                </h3>
                <span className="text-xs text-[#7A4E58] font-sans">
                  {selectedCardForModal.card.nameEn} · {selectedCardForModal.card.element} ·{' '}
                  <strong className={selectedCardForModal.isUpright ? 'text-emerald-800' : 'text-amber-800'}>
                    {selectedCardForModal.isUpright ? 'Эгц байрлал' : 'Урвуу байрлал'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Card Visual & Narrative */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-40 h-60 shrink-0 rounded-2xl shadow-xl overflow-hidden border border-[#DEB76A]/50">
                <TarotCardFront
                  name={selectedCardForModal.card.name}
                  image={selectedCardForModal.card.image}
                  number={selectedCardForModal.card.number}
                  cardId={selectedCardForModal.card.id}
                  keywords={selectedCardForModal.card.keywords}
                  isUpright={selectedCardForModal.isUpright}
                  element={selectedCardForModal.card.element}
                  symbolism={selectedCardForModal.card.symbolism}
                />
              </div>

              {(() => {
                const sections = getCardDetailedSections(selectedCardForModal.card, selectedCardForModal.isUpright);
                return (
                  <div className="space-y-3.5 text-xs leading-relaxed font-sans text-[#3D1E25] flex-1">
                    {/* Core idea badge */}
                    <div className="p-2.5 rounded-xl bg-[#FFF2ED] border border-[#DEB76A]/40 text-[#6B2D1D] font-serif font-semibold">
                      ✦ {sections.coreIdea}
                    </div>

                    {/* Paragraph 1: Хайр */}
                    <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                      <span className="font-serif font-bold text-[#8C3A27] flex items-center gap-1.5 text-xs">
                        <span>💖</span>
                        <span>Хайр дурлал & Харилцаа:</span>
                      </span>
                      <p className="text-[#3D1E25] font-sans leading-relaxed">
                        {sections.love}
                      </p>
                    </div>

                    {/* Paragraph 2: Ажил мэргэжил */}
                    <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                      <span className="font-serif font-bold text-[#7A3E1D] flex items-center gap-1.5 text-xs">
                        <span>💼</span>
                        <span>Ажил мэргэжил & Санхүү:</span>
                      </span>
                      <p className="text-[#3D1E25] font-sans leading-relaxed">
                        {sections.career}
                      </p>
                    </div>

                    {/* Paragraph 3: Мэдрэмж */}
                    <div className="p-3 rounded-xl bg-white/90 border border-[#9C6E65]/20 space-y-1">
                      <span className="font-serif font-bold text-[#5C2E3B] flex items-center gap-1.5 text-xs">
                        <span>🌊</span>
                        <span>Мэдрэмж & Дотоод сэтгэл зүй:</span>
                      </span>
                      <p className="text-[#3D1E25] font-sans leading-relaxed">
                        {sections.feelings}
                      </p>
                    </div>

                    {/* Paragraph 4: Үйлдэл */}
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

            {/* Close button */}
            <div className="pt-2 border-t border-[#9C6E65]/20 text-right">
              <button
                type="button"
                onClick={() => setSelectedCardForModal(null)}
                className="px-6 py-2 rounded-full bg-[#4D2630] text-white font-serif font-semibold text-xs hover:bg-[#3D1D25] transition-all cursor-pointer"
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
