import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  BookOpen,
  Flame,
  Gem,
  Calendar,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Crown,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { useShop } from '../context/ShopContext';

export interface ShopItem {
  id: string;
  title: string;
  category: 'physical' | 'digital' | 'consultation';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  description: string;
  features: string[];
  imageUrl: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'tarot_deck_deluxe',
    title: 'Rider-Waite Deluxe Tarot Хөзөр',
    category: 'physical',
    categoryLabel: 'Бодит бүтээгдэхүүн',
    price: 45000,
    originalPrice: 55000,
    badge: 'Шилдэг борлуулалт',
    description: '78 бүрэн Таро хөзөр, алтан шаргал хүрээтэй, зузаан чанартай хайрцаг болон Монгол хэл дээрх дэлгэрэнгүй тайлбар ном дагалдана.',
    features: ['78 бүрэн хөзөр (Major & Minor Arcana)', '350gsm дээд зэргийн ламинацитай цаас', 'Монгол хэл дээрх гарын авлага', 'Хүргэлт үнэгүй (Улаанбаатар хот)'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crystal_candle_set',
    title: 'Сарны Болор & Сарнай Лааны Иж Бүрдэл',
    category: 'physical',
    categoryLabel: 'Бодит бүтээгдэхүүн',
    price: 35000,
    badge: 'Эрчимжүүлсэн',
    description: 'Байгалийн шар буурцгийн лав, сарнайн үнэрт эфирийн тос болон сөрөг энергийг цэвэрлэгч байгалийн ягаан болор бүхий гар хийцийн лаа.',
    features: ['100% байгалийн органик лав', '45+ цаг цэвэр асах хугацаа', 'Байгалийн жинхэнэ болор чулуутай', 'Бясалгал, таро уншлагад зориулсан'],
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'birth_chart_pdf',
    title: 'Mystic Төрсөн Зурхайн Бүрэн Ном (Цахим PDF)',
    category: 'digital',
    categoryLabel: 'Цахим контент',
    price: 15000,
    originalPrice: 25000,
    badge: 'Шууд татах',
    description: 'Өөрийн наран орд, саран орд, өгсөх орд (Ascendant) болон 10 гаргийн нөлөөллийг бие даан тодорхойлж сурах 140 хуудас мэргэжлийн гарын авлага.',
    features: ['140 хуудас бүрэн өнгөт PDF', 'Шууд имэйлээр татах линк очно', 'Бүх 12 ордны гүнзгий тайлал', 'Хэвлэж уншихад бэлэн формат'],
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'chakra_bracelet',
    title: '7 Чакра Байгалийн Эрдэнийн Чулуун Бугуйвч',
    category: 'physical',
    categoryLabel: 'Бодит бүтээгдэхүүн',
    price: 28000,
    description: 'Аметист, номин, оюу, ногоон хас, барын нүд, шар мана, улаан гартаам чулуунуудаас бүтсэн биеийн 7 чакраг тэнцвэржүүлэгч бугуйвч.',
    features: ['Байгалийн 100% жинхэнэ чулуу', 'Уян бат бөх утсан сүлжээ', 'Бүх хэмжээнд таарах загвар', 'Ариутган цэнэглэсэн хайрцагтай'],
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'velvet_tarot_cloth',
    title: 'Таро Уншлагын Хилэн Бүтээлэг (Champagne Rose)',
    category: 'physical',
    categoryLabel: 'Бодит бүтээгдэхүүн',
    price: 32000,
    badge: 'Тансаг чанар',
    description: 'Таро хөзрүүдийн энергийг хамгаалах, цэвэр орчин бүрдүүлэх алтан хүрээтэй, нарийн хатгамал бүхий Champagne Rose хилэн бүтээлэг (65x65см).',
    features: ['65 x 65 см хэмжээтэй', 'Зөөлөн дээд зэргийн хилэн материал', 'Алтан утсан нарийн хатгамалтай', 'Хөзрийн уут дагалдана'],
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'private_consultation',
    title: '1-on-1 Хувийн Таро & Сэтгэл Зүйн Зөвлөгөө',
    category: 'consultation',
    categoryLabel: 'Хувийн зөвлөгөө',
    price: 69000,
    originalPrice: 90000,
    badge: 'Тусгай үйлчилгээ',
    description: 'Мэргэжлийн Таротч, сэтгэл зүйчтэй 45 минутын турш онлайнаар (Google Meet / Утас) шууд холбогдож, амьдралын эргэлтийн асуудлуудаа бүтэн ярилцах үйлчилгээ.',
    features: ['45 минут ганцаарчилсан уулзалт', 'Хязгааргүй асуулт асуух эрхтэй', 'Карт болон тоон зурхайн хосолсон тайлал', 'Уулзалтын дараах хураангуй зөвлөмж илгээнэ'],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
  },
];

