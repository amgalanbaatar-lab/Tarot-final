import React, { useState, useEffect } from 'react';
import {
  calculateLifePath,
  calculateBirthdayNumber,
  calculatePersonalYear,
  calculateExpressionNumber,
  NUMEROLOGY_PROFILES,
  NumerologyProfile,
} from '../data/numerologyData';
import {
  Sparkles,
  Heart,
  Briefcase,
  ArrowRight,
  RotateCw,
  Copy,
  Check,
  Lock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { FormattedReading } from '../components/FormattedReading';
import { useReading, saveReadingToHistory } from '../context/ReadingContext';
import { useShop } from '../context/ShopContext';
import { CheckoutModal } from '../components/CheckoutModal';

interface NumerologyPageProps {
  onStartReadingWithNumber?: (lifePath: number, birthDate: string) => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
}

export const NumerologyPage: React.FC<NumerologyPageProps> = ({
  currentUserEmail,
  currentUserName,
}) => {
  const { isNumerologyUnlocked, numerologyOrderStatus, consumeReadingAccess } = useReading();
  const { planPrices, formatPrice } = useShop();
  const numerologyPriceText = formatPrice(planPrices.numerology);

  const [birthDate, setBirthDate] = useState('1998-04-12');
  const [nameInput, setNameInput] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number>(7);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Deep Numerology state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReadingResult, setAiReadingResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Computed values
  const lifePath = calculateLifePath(birthDate);
  const birthdayNumber = calculateBirthdayNumber(birthDate);
  const personalYear = calculatePersonalYear(birthDate, 2026);
  const expressionNumber = nameInput ? calculateExpressionNumber(nameInput) : null;

  // Active static profile
  const activeProfile: NumerologyProfile =
    NUMEROLOGY_PROFILES[selectedNumber] || NUMEROLOGY_PROFILES[lifePath] || NUMEROLOGY_PROFILES[7];

  const handleDateChange = (val: string) => {
    setBirthDate(val);
    const newLp = calculateLifePath(val);
    setSelectedNumber(newLp);
    mysticAudio.playChime(528, 1.8);
  };

  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

  // Request dynamic Gemini API deep numerology reading (Single-Use per payment)
  const handleGenerateAiReading = async () => {
    if (!isNumerologyUnlocked) {
      mysticAudio.playChime(528, 1.5);
      setIsCheckoutOpen(true);
      return;
    }

    setIsAiLoading(true);
    mysticAudio.playChime(528, 2);

    const readingId = `num_${Date.now()}`;
    let finalReading = '';

    try {
      const response = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          name: nameInput,
          lifePath,
          birthdayNumber,
          personalYear,
          expressionNumber,
        }),
      });

      const data = await response.json();
      if (data.reading) {
        finalReading = data.reading;
      } else {
        throw new Error('No reading returned');
      }
    } catch {
      finalReading = `1. 🌟 Хувь заяаны дуудлага ба төрөлхийн авьяас:\nАмьдралын замын ${lifePath}-р тоо нь гүн ухаан, дотоод зөн совин, өөрийгөө танин мэдэх замаар бусдад гэрэл гэгээ түгээх онцгой чадварыг бэлгэддэг.\n\n2. 💎 2026 оны хувийн жилийн хэмнэл ба боломжууд (${personalYear}-р жил):\nЭнэ онд та өөрийн зорилгоо дахин тодотгож, урт хугацааны үнэ цэнтэй ажлуудыг эхлүүлэхэд хамгийн тохиромжтой мөчлөг тохиож байна.\n\n3. 💖 Хайр дурлал ба сэтгэлийн зохицол:\nСэтгэлийн гүн итгэлцэл таны хувьд хамгийн чухал. Дотоод мэдрэмжээ нээлттэй, дулаан үгээр илэрхийлснээр хосын харилцаа улам бат бөх болно.\n\n4. 🌿 Эрүүл мэнд, дотоод тэнцвэр ба анхаарах сургамж:\nТайван бясалгал, байгалийн сайханд алхах, сэтгэлийн амар амгаланг эрхэмлэх нь таны эрч хүчний гол эх булаг болно.\n\n5. 🕊 Өдөр тутмын сэтгэлийн батламж:\n"Миний амьдралын замнал орчлон ертөнцийн гэгээн зохицолд төгс нийцэж байна."`;
    } finally {
      setAiReadingResult(finalReading);

      // Save to both numerology history and unified profile reading history
      try {
        const nowStr = new Date().toLocaleDateString('mn-MN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const item = {
          id: readingId,
          type: 'numerology',
          title: `Тоон зурхай: Амьдралын замын ${lifePath}-р тоо (${birthDate})`,
          date: nowStr,
          content: finalReading,
          lifePath,
          birthdayNumber,
          personalYear,
          expressionNumber,
          birthDate,
          name: nameInput,
        };
        const hist = JSON.parse(localStorage.getItem('mystic_numerology_history') || '[]');
        localStorage.setItem('mystic_numerology_history', JSON.stringify([item, ...hist.slice(0, 29)]));

        saveReadingToHistory({
          id: readingId,
          date: nowStr,
          cards: [
            `Замын тоо: ${lifePath}`,
            `Төрсөн өдөр: ${birthdayNumber}`,
            `2026 жил: ${personalYear}`,
          ],
          summary: finalReading.slice(0, 180) + '...',
          type: `Пифагорын Тоон Зурхай (${birthDate})`,
          category: 'numerology',
          details: {
            content: finalReading,
            birthDate,
            name: nameInput,
            lifePath,
            birthdayNumber,
            personalYear,
            expressionNumber,
          },
        });
      } catch {}

      // Consume the single-use paid entitlement now that reading is generated & saved
      consumeReadingAccess('numerology', readingId);

      setIsAiLoading(false);
      setTimeout(() => {
        document.getElementById('ai-numerology-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  const handleCopy = () => {
    if (aiReadingResult) {
      navigator.clipboard.writeText(aiReadingResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showUnlockedView = isNumerologyUnlocked || Boolean(aiReadingResult);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Single Clean Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#230F16]">
          Пифагорын Тоон Зурхай
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Төрсөн огноо болон нэрээрээ өөрийн амьдралын замын тоо, 2026 оны хувийн жил болон төрөлхийн өгөгдлийн дэлгэрэнгүй тайлбарыг уншаарай.
        </p>
      </div>

      {/* Calculator Box in Champagne / Gold styling */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase font-serif tracking-wider text-[#3D1E25] mb-2 font-semibold">
              Төрсөн огноогоо оруулна уу
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-white border border-[#D4AF37]/45 rounded-xl px-4 py-3 text-[#2F171E] font-sans text-base focus:outline-none focus:border-[#8E5244] shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-serif tracking-wider text-[#3D1E25] mb-2 font-semibold">
              Таны нэр (Нэрийн илэрхийллийн тоо тооцоолох)
            </label>
            <input
              type="text"
              placeholder="Жишээ: Батболд, Ану"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-white border border-[#D4AF37]/45 rounded-xl px-4 py-3 text-[#2F171E] font-sans text-base placeholder:text-[#9A7A80] focus:outline-none focus:border-[#8E5244] shadow-xs"
            />
          </div>
        </div>

        {/* 3 Calculated Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D4AF37]/25">
          {/* Life Path */}
          <div
            onClick={() => {
              setSelectedNumber(lifePath);
              mysticAudio.playChime(639, 2);
            }}
            className={`p-5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
              selectedNumber === lifePath
                ? 'border-[#8E5244] bg-white shadow-md'
                : 'border-[#D4AF37]/35 bg-white/70 hover:border-[#8E5244]'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider font-serif text-[#7A4E58] font-bold block">
              Амьдралын замын тоо
            </span>
            <div className="text-4xl font-mystic font-bold text-[#8E441D] my-1">
              {lifePath}
            </div>
            <p className="text-xs text-[#523139] font-sans">
              Таны төрөлхийн мөн чанар
            </p>
          </div>

          {/* Birthday Number */}
          <div className="p-5 rounded-2xl border-2 border-[#D4AF37]/35 bg-white/70 text-center">
            <span className="text-[11px] uppercase tracking-wider font-serif text-[#7A4E58] font-bold block">
              Төрсөн өдрийн тоо
            </span>
            <div className="text-4xl font-mystic font-bold text-[#8E441D] my-1">
              {birthdayNumber}
            </div>
            <p className="text-xs text-[#523139] font-sans">
              Төрөлхийн авьяас чадвар
            </p>
          </div>

          {/* Personal Year */}
          <div className="p-5 rounded-2xl border-2 border-[#D4AF37]/35 bg-white/70 text-center">
            <span className="text-[11px] uppercase tracking-wider font-serif text-[#7A4E58] font-bold block">
              2026 оны хувийн жил
            </span>
            <div className="text-4xl font-mystic font-bold text-[#8E441D] my-1">
              {personalYear}
            </div>
            <p className="text-xs text-[#523139] font-sans">
              Энэ жилийн хэмнэл ба мөчлөг
            </p>
          </div>
        </div>

        {expressionNumber !== null && (
          <div className="p-4 rounded-xl border border-[#D4AF37]/40 bg-[#FFF7F5] text-center text-sm shadow-xs">
            <span className="text-[#523139]">Таны нэрийн илэрхийллийн тоо: </span>
            <strong className="text-[#8E441D] font-mystic text-lg ml-1 font-bold">
              {expressionNumber}
            </strong>
            <span className="text-[#7A4E58] text-xs ml-2">
              (Нийгэмд үзүүлэх нөлөө ба гадаад илэрхийлэл)
            </span>
          </div>
        )}

        {/* Dynamic AI Deep Reading Button - shown only when unlocked (1-time active entitlement) */}
        {isNumerologyUnlocked && (
          <div className="text-center pt-2 space-y-2">
            <button
              onClick={handleGenerateAiReading}
              disabled={isAiLoading}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8E441D] via-[#A65427] to-[#8E441D] hover:from-[#783715] hover:to-[#783715] text-[#FFF6F3] font-serif font-bold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Таны амьдралын тоон кодыг тайлж байна...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FCEBE6]" />
                  <span>Тоон Зурхайн Дэлгэрэнгүй Тайлал Үүсгэх (1 удаагийн эрх)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-[#7A4E58] font-sans">
              Анхаар: Төрсөн огноо болон нэрээ зөв оруулаад дарна уу. Үүсгэсэн тайлал таны Профайл дотор хадгалагдана.
            </p>
          </div>
        )}
      </div>

      {/* LOCKED vs UNLOCKED DEEP NUMEROLOGY SECTION */}
      {!showUnlockedView ? (
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/55 text-[#2A1118] shadow-xl relative overflow-hidden space-y-8">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF0E4] border-2 border-[#C59B27]/45">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400/60 flex items-center justify-center text-[#8E441D]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                {numerologyOrderStatus === 'pending'
                  ? '⏳ Таны төлбөр шалгагдаж байна'
                  : numerologyOrderStatus === 'consumed'
                  ? '✅ Өмнөх эрх ашиглагдсан (Профайлаас хадгалсан зурхайгаа харна уу)'
                  : '🔒 Төлбөр баталгаажиж эрх нээгдэх хүртэл түгжээтэй (1 удаагийн эрх)'}
              </h2>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs text-[#7A4E58] block font-sans font-semibold">Багцын үнэ:</span>
              <span className="text-2xl font-mystic font-bold text-[#8E441D]">{numerologyPriceText}</span>
            </div>
          </div>

          {/* Core Action Button */}
          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-r from-[#8E441D] via-[#A65427] to-[#8E441D] hover:from-[#783715] hover:to-[#783715] text-[#FFF6F3] font-serif font-bold text-sm sm:text-base uppercase tracking-widest shadow-xl transition-all cursor-pointer inline-flex items-center gap-3 hover:scale-105"
            >
              <Compass className="w-5 h-5 text-[#FCEBE6]" />
              <span>Тоон зурхай нээх ({numerologyPriceText})</span>
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
                Төлбөр баталгаажсанаар нээгдэх тоон зурхайн бүрэн тайлал
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[#4E2B34]">
              {[
                { title: '1. Хувь заяаны дуудлага ба авьяас', desc: `Амьдралын замын ${lifePath}-р тооны гүн тайлал` },
                { title: '2. 2026 оны хувийн жилийн хэмнэл', desc: `${personalYear}-р жилийн мөчлөг ба алтан боломжууд` },
                { title: '3. Хайр дурлал ба сэтгэлийн зохицол', desc: 'Таны тоон кодтой нийцэх харилцаа ба зан чанар' },
                { title: '4. Ажил мэргэжил, санхүү ба батламж', desc: 'Тохиромжтой салбар болон бүх 12 тооны дэлгэрэнгүй сан' },
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
        <div className="space-y-12 animate-fadeIn">
          {/* Unlocked Status Banner */}
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] border-2 border-[#C59B27]/55 flex items-center justify-between flex-wrap gap-4 text-[#2A1118] shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xs sm:text-sm font-serif font-bold text-[#2A1118]">
                Тоон зурхайн дэлгэрэнгүй тайлал идэвхжсэн
              </span>
            </div>
          </div>

          {/* AI Numerology Result Box */}
          {aiReadingResult && (
            <div
              id="ai-numerology-result"
              className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/55 p-6 sm:p-10 shadow-2xl space-y-6 animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/30">
                <h2 className="text-2xl font-mystic font-bold text-[#2A1118]">
                  Амьдралын замын {lifePath}-р тооны дэлгэрэнгүй тайлал
                </h2>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl border border-[#D4AF37]/45 bg-[#FFFDF9] hover:bg-[#FAF1E4] text-xs font-serif font-bold text-[#6D3B47] flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Хуулагдлаа' : 'Тайлал хуулах'}</span>
                </button>
              </div>

              <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl border border-[#C59B27]/40 shadow-inner">
                <FormattedReading content={aiReadingResult} theme="light" hideMainBanner={true} />
              </div>
            </div>
          )}

          {/* Number Profiles Selector & Knowledge Base */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E]">
                Тоонуудын Мөн Чанар ба Тайлбар
              </h2>
              <p className="text-xs text-[#6B434C]">
                Тоо бүрийн дэлгэрэнгүй зан чанар, тохирох ажил мэргэжил болон хайр дурлалын зохицлыг сонгон уншина уу.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {allNumbers.map((num) => {
                const isSelected = selectedNumber === num;
                const isMaster = num === 11 || num === 22 || num === 33;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedNumber(num);
                      mysticAudio.playChime(432 + num * 20, 1.5);
                    }}
                    className={`px-4 py-2 text-xs font-serif font-semibold rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8E441D] bg-[#8E441D] text-white shadow-md'
                        : 'border-[#D4AF37]/35 bg-white text-[#4D2630] hover:border-[#8E441D]'
                    }`}
                  >
                    {isMaster ? `Мастер ${num}` : `${num}-р тоо`}
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Details */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/50 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="p-3.5 rounded-xl border-2 border-[#C59B27]/55 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="space-y-0.5">
                  <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#2A1118]">
                    {activeProfile.title}
                  </h3>
                  <p className="text-xs font-serif font-bold text-[#8E441D]">
                    {activeProfile.archetype} · {activeProfile.keywords.join(' · ')}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#2F171E] leading-relaxed">
                {activeProfile.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/40 space-y-2.5 shadow-xs">
                  <div className="py-2 px-3 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 font-serif font-bold text-xs text-[#2A1118] uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-[#8E441D]" />
                    <span className="font-bold">Тохиромжтой ажил мэргэжил</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3D1E25] leading-relaxed pl-1">
                    {activeProfile.career.join(', ')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/40 space-y-2.5 shadow-xs">
                  <div className="py-2 px-3 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 font-serif font-bold text-xs text-[#2A1118] uppercase tracking-wider">
                    <Heart className="w-4 h-4 text-[#8E441D]" />
                    <span className="font-bold">Хайр дурлалын харилцаа</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3D1E25] leading-relaxed pl-1">
                    {activeProfile.loveCompatibility.join(' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal for Numerology Plan */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={{
          id: 'numerology',
          name: 'Пифагорын Тоон Зурхайн Тайлал',
          price: numerologyPriceText,
          amount: planPrices.numerology,
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
