import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const { shopEnabled } = useShop();
  return (
    <footer className="w-full bg-[#3D1D25] border-t border-[#8E5244]/35 text-[#EEDCD6] mt-20 sm:mt-28">
      {/* Upper footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-[#E8C582] leading-none drop-shadow-[0_0_8px_rgba(232,197,130,0.5)]">☾</span>
              <span className="text-2xl font-mystic font-bold tracking-[0.3em] gold-text-bright">
                M Y S T I C
              </span>
            </div>
            <p className="text-sm text-[#D8BCB4] max-w-md leading-relaxed font-sans">
              Эртний тоон зурхай (Пифагорын нумерологи) болон Таро хөзрийн гүн ухааныг орчин үеийн ухаалаг системтэй нэгтгэсэн, таны дотоод сэтгэлийг тольдох тансаг орон зай.
            </p>
            <div className="text-xs text-[#E8C582] flex items-center gap-2 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#E8C582]" />
              <span>Таны хувийн мэдээлэл болон уншлага 100% нууцлалтай хадгалагдана.</span>
            </div>
          </div>

          {/* Col 2: Үндсэн Цэсүүд */}
          <div>
            <h4 className="text-xs uppercase font-serif tracking-widest text-[#E8C582] font-semibold mb-4">
              Үндсэн Цэсүүд
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#E0C7BF]">
              <li>
                <button
                  onClick={() => { onSelectTab('daily-horoscope'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  1. Өдрийн зурхай
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectTab('numerology'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  2. Тоон зурхай
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectTab('free'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  3. Таро 3 хөзрийн уншлага
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectTab('love'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  4. Хайр & Харилцааны тайлал (9,900₮)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectTab('vip'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  5. Бүтэн уншлага (19,900₮)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectTab('horoscope'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  6. 12 Ордны шинж
                </button>
              </li>
              {shopEnabled && (
                <li>
                  <button
                    onClick={() => { onSelectTab('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    7. Дэлгүүр
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => { onSelectTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {shopEnabled ? '8.' : '7.'} Хувийн танхим
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Холбоо барих & Мэдээлэл */}
          <div>
            <h4 className="text-xs uppercase font-serif tracking-widest text-[#E8C582] font-semibold mb-4">
              Холбоо барих
            </h4>
            <div className="space-y-2.5 text-sm text-[#D8BCB4]">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E8C582]" />
                <span>support@mystic.mn</span>
              </p>
              <p className="text-xs text-[#C8ABA2] leading-relaxed pt-2">
                Улаанбаатар хот, Монгол Улс<br />
                Даваа - Баасан: 09:00 - 20:00
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Legal & Entertainment Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-[#8E5244]/25">
          <div className="rounded-2xl border border-[#E8C582]/25 bg-[#2C141A] p-5 text-center text-xs text-[#DEC3BB] leading-relaxed max-w-4xl mx-auto shadow-inner">
            <p className="font-semibold text-[#E8C582] mb-1">
              ⚠ Сануулга & Зохиогчийн эрхийн мэдэгдэл
            </p>
            <p>
              Энэхүү уншлага нь зугаа цэнгэл болон өөрийгөө эргэцүүлэх, урам зориг авах зориулалттай. Ирээдүйг шинжлэх ухааны үндэслэлтэйгээр урьдчилан таамаглах баталгаа биш бөгөөд эрүүл мэнд, санхүү, хууль зүйн мэргэжлийн зөвлөгөөг орлохгүй. Аливаа чухал шийдвэрийг та өөрийн ухамсарт эрүүл ухаанаар гаргах үүрэгтэй.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#BA9B92] gap-4">
            <p className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} MYSTIC. Бүх эрх хуулиар хамгаалагдсан.</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white transition-colors cursor-pointer">Нууцлалын бодлого</span>
              <span>·</span>
              <span className="hover:text-white transition-colors cursor-pointer">Үйлчилгээний нөхцөл</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
