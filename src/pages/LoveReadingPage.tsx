import React, { useState, useEffect } from 'react';
import { useReading, saveReadingToHistory } from '../context/ReadingContext';
import { useShop } from '../context/ShopContext';
import { CheckoutModal } from '../components/CheckoutModal';
import {
  Heart,
  Lock,
  Sparkles,
  Compass,
  Award,
  ShieldCheck,
  Clock,
  Zap,
  Wand2,
  Copy,
  Check,
  RotateCw,
  Crown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { TopDrawnCardsBar } from '../components/TopDrawnCardsBar';
import { FormattedReading, cleanMarkdownSymbols } from '../components/FormattedReading';

interface LoveReadingPageProps {
  onNavigateToFree?: () => void;
  onNavigateToVip: () => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
}

interface LoveSections {
  overview: string;
  deepDive: string;
  karmic: string;
  energyExchange: string;
  emotionalBlocks: string;
  timeline: string;
  scenarios: string;
  actionableAdvice: string;
  affirmation: string;
}

export const LoveReadingPage: React.FC<LoveReadingPageProps> = ({
  onNavigateToFree,
  onNavigateToVip,
  currentUserEmail,
  currentUserName,
}) => {
  const {
    cards,
    userQuestion,
    hasDrawnCards,
    drawCards,
    isLoveUnlocked,
    loveOrderStatus,
    consumeReadingAccess,
  } = useReading();
  const { planPrices, formatPrice } = useShop();
  const lovePriceText = formatPrice(planPrices.love);
  const fullPriceText = formatPrice(planPrices.full);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string>('');
  const [parsedSections, setParsedSections] = useState<LoveSections | null>(null);
  const [viewMode, setViewMode] = useState<'pillars' | 'full'>('pillars');
  const [copied, setCopied] = useState(false);

  const parseLoveReading = (text: string): LoveSections => {
    const raw = text || '';
    const extract = (start: RegExp, end: RegExp): string => {
      const match = raw.match(new RegExp(`${start.source}([\\s\\S]*?)(?=${end.source}|$)`, 'i'));
      if (!match) return '';
      const body = match[1]
        .replace(/^[^\n]*?:\s*\n?/, '')
        .replace(/^[:\-\s\n]+/, '')
        .trim();
      return cleanMarkdownSymbols(body);
    };

    const overview =
      extract(/1\.\s*Картуудын энергийн ерөнхий дүр зураг/i, /2\.\s*Сэтгэл зүй/i) ||
      'Хөзрүүдийн голлох уур амьсгал нь бие биеэ танин мэдэх, далд эргэлзээг тайлах, мөн харилцан итгэлцлийн шинэ шатанд шилжих хүчтэй таталцлыг үүсгэж байна.';

    const deepDive =
      extract(/2\.\s*Сэтгэл зүй/i, /3\.\s*(?:Кармик|Хувь заяаны) холбоо/i) ||
      'Таны зүгээс харилцаандаа тогтвортой байдал, үнэнч нээлттэй байдлыг хүсэмжилж буй бол нөгөө тал өөрийн мэдрэмжээ шууд илэрхийлэхээс болгоомжилсон байр суурьтай байна.';

    const karmic =
      extract(/3\.\s*(?:Кармик|Хувь заяаны) холбоо/i, /4\.\s*Хосын (?:энергийн|сэтгэлийн)/i) ||
      'Энэ харилцаа нь бие биенийхээ эмзэг талыг тольдон харуулж, өөрийгөө болон бусдыг чин сэтгэлээсээ ойлгож хайрлахад суралцах утга учиртай холбоо юм.';

    const energyExchange =
      extract(/4\.\s*Хосын (?:энергийн|сэтгэлийн)/i, /5\.\s*Сэтгэл хөдлөлийн/i) ||
      'Сэтгэлийн санаачилга, анхаарал халамжийг нэг тал нь арай илүү гаргаж байгаа бөгөөд харилцан тэнцвэртэй байдлыг ярилцаж тогтоох нь чухал.';

    const emotionalBlocks =
      extract(/5\.\s*Сэтгэл хөдлөлийн/i, /6\.\s*Цаг хугацааны/i) ||
      'Таны тал дээр: Эмзэг байдалд орохоос эмээх дотоод түгшүүр.\nНөгөө хүний тал дээр: Хувийн орон зай, бие даасан байдлаа хамгаалах далд хаалт.';

    const timeline =
      extract(/6\.\s*Цаг хугацааны/i, /7\.\s*Хамгийн сайнаар/i) ||
      'Ойрын 1-3 долоо хоногт: Сэтгэл хөдлөл тогтворжиж, тайван дулаан яриа өрнөнө.\nИрэх 1-3 сарын хугацаанд: Харилцааны цаашдын чиг тодорхой болж, чухал шийдвэрт хүрнэ.';

    const scenarios =
      extract(/7\.\s*Хамгийн сайнаар/i, /8\.\s*(?:Практик|Бодит) зөвлөгөө/i) ||
      'Хамгийн таатай өөрчлөлт: Сэтгэлийн гүн итгэлцэлд хүрч, бат бөх зохицол үүсэх.\nАнхаарвал зохих эрсдэл: Илэн далангүй ярилцахын оронд дотроо гомдол хуримтлуулах.';

    const actionableAdvice =
      extract(/8\.\s*(?:Практик|Бодит) зөвлөгөө/i, /(?:✨\s*)?(?:Энергийн\s*|Сэтгэлийн\s*)?(?:Affirmation|батламж)/i) ||
      'Юуг эрхэмлэх хэрэгтэй вэ?: Мэдрэмжээ тайван хуваалцаж, бие биедээ тайван орон зай олгох.\nЮунаас зайлсхийх ёстой вэ?: Урьдчилсан таамаг дэвшүүлж буруутгахаас зайлсхийх.';

    let aff = '';
    const affMatch = raw.match(/(?:(?:✨\s*)?(?:Энергийн\s*|Сэтгэлийн\s*)?(?:Affirmation|батламж)[\s\S]*$)/i);
    if (affMatch) {
      aff = cleanMarkdownSymbols(
        affMatch[0]
          .replace(/^(?:✨\s*)?(?:Энергийн\s*|Сэтгэлийн\s*)?(?:Affirmation|батламж)[^\n]*\n?/i, '')
          .replace(/^[-\s:"]+/, '')
          .replace(/["\s]+$/, '')
      );
    }
    if (!aff) {
      aff = 'Би хайрын өмнө зүрхээ нээж, харилцаандаа итгэлцэл ба амар амгаланг хүлээн авч байна.';
    }

    return {
      overview,
      deepDive,
      karmic,
      energyExchange,
      emotionalBlocks,
      timeline,
      scenarios,
      actionableAdvice,
      affirmation: aff,
    };
  };

  const loadLoveReading = async () => {
    let activeCards = cards;
    if (!hasDrawnCards) {
      activeCards = drawCards();
    }

    setIsLoading(true);
    const readingId = `love_${Date.now()}`;
    let finalRaw = '';
    let finalSections: LoveSections;

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          category: 'Хайр дурлал',
          plan: 'love',
          tarotCards: activeCards.map((c) => ({
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
        finalRaw = data.reading;
        finalSections = parseLoveReading(data.reading);
        setReadingResult(data.reading);
        setParsedSections(finalSections);
        mysticAudio.playChime(639, 2.5);
      } else {
        throw new Error('No love reading');
      }
    } catch {
      finalSections = parseLoveReading('');
      setParsedSections(finalSections);
    } finally {
      // Save generated love reading to profile history and consume single-use order
      const nowStr = new Date().toLocaleDateString('mn-MN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      saveReadingToHistory({
        id: readingId,
        date: nowStr,
        cards: activeCards.map((c) => `${c.card.name}${c.isUpright ? '' : ' (Урвуу)'}`),
        cardIds: activeCards.map((c) => c.card.id),
        summary: finalSections!.overview.slice(0, 180) + '...',
        type: 'Хайр Дурлалын Гүнзгийрүүлсэн Тайлал',
        category: 'love',
        details: {
          content: finalRaw,
          sections: finalSections!,
          question: userQuestion,
        },
      });
      consumeReadingAccess('love', readingId);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoveUnlocked && !readingResult && !parsedSections && !isLoading) {
      loadLoveReading();
    }
  }, [isLoveUnlocked]);

  const handleCopy = () => {
    if (readingResult) {
      navigator.clipboard.writeText(cleanMarkdownSymbols(readingResult));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showUnlockedView = isLoveUnlocked || Boolean(parsedSections);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Single Clean Page Title */}
      <div className="text-center space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#2A1118]">
          Хайр Дурлалын Гүнзгийрүүлсэн Тайлал
        </h1>
        <p className="text-sm sm:text-base text-[#4E2B34] max-w-2xl mx-auto leading-relaxed">
          Таны татсан 3 хөзөрт суурилсан сэтгэлийн холбоо, дотоод мэдрэмж болон ирэх саруудын чиг баримжаа бүхий 8 хэсэгт нарийвчилсан тайлал.
        </p>
      </div>

      {/* Persistent 3 Drawn Cards at Top */}
      <TopDrawnCardsBar onNavigateToFree={onNavigateToFree} />

      {/* Main Container: Locked vs Unlocked */}
      {!showUnlockedView ? (
        /* LOCKED STATE - WARM LIGHT PARCHMENT */
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/55 text-[#2A1118] shadow-xl relative overflow-hidden space-y-8">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF0E4] border-2 border-[#C59B27]/45">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400/60 flex items-center justify-center text-[#8E441D]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                {loveOrderStatus === 'pending'
                  ? '⏳ Таны төлбөр шалгагдаж байна'
                  : loveOrderStatus === 'consumed'
                  ? '✅ Өмнөх эрх ашиглагдсан (Профайлаас хадгалсан уншлагаа харна уу)'
                  : '🔒 Төлбөр баталгаажиж эрх нээгдэх хүртэл түгжээтэй (1 удаагийн эрх)'}
              </h2>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs text-[#7A4E58] block font-sans font-semibold">Багцын үнэ:</span>
              <span className="text-2xl font-mystic font-bold text-[#8E441D]">{lovePriceText}</span>
            </div>
          </div>

          {/* Core Action Button */}
          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-r from-[#8E441D] via-[#A65427] to-[#8E441D] hover:from-[#783715] hover:to-[#783715] text-[#FFF6F3] font-serif font-bold text-sm sm:text-base uppercase tracking-widest shadow-xl transition-all cursor-pointer inline-flex items-center gap-3 hover:scale-105"
            >
              <Heart className="w-5 h-5 text-[#FCEBE6]" />
              <span>Хайрын багц нээх ({lovePriceText})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-[#6D3B47] font-sans">
              Хаан банк болон Голомт банкаар шилжүүлэг хийж эрхээ нээнэ.
            </p>
          </div>

          {/* Unlocked Features Preview Grid */}
          <div className="pt-6 border-t border-[#D4AF37]/30 space-y-4">
            <div className="p-3 rounded-xl border-2 border-[#C59B27]/45 bg-[#FFFDF9] text-center">
              <h3 className="text-xs uppercase font-serif tracking-[0.2em] text-[#8E441D] font-bold">
                Төлбөр баталгаажсанаар нээгдэх 8 хэсэгт тайлал
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs text-[#4E2B34]">
              {[
                { title: '1. Хөзрүүдийн ерөнхий зураг', desc: 'Хөзрүүдийн харилцан уялдаа' },
                { title: '2. Сэтгэл зүй ба мэдрэмж', desc: 'Хоёр талын дотоод өнгө аяс' },
                { title: '3. Хувь заяаны холбоо', desc: 'Сүнслэг сургамж ба учир шалтгаан' },
                { title: '4. Сэтгэлийн тэнцвэрт байдал', desc: 'Харилцан халамж ба өгөөж' },
                { title: '5. Сэтгэл хөдлөлийн саад', desc: 'Таны болон нөгөө хүний болгоомжлол' },
                { title: '6. Цаг хугацааны баримжаа', desc: '1-3 долоо хоног ба 1-3 сар' },
                { title: '7. Боломжит хувилбарууд', desc: 'Таатай өөрчлөлт ба сэрэмжлэх зүйлс' },
                { title: '8. Бодит зөвлөгөө', desc: 'Эрхэмлэх алхам ба зайлсхийх зүйлс' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FFFDF9] border-2 border-[#D4AF37]/35 space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-serif font-bold text-[#2A1118]">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#6D3B47]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE - RICH 8 PILLARS IN WARM LIGHT THEME */
        <div className="space-y-8 animate-fadeIn">
          {/* Top Unlocked Action Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] border-2 border-[#C59B27]/55 flex items-center justify-between flex-wrap gap-4 text-[#2A1118] shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xs sm:text-sm font-serif font-bold text-[#2A1118]">
                Хайр дурлалын багц баталгаажсан
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'pillars' ? 'full' : 'pillars')}
                className="px-3.5 py-1.5 rounded-lg border border-[#C59B27]/50 bg-white hover:bg-[#FAF1E4] text-xs text-[#542B34] font-serif font-bold transition-all cursor-pointer shadow-xs"
              >
                {viewMode === 'pillars' ? 'Бүтэн эхээр харах' : 'Бүлэгчилсэн харагдац'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg border border-[#C59B27]/50 bg-white hover:bg-[#FAF1E4] text-xs text-[#542B34] font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Хуулагдлаа' : 'Хуулах'}</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 text-center space-y-4 shadow-md">
              <RotateCw className="w-8 h-8 text-[#8E441D] animate-spin mx-auto" />
              <p className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                Картуудын нууцыг тайлж байна...
              </p>
            </div>
          ) : parsedSections && viewMode === 'pillars' ? (
            /* 8 Specialized Cards with Framed Bold Subheaders & Warm Light Background */
            <div className="space-y-6">
              {[
                { icon: Sparkles, title: '1. Хөзрүүдийн Энергийн Ерөнхий Дүр Зураг', body: parsedSections.overview },
                { icon: Heart, title: '2. Сэтгэл Зүй ба Далд Мэдрэмжийн Тайлал', body: parsedSections.deepDive },
                { icon: Compass, title: '3. Хувь Заяаны Холбоо ба Далд Учир Шалтгаан', body: parsedSections.karmic },
                { icon: Award, title: '4. Хосын Сэтгэлийн Тэнцвэрт Байдал', body: parsedSections.energyExchange },
                { icon: ShieldCheck, title: '5. Сэтгэл Хөдлөлийн Саад ба Болгоомжлол', body: parsedSections.emotionalBlocks },
                { icon: Clock, title: '6. Цаг Хугацааны Чиг Баримжаа', body: parsedSections.timeline },
                { icon: Zap, title: '7. Хамгийн Сайнаар болон Муугаар Эргэх Хувилбар', body: parsedSections.scenarios },
                { icon: Wand2, title: '8. Бодит Зөвлөгөө ба Хийх Алхмууд', body: parsedSections.actionableAdvice },
              ].map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/50 p-6 sm:p-7 space-y-4 shadow-md"
                >
                  {/* Framed Bold Subheader */}
                  <div className="p-3 sm:p-3.5 rounded-xl border-2 border-[#C59B27]/55 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-[#E8C582]/35 border border-[#C59B27]/50 flex items-center justify-center text-[#8E441D] shrink-0">
                      <sec.icon className="w-4 h-4 text-[#8E441D]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-mystic font-bold text-[#2A1118]">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-[#2F171E] whitespace-pre-line font-sans pl-1">
                    {sec.body}
                  </p>
                </div>
              ))}

              {/* Affirmation Block */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] border-2 border-[#C59B27]/55 text-center space-y-2.5 shadow-md">
                <div className="inline-block px-4 py-1.5 rounded-xl border-2 border-[#C59B27]/50 bg-[#FFFDF9] text-xs uppercase font-serif tracking-[0.2em] text-[#8E441D] font-bold">
                  ✨ Сэтгэлийн батламж үг ✨
                </div>
                <p className="text-base sm:text-lg font-serif italic font-bold text-[#2A1118] max-w-2xl mx-auto leading-relaxed pt-1">
                  "{parsedSections.affirmation}"
                </p>
              </div>
            </div>
          ) : (
            /* Clean full view with bold framed subheaders and warm light background */
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/50 shadow-lg">
              <FormattedReading content={readingResult} theme="light" hideMainBanner={true} />
            </div>
          )}
        </div>
      )}

      {/* Bottom Section: Full Reading Banner (No VIP word) */}
      <div className="pt-6 border-t border-[#BA7765]/25">
        <div
          onClick={onNavigateToVip}
          className="group p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5E9D6] border-2 border-[#D4AF37]/65 hover:border-[#8E441D] text-[#2A1118] shadow-xl relative overflow-hidden transition-all cursor-pointer hover:-translate-y-1"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#E8C582]/35 border border-[#C59B27]/50 flex items-center justify-center text-[#8E441D] shrink-0">
                <Crown className="w-6 h-6 text-[#8E441D]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#2A1118] group-hover:text-[#8E441D] transition-colors">
                  Бүтэн уншлага руу шилжих ({fullPriceText})
                </h3>
                <p className="text-xs sm:text-sm text-[#542B34]">
                  Ажил мэргэжил, санхүү, эрүүл мэнд болон хувийн асуултын дэлгэрэнгүй тайлал авах.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="px-5 py-2.5 rounded-xl bg-[#8E441D] group-hover:bg-[#783715] text-[#FFF6F3] text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 shadow-md">
                <span>Бүтэн уншлага нээх</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal for Love Plan */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={{
          id: 'love',
          name: 'Хайр дурлалын гүнзгий тайлал',
          price: lovePriceText,
          amount: planPrices.love,
        }}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        onOrderSubmitted={() => {
          // Status updated, modal handles feedback
        }}
      />
    </div>
  );
};
