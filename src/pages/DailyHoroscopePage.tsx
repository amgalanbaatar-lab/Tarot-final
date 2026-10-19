import React from 'react';
import { DailyZodiac } from '../components/DailyZodiac';

export const DailyHoroscopePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Single Clean Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mystic font-bold text-[#2A1118]">
          Өнөөдрийн Ордны Зурхай
        </h1>
        <p className="text-xs sm:text-sm text-[#542F38] font-sans font-medium">
          Од эрхсийн өнөөдрийн байрлал таны амьдралд хэрхэн нөлөөлж буйг өөрийн ордоо сонгон уншаарай
        </p>
      </div>

      {/* Main Daily Zodiac Component */}
      <div className="bg-white/90 rounded-3xl border border-[#D4AF37]/40 p-4 sm:p-8 shadow-xl backdrop-blur-md">
        <DailyZodiac />
      </div>
    </div>
  );
};
