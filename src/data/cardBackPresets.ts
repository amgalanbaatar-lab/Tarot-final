/**
 * Preset luxury Card Back themes for the Tarot deck
 */
export interface CardBackPreset {
  id: string;
  name: string;
  description: string;
  image: string;
  badge?: string;
}

export const CARD_BACK_PRESETS: CardBackPreset[] = [
  {
    id: 'original',
    name: 'Үндсэн Сонгодог (Original)',
    description: 'Champagne Gold хээ, сар болон одот сахиустай тансаг алтан загвар',
    image: '/tarot/card-back.png',
    badge: 'Үндсэн',
  },
  {
    id: 'celestial-night',
    name: 'Од Эрхэс (Celestial Night)',
    description: 'Гүн цэнхэр шөнийн тэнгэр, алтан нар сарны сүлжээ ба оддын орд',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230A111C"/><stop offset="50%" stop-color="%23101E30"/><stop offset="100%" stop-color="%23060B12"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23F3DC9B"/><stop offset="50%" stop-color="%23D4AF37"/><stop offset="100%" stop-color="%23AA7C11"/></linearGradient></defs><rect width="600" height="900" fill="url(%23bg)"/><rect x="25" y="25" width="550" height="850" rx="28" fill="none" stroke="url(%23gold)" stroke-width="3" opacity="0.85"/><rect x="42" y="42" width="516" height="816" rx="20" fill="none" stroke="url(%23gold)" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/><g stroke="url(%23gold)" fill="none" stroke-width="2"><circle cx="300" cy="450" r="180" stroke-width="1.5" opacity="0.75"/><circle cx="300" cy="450" r="140" stroke-width="2"/><circle cx="300" cy="450" r="80" stroke-dasharray="4,4"/><polygon points="300,290 410,450 300,610 190,450" stroke-width="1.5" opacity="0.8"/><polygon points="300,320 390,450 300,580 210,450" stroke-width="1.5" opacity="0.6"/></g><g fill="url(%23gold)"><circle cx="300" cy="450" r="28" opacity="0.3"/><path d="M 300 415 A 35 35 0 0 0 300 485 A 28 28 0 0 1 300 415 Z"/><polygon points="300,380 306,400 325,400 310,412 316,430 300,418 284,430 290,412 275,400 294,400" transform="translate(0, -60)"/><polygon points="300,520 306,540 325,540 310,552 316,570 300,558 284,570 290,552 275,540 294,540" transform="translate(0, 60)"/></g><text x="300" y="110" font-family="Cinzel, serif" font-size="16" fill="%23F3DC9B" letter-spacing="8" text-anchor="middle">✦ M Y S T I C ✦</text><text x="300" y="810" font-family="Cinzel, serif" font-size="14" fill="%23F3DC9B" letter-spacing="6" text-anchor="middle">T A R O T  D E C K</text></svg>',
    badge: 'Шинэ',
  },
  {
    id: 'sacred-mandala',
    name: 'Ариун Мандала (Sacred Gold)',
    description: 'Эртний алхимийн бэлгэдэл, 12 өнцөгт мандала ба геометрийн тэнцвэр',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900"><defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23120E15"/><stop offset="50%" stop-color="%231A1420"/><stop offset="100%" stop-color="%230E0B11"/></linearGradient><linearGradient id="gold2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23FFEBB3"/><stop offset="50%" stop-color="%23DEB76A"/><stop offset="100%" stop-color="%23966F2A"/></linearGradient></defs><rect width="600" height="900" fill="url(%23bg2)"/><rect x="30" y="30" width="540" height="840" rx="24" fill="none" stroke="url(%23gold2)" stroke-width="2.5"/><rect x="46" y="46" width="508" height="808" rx="16" fill="none" stroke="url(%23gold2)" stroke-width="1" opacity="0.5"/><g stroke="url(%23gold2)" fill="none" stroke-width="1.8" opacity="0.85"><circle cx="300" cy="450" r="200"/><circle cx="300" cy="450" r="160" stroke-dasharray="3,3"/><circle cx="300" cy="450" r="120"/><circle cx="300" cy="450" r="70" stroke-width="2"/><g transform="rotate(0 300 450)"><rect x="180" y="330" width="240" height="240" stroke-width="1.2"/></g><g transform="rotate(45 300 450)"><rect x="180" y="330" width="240" height="240" stroke-width="1.2"/></g><g transform="rotate(22.5 300 450)"><rect x="180" y="330" width="240" height="240" stroke-width="0.8" stroke-dasharray="5,5"/></g><g transform="rotate(67.5 300 450)"><rect x="180" y="330" width="240" height="240" stroke-width="0.8" stroke-dasharray="5,5"/></g></g><circle cx="300" cy="450" r="18" fill="url(%23gold2)"/><text x="300" y="115" font-family="Cinzel, serif" font-size="15" fill="%23FFEBB3" letter-spacing="7" text-anchor="middle">✦ SACRED MANDALA ✦</text><text x="300" y="805" font-family="Cinzel, serif" font-size="13" fill="%23FFEBB3" letter-spacing="5" text-anchor="middle">UNIVERSAL HARMONY</text></svg>',
    badge: 'Тансаг',
  },
  {
    id: 'burgundy-rose',
    name: 'Хүрэн Сарнай (Velvet Rose)',
    description: 'Хааны хүрэн өнгө, готик сарнай ба алтан унжлагатай сонгодог загвар',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%232D101A"/><stop offset="50%" stop-color="%233D1624"/><stop offset="100%" stop-color="%231E0A11"/></linearGradient><linearGradient id="roseGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23F7E3DC"/><stop offset="50%" stop-color="%23DEB76A"/><stop offset="100%" stop-color="%23A15942"/></linearGradient></defs><rect width="600" height="900" fill="url(%23bg3)"/><rect x="28" y="28" width="544" height="844" rx="26" fill="none" stroke="url(%23roseGold)" stroke-width="3" opacity="0.85"/><rect x="44" y="44" width="512" height="812" rx="18" fill="none" stroke="url(%23roseGold)" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.6"/><g stroke="url(%23roseGold)" fill="none" stroke-width="2"><circle cx="300" cy="450" r="170"/><circle cx="300" cy="450" r="130" stroke-dasharray="4,4"/><circle cx="300" cy="450" r="85"/></g><g fill="url(%23roseGold)"><path d="M 300 400 C 330 360, 370 390, 370 420 C 370 460, 300 500, 300 510 C 300 500, 230 460, 230 420 C 230 390, 270 360, 300 400 Z" opacity="0.85"/><circle cx="300" cy="450" r="15" fill="%232D101A" stroke="url(%23roseGold)" stroke-width="2"/></g><text x="300" y="112" font-family="Cinzel, serif" font-size="16" fill="%23F7E3DC" letter-spacing="8" text-anchor="middle">✦ MYSTIC ROSE ✦</text><text x="300" y="808" font-family="Cinzel, serif" font-size="13" fill="%23F7E3DC" letter-spacing="6" text-anchor="middle">DEEP INTUITION</text></svg>',
    badge: 'Романтик',
  },
];
