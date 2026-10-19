import React, { useState } from 'react';
import { Sparkles, Shield, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { mysticAudio } from '../utils/audio';

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Тоон зурхай (Numerology) ба Tarot хоёр ямар ялгаатай вэ?',
      a: 'Тоон зурхай нь таны төрсөн өдрөөр дамжин таны төрөлхийн зан чанар, амьдралын урт хугацааны зам мөрийг харуулдаг. Харин Таро нь одоогийн мөчид таны сэтгэлд юу болж буйг, ойрын үед ямар боломж, сэрэмжлүүлэг байгааг тодотгож өгдөг. Энэ хоёрыг хамтад нь харснаар хамгийн тодорхой, зөв чиглэлийг олдог.',
    },
    {
      q: 'Уншлага хэр бодитой үнэн байдаг вэ?',
      a: 'Таро болон нумерологи нь ирээдүйг хөдөлшгүй хатуу зааж өгөх шорон биш юм. Та бол өөрийн амьдралыг удирдах чөлөөт хүсэл зоригтой хувь хүн. Эдгээр уншлагууд нь таны өмнө нээгдсэн боломжит гарцууд болон өөрийгөө танин мэдэх сэтгэл зүйн толь болдог.',
    },
    {
      q: 'Миний төрсөн огноо болон асуулт бусдад харагдах уу?',
      a: 'Үгүй. Таны оруулсан бүх мэдээлэл чанд нууцлалтай бөгөөд зөвхөн тухайн уншлагыг үүсгэхэд л түр ашиглагдана. Бид таны хувийн мэдээллийг гуравдагч этгээдэд хэзээ ч зарахгүй, задруулахгүй.',
    },
    {
      q: 'Хайрын уншлага болон Бүрэн шинжилгээний ялгаа юу вэ?',
      a: 'Хайрын уншлага нь хосын харилцааны энергийн тохироо, далд айдас, ойрын харилцаанд төвлөрсөн 5 карттай тусгай сүлжээ юм. Харин Бүрэн шинжилгээ нь карьер, мөнгө санхүү, эрүүл мэнд болон сүнсний зорилгыг 7 картын хүрдээр нарийвчлан гаргаж, PDF тайлан өгдөг цогц уншлага юм.',
    },
    {
      q: 'Champagne Pink болон сарнайн өнгөний учир юу вэ?',
      a: 'Champagne Pink нь сэтгэлийг тайвшруулах зөөлөн хайр, өөрийгөө энхрийлэх гоо зүйн өнгө юм. Бид хар бараан мухар сүсгийн айдсаас ангижирч, өөрийгөө гэрэл гэгээтэй, тансаг орчинд хайрлах боломжийг MYSTIC-ээр дамжуулан хүргэж байна.',
    },
  ];

  const handleToggleFaq = (index: number) => {
    mysticAudio.playChime(528, 1);
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl sm:text-5xl font-mystic font-normal text-[#2F171E]">
          MYSTIC Брэндийн Тухай
        </h1>
        <p className="text-sm sm:text-base text-[#523139] leading-relaxed font-sans">
          Хүний дотоод сэтгэлийн амар амгалан, өөрийгөө хайрлах мэдрэмж болон эртний билэгдлийн гүн ухааныг орчин үеийн тансаг гоо зүйгээр дамжуулан хүргэж байна.
        </p>
      </div>

      {/* 3 Values Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-[#FFF6F3]/90 border border-[#9C6E65]/30 space-y-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F5DFD7] border border-[#8E5244]/40 flex items-center justify-center text-[#8E5244]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-mystic font-bold text-[#2F171E]">
            Эрхэм Зорилго
          </h3>
          <p className="text-xs sm:text-sm text-[#523139] leading-relaxed">
            Хүн бүрийн дотор орших дахин давтагдашгүй энергийн нууцыг нээж, амьдралын чухал шийдвэрүүдэд эерэг, сэтгэл зүйн өндөр соёлтой удирдамж болох.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#FFF6F3]/90 border border-[#9C6E65]/30 space-y-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F5DFD7] border border-[#8E5244]/40 flex items-center justify-center text-[#8E5244]">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-mystic font-bold text-[#2F171E]">
            Ёс Зүйн Зарчим
          </h3>
          <p className="text-xs sm:text-sm text-[#523139] leading-relaxed">
            Бид айдсаар сүрдүүлдэг хар бараан хандлагыг эрс эсэргүүцдэг. Бидний уншлага нь өөртөө итгэх итгэл, хайр, бодит ухаарлыг бэлэглэх цэвэр зарчим дээр бүтээгдсэн.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#FFF6F3]/90 border border-[#9C6E65]/30 space-y-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F5DFD7] border border-[#8E5244]/40 flex items-center justify-center text-[#8E5244]">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-mystic font-bold text-[#2F171E]">
            Тансаг Гоо Зүй
          </h3>
          <p className="text-xs sm:text-sm text-[#523139] leading-relaxed">
            Champagne pink өнгөний намуухан зохицол нь сэтгэлийг тайвшруулж, нууцлаг боловч дотно уур амьсгалыг таны дэлгэцэнд бүрдүүлдэг.
          </p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#FFF6F3]/95 border border-[#9C6E65]/35 space-y-6 shadow-md">
        <div className="text-xs uppercase font-serif tracking-widest text-[#8E5244] font-semibold">
          Мэдлэгийн Хоёр Багана
        </div>
        <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E]">
          Пифагорын Математик ба Райдер-Уэйт Таро
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-[#4A262E] leading-relaxed pt-1">
          <p>
            МЭӨ 6-р зуунд суут сэтгэгч Пифагор "Орчлон ертөнц бол тоон дээр тогтоно" хэмээн тодорхойлсон. Таны төрсөн огноо бол санамсаргүй зүйл биш, харин таны эсийн түвшинд шингэсэн долгионы давтамж юм.
          </p>
          <p>
            Нөгөө талаас Тарогийн 78 карт нь бидний ухамсрын гадна нуугдсан үнэн бодол, мэдрэмжүүдийг өнгө дүрсээр ил гаргаж өгдөг сэтгэл зүйн толь юм.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E]">
            Түгээмэл Асуулт ба Дэлгэрэнгүй Хариулт
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#9C6E65]/25 bg-[#FFF6F3]/90 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => handleToggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white transition-colors"
                >
                  <span className="text-sm font-serif font-bold text-[#2F171E]">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#8E5244] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8E5244] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#523139] leading-relaxed border-t border-[#9C6E65]/15 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
