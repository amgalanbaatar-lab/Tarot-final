import React, { useState } from 'react';
import { Check, Heart, Crown, ArrowRight, ShieldCheck, Sparkles, Building, Clock, Compass } from 'lucide-react';
import { OrderPlan, MysticOrder, getUserOrderStatus } from '../types/order';
import { CheckoutModal } from '../components/CheckoutModal';
import { mysticAudio } from '../utils/audio';
import { useShop } from '../context/ShopContext';

interface PricingPageProps {
  onSelectPlan: (planId: 'free' | 'numerology' | 'love' | 'full') => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  activePlan?: 'numerology' | 'love' | 'full' | null;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectPlan,
  currentUserEmail,
  currentUserName,
  activePlan,
}) => {
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<{
    id: OrderPlan;
    name: string;
    price: string;
    amount: number;
  } | null>(null);

  const { planPrices, formatPrice } = useShop();

  const numerologyStatus = getUserOrderStatus('numerology', currentUserEmail);
  const loveStatus = getUserOrderStatus('love', currentUserEmail);
  const fullStatus = getUserOrderStatus('full', currentUserEmail);

  const getPlanCta = (planId: 'free' | 'numerology' | 'love' | 'full', price: string) => {
    if (planId === 'free') return 'Үнэгүй эхлэх';
    const isFullActive = activePlan === 'full';
    const isPlanActive =
      activePlan === planId || (isFullActive && (planId === 'love' || planId === 'numerology'));
    if (isPlanActive) return '✓ Багц идэвхжсэн (Уншлага үзэх) →';

    const statusInfo =
      planId === 'numerology'
        ? numerologyStatus
        : planId === 'love'
        ? loveStatus
        : fullStatus;
    if (statusInfo.status === 'pending') {
      return `⏳ Төлбөр шалгагдаж байна (Захиалга #${statusInfo.order?.id || ''}) →`;
    }
    return `Дансаар шилжүүлэх (${price}) →`;
  };

  const lovePriceText = formatPrice(planPrices.love);
  const fullPriceText = formatPrice(planPrices.full);

  const plans = [
    {
      id: 'free' as const,
      name: 'FREE READING',
      price: '0₮',
      amount: 0,
      period: 'Үнэгүй уншлага',
      description: 'Эхлэн сонирхогчдод зориулсан суурь тоон зурхай ба 3 картын түргэн уншлага.',
      badge: 'Эхлэл',
      isPopular: false,
      features: [
        'Life Path тоо болон төрөлхийн чанарын товч тайлал',
        'Birthday Number (Төрсөн өдрийн тоо)',
        '2026 оны хувийн жилийн мөчлөг',
        '3 Tarot карт (Өнгөрсөн · Одоо · Ирээдүй)',
        'Энгийн, ойлгомжтой өдрийн зөвлөгөө',
      ],
      cta: getPlanCta('free', '0₮'),
    },
    {
      id: 'love' as const,
      name: 'LOVE READING',
      price: lovePriceText,
      amount: planPrices.love,
      period: 'Нэг удаагийн уншлага',
      description: 'Хайр дурлал, хосын харилцаа, чин сэтгэлийн мэдрэмжийг нарийвчлан шинжлэх тусгай багц.',
      badge: 'Хамгийн эрэлттэй',
      isPopular: true,
      features: [
        '5 Tarot карт (Хайрын нарийвчилсан сүлжээ)',
        'Хосын энергийн зохицол ба үл ойлголцлын шалтгаан',
        'Сэтгэл хөдлөл, далд бодлын тайлал',
        'Сэтгэл зүйн дулаан, яруу зөвлөмж',
        'Хайрын батламж (Affirmation)',
        'Ирээдүйн 3-6 сарын харилцааны боломж',
      ],
      cta: getPlanCta('love', lovePriceText),
    },
    {
      id: 'full' as const,
      name: 'FULL READING',
      price: fullPriceText,
      amount: planPrices.full,
      period: 'Бүтэн уншлага',
      description: 'Ажил мэргэжил, мөнгө санхүү, хайр дурлал, сүнсний даалгаврыг нэгтгэсэн цогц уншлага.',
      badge: 'Бүтэн уншлага',
      isPopular: false,
      features: [
        'Бүрэн нумерологийн шинжилгээ (Бүх тоон кодууд)',
        '7 Tarot карт (Амьдралын хүрд сүлжээ)',
        'Хайр, ажил, мөнгөний нарийвчилсан зөвлөмж',
        '2026 оны бүтэн жилийн сар тутмын чиг хандлага',
        'Хэвлэх & PDF албан ёсны тайлан татах',
        'Асуултдаа шууд тодорхой хариулт авах эрх',
      ],
      cta: getPlanCta('full', fullPriceText),
    },
  ];

  const handleChoosePlan = (plan: typeof plans[0]) => {
    mysticAudio.playChime(528, 2);
    const isPlanUnlocked =
      plan.id === 'free' ||
      activePlan === plan.id ||
      (activePlan === 'full' && (plan.id === 'love' || plan.id === 'full'));

    if (isPlanUnlocked) {
      onSelectPlan(plan.id);
    } else {
      setSelectedPlanForModal({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        amount: plan.amount,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] gold-kicker">
          <span className="text-[#8E441D]">✦</span>
          <span>Ил Тод Үнэ & Дансаар Төлөх</span>
          <span className="text-[#8E441D]">✦</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-mystic font-bold text-[#230F16]">
          Уншлагын Багцууд
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Багцаа сонгон байгууллагын данс руу шилжүүлэг хийснээр админ таны эрхийг шалгаж шуурхай нээнэ.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isUserPlanActive =
            activePlan === plan.id || (activePlan === 'full' && plan.id === 'love');
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-xl ${
                plan.isPopular
                  ? 'border-2 border-[#A8582A] bg-[#FFF5F0] lg:-translate-y-2 shadow-[0_16px_40px_rgba(168,88,42,0.2)]'
                  : 'border border-[#DEB76A]/40 bg-[#FFF6F3]/90 hover:border-[#8C4524]'
              }`}
            >
              {/* Top Badge */}
              <div className="flex justify-between items-center mb-6">
                <span className={`text-[11px] font-sans font-bold uppercase tracking-widest px-3.5 py-1 rounded-full ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-[#441E28] to-[#5F2937] text-[#FFF6EE] border border-[#DEB76A]/40 shadow-sm'
                    : 'bg-[#F2DDD7] text-[#441E28] border border-[#9C6E65]/30'
                }`}>
                  {plan.badge}
                </span>
                {plan.id === 'love' && <Heart className="w-5 h-5 text-[#8E441D]" />}
                {plan.id === 'full' && <Crown className="w-5 h-5 text-[#8E441D]" />}
                {plan.id === 'free' && <Sparkles className="w-5 h-5 text-[#8E441D]" />}
              </div>

              {/* Price Info */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-mystic font-bold text-[#230F16]">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mystic font-bold text-[#7A3222] tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#7A4E58]">/ {plan.period}</span>
                </div>
                <p className="text-xs text-[#46232D] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Features list */}
              <div className="space-y-3 my-6 pt-6 border-t border-[#9C6E65]/20 flex-1">
                <span className="text-xs font-serif uppercase tracking-wider text-[#3D1E25] font-bold block mb-2">
                  Багцад багтсан:
                </span>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3E2129]">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleChoosePlan(plan)}
                className={`w-full py-3.5 px-6 rounded-full font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                  isUserPlanActive
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : plan.isPopular
                    ? 'bg-[#4D2630] hover:bg-[#3D1D25] text-white'
                    : 'border border-[#8E5244] text-[#3D1E25] hover:bg-[#8E5244]/10'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Manual Transfer Information Ribbon */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#FFF6F3]/95 border border-[#9C6E65]/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#9C6E65]/15 pb-2.5">
          <div className="flex items-center gap-2 text-xs text-[#4A262E] font-serif font-bold">
            <Building className="w-4 h-4 text-[#8E5244]" />
            <span>Банкаар шилжүүлэх төлбөрийн заавар</span>
          </div>
          <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
            Баталгаажсан дансууд
          </span>
        </div>

        <p className="text-xs text-[#5C3841] leading-relaxed">
          Та сонгосон багцын төлбөрөө манай <strong>Khaanbank</strong> эсвэл <strong>Golomt bank</strong> данс руу шилжүүлсний дараа <strong>"Төлбөр төлсөн, шалгах"</strong> товчийг дарж шалгуулна. Админ шалгаж баталгаажуулсан даруйд таны эрх "Active" болж шууд нээгдэнэ.
        </p>

        {/* Bank Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Khaanbank */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#9C6E65]/25 space-y-1.5 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <span className="font-serif font-bold text-[#4D2630]">🏦 Khaanbank (Хаан банк)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#DEB76A]/30 text-[#4D2630]">IBAN</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-[#5C3841]">
              <div>IBAN: <strong className="font-mono text-[#2F171E] select-all">74000500 5168987442</strong></div>
              <div>Данс: <strong className="font-mono text-[#2F171E] select-all">5168987442</strong></div>
              <div>Эзэмшигч: <strong className="text-[#2F171E]">Амгаланбаатар Одмаа</strong></div>
            </div>
          </div>

          {/* Golomt bank */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#9C6E65]/25 space-y-1.5 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <span className="font-serif font-bold text-[#4D2630]">🏦 Golomt bank (Голомт банк)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#DEB76A]/30 text-[#4D2630]">IBAN</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-[#5C3841]">
              <div>IBAN: <strong className="font-mono text-[#2F171E] select-all">88001500 1105425539</strong></div>
              <div>Данс: <strong className="font-mono text-[#2F171E] select-all">1105425539</strong></div>
              <div>Эзэмшигч: <strong className="text-[#2F171E]">Ариунзаяа Алтангэрэл</strong></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#9C6E65]/20 text-xs">
          <span className="text-[#7A4E58]">Гүйлгээний утга: <strong className="text-[#3D1E25]">Захиалгын код + Утас</strong></span>
          <span className="text-[#9E6F65] italic">Гүйлгээ шалгагдсаны дараа эрх шуурхай нээгдэнэ</span>
        </div>
      </div>

      {/* Interactive Manual Bank Transfer Checkout Modal */}
      {selectedPlanForModal && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setSelectedPlanForModal(null)}
          plan={selectedPlanForModal}
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          onOrderSubmitted={(order) => {
            console.log('Order submitted:', order);
          }}
          onNavigateToReading={(planId) => {
            setSelectedPlanForModal(null);
            onSelectPlan(planId as any);
          }}
        />
      )}
    </div>
  );
};
