import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Briefcase,
  Flame,
  Droplets,
  Wind,
  Mountain,
  RotateCw,
  ArrowRight,
  Sun,
  Compass,
  Star
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';

export interface ZodiacSign {
  id: string;
  nameMn: string;
  nameEn: string;
  symbol: string;
  dateRange: string;
  element: 'Гал' | 'Шороо' | 'Хий' | 'Ус';
  rulingPlanet: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    nameMn: 'Хонь',
    nameEn: 'Aries',
    symbol: '♈',
    dateRange: '03.21 – 04.19',
    element: 'Гал',
    rulingPlanet: 'Ангараг (Mars)',
    startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
  },
  {
    id: 'taurus',
    nameMn: 'Үхэр',
    nameEn: 'Taurus',
    symbol: '♉',
    dateRange: '04.20 – 05.20',
    element: 'Шороо',
    rulingPlanet: 'Сугар (Venus)',
    startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
  },
  {
    id: 'gemini',
    nameMn: 'Ихэр',
    nameEn: 'Gemini',
    symbol: '♊',
    dateRange: '05.21 – 06.20',
    element: 'Хий',
    rulingPlanet: 'Буд (Mercury)',
    startMonth: 5, startDay: 21, endMonth: 6, endDay: 20,
  },
  {
    id: 'cancer',
    nameMn: 'Мэлхий',
    nameEn: 'Cancer',
    symbol: '♋',
    dateRange: '06.21 – 07.22',
    element: 'Ус',
    rulingPlanet: 'Сар (Moon)',
    startMonth: 6, startDay: 21, endMonth: 7, endDay: 22,
  },
  {
    id: 'leo',
    nameMn: 'Арслан',
    nameEn: 'Leo',
    symbol: '♌',
    dateRange: '07.23 – 08.22',
    element: 'Гал',
    rulingPlanet: 'Нар (Sun)',
    startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
  },
  {
    id: 'virgo',
    nameMn: 'Охин',
    nameEn: 'Virgo',
    symbol: '♍',
    dateRange: '08.23 – 09.22',
    element: 'Шороо',
    rulingPlanet: 'Буд (Mercury)',
    startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
  },
  {
    id: 'libra',
    nameMn: 'Жинлүүр',
    nameEn: 'Libra',
    symbol: '♎',
    dateRange: '09.23 – 10.22',
    element: 'Хий',
    rulingPlanet: 'Сугар (Venus)',
    startMonth: 9, startDay: 23, endMonth: 10, endDay: 22,
  },
  {
    id: 'scorpio',
    nameMn: 'Хилэнц',
    nameEn: 'Scorpio',
    symbol: '♏',
    dateRange: '10.23 – 11.21',
    element: 'Ус',
    rulingPlanet: 'Плутон (Pluto)',
    startMonth: 10, startDay: 23, endMonth: 11, endDay: 21,
  },
  {
    id: 'sagittarius',
    nameMn: 'Нум',
    nameEn: 'Sagittarius',
    symbol: '♐',
    dateRange: '11.22 – 12.21',
    element: 'Гал',
    rulingPlanet: 'Бархасбадь (Jupiter)',
    startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
  },
  {
    id: 'capricorn',
    nameMn: 'Матар',
    nameEn: 'Capricorn',
    symbol: '♑',
    dateRange: '12.22 – 01.19',
    element: 'Шороо',
    rulingPlanet: 'Санчир (Saturn)',
    startMonth: 12, startDay: 22, endMonth: 1, endDay: 19,
  },
  {
    id: 'aquarius',
    nameMn: 'Хумх',
    nameEn: 'Aquarius',
    symbol: '♒',
    dateRange: '01.20 – 02.18',
    element: 'Хий',
    rulingPlanet: 'Тэнгэрийн ван (Uranus)',
    startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
  },
  {
    id: 'pisces',
    nameMn: 'Загас',
    nameEn: 'Pisces',
    symbol: '♓',
    dateRange: '02.19 – 03.20',
    element: 'Ус',
    rulingPlanet: 'Далайн ван (Neptune)',
    startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
  },
];

