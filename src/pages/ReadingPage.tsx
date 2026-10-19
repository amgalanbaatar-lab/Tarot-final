import React, { useState, useEffect } from 'react';
import {
  calculateLifePath,
  calculateBirthdayNumber,
  calculatePersonalYear,
  NUMEROLOGY_PROFILES
} from '../data/numerologyData';
import { TAROT_DECK, TarotCard } from '../data/tarotData';
import {
  Sparkles,
  Printer,
  Copy,
  Check,
  ArrowRight,
  RotateCw,
  Heart,
  Briefcase,
  DollarSign,
  Compass,
  Award,
  Wand2,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  HelpCircle,
  CheckCircle2,
  Lock,
  Crown,
  Building,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { TarotShuffleDeck, DrawnCard } from '../components/TarotShuffleDeck';
import { TarotCardFront } from '../components/MysticVisuals';
import { FormattedReading } from '../components/FormattedReading';
import { hasPlanAccess, getUserOrderStatus, OrderPlan } from '../types/order';
import { CheckoutModal } from '../components/CheckoutModal';

interface ReadingPageProps {
  initialBirthDate?: string;
  initialQuestion?: string;
  initialCards?: { card: TarotCard; isUpright: boolean; position: string }[];
  activePlan?: 'love' | 'full' | null;
  targetPlan?: 'free' | 'love' | 'full';
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  onOpenPricing?: () => void;
}

function getDefaultCardsForPlan(plan: 'free' | 'love' | 'full'): DrawnCard[] {
  if (plan === 'full') {
    return [
      { card: TAROT_DECK[0], isUpright: true, position: '01. Өнгөрсөн суурь', isRevealed: true },
      { card: TAROT_DECK[1], isUpright: true, position: '02. Одоо цагийн нөхцөл', isRevealed: true },
      { card: TAROT_DECK[2], isUpright: true, position: '03. Далд айдас / итгэл найдварууд', isRevealed: true },
      { card: TAROT_DECK[3], isUpright: true, position: '04. Гадаад орчны нөлөө', isRevealed: true },
      { card: TAROT_DECK[10], isUpright: true, position: '05. Ирээдүйн боломж', isRevealed: true },
      { card: TAROT_DECK[17], isUpright: true, position: '06. Сэтгэлийн тэнцвэр', isRevealed: true },
      { card: TAROT_DECK[19], isUpright: true, position: '07. Эцсийн үр дүн', isRevealed: true },
    ];
  }
  if (plan === 'love') {
    return [
      { card: TAROT_DECK[6], isUpright: true, position: '01. Өнгөрсөн харилцаа', isRevealed: true },
      { card: TAROT_DECK[2], isUpright: true, position: '02. Одоогийн сэтгэл зүй', isRevealed: true },
      { card: TAROT_DECK[15], isUpright: false, position: '03. Далд тээглүүр', isRevealed: true },
      { card: TAROT_DECK[10], isUpright: true, position: '04. Ирээдүйн чиг хандлага', isRevealed: true },
      { card: TAROT_DECK[19], isUpright: true, position: '05. Танд өгөх гол зөвлөгөө', isRevealed: true },
    ];
  }
  return [
    { card: TAROT_DECK[1], isUpright: true, position: '01. Өнгөрсөн үе (Past)', isRevealed: true },
    { card: TAROT_DECK[19], isUpright: true, position: '02. Одоо цаг (Present)', isRevealed: true },
    { card: TAROT_DECK[10], isUpright: true, position: '03. Ирээдүй (Future)', isRevealed: true },
  ];
}

export interface LoveDeepDiveSections {
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

interface ParsedReading {
  lifeJourney: string;
  strengths: string;
  challenges: string;
  answer: string;
  affirmation: string;
  fullRawText: string;
  isLoveDeepDive?: boolean;
  loveSections?: LoveDeepDiveSections;
}

export const ReadingPage: React.FC<ReadingPageProps> = ({
  initialBirthDate = '1998-04-12',
  initialQuestion = '',
  initialCards = [],
  activePlan = null,
  targetPlan,
  currentUserEmail = null,
  currentUserName = null,
  onOpenPricing,
}) => {
  // Determine effective plan based on active entitlements and target plan
  const initialEffectivePlan: 'free' | 'love' | 'full' =
    targetPlan || (activePlan === 'full' ? 'full' : activePlan === 'love' ? 'love' : 'free');

  const [name, setName] = useState(currentUserName || '');
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthPlace, setBirthPlace] = useState('Улаанбаатар');
  const [category, setCategory] = useState<'Хайр дурлал' | 'Ажил карьер' | 'Санхүү' | 'Сүнслэг өсөлт'>('Ажил карьер');
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'love' | 'full'>(initialEffectivePlan);

  const [cards, setCards] = useState<DrawnCard[]>(() => {
    if (initialCards.length > 0) {
      return initialCards.map((c) => ({ ...c, isRevealed: true }));
    }
    return getDefaultCardsForPlan(initialEffectivePlan);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [parsedReading, setParsedReading] = useState<ParsedReading | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'pillars' | 'full'>('pillars');
  const [spinningResultIndex, setSpinningResultIndex] = useState<number | null>(null);

  const handleSpinResultCard = (idx: number) => {
    mysticAudio.playChime(639, 1.8);
    setSpinningResultIndex(idx);
    setTimeout(() => setSpinningResultIndex(null), 1600);
  };

  // Sync when activePlan or targetPlan updates
  useEffect(() => {
    const nextPlan = targetPlan || (activePlan === 'full' ? 'full' : activePlan === 'love' ? 'love' : selectedPlan);
    if (nextPlan !== selectedPlan) {
      setSelectedPlan(nextPlan);
      setCards(getDefaultCardsForPlan(nextPlan));
    }
  }, [activePlan, targetPlan]);

  // Sync inputs if props change
  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      setCards(initialCards.map((c) => ({ ...c, isRevealed: true })));
    }
  }, [initialCards]);

  useEffect(() => {
    if (initialBirthDate) setBirthDate(initialBirthDate);
  }, [initialBirthDate]);

  useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    if (currentUserName && !name) {
      setName(currentUserName);
    }
  }, [currentUserName]);

  const lifePath = calculateLifePath(birthDate);
  const birthdayNumber = calculateBirthdayNumber(birthDate);
  const personalYear = calculatePersonalYear(birthDate, 2026);
  const profile = NUMEROLOGY_PROFILES[lifePath] || NUMEROLOGY_PROFILES[7];

  // Helper to parse unstructured / structured text into 4 clean pillars or 8 love deep-dive sections
  const parseSections = (text: string): ParsedReading => {
    const raw = text || '';

    // Check if reading is Love Deep Dive format
    const isLoveFormat =
      raw.includes('LOVE & RELATIONSHIP DEEP-DIVE') ||
      raw.includes('Картуудын энергийн ерөнхий дүр зураг') ||
      raw.includes('Karmic Connection') ||
      raw.includes('Energy Exchange') ||
      selectedPlan === 'love';

    if (isLoveFormat) {
      const extractLoveSection = (startRegex: RegExp, endRegex: RegExp): string => {
        const match = raw.match(new RegExp(`${startRegex.source}([\\s\\S]*?)(?=${endRegex.source}|$)`, 'i'));
        if (!match) return '';
        return match[1]
          .replace(/^[:\-\s\n]+/, '')
          .replace(/━+/g, '')
          .trim();
      };

      const overview = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*1\.\s*Картуудын энергийн ерөнхий дүр зураг/i, /(?:###|##|#|✦|[*]{2})?\s*2\.\s*Сэтгэл зүй/i) ||
        `Дэлгэгдсэн картууд нь та хоёрын харилцаанд сэтгэл зүйн болон сүнслэг түвшний гүн хувьсал явагдаж буйг илтгэж байна. Картуудын голлох эрчим нь бие биеэ танин мэдэх, далд эргэлзээг даван туулах, мөн харилцан итгэлцлийн шинэ шатанд шилжих хүчтэй соронзон энергийг үүсгэж байна.`;

      const deepDive = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*2\.\s*Сэтгэл зүй/i, /(?:###|##|#|✦|[*]{2})?\s*3\.\s*Кармик холбоо/i) ||
        `Таны зүгээс харилцаандаа чин сэтгэлийн тогтвортой байдал, үнэнч нээлттэй байдлыг хүсэмжилж байгаа бол нөгөө хүний хувьд өөрийн дотоод мэдрэмжээ шууд илэрхийлэхээс бага зэрэг эмээсэн, хамгаалалтын байр суурьтай байна. Өнгөрсөн туршлагаас үүдэлтэй үл итгэх хандлага хоорондоо илэн далангүй ярилцахад үл үзэгдэх саад болж байна.`;

      const karmic = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*3\.\s*Кармик холбоо/i, /(?:###|##|#|✦|[*]{2})?\s*4\.\s*Хосын энергийн/i) ||
        `Энэхүү харилцаа нь та хоёрын хувьд тохиолдлын уулзалт бус, харин өөрсдийн хувийн хил хязгаар, тэвчээр, өөрийгөө болон бусдыг болзолгүй хайрлах чадварыг суралцах сүнслэг хичээл юм. Бие биенийхээ эмзэг талыг тольдон харуулж, хуучин шархыг анагаах кармик холбоотой.`;

      const energyExchange = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*4\.\s*Хосын энергийн/i, /(?:###|##|#|✦|[*]{2})?\s*5\.\s*Сэтгэл хөдлөлийн/i) ||
        `Энергийн солилцооны хувьд одоогийн байдлаар сэтгэлийн санаачилга, анхаарал халамжийг нэг тал нь арай илүү гаргаж, нөгөө тал нь үүнийг дотроо талархалтай хүлээж авдаг ч ил гаргахдаа хүлээцтэй байгаа дүр зураг байна. Өгөх ба авах тэнцвэрийг тэгшитгэх шаардлагатай.`;

      const emotionalBlocks = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*5\.\s*Сэтгэл хөдлөлийн/i, /(?:###|##|#|✦|[*]{2})?\s*6\.\s*Цаг хугацааны/i) ||
        `Таны тал дээр: Сэтгэлээ бүрэн дэлгэвэл эмзэг байдалд орж магадгүй гэсэн дотоод түгшүүр.\nНөгөө хүний тал дээр: Өөрийн эрх чөлөө, бие даасан байдлаа алдахаас эмээх сэтгэл зүйн хаалт.`;

      const timeline = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*6\.\s*Цаг хугацааны/i, /(?:###|##|#|✦|[*]{2})?\s*7\.\s*Хамгийн сайнаар/i) ||
        `Ойрын 1-3 долоо хоногт: Сэтгэл хөдлөлийн хэлбэлзэл намжиж, өдөр тутмын харилцаанд ойлголцлын анхны дулаан уур амьсгал сэргэнэ.\nИрэх 1-3 сарын хугацаанд: Харилцааны цаашдын чиг баримжаа тодорхой болж, шийдвэртэй бодит алхам хийх чухал цэгт хүрнэ.`;

      const scenarios = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*7\.\s*Хамгийн сайнаар/i, /(?:###|##|#|✦|[*]{2})?\s*8\.\s*Практик зөвлөгөө/i) ||
        `Хамгийн сайн хувилбар: Хоёр тал бие биенийхээ дотоод хэрэгцээг хүлээн зөвшөөрч, сэтгэлийн гүн итгэлцэл дээр суурилсан урт хугацааны бат бөх зохицолд хүрэх.\nХамгийн муу хувилбар: Илэн далангүй ярилцахын оронд дотроо гомдол, таамаглал хуримтлуулж хөндийрөх.`;

      const actionableAdvice = extractLoveSection(/(?:###|##|#|✦|[*]{2})?\s*8\.\s*Практик зөвлөгөө/i, /(?:###|##|#|✦|[*]{2})?\s*(?:✨\s*)?(?:Энергийн\s*)?Affirmation/i) ||
        `Юуг хийх хэрэгтэй вэ?: Асуудлыг хурцатгахгүйгээр өөрийн мэдрэмжээ "би" гэсэн өнцгөөс тайван хуваалцах; бие биедээ амьсгалах орон зай олгох.\nЮунаас зайлсхийх ёстой вэ?: Нөгөө хүний бодол, үйлдэлд хувийн таамаг дэвшүүлэн буруутгах, сэтгэл хөдлөлөөр түргэдэн эцсийн дүгнэлт хийхээс зайлсхийх.`;

      let aff = '';
      const affMatch = raw.match(/(?:(?:###|##|#|✦|[*]{2})?\s*(?:✨\s*)?(?:Энергийн\s*)?Affirmation[\s\S]*$)/i);
      if (affMatch) {
        aff = affMatch[0]
          .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:✨\s*)?(?:Энергийн\s*)?Affirmation[^\n]*\n?/i, '')
          .replace(/^[-\s:"]+/, '')
          .replace(/["\s]+$/, '')
          .trim();
      }
      if (!aff) {
        aff = 'Би өөрийн зүрх сэтгэлийн дуудлагад итгэж, харилцаандаа хүндэтгэл, үнэнч хайр, амар амгаланг хүлээн авч байна. Бидний хайрын эрчим өдөр бүр тэнцвэртэйгээр өсөн бэхжиж байна.';
      }

      return {
        lifeJourney: overview,
        strengths: deepDive,
        challenges: emotionalBlocks,
        answer: `${karmic}\n\n${energyExchange}\n\n${timeline}\n\n${scenarios}\n\n${actionableAdvice}`,
        affirmation: aff,
        fullRawText: raw,
        isLoveDeepDive: true,
        loveSections: {
          overview,
          deepDive,
          karmic,
          energyExchange,
          emotionalBlocks,
          timeline,
          scenarios,
          actionableAdvice,
          affirmation: aff,
        },
      };
    }

    // Standard 4 pillars extraction
    let lifeJourney = '';
    const journeyMatch = raw.match(/(?:###|##|#|✦|[*]{2})?\s*(?:🌿\s*)?1\.\s*АМЬДРАЛЫН ЗАМНАЛ[\s\S]*?(?=(?:###|##|#|✦|[*]{2})?\s*(?:💎\s*)?2\.\s*ТАНЫ ДАВУУ ТАЛ|$)/i);
    if (journeyMatch) {
      lifeJourney = journeyMatch[0]
        .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:🌿\s*)?1\.\s*АМЬДРАЛЫН ЗАМНАЛ[^\n]*\n?/i, '')
        .replace(/━+/g, '')
        .trim();
    }

    // Extract Strengths
    let strengths = '';
    const strengthsMatch = raw.match(/(?:###|##|#|✦|[*]{2})?\s*(?:💎\s*)?2\.\s*ТАНЫ ДАВУУ ТАЛ[\s\S]*?(?=(?:###|##|#|✦|[*]{2})?\s*(?:⚡\s*)?3\.\s*СОРИЛТ|$)/i);
    if (strengthsMatch) {
      strengths = strengthsMatch[0]
        .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:💎\s*)?2\.\s*ТАНЫ ДАВУУ ТАЛ[^\n]*\n?/i, '')
        .replace(/━+/g, '')
        .trim();
    }

    // Extract Challenges
    let challenges = '';
    const challengesMatch = raw.match(/(?:###|##|#|✦|[*]{2})?\s*(?:⚡\s*)?3\.\s*СОРИЛТ[\s\S]*?(?=(?:###|##|#|✦|[*]{2})?\s*(?:🔮\s*)?4\.\s*(?:ТАНЫ\s*(?:ТАВЬСАН\s*)?)?АСУУЛТАД|$)/i);
    if (challengesMatch) {
      challenges = challengesMatch[0]
        .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:⚡\s*)?3\.\s*СОРИЛТ[^\n]*\n?/i, '')
        .replace(/━+/g, '')
        .trim();
    }

    // Extract Answer
    let answer = '';
    const answerMatch = raw.match(/(?:###|##|#|✦|[*]{2})?\s*(?:🔮\s*)?4\.\s*(?:ТАНЫ\s*(?:ТАВЬСАН\s*)?)?АСУУЛТАД\s*ӨГӨХ\s*ХАРИУ[\s\S]*?(?=(?:###|##|#|✦|[*]{2})?\s*(?:🕊\s*)?5\.\s*(?:ӨДРИЙН\s*)?(?:СЭТГЭЛИЙН\s*)?БАТЛАМЖ|$)/i);
    if (answerMatch) {
      answer = answerMatch[0]
        .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:🔮\s*)?4\.\s*(?:ТАНЫ\s*(?:ТАВЬСАН\s*)?)?АСУУЛТАД\s*ӨГӨХ\s*ХАРИУ[^\n]*\n?/i, '')
        .replace(/━+/g, '')
        .trim();
    }

    // Extract Affirmation
    let affirmation = '';
    const affMatch = raw.match(/(?:(?:###|##|#|✦|[*]{2})?\s*(?:🕊\s*)?5\.\s*(?:ӨДРИЙН\s*)?(?:СЭТГЭЛИЙН\s*)?БАТЛАМЖ|БАТЛАМЖ|AFFIRMATION)[\s\S]*$/i);
    if (affMatch) {
      affirmation = affMatch[0]
        .replace(/^(?:###|##|#|✦|[*]{2})?\s*(?:🕊\s*)?5\.\s*(?:ӨДРИЙН\s*)?(?:СЭТГЭЛИЙН\s*)?БАТЛАМЖ[^\n]*\n?/i, '')
        .replace(/━+/g, '')
        .replace(/[""]/g, '"')
        .trim();
    }

    // High quality rich fallbacks if any section wasn't delimited by regex
    if (!lifeJourney) {
      if (selectedPlan === 'free') {
        lifeJourney = `Таны дэлгэсэн картуудын өнгөрсөн суурь нь таныг аливаа асуудлын цаад үнэнийг нэвт хардаг, өөрийн дотоод луужинтай хүн болохыг илтгэнэ. Өнгөрсөн үед хуримтлуулсан туршлага, туулсан эргэлзээнүүд тань өнөөдрийн бат бөх суурийг тавьж өгсөн байна. Хуучин айдсаа тавьж явуулснаар та шинэ боломжийн үүдийг нээнэ.`;
      } else {
        lifeJourney = `Таны амьдралын суурь зам мөр нь аливаа асуудлын цаад үнэнийг нэвт хардаг, бие даасан хүчирхэг дотоод ертөнцтэй хүн болохыг илтгэнэ. Өнгөрсөн туршлага танд бусдын сэтгэлийг таних мэдрэмж, дасан зохицох уян хатан чанарыг хайрлажээ. Одоо цаг бол хуучин дарамт, эргэлзээгээ тавьж явуулж, удахгүй эхлэх шинэ мөчлөгт өөрийгөө бэлтгэх сэрэхүйн үе юм.`;
      }
    }

    if (!strengths) {
      strengths = `• Зөн совин ба дотоод мэдрэмж: Аливаа шийдвэрийг бусдаас түрүүлж зөв мэдрэх байгалийн луужинтай.
• Сэтгэлийн тэнхээ: Хүнд сорилт, саад бэрхшээл тулгарахад ганцаардаж шантралгүй, өөрийн хүчээр босоод ирэх далд их чадавхтай.
• Зарчимч, бие даасан байдал: Бусдын явцуу үзэл, шүүмжлэлд амархан автахгүйгээр өөрийн замаар тууштай алхаж чаддаг.
• Бусдыг энэрэн ойлгох зүрх: Чин сэтгэлээсээ бусдад тус дэм болох, эргэн тойрондоо дулаан нөлөө түгээх авьяастай.`;
    }

    if (!challenges) {
      challenges = `• Хэт их тунгаан бодох (Overthinking): Жижиг эргэлзээг толгойдоо томруулан төсөөлж, эхлэх алхмаа хойшлуулах хандлага байна.
• Сэтгэлийн дарамтыг ганцаараа үүрэх: Бусдад төвөг болохгүй гэж бүхнийг дотроо хадгалснаар сэтгэл зүйн эрч хүчээ шавхах эрсдэлтэй.
• Төгс байх гэж өөрийгөө шахдаг зан: Алдаа гаргахаас бүү эмээ. Заримдаа дутуу мэт санагдах зүйлс таныг илүү том амжилтад хөтөлдөг.
• Хуучин дурсамжид уягдах: Өнгөрсөн алдаа эсвэл харилцааны таагүй дурсамжаа давтан бодохоос татгалзаж, одоо цаг дээрээ төвлөрөх шаардлагатай.`;
    }

    if (!answer) {
      const cardsDesc = cards.map((c) => `• ${c.position}: ${c.card.name} (${c.isUpright ? 'Шулуун' : 'Эргэсэн'}) — ${c.isUpright ? c.card.uprightMeaning : c.card.reversedMeaning}`).join('\n');
      answer = `Таны тавьсан "${question || category || 'Амьдралын замнал ба сонголт'}" асуултыг тунгаан үзэхэд картууд дараах тодорхой хариултыг өгч байна:

${cardsDesc}

Танд өгөх гол хариу:
Таны эргэлзэж буй энэхүү асуудал бол дараагийн шинэ түвшинд шилжих гарц юм. Картууд танд гаднаас зөвшөөрөл хайхын оронд өөрийн анхны зөн совиндоо итгэхийг зөвлөж байна. Аливаа алхмыг яаралгүй, тайван сэтгэлээр хийвэл үр дүн нь таны талд эргэнэ.`;
    }

    if (!affirmation) {
      affirmation = `"Би амьдралынхаа бүх үе шатанд зөв цагтаа, зөв газраа явж байна. Өнгөрсөн бүхэн надад туршлага болж, ирээдүй надад хамгийн сайн сайхныг авчирч байна. Би өөрийн дотоод хүчиндээ бүрэн итгэж байна."`;
    }

    return {
      lifeJourney,
      strengths,
      challenges,
      answer,
      affirmation,
      fullRawText: raw,
    };
  };

  const handleGenerateReading = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasAccess = hasPlanAccess(selectedPlan, currentUserEmail);
    if (!hasAccess && selectedPlan !== 'free') {
      mysticAudio.playChime(261, 1);
      setCheckoutModalPlan({
        id: selectedPlan as OrderPlan,
        name: selectedPlan === 'full' ? 'FULL READING' : 'LOVE READING',
        price: selectedPlan === 'full' ? '19,900₮' : '9,900₮',
        amount: selectedPlan === 'full' ? 19900 : 9900,
      });
      return;
    }

    setIsLoading(true);
    mysticAudio.playChime(432, 2.5);

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          category,
          plan: selectedPlan,
          tarotCards: cards.map((c) => ({
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
        setReadingResult(data.reading);
        setParsedReading(parseSections(data.reading));
        mysticAudio.playChime(639, 3);

        // Save to history
        try {
          const currentHistory = JSON.parse(localStorage.getItem('mystic_readings_history') || '[]');
          currentHistory.unshift({
            title: `${selectedPlan.toUpperCase()} уншлага (${category})`,
            date: new Date().toLocaleDateString('mn-MN'),
            category,
            plan: selectedPlan,
          });
          localStorage.setItem('mystic_readings_history', JSON.stringify(currentHistory.slice(0, 10)));
        } catch {}
      } else {
        throw new Error('Уншлага үүсгэхэд алдаа гарлаа');
      }
    } catch (err) {
      console.error(err);
      const parsed = parseSections('');
      setReadingResult(parsed.fullRawText || parsed.lifeJourney);
      setParsedReading(parsed);
      mysticAudio.playChime(528, 2);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('reading-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  };

  const handleCopy = () => {
    if (readingResult || parsedReading) {
      let fullText = readingResult || '';
      if (!fullText && parsedReading?.isLoveDeepDive && parsedReading?.loveSections) {
        const ls = parsedReading.loveSections;
        fullText = `[LOVE & RELATIONSHIP DEEP-DIVE READING]\n\n1. Картуудын энергийн ерөнхий дүр зураг:\n${ls.overview}\n\n2. Сэтгэл зүй ба далд мэдрэмжийн задргаа (Deep Dive):\n${ls.deepDive}\n\n3. Кармик холбоо ба далд шалтгаан (Karmic Connection):\n${ls.karmic}\n\n4. Хосын энергийн тэнцвэрт байдал (Energy Exchange):\n${ls.energyExchange}\n\n5. Сэтгэл хөдлөлийн саад ба айдас (Emotional Blocks):\n${ls.emotionalBlocks}\n\n6. Цаг хугацааны чиг баримжаа (Timeline Outlook):\n${ls.timeline}\n\n7. Хамгийн сайнаар болон муугаар эргэх хувилбар (Best & Worst Case Scenario):\n${ls.scenarios}\n\n8. Практик зөвлөгөө ба энергийн алхмууд (Actionable Advice):\n${ls.actionableAdvice}\n\n✨ Энергийн Affirmation (Батлах үг):\n${ls.affirmation}`;
      } else if (!fullText) {
        fullText = `${parsedReading?.lifeJourney}\n\n${parsedReading?.strengths}\n\n${parsedReading?.challenges}\n\n${parsedReading?.answer}\n\n${parsedReading?.affirmation}`;
      }
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [checkoutModalPlan, setCheckoutModalPlan] = useState<{
    id: OrderPlan;
    name: string;
    price: string;
    amount: number;
  } | null>(null);

  const [, setOrderUpdateTick] = useState(0);

  // Listen to order and storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setOrderUpdateTick((prev) => prev + 1);
    };
    window.addEventListener('mystic_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('mystic_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleChangePlan = (newPlan: 'free' | 'love' | 'full') => {
    mysticAudio.playChime(528, 1);
    setSelectedPlan(newPlan);
    setCards(getDefaultCardsForPlan(newPlan));
    setReadingResult(null);
    setParsedReading(null);
  };

  const isFullPlanActive = activePlan === 'full' || hasPlanAccess('full', currentUserEmail);
  const isLovePlanActive = activePlan === 'love' || hasPlanAccess('love', currentUserEmail) || isFullPlanActive;

  const isSelectedPlanUnlocked =
    selectedPlan === 'free' ||
    (selectedPlan === 'full' ? isFullPlanActive : isLovePlanActive);

  const orderStatusInfo =
    selectedPlan !== 'free'
      ? getUserOrderStatus(selectedPlan, currentUserEmail)
      : { status: 'active' as const };

  const isOrderPending = orderStatusInfo.status === 'pending';

  const loveOrderStatus = getUserOrderStatus('love', currentUserEmail);
  const fullOrderStatus = getUserOrderStatus('full', currentUserEmail);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Top Banner: Status & Access */}
      {isSelectedPlanUnlocked && (isFullPlanActive || isLovePlanActive) && (
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-[#2A121E] via-[#1E0C15] to-[#2A121E] border-2 border-[#E8BCB0]/50 p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4] shrink-0">
              <Crown className="w-5 h-5 text-[#FADBD4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#FADBD4] font-bold">
                  {isFullPlanActive ? '✦ FULL READING · ИДЭВХЖСЭН (ACTIVE) ✦' : '✦ LOVE READING · ИДЭВХЖСЭН (ACTIVE) ✦'}
                </span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  Нээгдсэн ✓
                </span>
              </div>
              <p className="text-xs text-[#E4B5AA] mt-0.5">
                Таны төлбөр баталгаажсан тул тухайн багцын бүх өгөгдөл, {selectedPlan === 'full' ? '7' : '5'} картын сүлжээ болон дэлгэрэнгүй тайлан бүрэн нээлттэй байна.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleGenerateReading()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#E8BCB0] hover:bg-[#F5D6CE] text-[#240F19] text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#8C3F2B]" />
            <span>Шууд Үр Дүн Үзэх</span>
          </button>
        </div>
      )}

      {/* Locked State Banner 1: PENDING PAYMENT */}
      {!isSelectedPlanUnlocked && isOrderPending && (
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#2F171E] via-[#241117] to-[#2F171E] border-2 border-amber-400/60 p-6 sm:p-8 text-white shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-400/25 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-serif tracking-[0.25em] text-amber-300 font-bold">
                    ⏳ ТӨЛБӨРИЙН БАТАЛГААЖИЛТ ХҮЛЭЭГДЭЖ БАЙНА
                  </span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 border border-amber-400/50 px-2 py-0.5 rounded-full font-bold">
                    Хүлээгдэж буй
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3] mt-1">
                  {selectedPlan === 'full' ? 'Full Reading (7 карт) түр түгжээтэй' : 'Love Reading (5 карт) түр түгжээтэй'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                mysticAudio.playChime(639, 1);
                setOrderUpdateTick((prev) => prev + 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-serif font-bold transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Төлөв дахин шалгах</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#F7D8CE] leading-relaxed">
            Таны шилжүүлэг бүртгэгдсэн бөгөөд админ банкны гүйлгээг шалгаж, эрх нээх хүртэл энэхүү төлбөртэй уншлага түр түгжээтэй байна. Админ баталгаажуулмагц эрх автоматаар нээгдэж, бүх картууд дэлгэгдэнэ.
          </p>

          {orderStatusInfo.order && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/35 border border-amber-400/25 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Захиалгын дугаар:</span>
                <strong className="font-mono text-amber-300 text-sm">#{orderStatusInfo.order.id}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Шилжүүлсэн дүн:</span>
                <strong className="text-white text-sm">{orderStatusInfo.order.amount.toLocaleString()}₮</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Шилжүүлсэн банк:</span>
                <strong className="text-[#FADBD4]">{orderStatusInfo.order.bankName}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Гүйлгээний утга:</span>
                <strong className="text-[#FADBD4] truncate block">{orderStatusInfo.order.transferNote}</strong>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleChangePlan('free')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-serif transition-all cursor-pointer"
            >
              Үнэгүй 3 картын уншлага хийх →
            </button>
          </div>
        </div>
      )}

      {/* Locked State Banner 2: NOT PAID YET */}
      {!isSelectedPlanUnlocked && !isOrderPending && (
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#2A1118] via-[#1E0B11] to-[#2A1118] border-2 border-[#E8BCB0]/50 p-6 sm:p-8 text-white shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8BCB0]/20 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8BCB0]/20 border border-[#DEB76A]/40 flex items-center justify-center text-[#FADBD4] shrink-0">
                <Lock className="w-6 h-6 text-[#FADBD4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-serif tracking-[0.25em] text-[#FADBD4] font-bold">
                    ✦ ТӨЛБӨРТЭЙ УНШЛАГА ТҮГЖЭЭТЭЙ ✦
                  </span>
                  <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-400/40 px-2.5 py-0.5 rounded-full font-bold">
                    Эрх шаардлагатай
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3] mt-1">
                  {selectedPlan === 'full' ? 'FULL READING (7 КАРТ) — 19,900₮' : 'LOVE READING (5 КАРТ) — 9,900₮'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutModalPlan({
                  id: selectedPlan as OrderPlan,
                  name: selectedPlan === 'full' ? 'FULL READING' : 'LOVE READING',
                  price: selectedPlan === 'full' ? '19,900₮' : '9,900₮',
                  amount: selectedPlan === 'full' ? 19900 : 9900,
                });
              }}
              className="px-6 py-3 rounded-full bg-[#E8BCB0] hover:bg-[#F5D6CE] text-[#240F19] text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-[#8C3F2B]" />
              <span>Дансаар шилжүүлэх & Эрх нээх</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#F7D8CE] leading-relaxed">
            Энэхүү дэлгэрэнгүй уншлага нь төлбөртэй эрх шаардана. Та байгууллагын Khaanbank эсвэл Golomt bank-ны данс руу төлбөрөө шилжүүлж, админ эрх нээсний дараа нээгдэнэ.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-[#FADBD4]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{selectedPlan === 'full' ? '7 Таро картын амьдралын хүрд' : '5 Таро картын хайрын тусгай сүлжээ'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#FADBD4]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Сэтгэл зүйн далд бодол & саад тээглүүр</span>
            </div>
            <div className="flex items-center gap-2 text-[#FADBD4]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Бүрэн хувийн зөвлөгөө ба өдрийн батламж</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleChangePlan('free')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-serif transition-all cursor-pointer"
            >
              Үнэгүй 3 картын уншлага сонгох →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] gold-kicker">
          <span className="text-[#8E441D]">✦</span>
          <span>Тоон Зурхай & Тарогийн Нэгдэл</span>
          <span className="text-[#8E441D]">✦</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-mystic font-bold text-[#230F16]">
          {selectedPlan === 'full' ? 'Бүрэн Уншлага & Амьдралын Толь' : selectedPlan === 'love' ? 'Хайрын Уншлага & Хосын Эрчим' : 'Хувийн Уншлага Үүсгэх'}
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Таны сонирхсон салбар, тавьсан асуулт болон сонгосон картууд дээр үндэслэн амьдралын замнал, давуу тал, сорилт болон асуултад тань ойлгомжтой, энгийн үгээр цэгцтэй бүрэн хариулна.
        </p>
      </div>

      {/* Plan Switcher Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#FFF6F3] border border-[#DEB76A]/40 shadow-sm gap-1.5 text-xs font-serif font-bold">
          <button
            type="button"
            onClick={() => handleChangePlan('free')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlan === 'free'
                ? 'bg-[#4D2630] text-white shadow-sm'
                : 'text-[#5A353E] hover:bg-[#F2DDD7]'
            }`}
          >
            <span>Үнэгүй (3 карт)</span>
          </button>

          <button
            type="button"
            onClick={() => handleChangePlan('love')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlan === 'love'
                ? 'bg-[#4D2630] text-white shadow-sm'
                : 'text-[#5A353E] hover:bg-[#F2DDD7]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Love Reading (5 карт)</span>
            {isLovePlanActive ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">✓ Active</span>
            ) : loveOrderStatus.status === 'pending' ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">⏳ Хүлээгдэж буй</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#7A4E58]">
                <Lock className="w-3 h-3 text-[#9A7A80]" />
                <span>9,900₮</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleChangePlan('full')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlan === 'full'
                ? 'bg-[#4D2630] text-white shadow-sm'
                : 'text-[#5A353E] hover:bg-[#F2DDD7]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Full Reading (7 карт)</span>
            {isFullPlanActive ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">✓ Active</span>
            ) : fullOrderStatus.status === 'pending' ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">⏳ Хүлээгдэж буй</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#7A4E58]">
                <Lock className="w-3 h-3 text-[#9A7A80]" />
                <span>19,900₮</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Form */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#FFF6F3]/95 border border-[#DEB76A]/40 p-6 sm:p-10 shadow-xl space-y-8">
        <form onSubmit={handleGenerateReading} className="space-y-8">
          {/* Step 1: Category & Question */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-serif tracking-[0.2em] gold-kicker border-b border-[#DEB76A]/25 pb-2 flex items-center justify-between">
              <span>01. Сонирхсон Салбар ба Асуулт</span>
              <span className="text-[11px] text-[#7A4E58] font-sans font-normal normal-case">
                {selectedPlan === 'love' ? '5 картын хайрын уншлага' : selectedPlan === 'full' ? '7 картын бүрэн шинжилгээ' : '3 картын уншлага'}
              </span>
            </h3>

            <div>
              <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-2 font-semibold">
                Сонирхсон салбар
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Хайр дурлал', icon: Heart },
                  { id: 'Ажил карьер', icon: Briefcase },
                  { id: 'Санхүү', icon: DollarSign },
                  { id: 'Сүнслэг өсөлт', icon: Compass },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setCategory(item.id as any)}
                      className={`p-3 rounded-xl border text-xs font-serif font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-[#8E5244] bg-[#4D2630] text-white shadow-sm'
                          : 'border-[#9C6E65]/30 bg-white/70 text-[#523139] hover:border-[#8E5244]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1.5 font-semibold">
                Таны тодорхой асуулт (Заавал биш)
              </label>
              <textarea
                rows={2}
                placeholder="Жишээ: Миний ойрын үед хийх сонголт зөв үү? Эсвэл хайр дурлал, карьертаа юунд анхаарах вэ?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-white border border-[#9C6E65]/30 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] placeholder:text-[#9A7A80] focus:outline-none focus:border-[#8E5244]"
              />
            </div>
          </div>

          {/* Step 2: Cards Deck (Unlocked OR Locked) */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-serif tracking-[0.2em] gold-kicker border-b border-[#DEB76A]/25 pb-2 flex items-center justify-between">
              <span>02. Тарогийн Хөзрүүд</span>
              <span className="text-[11px] text-[#7A4E58] font-sans font-normal normal-case">
                {cards.length} карт дэлгэгдэнэ
              </span>
            </h3>

            {isSelectedPlanUnlocked ? (
              <TarotShuffleDeck
                cards={cards}
                onCardsChange={setCards}
                plan={selectedPlan}
                userName=""
                userBirthDate=""
                userQuestion={question}
                userCategory={category}
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#9C6E65]/40 bg-[#FBF0EC]/85 p-8 sm:p-12 text-center space-y-4 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-[#4D2630] border-2 border-[#DEB76A] mx-auto flex items-center justify-center text-[#E8BCB0] shadow-md">
                  {isOrderPending ? (
                    <Clock className="w-8 h-8 text-amber-300 animate-pulse" />
                  ) : (
                    <Lock className="w-8 h-8 text-[#E8BCB0]" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-mystic font-bold text-[#2F171E]">
                    {isOrderPending
                      ? 'Төлбөр баталгаажих хүртэл хөзрүүд түгжээтэй байна'
                      : `${selectedPlan === 'full' ? '7' : '5'} Таро картын дэлгэлт түгжээтэй`}
                  </h4>
                  <p className="text-xs text-[#633C45] max-w-md mx-auto leading-relaxed">
                    {isOrderPending
                      ? 'Админ таны шилжүүлгийг шалгаж баталгаажуулмагц хөзрүүд автоматаар нээгдэж, дэлгэрэнгүй уншлагаа шууд авах боломжтой болно.'
                      : 'Төлбөр шилжүүлж эрх нээсний дараа хөзрүүдийг хольж, өөрийн гараар дэлгэн бүрэн уншлага авах боломжтой.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isOrderPending) {
                        mysticAudio.playChime(639, 1);
                        setOrderUpdateTick((prev) => prev + 1);
                      } else {
                        setCheckoutModalPlan({
                          id: selectedPlan as OrderPlan,
                          name: selectedPlan === 'full' ? 'FULL READING' : 'LOVE READING',
                          price: selectedPlan === 'full' ? '19,900₮' : '9,900₮',
                          amount: selectedPlan === 'full' ? 19900 : 9900,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    {isOrderPending ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Баталгаажилтын төлөв шалгах</span>
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 text-[#E8BCB0]" />
                        <span>Дансаар шилжүүлэх (Эрх нээх)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#9C6E65]/20 text-center">
            {isSelectedPlanUnlocked ? (
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-4 rounded-full bg-gradient-to-r from-[#441E28] via-[#5A2433] to-[#441E28] hover:from-[#381620] hover:to-[#381620] text-white font-serif font-bold text-xs uppercase tracking-widest shadow-2xl transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Картуудын нууцыг тайлж байна...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPlan === 'full'
                        ? '✦ Бүрэн уншлага эхлүүлэх (Full Reading) ✦'
                        : selectedPlan === 'love'
                        ? '✦ Хайрын уншлага эхлүүлэх (Love Reading) ✦'
                        : '✦ Уншлага эхлүүлэх ✦'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isOrderPending) {
                    mysticAudio.playChime(432, 1);
                    setOrderUpdateTick((prev) => prev + 1);
                  } else {
                    setCheckoutModalPlan({
                      id: selectedPlan as OrderPlan,
                      name: selectedPlan === 'full' ? 'FULL READING' : 'LOVE READING',
                      price: selectedPlan === 'full' ? '19,900₮' : '9,900₮',
                      amount: selectedPlan === 'full' ? 19900 : 9900,
                    });
                  }
                }}
                className="px-10 py-4 rounded-full bg-[#4D2630]/75 hover:bg-[#3D1D25] border border-[#DEB76A]/40 text-[#FADBD4] font-serif font-bold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {isOrderPending
                    ? '⏳ Төлбөр шалгагдаж буй тул түгжээтэй (Шалгах)'
                    : '🔒 Төлбөр баталгаажиж эрх нээх хүртэл түгжээтэй'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Checkout Modal embedded directly on ReadingPage for instant access */}
      {checkoutModalPlan && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setCheckoutModalPlan(null)}
          plan={checkoutModalPlan}
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          onOrderSubmitted={() => {
            setOrderUpdateTick((prev) => prev + 1);
          }}
          onNavigateToReading={() => {
            setCheckoutModalPlan(null);
            setOrderUpdateTick((prev) => prev + 1);
          }}
        />
      )}

      {/* ========================================================
          REQUIREMENT 2: LUXURIOUS READING RESULT CONTAINER
          Champagne Pink (#F5D6CE, #E8BCB0) & Deep Midnight Black (#0D060A, #14080F)
          ======================================================== */}
      {parsedReading && (
        <div
          id="reading-result"
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-[#160A12] via-[#0E060A] to-[#070205] border-2 border-[#E8BCB0]/50 p-6 sm:p-12 shadow-[0_24px_80px_rgba(232,188,176,0.18)] space-y-10 animate-fadeIn text-[#FFF5F2]"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8BCB0]/25 pb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8BCB0]/15 border border-[#E8BCB0]/30 text-xs uppercase font-serif tracking-[0.25em] text-[#FADBD4]">
                <span>☾ MYSTIC · {selectedPlan.toUpperCase()} READING ☽</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-mystic font-bold bg-gradient-to-r from-[#FFF5F2] via-[#FADBD4] to-[#E8BCB0] bg-clip-text text-transparent mt-2">
                {selectedPlan === 'full' ? 'Бүрэн Уншлага & Амьдралын Толь' : selectedPlan === 'love' ? 'Хайрын Уншлага & Хосын Эрчим' : 'Үнэгүй 3 Картын Уншлага'}
              </h2>
              <div className="text-xs text-[#E4B5AA] mt-1 font-sans flex flex-wrap items-center gap-2">
                <span>Огноо: {new Date().toLocaleDateString('mn-MN')}</span>
                <span>·</span>
                <span>Салбар: {category}</span>
                <span>·</span>
                <span>Хөзрийн тоо: {cards.length} карт</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl border border-[#E8BCB0]/40 bg-[#1D0C17] text-xs text-[#FADBD4] hover:bg-[#E8BCB0]/20 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FADBD4]" />}
                <span>{copied ? 'Хуулагдлаа' : 'Хуулах'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl border border-[#E8BCB0]/40 bg-[#1D0C17] text-xs text-[#FADBD4] hover:bg-[#E8BCB0]/20 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#FADBD4]" />
                <span>Хэвлэх / PDF</span>
              </button>
            </div>
          </div>

          {/* Reading Summary Strip */}
          <div className="rounded-2xl bg-[#1C0D17]/85 border border-[#E8BCB0]/30 p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between gap-2 text-xs font-serif font-bold text-[#FADBD4] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8BCB0]" />
                <span>Уншлагын Төлөв & Сонгосон Багц</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E8BCB0]/20 text-[#FADBD4] font-sans border border-[#E8BCB0]/30 font-semibold">
                {selectedPlan === 'love' ? 'Love Spread (5 карт)' : selectedPlan === 'full' ? 'Full Spread (7 карт)' : 'Free Spread (3 карт)'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-[#E8BCB0]/15">
              <div>
                <span className="text-[#D1A094] block text-[11px]">Сонирхсон салбар:</span>
                <strong className="text-[#FFF5F2]">{category}</strong>
              </div>
              <div>
                <span className="text-[#D1A094] block text-[11px]">Дэлгэсэн хөзрүүд:</span>
                <strong className="text-[#FADBD4]">{cards.length} карт дэлгэгдсэн</strong>
              </div>
              <div>
                <span className="text-[#D1A094] block text-[11px]">Уншлагын багц:</span>
                <strong className="text-[#FADBD4]">{selectedPlan.toUpperCase()}</strong>
              </div>
            </div>

            {question && (
              <div className="pt-2 border-t border-[#E8BCB0]/15 text-xs">
                <span className="text-[#D1A094]">Таны тавьсан асуулт: </span>
                <em className="text-[#FFF5F2] font-serif">"{question}"</em>
              </div>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-between border-b border-[#E8BCB0]/20 pb-3">
            <span className="text-xs uppercase font-serif tracking-[0.2em] text-[#FADBD4] font-bold">
              Уншлагын Гол 4 Багана (Үр дүн)
            </span>
            <div className="flex items-center gap-1 bg-[#1A0A14] p-1 rounded-xl border border-[#E8BCB0]/30 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('pillars')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'pillars' ? 'bg-[#E8BCB0] text-[#1E0B16] font-bold' : 'text-[#E4B5AA]'
                }`}
              >
                Бүлэгчилсэн карт
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'full' ? 'bg-[#E8BCB0] text-[#1E0B16] font-bold' : 'text-[#E4B5AA]'
                }`}
              >
                Бүтэн эхээр
              </button>
            </div>
          </div>

          {viewMode === 'pillars' ? (
            parsedReading.isLoveDeepDive && parsedReading.loveSections ? (
              /* ========================================================
                 LOVE & RELATIONSHIP DEEP-DIVE 8 SPECIALIZED CARDS
                 ======================================================== */
              <div className="space-y-6">
                {/* Header Tag */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2B1223] via-[#1E0B17] to-[#2B1223] border border-[#E8BCB0]/40 flex items-center justify-between flex-wrap gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 flex items-center justify-center text-[#FADBD4] border border-[#E8BCB0]/30">
                      <Heart className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">
                        Professional Tarot & Psychology Analysis
                      </span>
                      <h4 className="text-sm sm:text-base font-mystic font-bold text-[#FFF5F2]">
                        LOVE & RELATIONSHIP DEEP-DIVE READING
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8BCB0]/20 text-[#FADBD4] border border-[#E8BCB0]/35">
                    8 Үе Шатт Задргаа
                  </span>
                </div>

                {/* 1. Картуудын энергийн ерөнхий дүр зураг */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Sparkles className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Картуудын харилцан холбоо</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        1. Картуудын Энергийн Ерөнхий Дүр Зураг
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.overview}
                  </div>
                </div>

                {/* 2. Сэтгэл зүй ба далд мэдрэмжийн задргаа */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Heart className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Таны болон нөгөө хүний дотоод өнгө аяс & сорилт</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        2. Сэтгэл Зүй ба Далд Мэдрэмжийн Задргаа (Deep Dive)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.deepDive}
                  </div>
                </div>

                {/* 3. Кармик холбоо ба далд шалтгаан */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Compass className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Сүнслэг сургамж & учир шалтгаан</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        3. Кармик Холбоо ба Далд Шалтгаан (Karmic Connection)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.karmic}
                  </div>
                </div>

                {/* 4. Хосын энергийн тэнцвэрт байдал */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Award className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Сэтгэл санаачилга & харилцан өгөөж</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        4. Хосын Энергийн Тэнцвэрт Байдал (Energy Exchange)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.energyExchange}
                  </div>
                </div>

                {/* 5. Сэтгэл хөдлөлийн саад ба айдас */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <ShieldCheck className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Хоёр талын дотоод тээг & эмзэг цэг</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        5. Сэтгэл Хөдлөлийн Саад ба Айдас (Emotional Blocks)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.emotionalBlocks}
                  </div>
                </div>

                {/* 6. Цаг хугацааны чиг баримжаа */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Clock className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">1-3 долоо хоног & 1-3 сар</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        6. Цаг Хугацааны Чиг Баримжаа (Timeline Outlook)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.timeline}
                  </div>
                </div>

                {/* 7. Хамгийн сайнаар болон муугаар эргэх хувилбар */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Zap className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Хамгийн сайн & муу хувилбар</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        7. Хамгийн Сайнаар болон Муугаар Эргэх Хувилбар (Best & Worst Case Scenario)
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.loveSections.scenarios}
                  </div>
                </div>

                {/* 8. Практик зөвлөгөө ба энергийн алхмууд */}
                <div className="rounded-2xl bg-gradient-to-br from-[#291320] via-[#1B0C15] to-[#12060D] border-2 border-[#E8BCB0]/70 p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#E8BCB0] text-[#1E0B16] flex items-center justify-center shadow-md">
                        <Wand2 className="w-5 h-5 text-[#240F19]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-[#FADBD4] font-bold">Хийх алхам & зайлсхийх зүйлс</span>
                        <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3]">
                          8. Практик Зөвлөгөө ба Энергийн Алхмууд (Actionable Advice)
                        </h3>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8BCB0] text-[#1D0A16] shadow-sm">
                      Бодит Алхам
                    </span>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#FFF6F3] whitespace-pre-line font-sans pl-1 pt-2 border-t border-[#E8BCB0]/20">
                    {parsedReading.loveSections.actionableAdvice}
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================
                 STANDARD 4 PILLARS IN CHAMPAGNE PINK & BLACK LUXURY CARDS
                 ======================================================== */
              <div className="space-y-6">
                {/* PILLAR 1 */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Compass className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Суурь нөхцөл & өнгөрсөн</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        {selectedPlan === 'free'
                          ? '1. Өнгөрсөн Суурь & Замнал'
                          : '1. Амьдралын Замнал & Одоогийн Хөдөлгөөн'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.lifeJourney}
                  </div>
                </div>

                {/* PILLAR 2 */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <Award className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Одоогийн байдал & давуу тал</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        {selectedPlan === 'free'
                          ? '2. Одоо Цагийн Нөхцөл & Давуу Тал'
                          : '2. Таны Давуу Тал & Дотоод Нөөц'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.strengths}
                  </div>
                </div>

                {/* PILLAR 3 */}
                <div className="rounded-2xl bg-[#180C14]/90 border border-[#E8BCB0]/35 p-6 sm:p-7 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8BCB0]/20 border border-[#E8BCB0]/40 flex items-center justify-center text-[#FADBD4]">
                      <ShieldCheck className="w-4 h-4 text-[#FADBD4]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#E8BCB0] font-bold">Ирээдүйн чиг & сорилт</span>
                      <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#FFF5F2]">
                        {selectedPlan === 'free'
                          ? '3. Ирээдүйн Чиг Хандлага & Сорилт'
                          : '3. Сорилт & Болгоомжлох Зүйлс'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#F7E7E3] whitespace-pre-line font-sans pl-1 pt-1">
                    {parsedReading.challenges}
                  </div>
                </div>

                {/* PILLAR 4 */}
                <div className="rounded-2xl bg-gradient-to-br from-[#291320] via-[#1B0C15] to-[#12060D] border-2 border-[#E8BCB0]/70 p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#E8BCB0] text-[#1E0B16] flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-[#240F19]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-[#FADBD4] font-bold">Шууд хариулт & картуудын шийдэл</span>
                        <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3]">
                          {selectedPlan === 'free'
                            ? '4. Таны Асуултад Өгөх Бодит Гарц & Зөвлөгөө'
                            : '4. Таны Тавьсан Асуултад Өгөх Хариу'}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8BCB0] text-[#1D0A16] shadow-sm">
                      Гол Гарц
                    </span>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed text-[#FFF6F3] whitespace-pre-line font-sans pl-1 pt-2 border-t border-[#E8BCB0]/20">
                    {parsedReading.answer}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Full Clean Reading view with bold framed subheaders and no raw markdown characters */
            <div className="p-6 sm:p-8 rounded-2xl bg-[#180C14] border border-[#E8BCB0]/30 shadow-lg">
              <FormattedReading content={parsedReading.fullRawText || readingResult || ''} theme="dark" />
            </div>
          )}

          {/* VISUAL CARDS GALLERY IN READING RESULT */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#190C15] border border-[#E8BCB0]/35 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#E8BCB0]" />
                <h4 className="text-xs uppercase font-serif tracking-[0.2em] text-[#FADBD4] font-bold">
                  Таны Уншлагад Буусан Хөзрүүдийн Зурган Толь ({cards.length} Карт)
                </h4>
              </div>
              <span className="text-[11px] text-[#E4B5AA] italic font-serif">
                {selectedPlan.toUpperCase()} SPREAD
              </span>
            </div>

            <div
              className={`grid gap-4 ${
                cards.length <= 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : cards.length <= 5
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
              }`}
            >
              {cards.map((c, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-2xl border border-[#DEB76A]/50 overflow-hidden shadow-xl transition-all select-none group min-h-[360px] sm:min-h-[420px] relative"
                >
                  {/* 100% Full Bleed Large Card Image extending to all edges including bottom */}
                  <div className="absolute inset-0 w-full h-full">
                    <TarotCardFront
                      name={c.card.name}
                      image={c.card.image}
                      number={c.card.number}
                      cardId={c.card.id}
                      keywords={c.card.keywords}
                      isUpright={c.isUpright}
                      element={c.card.element}
                      symbolism={c.card.symbolism}
                      className="w-full h-full rounded-2xl"
                      showOverlayName={false}
                    />
                  </div>

                  {/* Floating Position Pill */}
                  <div className="absolute top-2.5 left-2.5 z-30 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#DEB76A]/50 text-[10px] font-serif font-bold text-[#F5D77F] shadow-sm pointer-events-none">
                    {c.position}
                  </div>

                  {/* Seamless Bottom Label with NO solid frame/box, image extends all the way to bottom edge */}
                  <div className="absolute inset-x-0 bottom-0 z-20 pt-10 pb-3.5 px-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center space-y-0.5 pointer-events-none">
                    <span className="text-xs sm:text-sm text-[#FFF0EC] block font-mystic font-bold leading-snug truncate drop-shadow-md">
                      {c.card.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#E8C582] block font-serif drop-shadow-sm">
                      {c.card.nameEn} · {c.isUpright ? 'Эгц' : 'Урвуу'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affirmation Block */}
          {parsedReading.affirmation && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#291321] via-[#1D0C17] to-[#291321] border border-[#E8BCB0]/40 text-center space-y-2.5 shadow-lg">
              <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#FADBD4] font-bold">
                {parsedReading.isLoveDeepDive
                  ? '✨ Энергийн Affirmation (Батлах үг) ✨'
                  : '🕊 Өдрийн Сэтгэлийн Батламж (Affirmation) 🕊'}
              </span>
              <p className="text-base sm:text-lg font-serif italic text-[#FFF6F3] max-w-2xl mx-auto leading-relaxed">
                {parsedReading.affirmation}
              </p>
            </div>
          )}

          {/* Footer of Reading Result */}
          <div className="pt-6 border-t border-[#E8BCB0]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E4B5AA]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E8BCB0]" />
              <span>Таны хувийн уншлага амжилттай бэлтгэгдэж хадгалагдлаа.</span>
            </div>

            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="text-[#FADBD4] font-bold hover:underline font-serif cursor-pointer flex items-center gap-1"
              >
                <span>Бусад багцуудын мэдээлэл харах</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
