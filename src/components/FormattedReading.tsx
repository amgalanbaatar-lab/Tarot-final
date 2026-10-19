import React from 'react';

interface FormattedReadingProps {
  content: string;
  theme?: 'light' | 'dark';
  className?: string;
  hideMainBanner?: boolean;
}

/**
 * Replaces awkward machine-translated phrases and strips raw markdown characters (#, *, _)
 * so that all reading and numerology texts read in natural, literary Mongolian.
 */
export function normalizeMongolianReadingText(raw: string): string {
  if (!raw) return '';
  return raw
    // Replace awkward machine-translated numerology headers
    .replace(
      /\[?\s*✨?\s*МЭРГЭЖЛИЙН ТОСЛОЛТ БОЛОН ТОМИЛОЛТ:\s*#?(\d+)\s*АМЬДРАЛЫН ЗАМ\s*\]?/gi,
      'Амьдралын замын $1-р тооны дэлгэрэнгүй тайлал'
    )
    .replace(/Мэргэжлийн тослолт болон томилолт/gi, 'Хувь заяаны замнал ба тоон зурхайн тайлал')
    .replace(/Мэргэжлийн тослолт/gi, 'Гүнзгийрүүлсэн тайлал')
    // Replace "#7 Амьдралын зам" or "Амьдралын замнал #7" or "Life Path #7"
    .replace(/#(\d+)\s*Амьдралын зам(нал)?/gi, 'Амьдралын замын $1-р тоо')
    .replace(/Амьдралын зам(нал)?\s*#(\d+)/gi, 'Амьдралын замын $2-р тоо')
    .replace(/Life Path\s*#?(\d+)/gi, 'Амьдралын замын $1-р тоо')
    .replace(/#(\d+)-р хувийн жил/gi, '$1-р хувийн жил')
    .replace(/\(#(\d+)\s*Жил\)/gi, '($1-р жил)')
    .replace(/Тоон зурхай:\s*#(\d+)\s*Зам мөр/gi, 'Тоон зурхай: Амьдралын замын $1-р тоо')
    // Fix common spelling / unnatural words
    .replace(/задргаа/g, 'тайлал')
    .replace(/Задргаа/g, 'Тайлал')
    .replace(/ЗАДРГАА/g, 'ТАЙЛАЛ')
    // Remove bracketed English/redundant banners
    .replace(/^\s*\[LOVE & RELATIONSHIP DEEP-DIVE READING\]\s*$/gim, '')
    .replace(/^\s*\[👑\s*VIP ULTIMATE READING[^\]]*\]\s*$/gim, '')
    .replace(/^\s*\[FREE 3-CARD READING\]\s*$/gim, '')
    // Clean English parenthetical tags in section headers
    .replace(/\s*\(Deep Dive\)/gi, '')
    .replace(/\s*\(Karmic Connection\)/gi, '')
    .replace(/\s*\(Energy Exchange\)/gi, '')
    .replace(/\s*\(Emotional Blocks\)/gi, '')
    .replace(/\s*\(Timeline Outlook\)/gi, '')
    .replace(/\s*\(Best & Worst Case Scenario\)/gi, '')
    .replace(/\s*\(Actionable Advice\)/gi, '')
    .replace(/\s*\(Career & Profession\)/gi, '')
    .replace(/\s*\(Wealth & Abundance\)/gi, '')
    .replace(/\s*\(Personal Growth & Spirituality\)/gi, '')
    .replace(/\s*\(Health & Well-being\)/gi, '')
    .replace(/\s*\(Decision Making & Crossroads\)/gi, '')
    .replace(/\s*\(Hidden Talents & Opportunities\)/gi, '')
    .replace(/\s*\(Custom Q&A\)/gi, '')
    .replace(/Энергийн Affirmation \(Батлах үг\)/gi, 'Сэтгэлийн батламж үг')
    .replace(/VIP Энергийн Affirmation \(Батлах үг\)/gi, 'Эрч хүчний батламж үг')
    .replace(/VIP\s+Зөвлөмж/gi, 'Тусгай зөвлөмж')
    .replace(/VIP\s+Тайлал/gi, 'Амьдралын Гүнзгийрүүлсэн Тайлал')
    .replace(/VIP\s+Уншлага/gi, 'Бүтэн уншлага')
    .replace(/\bVIP\b/gi, 'Бүтэн уншлага')
    .replace(/\s*\(Affirmation\)/gi, '')
    // Remove stray hash symbols before numbers like #7 -> 7
    .replace(/#(\d+)/g, '$1');
}

/**
 * Strips all markdown characters (#, *, _, `, ~) from plain text snippets.
 */
export function cleanMarkdownSymbols(raw: string): string {
  if (!raw) return '';
  return normalizeMongolianReadingText(raw)
    .replace(/[#*_`~\[\]]+/g, '')
    .replace(/━+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const cleanMarkdownText = cleanMarkdownSymbols;

// Helper to clean markdown artifacts like #, *, _, and brackets from titles
export function cleanHeaderTitle(raw: string): string {
  if (!raw) return '';
  return normalizeMongolianReadingText(raw)
    .replace(/[#*_`~\[\]━]+/g, '')
    .replace(/^[\s\-–—•✦:]+|[\s\-–—]+$/g, '')
    .trim();
}

export const FormattedReading: React.FC<FormattedReadingProps> = ({
  content,
  className = '',
  hideMainBanner = true,
}) => {
  if (!content) return null;

  const normalizedContent = normalizeMongolianReadingText(content);
  const lines = normalizedContent.split('\n');

  // Helper to format inline bold without raw markdown asterisks, hashes, or underscores
  const formatInlineText = (text: string): React.ReactNode => {
    // Strip stray hashes, backticks, tildes, brackets
    const cleaned = text.replace(/[#`~\[\]]+/g, '');

    // Match **bold** or __bold__ segments
    const parts = cleaned.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, index) => {
      if (
        (part.startsWith('**') && part.endsWith('**')) ||
        (part.startsWith('__') && part.endsWith('__'))
      ) {
        const inner = part.slice(2, -2).replace(/[#*_]+/g, '').trim();
        if (!inner) return null;
        return (
          <strong
            key={index}
            className="font-bold text-[#7A3516]"
          >
            {inner}
          </strong>
        );
      }
      // Strip any isolated single asterisks or underscores
      const plain = part.replace(/[*_]+/g, '');
      return <span key={index}>{plain}</span>;
    });
  };

  return (
    <div
      className={`space-y-4 font-sans leading-relaxed text-[#2F171E] ${className}`}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Skip empty or divider-only lines
        if (!trimmed || /^━+$/.test(trimmed) || /^[-=_*]{3,}$/.test(trimmed)) {
          return null;
        }

        // Main Title / Big Header (e.g., # Title, [Banner], etc.)
        const isMainBanner =
          trimmed.startsWith('# ') ||
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          trimmed.startsWith('👑') ||
          /^✦.*✦$/.test(trimmed) ||
          /^Амьдралын замын \d+-р тооны дэлгэрэнгүй тайлал$/i.test(trimmed);

        if (isMainBanner) {
          const title = cleanHeaderTitle(trimmed);
          if (!title) return null;
          // If the parent container already renders a section title, skip top-level duplicate banner
          if (hideMainBanner && idx <= 2 && !/^[0-9]+\./.test(title)) {
            return null;
          }
          return (
            <div
              key={idx}
              className="py-3 px-4 rounded-xl border-2 border-[#C59B27]/55 bg-gradient-to-r from-[#FFF7EC] via-[#FFFDF9] to-[#FFF7EC] font-mystic font-bold text-base sm:text-lg my-4 flex items-center gap-2.5 text-[#2A1118] shadow-sm"
            >
              <span className="text-[#B8860B] text-sm shrink-0">✦</span>
              <span className="font-bold">{title}</span>
            </div>
          );
        }

        // Subheader (e.g. ##, ###, or "1. Картуудын...", "🔮 ...", "🕊 ...", "✨ ...", or short standalone colon-ended heading)
        const isSubheader =
          trimmed.startsWith('## ') ||
          trimmed.startsWith('### ') ||
          trimmed.startsWith('#### ') ||
          /^[0-9]+\.\s+[^\n]+$/.test(trimmed) ||
          /^(?:🔮|🕊|✨|💖|💼|🌊|⚡|🌟|🌙|☀️|🔑|🧭)\s+[^\n]+:?$/.test(trimmed) ||
          (trimmed.endsWith(':') && trimmed.length <= 75 && !trimmed.includes('. '));

        if (isSubheader) {
          const title = cleanHeaderTitle(trimmed);
          if (!title) return null;
          return (
            <div
              key={idx}
              className="py-2.5 px-4 rounded-xl border-2 border-[#C59B27]/50 bg-gradient-to-r from-[#FAF1E4] via-[#FFFDF9] to-[#FAF1E4] font-mystic font-bold text-base sm:text-lg mt-5 mb-2.5 text-[#2A1118] shadow-sm flex items-center gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#B8860B] shrink-0" />
              <span className="font-bold tracking-wide">{title}</span>
            </div>
          );
        }

        // Bullet point (e.g. * or - or •)
        const isBullet =
          trimmed.startsWith('* ') ||
          trimmed.startsWith('- ') ||
          trimmed.startsWith('• ') ||
          trimmed.startsWith('✦ ');

        if (isBullet) {
          const bulletText = trimmed.replace(/^[\*\-\•\✦]\s+/, '').trim();
          if (!bulletText) return null;
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 sm:pl-3 my-1.5">
              <span className="text-xs mt-1 shrink-0 text-[#8E441D] font-bold">
                ✦
              </span>
              <div className="flex-1 text-sm sm:text-base text-[#2F171E]">
                {formatInlineText(bulletText)}
              </div>
            </div>
          );
        }

        // Regular paragraph with inline bold support & cleaned syntax
        return (
          <p key={idx} className="text-sm sm:text-base leading-relaxed pl-0.5 text-[#2F171E]">
            {formatInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
