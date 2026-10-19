import React, { useState, useEffect } from 'react';
import { useReading, saveReadingToHistory } from '../context/ReadingContext';
import { useShop } from '../context/ShopContext';
import { CheckoutModal } from '../components/CheckoutModal';
import {
  Crown,
  Lock,
  Sparkles,
  Briefcase,
  DollarSign,
  Sprout,
  HeartPulse,
  Compass,
  Wand2,
  Copy,
  Check,
  RotateCw,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Send,
  Zap,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { TopDrawnCardsBar } from '../components/TopDrawnCardsBar';
import { FormattedReading, cleanMarkdownSymbols } from '../components/FormattedReading';

interface VipReadingPageProps {
  onNavigateToFree?: () => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
}

interface VipSections {
  overview: string;
  career: string;
  finance: string;
  growth: string;
  health: string;
  decision: string;
  talents: string;
  customQA: string;
  affirmation: string;
}

export const VipReadingPage: React.FC<VipReadingPageProps> = ({
  onNavigateToFree,
  currentUserEmail,
  currentUserName,
}) => {
  const {
    cards,
    userQuestion,
    hasDrawnCards,
    drawCards,
    isVipUnlocked,
    vipOrderStatus,
    consumeReadingAccess,
  } = useReading();
  const { planPrices, formatPrice } = useShop();
  const fullPriceText = formatPrice(planPrices.full);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string>('');
  const [parsedSections, setParsedSections] = useState<VipSections | null>(null);
  const [viewMode, setViewMode] = useState<'pillars' | 'full'>('pillars');
  const [copied, setCopied] = useState(false);
  const [vipCustomQuestion, setVipCustomQuestion] = useState<string>(userQuestion || '');

  // Keep synced with global userQuestion if user hasn't typed anything custom
  useEffect(() => {
    if (userQuestion && !vipCustomQuestion) {
      setVipCustomQuestion(userQuestion);
    }
  }, [userQuestion]);

  const parseVipReading = (text: string): VipSections => {
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
      extract(/1\.\s*Картуудын энергийн ерөнхий дүр зураг/i, /2\.\s*(?:💼\s*)?(?:Карьер|Ажил мэргэжил)/i) ||
      'Татсан 3 хөзөр нь таны амьдралын одоогийн ерөнхий хэмнэл даван туулах чадвар, өсөлт ба шинэчлэлийн хүчирхэг мөчлөгт шилжиж буйг тодорхойлж байна.';

    const career =
      extract(/2\.\s*(?:💼\s*)?(?:Карьер|Ажил мэргэжил)/i, /3\.\s*(?:💰\s*)?Санхүү/i) ||
      'Ажил мэргэжлийн замналд манлайлах, санаачилга гаргах орон зай тэлнэ. Хөндлөнгийн саад бэрхшээлийг боломж болгон хувиргах арга барил баримталж, өөрийн ур чадварыг дутуу үнэлэхгүй байх нь нэн чухал.';

    const finance =
      extract(/3\.\s*(?:💰\s*)?Санхүү/i, /4\.\s*(?:🌱\s*)?Хувь хүний/i) ||
      'Санхүүгийн урсгал шинэ орлогын эх үүсвэр болон оновчтой хөрөнгө оруулалтын шийдвэрээр тэлэх боломжтой. Элбэг хангалуун байдлыг татахын тулд хомсдолын айдсаа чөлөөлж, үнэ цэнэ бүтээх зарчимд төвлөрөөрэй.';

    const growth =
      extract(/4\.\s*(?:🌱\s*)?Хувь хүний/i, /5\.\s*(?:🌿\s*)?Эрүүл мэнд/i) ||
      'Та өөрийгөө хуучин хязгаарлагдмал хүрээнээс чөлөөлөх чухал үе дээр зогсож байна. Өөртөө эргэлзэх далд айдсыг даван туулж, дотоод зөн совиндоо найдах нь таныг шинэ түвшинд хөтөлнө.';

    const health =
      extract(/5\.\s*(?:🌿\s*)?Эрүүл мэнд/i, /6\.\s*(?:🔀\s*)?Чухал шийдвэр/i) ||
      'Сэтгэл зүйн болон биеийн ачааллыг тэнцвэржүүлэхэд байгальтай ойр байх, нойрны чанартаа анхаарах, мэдээллийн хэт ачааллаас түр завсарлага авах нь нэн чухал.';

    const decision =
      extract(/6\.\s*(?:🔀\s*)?Чухал шийдвэр/i, /7\.\s*(?:✨\s*)?Далд авьяас/i) ||
      'Чухал сонголтын өмнө шийдвэр гаргахдаа айдаст биш, өөрийн урт хугацааны алсын хараанд тулгуурлаарай. Бусдын шахалтаар яаран шийдвэр гаргахаас сэргийлж, бодит баримт болон дотоод амар амгаланг нийцүүлээрэй.';

    const talents =
      extract(/7\.\s*(?:✨\s*)?Далд авьяас/i, /8\.\s*(?:🔮\s*)?Хэрэглэгчийн хувийн/i) ||
      'Таны доторх торгон мэдрэмж, бусдыг удирдан чиглүүлэх болон нөхцөл байдлыг цэгцлэх авьяас бүрэн нээгдэж байна. Шинэ ур чадвар эзэмших, өөрийн өвөрмөц санааг зоригтой турших үед таатай боломжууд нээгдэнэ.';

    const customQA =
      extract(/8\.\s*(?:🔮\s*)?Хэрэглэгчийн хувийн/i, /(?:✨\s*)?(?:VIP\s*)?(?:Энергийн|Сэтгэлийн)/i) ||
      'Таны тавьсан тодорхой асуултад: Хөзрүүд танд гаднын зөвшөөрөл хүлээлгүйгээр, шууд бодит эхний алхмаа өөртөө итгэлтэй хийхийг зөвлөж байна. Нөхцөл байдал таны талд эргэх таатай урсгал бүрдсэн байна.';

    let aff = '';
    const affMatch = raw.match(/(?:(?:✨\s*)?(?:VIP\s*)?(?:Энергийн|Сэтгэлийн)[\s\S]*$)/i);
    if (affMatch) {
      aff = cleanMarkdownSymbols(
        affMatch[0]
          .replace(/^(?:✨\s*)?(?:VIP\s*)?(?:Энергийн|Сэтгэлийн)[^\n]*\n?/i, '')
          .replace(/^[-\s:"]+/, '')
          .replace(/["\s]+$/, '')
      );
    }
    if (!aff) {
      aff = 'Би өөрийн хувь тавилангийн бүтээгч бөгөөд амьдралынхаа бүхий л салбарт элбэг хангалуун байдал, хүч чадал, амар амгаланг хүлээн авч байна.';
    }

    return {
      overview,
      career,
      finance,
      growth,
      health,
      decision,
      talents,
      customQA,
      affirmation: aff,
    };
  };

  const loadVipReading = async (customQOverride?: string) => {
    let activeCards = cards;
    if (!hasDrawnCards) {
      activeCards = drawCards();
    }

    const questionToSend = customQOverride !== undefined ? customQOverride : vipCustomQuestion;

    setIsLoading(true);
    const readingId = `full_${Date.now()}`;
    let finalRaw = '';
    let finalSections: VipSections;

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          vipCustomQuestion: questionToSend,
          category: 'vip',
          plan: 'full',
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
        finalSections = parseVipReading(data.reading);
        setReadingResult(data.reading);
        setParsedSections(finalSections);
        mysticAudio.playChime(639, 3);
      } else {
        throw new Error('No full reading');
      }
    } catch {
      finalSections = parseVipReading('');
      setParsedSections(finalSections);
    } finally {
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
        type: 'Амьдралын Гүнзгийрүүлсэн Тайлал (Бүтэн Уншлага)',
        category: 'full',
        details: {
          content: finalRaw,
          sections: finalSections!,
          question: questionToSend || userQuestion,
        },
      });
      consumeReadingAccess('full', readingId);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVipUnlocked && !readingResult && !parsedSections && !isLoading) {
      loadVipReading();
    }
  }, [isVipUnlocked]);

  const handleCopy = () => {
    if (readingResult) {
      navigator.clipboard.writeText(cleanMarkdownSymbols(readingResult));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && isVipUnlocked) {
      loadVipReading(vipCustomQuestion);
    }
  };

  const showUnlockedView = isVipUnlocked || Boolean(parsedSections);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Single Clean Page Title */}
      <div className="text-center space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#2A1118]">
          Амьдралын Гүнзгийрүүлсэн Тайлал
        </h1>
        <p className="text-sm sm:text-base text-[#4E2B34] max-w-2xl mx-auto leading-relaxed">
          3 хөзрийн уялдаа, ажил мэргэжил, санхүү, дотоод өсөлт, эрүүл мэнд, чухал шийдвэр, далд авьяас болон таны хувийн асуултын дэлгэрэнгүй тайлал.
        </p>
      </div>

      {/* Persistent 3 Drawn Cards at Top */}
      <TopDrawnCardsBar onNavigateToFree={onNavigateToFree} />

      {/* Main Container: Locked vs Unlocked */}
      {!showUnlockedView ? (
        /* LOCKED STATE - WARM LIGHT PARCHMENT */
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/60 text-[#2A1118] shadow-2xl relative overflow-hidden space-y-8">
          {/* Status strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF0E4] border-2 border-[#C59B27]/45 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400/60 flex items-center justify-center text-[#8E441D]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                {vipOrderStatus === 'pending'
                  ? '⏳ Таны бүтэн уншлагын төлбөр шалгагдаж байна'
                  : vipOrderStatus === 'consumed'
                  ? '✅ Өмнөх эрх ашиглагдсан (Профайлаас хадгалсан уншлагаа харна уу)'
                  : '🔒 Бүтэн уншлага баталгаажтал түгжээтэй байна (1 удаагийн эрх)'}
              </h2>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs text-[#7A4E58] block font-sans font-semibold">Багцын үнэ:</span>
              <span className="text-2xl font-mystic font-bold text-[#8E441D]">{fullPriceText}</span>
            </div>
          </div>

          {/* Core Action Button */}
          <div className="text-center space-y-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-r from-[#8E441D] via-[#B87A42] to-[#8E441D] hover:from-[#783715] hover:to-[#783715] text-[#FFF6F3] font-serif font-bold text-sm sm:text-base uppercase tracking-widest shadow-2xl transition-all cursor-pointer inline-flex items-center gap-3 hover:scale-105"
            >
              <Crown className="w-5 h-5 text-[#FCEBE6]" />
              <span>Бүтэн уншлага нээх ({fullPriceText})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-[#6D3B47] font-sans">
              Хаан банк болон Голомт банкны дансаар шилжүүлэг хийж эрхээ нээнэ үү.
            </p>
          </div>

          {/* Unlocked Features Preview Grid - 8 Core Areas */}
          <div className="pt-6 border-t border-[#D4AF37]/30 space-y-4 relative z-10">
            <div className="p-3 rounded-xl border-2 border-[#C59B27]/45 bg-[#FFFDF9] text-center">
              <h3 className="text-xs uppercase font-serif tracking-[0.2em] text-[#8E441D] font-bold">
                Эрх нээгдсэнээр дэлгэгдэх 8 үндсэн бүлэг
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[#4E2B34]">
              {[
                {
                  icon: Sparkles,
                  title: '1. Хөзрүүдийн Энерги',
                  desc: '3 хөзрийн хоорондын уялдаа, одоогийн ерөнхий зураг',
                },
                {
                  icon: Briefcase,
                  title: '2. 💼 Ажил Мэргэжил',
                  desc: 'Ирэх 6 сарын чиг хандлага, анхаарах зүйлс',
                },
                {
                  icon: DollarSign,
                  title: '3. 💰 Санхүү ба Баялаг',
                  desc: 'Орлогын урсгал, саад ба элбэг хангалуун байдал',
                },
                {
                  icon: Sprout,
                  title: '4. 🌱 Дотоод Өсөлт',
                  desc: 'Сүнслэг замнал, даван туулах дотоод сорилт',
                },
                {
                  icon: HeartPulse,
                  title: '5. 🌿 Эрүүл Мэнд',
                  desc: 'Ядралыг тайлах, эрч хүчээ сэлбэх арга замууд',
                },
                {
                  icon: Compass,
                  title: '6. 🔀 Чухал Шийдвэр',
                  desc: 'Амьдралын эргэлт дээр баримтлах чиглэл',
                },
                {
                  icon: Zap,
                  title: '7. ✨ Далд Авьяас',
                  desc: 'Дотоод нөөц бололцоо, ирээдүйн боломжууд',
                },
                {
                  icon: Wand2,
                  title: '8. 🔮 Хувийн Асуулт',
                  desc: 'Таны тодорхой асуултад өгөх шууд зөвлөгөө',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FFFDF9] border-2 border-[#D4AF37]/35 space-y-1.5 hover:border-[#C59B27] transition-colors shadow-xs">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2A1118]">
                    <item.icon className="w-4 h-4 text-[#8E441D] shrink-0" />
                    <span className="line-clamp-1">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#6D3B47] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE - RICH 8 MODULES IN WARM LIGHT THEME */
        <div className="space-y-8 animate-fadeIn">
          {/* Top Unlocked Action Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] border-2 border-[#C59B27]/55 flex items-center justify-between flex-wrap gap-4 text-[#2A1118] shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xs sm:text-sm font-serif font-bold text-[#2A1118]">
                Бүтэн уншлага баталгаажсан
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

          {/* Custom Question Strip & Refresh Box */}
          <form
            onSubmit={handleCustomQuestionSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#8E441D] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#8E441D]" />
                <span>Таны тусгайлан асуух хувийн асуулт</span>
              </label>
              <span className="text-[10px] text-[#7A4E58]">Та хүссэн үедээ асуултаа шинэчилж болно</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={vipCustomQuestion}
                onChange={(e) => setVipCustomQuestion(e.target.value)}
                placeholder="Жишээ нь: Миний ажил мэргэжил, санхүү ба ойрын шийдвэрүүдэд хамгийн чухал зөвлөгөө юу вэ?"
                className="flex-1 px-4 py-3 rounded-xl bg-[#FAF4EC] border border-[#C59B27]/45 focus:border-[#8E441D] text-sm text-[#2A1118] placeholder:text-[#8C626C] outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8E441D] to-[#B87A42] text-white font-serif font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Картуудын нууцыг тайлж байна...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Шинэчлэн уншуулах</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="p-12 rounded-3xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 text-center space-y-4 shadow-md">
              <RotateCw className="w-8 h-8 text-[#8E441D] animate-spin mx-auto" />
              <p className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                Картуудын нууцыг тайлж байна...
              </p>
            </div>
          ) : parsedSections && viewMode === 'pillars' ? (
            /* 8-Part Cards with Framed Bold Subheaders & Warm Light Background */
            <div className="space-y-6">
              {[
                { icon: Sparkles, title: '1. Хөзрүүдийн Энергийн Ерөнхий Дүр Зураг', body: parsedSections.overview },
                { icon: Briefcase, title: '2. Ажил Мэргэжил ба Замнал', body: parsedSections.career },
                { icon: DollarSign, title: '3. Санхүү ба Элбэг Хангалуун Байдал', body: parsedSections.finance },
                { icon: Sprout, title: '4. Хувь Хүний Дотоод Өсөлт ба Сүнслэг Хөгжил', body: parsedSections.growth },
                { icon: HeartPulse, title: '5. Эрүүл Мэнд ба Эрч Хүчний Тэнцвэр', body: parsedSections.health },
                { icon: Compass, title: '6. Чухал Шийдвэр ба Сонголт', body: parsedSections.decision },
                { icon: Zap, title: '7. Далд Авьяас ба Шинэ Боломжууд', body: parsedSections.talents },
                { icon: Wand2, title: '8. Таны Хувийн Асуултын Тусгай Хариу', body: parsedSections.customQA },
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

              {/* Affirmation */}
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

      {/* Checkout Modal for Full Plan */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={{
          id: 'full',
          name: 'Бүтэн уншлага',
          price: fullPriceText,
          amount: planPrices.full,
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