interface ZodiacInsight {
  general: string;
  mood: string;
  love: string;
  career: string;
  luckyNumber: number;
  luckyColor: string;
  affirmation: string;
}

interface DailyZodiacProps {
  onNavigateToReading?: () => void;
}

// Find current sign based on today's calendar date
function getCurrentZodiacSign(): ZodiacSign {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  for (const sign of ZODIAC_SIGNS) {
    if (sign.id === 'capricorn') {
      if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return sign;
    } else {
      if (
        (m === sign.startMonth && d >= sign.startDay) ||
        (m === sign.endMonth && d <= sign.endDay)
      ) {
        return sign;
      }
    }
  }
  return ZODIAC_SIGNS[6]; // Libra default
}

const DEFAULT_INSIGHTS: Record<string, ZodiacInsight> = {
  aries: {
    general: 'Өнөөдөр таны гал махбод танд хүчтэй эрч хүч, санаачилгыг бэлэглэж байна. Удаан эргэлзсэн шийдвэрээ зоригтой эхлүүлэхэд од эрхэс таны талд байх болно.',
    mood: 'Зоримог & Тэвчээртэй',
    love: 'Хайртай хүнтэйгээ чин сэтгэлийн илэн далангүй яриа өрнүүлбэл та хоёрын харилцаа шинэ шатанд гарна.',
    career: 'Ажил дээрээ шинэ санаа дэвшүүлэхэд хамт олон тань нааштай хүлээж авна. Санхүүгийн жижиг тооцоог анхаараарай.',
    luckyNumber: 9,
    luckyColor: 'Champagne Coral (Шүрэн ягаан)',
    affirmation: 'Би өөрийн зорилгодоо итгэлтэйгээр алхам бүрээ ухамсартай хийж байна.',
  },
  taurus: {
    general: 'Шороо махбодын тогтвортой тайван энерги өнөөдөр таныг хүрээлж байна. Аливаа яаруу алхмаас зайлсхийж, өөрийн хэмнэлээр урагшлах нь хамгийн том ялалт авчирна.',
    mood: 'Тайван & Бат бөх',
    love: 'Халуун дулаан халамж, амттай хоол, ая тухтай орчин харилцаанд тань баяр баясал нэмнэ.',
    career: 'Төлөвлөгөөт ажлууд амжилттай урагшилна. Урт хугацааны хөрөнгө оруулалтаа эргэцүүлэхэд таатай өдөр.',
    luckyNumber: 6,
    luckyColor: 'Rose Gold (Сарнайн алтлаг)',
    affirmation: 'Миний сэтгэлд амар амгалан оршиж, бүтээсэн бүхэн минь өсөн дэвжиж байна.',
  },
  gemini: {
    general: 'Хий махбодын хурц оюун ухаан, харилцааны өндөр чадвар өнөөдөр гялалзах болно. Сонирхолтой мэдээ, шинэ танил танд шинэ үүд хаалгыг нээж өгнө.',
    mood: 'Оюунлаг & Сониуч',
    love: 'Хөнгөн инээмсэглэл, хөгжилтэй яриа хосын хоорондын бяцхан үл ойлголцлыг арилгана.',
    career: 'Төсөл танилцуулах, хэлэлцээр хийхэд маш таатай. Хамгийн чухал ажлаа эхэнд тавьж төвлөрөөрэй.',
    luckyNumber: 5,
    luckyColor: 'Blush Champagne (Цайвар оргилуун ягаан)',
    affirmation: 'Би шинэ мэдлэг, эерэг боломж бүрийг нээлттэй угтан авч байна.',
  },
  cancer: {
    general: 'Ус махбодын давуу тал болох гүн зөн совин тань өнөөдөр маш хүчтэй байна. Дотоод мэдрэмж тань таныг зөв зам руу хөтөлнө.',
    mood: 'Зөн совинтой & Халамжтай',
    love: 'Гэр бүл, дотны хүмүүстээ халуун дулаан үг хэлж сэтгэлээ нээх өдөр. Жижиг ч гэсэн үйлдэл үнэ цэнтэй.',
    career: 'Бүтээлч шийдлүүд толгойд тань орж ирнэ. Ажлын хамтрагчдынхаа сэтгэл зүйг ойлгож харилцаарай.',
    luckyNumber: 2,
    luckyColor: 'Pearl Silver & Pink (Сувдан ягаан)',
    affirmation: 'Миний зөн совин бол миний найдвартай луужин юм.',
  },
  leo: {
    general: 'Таны гэрэлтсэн, өгөөмөр зан чанар өнөөдөр бусдад урам зориг өгнө. Өөртөө итгэх итгэл тань оргилдоо хүрч байна.',
    mood: 'Гэрэлтсэн & Урам зоригтой',
    love: 'Романтик гэнэтийн бэлэг эсвэл хамтдаа өнгөрүүлэх онцгой цаг мөч харилцааг бадраана.',
    career: 'Манлайлах чадвараа харуулахад тун таатай үе. Таны санаачилгыг хамт олон өндрөөр үнэлнэ.',
    luckyNumber: 1,
    luckyColor: 'Warm Gold (Алтан наран)',
    affirmation: 'Би амьдралдаа талархаж, гэрэл гэгээгээ бусадтай хуваалцаж байна.',
  },
  virgo: {
    general: 'Нарийн нягт сэтгэлгээ, эмх цэгц өнөөдөр таны хамгийн том зэвсэг болно. Асуудлууд бүгд өөрийн байраа олох болно.',
    mood: 'Цэгцтэй & Мэргэн',
    love: 'Энгийн өдөр тутмын анхаарал халамж нь сүржин үгнээс илүү үнэ цэнтэй.',
    career: 'Бичиг баримт, санхүү, нарийн ширийн ажлууд саадгүй бүтнэ. Өөрийн чадварт итгэлтэй байгаарай.',
    luckyNumber: 4,
    luckyColor: 'Dusty Rose (Зөөлөн шаргал сарнай)',
    affirmation: 'Би алхам алхмаар төгс зохицол, амар тайванг бий болгож байна.',
  },
  libra: {
    general: 'Гоо зүй, зохицол, шударга тэнцвэрийн энерги өнөөдөр таны амьдралд хүчтэй үйлчилж байна.',
    mood: 'Тэнцвэртэй & Гоёмсог',
    love: 'Хосын харилцаанд харилцан хүндэтгэл маш чухал байна. Тааламжтай уур амьсгал та хоёрыг холбоно.',
    career: 'Хамтран ажиллах, шинэ гэрээ хэлцэл байгуулахад өндөр амжилт хүлээнэ. Эелдэг харилцаа амжилтын түлхүүр.',
    luckyNumber: 7,
    luckyColor: 'Champagne Pink (Оргилуун ягаан)',
    affirmation: 'Миний дотор төгс тэнцвэр, гоо үзэсгэлэн, амар амгалан оршиж байна.',
  },
  scorpio: {
    general: 'Гүн гүнзгий өөрчлөлт, шинэчлэлийн хүчирхэг урсгал танд ирж байна. Хуучирсан бодлуудаа орхисноор шинэ хүч цутгана.',
    mood: 'Хүчирхэг & Зоримог',
    love: 'Чин сэтгэлийн үнэнч байдал, гүн холбоо чухал болно. Итгэлцлээ улам бэхжүүлээрэй.',
    career: 'Нуугдмал байсан боломжуудыг соргогоор олж харах чадвар тань нэмэгдэнэ.',
    luckyNumber: 8,
    luckyColor: 'Deep Plum (Гүн чавган ягаан)',
    affirmation: 'Би хуучныг үдэж, шинэ дэвшил бүрийг бүрэн хүчээрээ хүлээн авч байна.',
  },
  sagittarius: {
    general: 'Өөдрөг үзэл, алсын хараа, эрх чөлөөний хүсэл таныг хөглөнө. Шинэ зүйл туршиж үзэхэд гайхалтай тохиромжтой.',
    mood: 'Өөдрөг & Тэлэгч',
    love: 'Хамтдаа сонирхолтой газарт очих эсвэл ирээдүйн тухай ярилцах нь харилцааг сэргээнэ.',
    career: 'Суралцах, гадаад харилцаа, шинэ чиглэл нээхэд оддын ивээл өндөр байна.',
    luckyNumber: 3,
    luckyColor: 'Celestial Violet (Тэнгэрийн ягаан)',
    affirmation: 'Миний амьдрал шинэ боломж, баяр баясгалан, өсөлтөөр дүүрэн байна.',
  },
  capricorn: {
    general: 'Зорилгодоо үнэнч тууштай байдал, тэвчээр өнөөдөр үр дүнгээ өгч эхэлнэ. Хийсэн ажлууд тань томоохон суурь болж бэхжинэ.',
    mood: 'Тууштай & Найдвартай',
    love: 'Харилцаанд найдвартай тулгуур болж буйгаа мэдрүүлэх нь хамгийн том хайрын баталгаа.',
    career: 'Мэргэжлийн түвшинд нэр хүнд тань өсөх таатай үйл явдал болно. Санхүүгээ урт хугацаанд төлөвлөөрэй.',
    luckyNumber: 10,
    luckyColor: 'Earth Charcoal & Bronze (Хүрэл бор)',
    affirmation: 'Миний хичээл зүтгэл бүхэн бодит амжилт болон хувирч байна.',
  },
  aquarius: {
    general: 'Өвөрмөц шинэ санаа, чөлөөт сэтгэлгээ тань өнөөдөр бусдыг гайхшруулна. Өөрийнхөөрөө байх нь амжилтын нууц.',
    mood: 'Шинэчлэгч & Чөлөөт',
    love: 'Найз нөхдийн холбоон дээр суурилсан гүн хайр өнөөдөр цэцэглэнэ. Өвөрмөц онцлогийг нь хүндэтгээрэй.',
    career: 'Технологи, бүтээлч ажлуудад гэнэтийн шинэ боломж нээгдэнэ. Багаар ажиллах нь үр өгөөжтэй.',
    luckyNumber: 11,
    luckyColor: 'Electric Sky Blue & Pink (Оргилуун цэнхэр)',
    affirmation: 'Би өөрийн өвөрмөц гэрлийг ертөнцөд айдасгүйгээр түгээж байна.',
  },
  pisces: {
    general: 'Сэтгэлийн мэдрэмж, уран бүтээлч сэтгэлгээ, өрөвч энэрэнгүй чанар тань өнөөдөр хүчтэй байна.',
    mood: 'Мэдрэмтгий & Уран бүтээлч',
    love: 'Гүн сэтгэлийн дотно байдал, романтик мэдрэмжүүд таныг хөглөнө.',
    career: 'Зөн совингоо дагаж гаргасан шийдвэр тань онох магадлал өндөр. Бүтээлч төслүүдэд амжилт дагалдана.',
    luckyNumber: 12,
    luckyColor: 'Mystic Lavender (Эрхэм нил ягаан)',
    affirmation: 'Би орчлон ертөнцийн урсгалд итгэж, зүрх сэтгэлийн дуу хоолойг дагаж байна.',
  },
};

