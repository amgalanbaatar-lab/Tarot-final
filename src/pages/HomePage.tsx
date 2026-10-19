import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';
import { CelestialHeroBackground, DarkGoldTarotFan, TarotCardBack, TarotCardFront } from '../components/MysticVisuals';
import { TAROT_DECK, TarotCard } from '../data/tarotData';
import { DailyZodiac } from '../components/DailyZodiac';
import { mysticAudio } from '../utils/audio';
import { useShop } from '../context/ShopContext';

interface HomePageProps {
  onStartReadingWithData: (birthDate: string, question: string) => void;
  onNavigate: (tab: string) => void;
  activePlan?: 'numerology' | 'love' | 'full' | null;
  onSelectPlan?: (plan: 'free' | 'numerology' | 'love' | 'full') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartReadingWithData,
  onNavigate,
  activePlan,
  onSelectPlan,
}) => {
  const { planPrices, formatPrice } = useShop();
  const [birthDate, setBirthDate] = useState('1998-04-12');
  const [question, setQuestion] = useState('');
  const [showQuickForm, setShowQuickForm] = useState(false);

  // Daily Card state
  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);
  const [dailyCardUpright, setDailyCardUpright] = useState<boolean>(true);
  const [isDrawingDaily, setIsDrawingDaily] = useState(false);

  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    mysticAudio.playChime(528, 2);
    onStartReadingWithData(birthDate, question);
  };

  const handleDrawDailyCard = () => {
    setIsDrawingDaily(true);
    mysticAudio.playCardFlip();
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
      const pulse = Math.sin(Date.now() * 0.003 + randomIndex * 7);
      setDailyCardUpright((pulse + (Math.random() * 2 - 1)) > -0.15);
      setDailyCard(TAROT_DECK[randomIndex]);
      setIsDrawingDaily(false);
      mysticAudio.playChime(639, 2.5);
    }, 700);
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ========================================================
          1. HERO SECTION (Exactly matching Screenshot 1)
         ======================================================== */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center text-center px-4 sm:px-6 pt-16 pb-20 overflow-hidden">
        {/* Full-bleed celestial clouds, constellation lines & faint golden crescent moon */}
        <CelestialHeroBackground />

        {/* Hero Content (Centered) */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Tag: ✦ MYSTIC ✦ */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.32em] gold-kicker">
            <span className="text-[#8E441D]">✦</span>
            <span className="font-sans font-bold tracking-[0.35em] text-[#6E2D1F]">M Y S T I C</span>
            <span className="text-[#8E441D]">✦</span>
          </div>

          {/* Headline: Од гараг эрхсээс өөрийгөө асууж, дотоод ертөнцөө нээ */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mystic font-normal text-[#240E16] tracking-tight leading-[1.18] text-balance">
            Од гараг эрхсээс өөрийгөө асууж, <br />
            <span className="gold-italic text-5xl sm:text-7xl lg:text-8xl">дотоод ертөнцөө</span> нээ
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#46232D] max-w-2xl mx-auto leading-relaxed font-sans font-medium">
            Төрсөн огноо болон асуултаа оруулаад хувийн тоон зурхай, Tarot уншлагаа аваарай.
          </p>

          {/* Primary CTA button: ✦ ҮНЭГҮЙ ЭХЛЭХ (Screenshot 1) */}
          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                if (!showQuickForm) {
                  setShowQuickForm(true);
                  mysticAudio.playChime(528, 1.5);
                } else {
                  handleHeroSubmit();
                }
              }}
              className="px-9 py-4 rounded-full bg-gradient-to-r from-[#441E28] via-[#542533] to-[#441E28] border border-[#DEB76A]/50 hover:border-[#DEB76A]/90 text-white font-sans font-semibold text-xs sm:text-sm tracking-[0.22em] uppercase shadow-[0_12px_28px_rgba(68,30,40,0.3)] hover:shadow-[0_16px_36px_rgba(142,68,29,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 group"
            >
              <span className="text-sm text-[#F0D598] group-hover:rotate-45 transition-transform">✦</span>
              <span className="tracking-[0.25em]">ҮНЭГҮЙ ЭХЛЭХ</span>
            </button>

            {/* Quick entry dropdown for immediate reading */}
            {showQuickForm ? (
              <form
                onSubmit={handleHeroSubmit}
                className="w-full max-w-lg mt-4 p-6 rounded-2xl bg-[#FFF6F3]/90 border border-[#9C6E65]/35 shadow-xl space-y-4 text-left animate-fadeIn backdrop-blur-md"
              >
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-[#4A262E] mb-1.5 font-semibold">
                    Төрсөн огноогоо сонгоно уу
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white border border-[#9C6E65]/30 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-[#4A262E] mb-1.5 font-semibold">
                    Сонирхсон асуулт тань юу вэ?
                  </label>
                  <input
                    type="text"
                    placeholder="Жишээ: Миний энэ жилийн ажил, хайр дурлал ямар байх вэ?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white border border-[#9C6E65]/30 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] placeholder:text-[#9A7A80] focus:outline-none focus:border-[#8E5244]"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#4D2630] text-white font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#3D1D25] transition-colors cursor-pointer"
                  >
                    Шууд уншлага авах →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickForm(false)}
                    className="px-4 py-3 rounded-xl border border-[#9C6E65]/30 text-[#5A353E] hover:bg-[#9C6E65]/10 text-xs font-serif uppercase tracking-wider cursor-pointer"
                  >
                    Хаах
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-[#6B424B] tracking-wide">
                Бүртгэл шаардахгүй · Life Path тоо болон 3 Tarot карт үнэгүй
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          2. BRAND INTRO SECTION (Exactly matching Screenshot 2)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Side: 3 fan-spread dark navy & gold foil tarot cards */}
          <div className="lg:col-span-6 flex justify-center">
            <DarkGoldTarotFan />
          </div>

          {/* Right Side: Typography and Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs uppercase gold-kicker">
              <span>✦</span>
              <span>Өөрийгөө таних аялал</span>
              <span>✦</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-mystic font-normal text-[#230F16] leading-[1.2]">
              Дотоод дуу хоолойгоо <br />
              <span className="gold-italic text-5xl sm:text-6xl">сонс</span>
            </h2>

            <p className="text-base sm:text-lg text-[#3F1E26] leading-relaxed font-sans font-normal">
              MYSTIC нь ирээдүйг таамагладаггүй — харин бэлгэдэл, тоогоор дамжуулан өөрийн бодол, мэдрэмж, сонголтоо шинэ өнцгөөс харахад тусалдаг. Уншлага бүр зугаа цэнгэл ба өөрийгөө эргэцүүлэх зориулалттай.
            </p>

            {/* Trust badge */}
            <div className="pt-2 flex items-center gap-2.5 text-xs sm:text-sm text-[#48222B] font-medium">
              <ShieldCheck className="w-5 h-5 text-[#8E441D] shrink-0" />
              <span>Таны мэдээлэл нууцлагдан, зөвхөн танд харагдана.</span>
            </div>

            {/* Quick buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('tarot')}
                className="px-6 py-3 rounded-full border border-[#8C4524]/50 hover:border-[#8C4524] text-[#2A1118] hover:bg-[#8C4524]/10 font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-sm"
              >
                Tarot хөзөр сурах
              </button>
              <button
                onClick={() => onNavigate('numerology')}
                className="px-6 py-3 rounded-full border border-[#8C4524]/50 hover:border-[#8C4524] text-[#2A1118] hover:bg-[#8C4524]/10 font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-sm"
              >
                Тоон зурхайгаа шалгах
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. DAILY ZODIAC HOROSCOPE
          ======================================================== */}
      <DailyZodiac onNavigateToReading={() => onNavigate('reading')} />

      {/* ========================================================
          4. PACKAGES HEADING (Screenshot 2 bottom: "Уншлагын багцууд")
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs uppercase gold-kicker">
          <span>✦</span>
          <span>Хувийн Зөвлөгөө</span>
          <span>✦</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-mystic font-bold text-[#230F16] tracking-tight">
          Уншлагын багцууд
        </h2>
        <p className="text-sm sm:text-base text-[#46232D] max-w-xl mx-auto font-sans font-medium">
          Өөрийн сэтгэлийн асуултад тохирсон багцыг сонгон, ойлгомжтой бөгөөд дулаан зөвлөгөө аваарай.
        </p>

        {/* 3 Quick Package Previews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          {/* Free */}
          <div className="p-6 rounded-3xl bg-[#FFF6F3]/90 border border-[#DEB76A]/40 shadow-lg space-y-4 flex flex-col justify-between hover:border-[#8C4524]/70 transition-all">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-sans text-[#783323] font-bold">
                Үнэгүй Багц
              </span>
              <h3 className="text-xl font-mystic font-bold text-[#230F16]">
                FREE READING
              </h3>
              <div className="text-2xl font-mystic font-bold text-[#783323]">
                0₮
              </div>
              <p className="text-xs text-[#46232D] leading-relaxed">
                Life Path тоо болон 3 Tarot картын товч хувийн тайлбар.
              </p>
            </div>
            <button
              onClick={() => onNavigate('reading')}
              className="w-full py-2.5 rounded-xl border border-[#8C4524]/50 text-[#2A1118] hover:bg-[#8C4524]/10 text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer text-center"
            >
              Үнэгүй эхлэх →
            </button>
          </div>

          {/* Love */}
          <div className="p-6 rounded-3xl bg-[#FFF5F0] border-2 border-[#A8582A] shadow-xl space-y-4 flex flex-col justify-between relative hover:shadow-[0_12px_32px_rgba(168,88,42,0.25)] transition-all">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#441E28] to-[#5F2937] text-[#FFF6EE] text-[10px] font-sans uppercase tracking-widest px-3 py-1 rounded-full font-bold border border-[#DEB76A]/40 shadow-sm">
              Хамгийн эрэлттэй
            </div>
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-sans text-[#783323] font-bold">
                Хайр & Харилцаа
              </span>
              <h3 className="text-xl font-mystic font-bold text-[#230F16]">
                LOVE READING
              </h3>
              <div className="text-2xl font-mystic font-bold text-[#783323]">
                {formatPrice(planPrices.love)}
              </div>
              <p className="text-xs text-[#46232D] leading-relaxed">
                5 Tarot карт, хосын харилцааны энергийн тохироо, чин сэтгэлийн тайлал.
              </p>
            </div>
            <button
              onClick={() => {
                if (activePlan === 'love' || activePlan === 'full') {
                  if (onSelectPlan) onSelectPlan('love');
                  else onNavigate('reading');
                } else {
                  onNavigate('pricing');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#441E28] via-[#542533] to-[#441E28] border border-[#DEB76A]/40 hover:border-[#DEB76A]/80 text-white text-xs font-sans uppercase tracking-wider font-bold transition-all cursor-pointer text-center shadow-md"
            >
              {activePlan === 'love' || activePlan === 'full'
                ? 'Уншлагын үр дүн үзэх (Active) →'
                : 'Дэлгэрэнгүй үзэх →'}
            </button>
          </div>

          {/* Full */}
          <div className="p-6 rounded-3xl bg-[#FFF6F3]/90 border border-[#DEB76A]/40 shadow-lg space-y-4 flex flex-col justify-between hover:border-[#8C4524]/70 transition-all">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-sans text-[#783323] font-bold">
                Бүтэн Уншлага
              </span>
              <h3 className="text-xl font-mystic font-bold text-[#230F16]">
                FULL READING
              </h3>
              <div className="text-2xl font-mystic font-bold text-[#783323]">
                {formatPrice(planPrices.full)}
              </div>
              <p className="text-xs text-[#46232D] leading-relaxed">
                7 Tarot карт, тоон зурхайн бүх кодууд, 2026 оны бүтэн жилийн хувийн зөвлөгөө.
              </p>
            </div>
            <button
              onClick={() => {
                if (activePlan === 'full') {
                  if (onSelectPlan) onSelectPlan('full');
                  else onNavigate('reading');
                } else {
                  onNavigate('pricing');
                }
              }}
              className="w-full py-2.5 rounded-xl border border-[#8C4524]/50 text-[#2A1118] hover:bg-[#8C4524]/10 text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer text-center"
            >
              {activePlan === 'full'
                ? 'Дэлгэрэнгүй уншлага үзэх (Active) →'
                : 'Багц үзэх →'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. DAILY CARD SECTION
         ======================================================== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FFF6F3]/90 border border-[#9C6E65]/30 text-center space-y-6 shadow-xl">
          <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#8E5244]">
            Өдрийн Бэлгэдэл
          </span>
          <h3 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E]">
            Өнөөдрийн Таро Картыг Татах
          </h3>
          <p className="text-xs sm:text-sm text-[#5C3841] max-w-md mx-auto leading-relaxed">
            Өнөөдөр ямар энерги таныг дагалдаж буйг нэг товшилтоор мэдэж, сэтгэлээ тайван байлгаарай.
          </p>

          {!dailyCard ? (
            <div className="flex flex-col items-center gap-5 pt-2">
              <div className="w-32 h-48 rounded-xl shadow-md">
                <TarotCardBack className="w-full h-full" />
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleDrawDailyCard}
                  disabled={isDrawingDaily}
                  className="px-7 py-3 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-medium text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDrawingDaily ? 'Картыг дэлгэж байна...' : 'Өнөөдрийн карт татах'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto">
                <div className="w-36 h-56 shrink-0 rounded-2xl shadow-2xl overflow-hidden border border-[#DEB76A]/50 animate-card-spin-3d tarot-glow-celestial">
                  <TarotCardFront
                    name={dailyCard.name}
                    image={dailyCard.image}
                    number={dailyCard.number}
                    cardId={dailyCard.id}
                    keywords={dailyCard.keywords}
                    isUpright={dailyCardUpright}
                    element={dailyCard.element}
                    symbolism={dailyCard.symbolism}
                  />
                </div>
                <div className="flex-1 p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 text-left space-y-3 shadow-md">
                  <div className="p-3 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex justify-between items-center gap-2">
                    <div>
                      <h4 className="text-base font-mystic font-bold text-[#2A1118]">
                        {dailyCard.name}
                      </h4>
                      <span className="text-[11px] text-[#7A4E58] font-sans font-bold">
                        {dailyCard.nameEn} · {dailyCard.element}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-serif font-bold border shrink-0 ${
                        dailyCardUpright
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {dailyCardUpright ? '✨ Эгц байрлал' : '🔄 Урвуу байрлал'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2F171E] leading-relaxed pl-1">
                    {dailyCardUpright ? dailyCard.uprightMeaning : dailyCard.reversedMeaning}
                  </p>
                  <div className="text-xs text-[#8E441D] font-bold pt-1 border-t border-[#D4AF37]/25 pl-1">
                    Түлхүүр үгс: {dailyCard.keywords.join(' · ')}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDrawDailyCard}
                className="px-6 py-2 text-xs uppercase font-serif tracking-widest text-[#4D2630] hover:underline cursor-pointer"
              >
                Дахин өөр карт татах
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