interface ShopPageProps {
  onOrderProduct: (item: ShopItem) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onOrderProduct }) => {
  const { shopEnabled, items } = useShop();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'digital' | 'consultation'>('all');

  if (!shopEnabled) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF6F0] border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#8E441D] shadow-md">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2A1118]">
          Дэлгүүрийн хэсэг түр хаалттай байна
        </h1>
        <p className="text-sm text-[#542B34] max-w-md mx-auto leading-relaxed">
          Бараа бүтээгдэхүүний мэдээлэл шинэчлэгдэж байгаа тул та түр хүлээгээд дахин зочилно уу.
        </p>
      </div>
    );
  }

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#230F16]">
          Таро, Зурхай ба Энергийн Бүтээгдэхүүн
        </h1>
        <p className="text-sm sm:text-base text-[#46232D] leading-relaxed font-sans font-medium">
          Тарогийн өндөр чанартай хөзрүүд, байгалийн эрдэнийн чулуу, энергийн лаа, цахим гарын авлага болон мэргэжлийн ганцаарчилсан зөвлөгөөг Хаан, Голомт банкаар захиалаарай.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-lg mx-auto">
        {[
          { id: 'all', label: 'Бүх бүтээгдэхүүн' },
          { id: 'physical', label: 'Бодит бараа (Хүргэлттэй)' },
          { id: 'digital', label: 'Цахим ном & PDF' },
          { id: 'consultation', label: 'Хувийн зөвлөгөө' },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id as any);
                mysticAudio.playChime(528, 1.5);
              }}
              className={`px-4 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#8E441D] text-white border-[#8E441D] shadow-md'
                  : 'bg-white/80 text-[#542B34] border-[#D4AF37]/35 hover:border-[#8E441D]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white border-2 border-[#D4AF37]/40 hover:border-[#8E441D] transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge if present */}
                {item.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#8E441D] text-white text-[10px] font-serif font-bold uppercase tracking-wider shadow-md">
                    {item.badge}
                  </span>
                )}
                {/* Category tag */}
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-medium">
                  {item.categoryLabel}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-mystic font-bold text-[#2A1118] line-clamp-2 group-hover:text-[#8E441D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#542B34] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-1.5 py-2 border-y border-[#D4AF37]/25 text-xs text-[#3D1E25]">
                  {item.features.slice(0, 3).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Price and Action */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#7A4E58] block font-serif">Үнэ:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-mystic font-bold text-[#8E441D]">
                        {item.price.toLocaleString()}₮
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          {item.originalPrice.toLocaleString()}₮
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      mysticAudio.playChime(639, 2);
                      onOrderProduct(item);
                    }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8E441D] to-[#A65427] hover:from-[#783715] hover:to-[#783715] text-white font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Захиалах</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust guarantees bar */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border border-[#D4AF37]/40 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="space-y-1 flex flex-col items-center">
          <Truck className="w-6 h-6 text-[#8E441D] mb-1" />
          <h4 className="text-xs font-serif font-bold uppercase text-[#2A1118]">
            Шуурхай Хүргэлт
          </h4>
          <p className="text-[11px] text-[#5C343E]">
            Улаанбаатар хот дотор 24-48 цагт үүдэнд тань хүргэнэ.
          </p>
        </div>

        <div className="space-y-1 flex flex-col items-center">
          <ShieldCheck className="w-6 h-6 text-[#8E441D] mb-1" />
          <h4 className="text-xs font-serif font-bold uppercase text-[#2A1118]">
            Найдвартай Төлбөр
          </h4>
          <p className="text-[11px] text-[#5C343E]">
            Хаан & Голомт банкны дансаар найдвартай шилжүүлэг.
          </p>
        </div>

        <div className="space-y-1 flex flex-col items-center">
          <Crown className="w-6 h-6 text-[#8E441D] mb-1" />
          <h4 className="text-xs font-serif font-bold uppercase text-[#2A1118]">
            100% Баталгаат Чанар
          </h4>
          <p className="text-[11px] text-[#5C343E]">
            Сүнслэг зорилгоор ариутгаж бэлтгэсэн оригинал бүтээгдэхүүн.
          </p>
        </div>
      </div>
    </div>
  );
};
