import React, { useState } from 'react';
import { ZODIAC_SIGNS, ZodiacSign } from '../components/DailyZodiac';
import {
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Heart,
  Briefcase,
  Star,
  Compass,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';

export const HoroscopePage: React.FC = () => {
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [selectedElement, setSelectedElement] = useState<'all' | 'Гал' | 'Шороо' | 'Хий' | 'Ус'>('all');

  const selectedSign = ZODIAC_SIGNS.find((s) => s.id === selectedSignId) || ZODIAC_SIGNS[0];

  const filteredSigns = selectedElement === 'all'
    ? ZODIAC_SIGNS
    : ZODIAC_SIGNS.filter((s) => s.element === selectedElement);

  // Extended deep profiles for the 12 signs
  const signDetails: Record<string, {
    strengths: string[];
    shadowSide: string[];
    bestMatches: string[];
    year2026Outlook: string;
    gemstone: string;
    mantra: string;
  }> = {
    aries: {
      strengths: ['Зоримог манлайлал', 'Шийдэмгий эхлэл', 'Өөдрөг эрч хүч', 'Шударга зан'],
      shadowSide: ['Тэвчээргүй хандах', 'Түргэн уурлах', 'Дутуу орхих эрсдэл'],
      bestMatches: ['Арслан (Leo)', 'Нум (Sagittarius)', 'Ихэр (Gemini)'],
      year2026Outlook: '2026 онд таны манлайлах чадвар өндөр үнэлэгдэж, шинэ бие даасан бизнес, карьерын томоохон үсрэлт хийх боломж бүрдэнэ. Харилцаан дээр тэвчээр заах нь хамгийн чухал.',
      gemstone: 'Улаан мана, Очир алмааз',
      mantra: 'Би өөрийн зорилгодоо итгэлтэйгээр урагшилж байна.',
    },
    taurus: {
      strengths: ['Найдвартай тууштай', 'Гоо зүйн өндөр мэдрэмж', 'Санхүүгийн ухаан', 'Үнэнч нөхөрлөл'],
      shadowSide: ['Хэт зөрүүдлэх', 'Өөрчлөлтөөс эмээх', 'Харамч хандах хандлага'],
      bestMatches: ['Охин (Virgo)', 'Матар (Capricorn)', 'Мэлхий (Cancer)'],
      year2026Outlook: 'Урт хугацааны үл хөдлөх, санхүүгийн тогтвортой байдал бэхжиж, хувийн амьдралд тайван, аюулгүй таатай орчин бүрдэх жил.',
      gemstone: 'Маргад эрдэнэ, Сарнайн болор',
      mantra: 'Миний сэтгэлд амар амгалан оршиж, миний амьдрал цэцэглэн хөгжиж байна.',
    },
    gemini: {
      strengths: ['Хурц оюун ухаан', 'Харилцааны мастер', 'Дасан зохицох чадвар', 'Бүтээлч сониуч'],
      shadowSide: ['Сэтгэл хөвсөлзөх', 'Төвлөрөл алдагдах', 'Хэлэх үгээ хянахгүй байх'],
      bestMatches: ['Жинлүүр (Libra)', 'Хумх (Aquarius)', 'Хонь (Aries)'],
      year2026Outlook: 'Мэдээлэл, харилцаа холбоо, шинэ технологи, боловсролын салбарт гайхалтай амжилт хүлээнэ. Сонирхсон олон чиглэлээсээ хамгийн чухалд нь анхаарлаа хандуулаарай.',
      gemstone: 'Агат, Барын нүд',
      mantra: 'Би шинэ мэдлэг ба эерэг харилцаа бүрийг нээлттэй угтдаг.',
    },
    cancer: {
      strengths: ['Гүн зөн совин', 'Халамж энэрэл', 'Гэр бүлд үнэнч', 'Сэтгэл хөдлөлийн баялаг'],
      shadowSide: ['Хэт эмзэглэх', 'Өнгөрсөндөө зууралдах', 'Өөрийгөө хамгаалах хуяг'],
      bestMatches: ['Хилэнц (Scorpio)', 'Загас (Pisces)', 'Үхэр (Taurus)'],
      year2026Outlook: 'Гэр бүл, дотоод сэтгэлийн тэнцвэрт онцгой эерэг өөрчлөлт гарна. Орон байраа сайжруулах, дотны харилцаагаа гүнзгийрүүлэхэд хамгийн ивээлтэй жил.',
      gemstone: 'Сарны чулуу, Сувд',
      mantra: 'Миний дотоод зөн совин надад аюулгүй, гэгээлэг замыг заадаг.',
    },
    leo: {
      strengths: ['Өгөөмөр сэтгэл', 'Харизматик гэрэл гэгээ', 'Бүтээлч авьяас', 'Үнэнч бахархал'],
      shadowSide: ['Хэт их магтаал шаардах', 'Биеэ тоох', 'Драм үүсгэх'],
      bestMatches: ['Хонь (Aries)', 'Нум (Sagittarius)', 'Жинлүүр (Libra)'],
      year2026Outlook: 'Таны нэр хүнд, олон нийтэд танигдах нөлөө оргилдоо хүрнэ. Уран бүтээл, манлайллын төслүүд өндөр амжилт авчирна.',
      gemstone: 'Хув, Рубин (Бадмаараг)',
      mantra: 'Би өөрийн гэрлээр бусдыг дулаацуулж, амьдралдаа талархаж байна.',
    },
    virgo: {
      strengths: ['Нарийн нягт сэтгэлгээ', 'Асуудал шийдэгч', 'Эрүүл амьдралын хэв маяг', 'Хариуцлага'],
      shadowSide: ['Хэт шүүмжлэгч', 'Перфекционизмд баригдах', 'Өөрийгөө буруутгах'],
      bestMatches: ['Үхэр (Taurus)', 'Матар (Capricorn)', 'Хилэнц (Scorpio)'],
      year2026Outlook: 'Эрүүл мэнд, өдөр тутмын хэв маяг, ажлын ур чадвараа шинэ түвшинд гаргана. Таны нямбай хөдөлмөр санхүүгийн тогтвортой шагнал авчирна.',
      gemstone: 'Сапфир, Номин чулуу',
      mantra: 'Би алхам бүртээ төгс тэнцвэр, амар амгаланг цогцлоож байна.',
    },
    libra: {
      strengths: ['Дипломат ур чадвар', 'Шударга ёс', 'Гоо үзэсгэлэнгийн мэдрэмж', 'Зохицол'],
      shadowSide: ['Шийдвэр гаргаж ядах', 'Зөрчилдөөнөөс хэт зугтах', 'Бусдын үгэнд орох'],
      bestMatches: ['Ихэр (Gemini)', 'Хумх (Aquarius)', 'Арслан (Leo)'],
      year2026Outlook: 'Хамтын ажиллагаа, гэрээ хэлцэл, хувийн хайр дурлалын харилцаанд алтан үе ирж байна. Өөрийн хүсэл зоригоо тодорхой илэрхийлэх нь ялалт авчирна.',
      gemstone: 'Опал, Ягаан кварц',
      mantra: 'Миний амьдралд гоо сайхан, тэнцвэр, хайр бялхаж байна.',
    },
    scorpio: {
      strengths: ['Гүн сэтгэл зүй', 'Эр зориг', 'Хувиран шинэчлэгдэх хүч', 'Үнэнч зан'],
      shadowSide: ['Харуусал тээх', 'Хэт нууцлаг хандах', 'Хяналтандаа байлгах хүсэл'],
      bestMatches: ['Мэлхий (Cancer)', 'Загас (Pisces)', 'Охин (Virgo)'],
      year2026Outlook: 'Хуучин ачаа, сөрөг бодлуудаа бүрэн үдэж, санхүүгийн хамтарсан том хөрөнгө оруулалт болон сүнслэг хувьслыг туулах хүчирхэг жил.',
      gemstone: 'Топаз, Гранат (Хүрэн улаан чулуу)',
      mantra: 'Би өөрчлөлтийг талархан хүлээн авч, улам хүчирхэгжиж байна.',
    },
    sagittarius: {
      strengths: ['Өөдрөг философи', 'Адал явдалд дуртай', 'Үнэнч шударга', 'Өргөн алсын хараа'],
      shadowSide: ['Бодлогогүй ам алдах', 'Тогтворгүй байдал', 'Хэт их итгэж эрсдэлд орох'],
      bestMatches: ['Хонь (Aries)', 'Арслан (Leo)', 'Хумх (Aquarius)'],
      year2026Outlook: 'Аялал, гадаад харилцаа, дээд боловсрол, философийн салбарт урьд өмнө байгаагүй үүд хаалга нээгдэнэ. Зорилго тань том байх тусам үр дүн өндөр байна.',
      gemstone: 'Оюу, Номин эрдэнэ',
      mantra: 'Би шинэ боломж, баяр баясгалан бүрийг талархалтайгаар угтаж байна.',
    },
    capricorn: {
      strengths: ['Тэвчээр тууштай байдал', 'Стратегич ухаан', 'Найдвартай түшиг', 'Зорилгодоо үнэнч'],
      shadowSide: ['Хэт хатуу хандах', 'Гутранги болох хандлага', 'Ажилдаа хэт дарагдах'],
      bestMatches: ['Үхэр (Taurus)', 'Охин (Virgo)', 'Хилэнц (Scorpio)'],
      year2026Outlook: 'Олон жилийн хүнд хүчир хөдөлмөрийн үр дүн бодит албан тушаал, нийгмийн статус болж хувирах гайхалтай ургацын жил.',
      gemstone: 'Оникс, Молор эрдэнэ',
      mantra: 'Миний хичээл зүтгэл бүхэн бодит амжилт болж бэхжиж байна.',
    },
    aquarius: {
      strengths: ['Шинэчлэгч сэтгэлгээ', 'Хүмүүнлэг үзэл', 'Чөлөөт сэтгэлгээ', 'Өвөрмөц байдал'],
      shadowSide: ['Сэтгэл хөдлөлөөс тасрах', 'Хэт зөрүүд гаж үзэл', 'Хүйтэн хөндий харагдах'],
      bestMatches: ['Ихэр (Gemini)', 'Жинлүүр (Libra)', 'Нум (Sagittarius)'],
      year2026Outlook: 'Олон нийт, дижитал төслүүд, шинжлэх ухаан ба хүний эрхийн чиглэлд таны дуу хоолой хүчтэй сонсогдоно. Өөрийн жинхэнэ дүр төрхөөсөө бүү эргэлзээрэй.',
      gemstone: 'Аметист (Нил ягаан болор), Номин',
      mantra: 'Би өөрийн өвөрмөц гэрлийг ертөнцөд айдасгүйгээр түгээж байна.',
    },
    pisces: {
      strengths: ['Энэрэнгүй өрөвч', 'Уран бүтээлч зөн билэг', 'Гүн ойлголцол', 'Сүнслэг зохицол'],
      shadowSide: ['Бодит байдлаас зугтах', 'Хэт хөөрөлд автах', 'Хил хязгаараа тогтоож чадахгүй байх'],
      bestMatches: ['Мэлхий (Cancer)', 'Хилэнц (Scorpio)', 'Үхэр (Taurus)'],
      year2026Outlook: 'Урлаг, сэтгэл засал, оюун санааны хөгжил болон хайрын нандин холбоо өндөр түвшинд цэцэглэнэ. Өөрийн зөн совиндоо бүрэн найдаж болно.',
      gemstone: 'Аквамарин, Сарны чулуу',
      mantra: 'Би орчлонгийн урсгалд итгэж, зүрх сэтгэлийнхээ дууг дагаж байна.',
    },
  };

  const details = signDetails[selectedSign.id] || signDetails.aries;

  const getElementIcon = (elem: string) => {
    switch (elem) {
      case 'Гал':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'Шороо':
        return <Mountain className="w-4 h-4 text-emerald-700" />;
      case 'Хий':
        return <Wind className="w-4 h-4 text-sky-600" />;
      case 'Ус':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#8E441D]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#230F16]">
          12 Ордны Цогц Толь & Нийцэл
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Ордуудын төрөлхийн зан төлөв, давуу ба сүүдэрт талууд, 2026 оны бүрэн чиг хандлага болон хоорондын хайрын зохицлыг нэг дороос судлаарай.
        </p>
      </div>

      {/* Element Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-xl mx-auto">
        {(['all', 'Гал', 'Шороо', 'Хий', 'Ус'] as const).map((elem) => {
          const isSelected = selectedElement === elem;
          return (
            <button
              key={elem}
              onClick={() => {
                setSelectedElement(elem);
                mysticAudio.playChime(528, 1.5);
              }}
              className={`px-4 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#8E441D] text-white border-[#8E441D] shadow-md'
                  : 'bg-white/80 text-[#542B34] border-[#D4AF37]/35 hover:border-[#8E441D]'
              }`}
            >
              {elem === 'all' ? 'Бүх 12 Орд' : `${elem} махбод`}
            </button>
          );
        })}
      </div>

      {/* 12 Signs Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
        {filteredSigns.map((s) => {
          const isSelected = selectedSign.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSignId(s.id);
                mysticAudio.playChime(639, 1.8);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center justify-between min-h-[120px] ${
                isSelected
                  ? 'border-[#8E441D] bg-[#FFF8F5] shadow-lg scale-102 ring-2 ring-[#8E441D]/20'
                  : 'border-[#D4AF37]/35 bg-white/70 hover:bg-white hover:border-[#D4AF37]'
              }`}
            >
              <div className="text-2xl sm:text-3xl text-[#8E441D] font-bold">
                {s.symbol}
              </div>
              <div>
                <span className="text-sm font-mystic font-bold text-[#2A1118] block">
                  {s.nameMn}
                </span>
                <span className="text-[11px] text-[#7A4E58] font-serif block">
                  {s.nameEn}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] text-[#542B34] font-medium mt-1">
                {getElementIcon(s.element)}
                <span>{s.element}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sign Detailed Deep Dive Card */}
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Sign Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#D4AF37] flex items-center justify-center text-4xl text-[#8E441D] shadow-md">
              {selectedSign.symbol}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#8E441D] uppercase tracking-wider">
                <span>{selectedSign.dateRange}</span>
                <span>·</span>
                <span>{selectedSign.element} махбод</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2A1118]">
                {selectedSign.nameMn} ({selectedSign.nameEn})
              </h2>
              <span className="text-xs text-[#5C343E]">
                Эзэнт гарaг: {selectedSign.rulingPlanet}
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white/80 border border-[#D4AF37]/40 text-xs text-[#5C343E] space-y-0.5">
            <span className="font-serif font-bold text-[#8E441D] block">Ивээл чулуу:</span>
            <span>{details.gemstone}</span>
          </div>
        </div>

        {/* Strengths vs Shadow Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 space-y-3.5 shadow-xs">
            <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs font-serif font-bold text-[#2A1118] uppercase tracking-wider">
              <Star className="w-4 h-4 text-emerald-700" />
              <span className="font-bold">Төрөлхийн Давуу Талууд</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#2F171E] pl-1">
              {details.strengths.map((str, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shadow side */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 space-y-3.5 shadow-xs">
            <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs font-serif font-bold text-[#2A1118] uppercase tracking-wider">
              <Moon className="w-4 h-4 text-rose-700" />
              <span className="font-bold">Сүүдэрт тал & Анхаарах зүйлс</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#2F171E] pl-1">
              {details.shadowSide.map((sh, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{sh}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Love Compatibility */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 space-y-3.5 shadow-xs">
          <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs font-serif font-bold text-[#2A1118] uppercase tracking-wider">
            <Heart className="w-4 h-4 text-[#8E441D]" />
            <span className="font-bold">Хамгийн сайн зохицох ордууд</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 pl-1">
            {details.bestMatches.map((bm, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full bg-[#FAF1E4] border border-[#C59B27]/45 text-xs font-serif font-bold text-[#8E441D]"
              >
                ♥ {bm}
              </span>
            ))}
          </div>
        </div>

        {/* 2026 Overall Outlook */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/50 space-y-3 shadow-xs">
          <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs font-serif font-bold text-[#2A1118] uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#8E441D]" />
            <span className="font-bold">2026 Оны Нийтлэг Төлөв & Оддын Чиг Хандлага</span>
          </div>
          <p className="text-sm sm:text-base text-[#2F171E] leading-relaxed font-sans pl-1">
            {details.year2026Outlook}
          </p>
        </div>

        {/* Affirmation Mantra */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] border-2 border-[#C59B27]/50 text-center italic font-bold text-xs sm:text-sm text-[#2A1118]">
          ✨ Өөртөө хэлэх тарни: "{details.mantra}"
        </div>
      </div>
    </div>
  );
};