export const DailyZodiac: React.FC<DailyZodiacProps> = ({ onNavigateToReading }) => {
  const initialSign = getCurrentZodiacSign();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(initialSign);
  const [insight, setInsight] = useState<ZodiacInsight>(() => DEFAULT_INSIGHTS[initialSign.id] || DEFAULT_INSIGHTS.libra);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedInsights, setCachedInsights] = useState<Record<string, ZodiacInsight>>({});

  // Today formatted in pure Mongolian
  const getMongolianFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = [
      'Ням гараг',
      'Даваа гараг',
      'Мягмар гараг',
      'Лхагва гараг',
      'Пүрэв гараг',
      'Баасан гараг',
      'Бямба гараг',
    ];
    const weekday = weekdays[now.getDay()];
    return `${year} оны ${month}-р сарын ${day}-ний өдөр (${weekday})`;
  };

  const todayFormatted = getMongolianFormattedDate();

  // Fetch insight for sign
  const fetchZodiacInsight = async (sign: ZodiacSign, forceRefresh = false) => {
    if (!forceRefresh && cachedInsights[sign.id]) {
      setInsight(cachedInsights[sign.id]);
      return;
    }

    // Default fallback available instantly
    const fallbackInsight = DEFAULT_INSIGHTS[sign.id] || DEFAULT_INSIGHTS.libra;

    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-zodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signId: sign.id,
          signName: sign.nameMn,
          signEn: sign.nameEn,
          element: sign.element,
          dateStr: todayFormatted,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.zodiac) {
          setInsight(data.zodiac);
          setCachedInsights((prev) => ({ ...prev, [sign.id]: data.zodiac }));
          return;
        }
      }
      // If server returned fallback or couldn't parse, ensure fallback is set
      setInsight(fallbackInsight);
    } catch {
      // Clean fallback without breaking UI
      setInsight(fallbackInsight);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZodiacInsight(selectedSign);
  }, [selectedSign]);

  const handleSelectSign = (sign: ZodiacSign) => {
    if (sign.id === selectedSign.id) return;
    mysticAudio.playChime(528, 0.7);
    setSelectedSign(sign);
  };

  const handleRefresh = () => {
    mysticAudio.playChime(639, 1.2);
    fetchZodiacInsight(selectedSign, true);
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Гал':
        return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      case 'Шороо':
        return <Mountain className="w-3.5 h-3.5 text-amber-700" />;
      case 'Хий':
        return <Wind className="w-3.5 h-3.5 text-sky-600" />;
      case 'Ус':
        return <Droplets className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-[#8E5244]" />;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 py-2 space-y-6 animate-fadeIn">
      {/* Date Strip */}
      <div className="flex items-center justify-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#FFF4F0] border border-[#DEB76A]/40 text-xs text-[#7A3222] font-sans font-bold shadow-sm">
          🗓 {todayFormatted}
        </div>
      </div>

      {/* Zodiac Sign Selector Grid */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#FFF6F3]/80 border border-[#9C6E65]/25 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {ZODIAC_SIGNS.map((sign) => {
            const isSelected = selectedSign.id === sign.id;
            return (
              <button
                key={sign.id}
                onClick={() => handleSelectSign(sign)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#4D2630] text-white shadow-md transform -translate-y-1'
                    : 'bg-white/70 hover:bg-white text-[#4A262E] border border-[#9C6E65]/15 hover:border-[#8E5244]/40'
                }`}
              >
                <span className="text-2xl leading-none mb-1 font-serif">
                  {sign.symbol}
                </span>
                <span className="text-xs font-serif font-bold whitespace-nowrap">
                  {sign.nameMn}
                </span>
                <span className={`text-[9px] font-sans ${isSelected ? 'text-[#EAC7C7]' : 'text-[#7A4E58]'}`}>
                  {sign.dateRange.split('–')[0]?.trim()}
                </span>
                {isSelected && (
                  <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-[#E8C582]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Zodiac Insight Display Card */}
      <div className="rounded-3xl bg-[#FFF6F3]/95 border border-[#9C6E65]/35 p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
        {/* Soft celestial corner filigrees */}
        <div className="absolute top-4 left-4 text-[#8E5244]/30 text-xs font-serif">✦ ☾ ✦</div>
        <div className="absolute top-4 right-4 text-[#8E5244]/30 text-xs font-serif">✦ ☽ ✦</div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#9C6E65]/20 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4D2630] text-[#E8C582] flex items-center justify-center text-4xl shadow-md border border-[#DEB76A]/40 shrink-0">
              {selectedSign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E]">
                  {selectedSign.nameMn} Орд ({selectedSign.nameEn})
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#5C3841] mt-1 font-sans">
                <span className="font-serif font-semibold text-[#8E5244]">
                  {selectedSign.dateRange}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-[#9C6E65]/20">
                  {getElementIcon(selectedSign.element)}
                  <strong className="text-[#3D1E25]">{selectedSign.element} махбод</strong>
                </span>
                <span>·</span>
                <span className="text-[#6B424B]">
                  Ивээгч: {selectedSign.rulingPlanet}
                </span>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="self-start sm:self-center px-4 py-2 rounded-xl border border-[#9C6E65]/30 bg-white hover:bg-stone-50 text-xs font-serif font-semibold text-[#4D2630] flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#8E5244] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Шинэчлэх</span>
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-16 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#4D2630] text-[#E8C582] flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-mystic font-semibold text-[#2F171E]">
                Од эрхсийн байрлалыг шинжилж байна...
              </h4>
            </div>
          </div>
        ) : insight ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Mood banner with Framed Bold Subheader */}
            {insight.mood && (
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#C59B27]/50 flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs text-[#2A1118] shadow-sm">
                <div className="py-1.5 px-3 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] inline-flex items-center gap-1.5 font-serif font-bold uppercase tracking-wider text-[#8E441D] shrink-0">
                  <Star className="w-4 h-4 text-[#8E441D] shrink-0" />
                  <span className="font-bold">Өдрийн Уур Амьсгал</span>
                </div>
                <span className="font-sans font-semibold text-sm text-[#2F171E] pl-1">
                  {insight.mood}
                </span>
              </div>
            )}

            {/* General Insight */}
            <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 shadow-sm space-y-3">
              <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs sm:text-sm uppercase font-serif tracking-wider text-[#2A1118] font-bold">
                <Sun className="w-4 h-4 text-[#8E441D]" />
                <span className="font-bold">Өнөөдрийн Оддын Энерги</span>
              </div>
              <p className="text-sm sm:text-base text-[#2F171E] leading-relaxed font-sans font-normal pl-1">
                {insight.general}
              </p>
            </div>

            {/* 2-Columns Grid: Love & Career */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Love */}
              <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 shadow-sm space-y-3">
                <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs uppercase font-serif tracking-wider text-[#2A1118] font-bold">
                  <Heart className="w-4 h-4 text-rose-700" />
                  <span className="font-bold">Хайр Сэтгэл & Харилцаа</span>
                </div>
                <p className="text-xs sm:text-sm text-[#2F171E] leading-relaxed pl-1">
                  {insight.love}
                </p>
              </div>

              {/* Career */}
              <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 shadow-sm space-y-3">
                <div className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] flex items-center gap-2 text-xs uppercase font-serif tracking-wider text-[#2A1118] font-bold">
                  <Briefcase className="w-4 h-4 text-[#8E441D]" />
                  <span className="font-bold">Ажил Хэрэг & Санхүү</span>
                </div>
                <p className="text-xs sm:text-sm text-[#2F171E] leading-relaxed pl-1">
                  {insight.career}
                </p>
              </div>
            </div>

            {/* Lucky highlights & Affirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Lucky Number */}
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4AF37]/45 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#8E441D] text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm shrink-0">
                  {insight.luckyNumber}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-lg border border-[#C59B27]/50 bg-[#FAF1E4] text-[10px] uppercase font-serif tracking-wider text-[#2A1118] font-bold">
                    Өдрийн Азын Тоо
                  </span>
                  <span className="text-sm font-serif font-bold text-[#2F171E] block mt-1">
                    {insight.luckyNumber}-р тоо
                  </span>
                </div>
              </div>

              {/* Affirmation in warm light theme */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] text-[#2A1118] border-2 border-[#C59B27]/55 flex flex-col justify-center space-y-1.5 shadow-sm">
                <span className="inline-block self-start px-2.5 py-0.5 rounded-lg border border-[#C59B27]/50 bg-[#FFFDF9] text-[10px] uppercase font-serif tracking-widest text-[#8E441D] font-bold">
                  🕊 Өдрийн Батламж
                </span>
                <p className="text-xs italic font-serif font-bold text-[#2A1118] leading-relaxed">
                  "{insight.affirmation}"
                </p>
              </div>
            </div>

            {/* CTA to complete reading */}
            {onNavigateToReading && (
              <div className="pt-4 border-t border-[#9C6E65]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#6D424B]">
                  Таны төрсөн огноо болон асуултад үндэслэсэн илүү нарийвчилсан тайлбар авахыг хүсвэл:
                </span>
                <button
                  onClick={onNavigateToReading}
                  className="px-5 py-2.5 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <span>Бүрэн хувийн уншлага эхлүүлэх</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};
