import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';

// 600 x 1050 tarot card proportion
const width = 600;
const height = 1050;

const sectors = [
  { color: '#F1B929', opacity: 0.92 }, // 0: Top bright yellow
  { color: '#D47E8C', opacity: 0.85 }, // 1: Rose pink
  { color: '#4B735B', opacity: 0.88 }, // 2: Forest green
  { color: '#E59247', opacity: 0.88 }, // 3: Warm orange
  { color: '#A6B894', opacity: 0.82 }, // 4: Sage
  { color: '#576F8E', opacity: 0.88 }, // 5: Slate blue
  { color: '#D9735F', opacity: 0.88 }, // 6: Terracotta
  { color: '#BA4336', opacity: 0.92 }, // 7: Red
  { color: '#E8A33A', opacity: 0.88 }, // 8: Gold
  { color: '#68869E', opacity: 0.82 }, // 9: Blue grey
  { color: '#D68595', opacity: 0.85 }, // 10: Pink
  { color: '#4B735B', opacity: 0.88 }, // 11: Green
  { color: '#DE5646', opacity: 0.92 }, // 12: Coral red bottom
  { color: '#DF85A1', opacity: 0.85 }, // 13: Lavender pink
  { color: '#E89C3A', opacity: 0.88 }, // 14: Ochre
  { color: '#97AA85', opacity: 0.82 }, // 15: Sage green
  { color: '#5C7694', opacity: 0.88 }, // 16: Slate blue
  { color: '#DE5240', opacity: 0.92 }, // 17: Red
  { color: '#EAA93C', opacity: 0.88 }, // 18: Amber yellow
  { color: '#749280', opacity: 0.82 }, // 19: Pale green
  { color: '#DE7360', opacity: 0.88 }, // 20: Orange red
  { color: '#476E57', opacity: 0.88 }, // 21: Forest green
];

const count = sectors.length;
const r = 218;
const innerR = 58;

let sectorsMarkup = '';
for (let i = 0; i < count; i++) {
  const a1 = (i / count) * 2 * Math.PI - Math.PI / 2;
  const a2 = ((i + 0.88) / count) * 2 * Math.PI - Math.PI / 2;

  const x1 = Math.cos(a1) * r;
  const y1 = Math.sin(a1) * r;
  const x2 = Math.cos(a2) * r;
  const y2 = Math.sin(a2) * r;

  const ix1 = Math.cos(a1) * innerR;
  const iy1 = Math.sin(a1) * innerR;
  const ix2 = Math.cos(a2) * innerR;
  const iy2 = Math.sin(a2) * innerR;

  const d = `M ${ix1.toFixed(1)} ${iy1.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR} ${innerR} 0 0 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`;
  sectorsMarkup += `<path d="${d}" fill="${sectors[i].color}" fill-opacity="${sectors[i].opacity}" stroke="#40372D" stroke-width="1.4" stroke-linejoin="round" filter="url(#sketchy)"/>\n`;
}

let rivets = '';
const numRivets = 32;
for (let i = 0; i < numRivets; i++) {
  const angle = (i / numRivets) * 2 * Math.PI;
  const x = Math.cos(angle) * 228;
  const y = Math.sin(angle) * 228;
  rivets += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#2E3330" stroke="#8B958E" stroke-width="0.8"/>\n`;

  if (i % 2 === 0) {
    const px1 = Math.cos(angle) * 235;
    const py1 = Math.sin(angle) * 235;
    const px2 = Math.cos(angle + 0.04) * 252;
    const py2 = Math.sin(angle + 0.04) * 252;
    const px3 = Math.cos(angle + 0.08) * 256;
    const py3 = Math.sin(angle + 0.08) * 256;
    rivets += `<path d="M ${px1.toFixed(1)} ${py1.toFixed(1)} Q ${px2.toFixed(1)} ${py2.toFixed(1)} ${px3.toFixed(1)} ${py3.toFixed(1)}" stroke="#423B33" stroke-width="1.8" fill="none" stroke-linecap="round"/>\n`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="paperGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FCFAF3"/>
      <stop offset="65%" stop-color="#F7F3E7"/>
      <stop offset="100%" stop-color="#EFE8D6"/>
    </radialGradient>

    <linearGradient id="metalRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A948C"/>
      <stop offset="35%" stop-color="#A3ADA5"/>
      <stop offset="70%" stop-color="#717B73"/>
      <stop offset="100%" stop-color="#555D57"/>
    </linearGradient>

    <radialGradient id="brassHub" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#D1D691"/>
      <stop offset="50%" stop-color="#A4AE61"/>
      <stop offset="85%" stop-color="#788241"/>
      <stop offset="100%" stop-color="#58602E"/>
    </radialGradient>

    <linearGradient id="woodPillar" x1="0%" y1="0%" x2="100%" y2="10%">
      <stop offset="0%" stop-color="#755E50"/>
      <stop offset="40%" stop-color="#5C473C"/>
      <stop offset="70%" stop-color="#42322A"/>
      <stop offset="100%" stop-color="#655043"/>
    </linearGradient>

    <filter id="sketchy" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#paperGlow)"/>
  <rect width="${width}" height="${height}" fill="none" stroke="#D8CEB8" stroke-width="1.5" stroke-opacity="0.6"/>

  <g transform="translate(300, 52)" stroke="#4A443A" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M -18 10 C -12 10, -10 6, -8 0 C -6 -12, 6 -12, 8 0 C 10 6, 12 10, 18 10" />
    <path d="M -2 -14 C -1 -17, 1 -17, 2 -14" />
  </g>

  <g id="wheel" transform="translate(300, 420)">
    ${sectorsMarkup}

    <!-- 1. Monkey/beast on left rim -->
    <g transform="translate(-155, -60) scale(0.95)" stroke="#3D291F" stroke-width="1.4" fill="#9C5845" stroke-linecap="round">
      <ellipse cx="0" cy="0" rx="16" ry="12" transform="rotate(20)"/>
      <circle cx="-16" cy="-8" r="8" fill="#B06B56"/>
      <path d="M -18 -16 Q -28 -28 -34 -24" fill="none"/>
      <path d="M -12 -14 Q -22 -2 -30 2" fill="none"/>
      <path d="M 10 6 Q 22 18 28 26" fill="none"/>
      <path d="M 14 -2 Q 26 6 32 4" fill="none"/>
      <path d="M 16 -8 Q 30 -24 38 -14" fill="none" stroke-width="1.8"/>
    </g>

    <!-- 2. Leaping creature at 2 o'clock -->
    <g transform="translate(100, -115) rotate(45) scale(0.85)" stroke="#3D2A1C" stroke-width="1.3" fill="#D97F3E">
      <ellipse cx="0" cy="0" rx="14" ry="8"/>
      <circle cx="-12" cy="-5" r="6" fill="#E39356"/>
      <path d="M 12 0 Q 24 8 30 16" fill="none" stroke-width="1.6"/>
      <path d="M -8 -8 Q -16 -18 -22 -14" fill="none"/>
      <path d="M 4 6 Q 10 18 16 22" fill="none"/>
    </g>

    <!-- 3. Acrobatic hanging creature at 1 o'clock -->
    <g transform="translate(35, -145) rotate(15) scale(0.8)" stroke="#403B35" stroke-width="1.2" fill="#E5E0D5">
      <ellipse cx="0" cy="0" rx="16" ry="9"/>
      <circle cx="-14" cy="-6" r="5"/>
      <path d="M -12 -10 L -20 -22" fill="none"/>
      <path d="M 8 6 L 18 22" fill="none"/>
      <path d="M 12 -4 L 24 6" fill="none"/>
    </g>

    <!-- 4. Green climber at 3 o'clock -->
    <g transform="translate(170, -20) rotate(10) scale(0.85)" stroke="#2D3D2B" stroke-width="1.3" fill="#5E7A5A">
      <ellipse cx="0" cy="0" rx="13" ry="8"/>
      <circle cx="-12" cy="-4" r="6" fill="#759470"/>
      <path d="M -10 -10 Q -22 -16 -28 -12" fill="none"/>
      <path d="M 10 4 Q 24 12 30 18" fill="none"/>
    </g>

    <!-- 5. Pink figure at 8 o'clock -->
    <g transform="translate(-150, 50) rotate(-25) scale(0.85)" stroke="#422933" stroke-width="1.3" fill="#E092A2">
      <path d="M -12 -10 Q 0 0 12 -4 Q 18 10 6 18 Q -8 14 -12 -10 Z"/>
      <circle cx="-14" cy="-14" r="6"/>
      <path d="M 8 16 Q 16 30 24 34" fill="none"/>
      <path d="M -10 14 Q -16 26 -22 28" fill="none"/>
    </g>

    <!-- 6. Acrobat at 5 o'clock hanging from red spoke -->
    <g transform="translate(125, 95) rotate(55) scale(0.85)" stroke="#47382B" stroke-width="1.3" fill="#D9904E">
      <ellipse cx="0" cy="0" rx="14" ry="8"/>
      <circle cx="-12" cy="-4" r="5"/>
      <path d="M 10 4 L 22 20" fill="none" stroke-width="1.6"/>
      <path d="M 14 -2 L 26 12" fill="none" stroke-width="1.6"/>
    </g>

    <!-- 7. Bird/winged creature at 6 o'clock bottom -->
    <g transform="translate(20, 150) scale(0.85)" stroke="#383025" stroke-width="1.2" fill="#947F65">
      <ellipse cx="0" cy="0" rx="12" ry="8"/>
      <path d="M -4 -8 L -14 -20 L -2 -14 Z" fill="#B09C82"/>
      <path d="M 4 -8 L 14 -20 L 2 -14 Z" fill="#B09C82"/>
      <circle cx="-8" cy="4" r="4"/>
    </g>

    <circle cx="0" cy="0" r="228" fill="none" stroke="url(#metalRim)" stroke-width="14" filter="url(#sketchy)"/>
    <circle cx="0" cy="0" r="235" fill="none" stroke="#383D39" stroke-width="2"/>
    <circle cx="0" cy="0" r="221" fill="none" stroke="#383D39" stroke-width="2"/>

    ${rivets}

    <!-- SPHINX / BLUE CHIMERA AT TOP -->
    <g transform="translate(0, -238) scale(0.95)" stroke="#263B47" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -4 4 Q -12 -10 -8 -22 Q -4 -28 2 -26" fill="none" stroke-width="2"/>
      <path d="M -10 12 C -12 2, -10 -8, -6 -14 C 6 -14, 10 2, 10 12 Z" fill="#5A8AA6"/>
      <path d="M -4 -16 L -2 -24 L 2 -24 L 4 -16" fill="#76A6C4"/>
      <path d="M -8 -8 C -18 -12, -20 2, -10 4 Z" fill="#6E9CB8"/>
      <path d="M 8 -8 C 18 -12, 20 2, 10 4 Z" fill="#6E9CB8"/>
      <circle cx="-2" cy="-6" r="1.2" fill="#1B2930"/>
      <circle cx="2" cy="-6" r="1.2" fill="#1B2930"/>
    </g>

    <!-- BRASS CENTER HUB -->
    <circle cx="0" cy="0" r="58" fill="url(#brassHub)" stroke="#3D421F" stroke-width="2.5" filter="url(#sketchy)"/>
    <circle cx="0" cy="0" r="52" fill="none" stroke="#8B9445" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="0" cy="0" r="32" fill="#9AA454" stroke="#383D1B" stroke-width="2"/>
    <circle cx="0" cy="0" r="18" fill="#BFC878" stroke="#2B3014" stroke-width="2"/>
    <circle cx="0" cy="0" r="6" fill="#22260F"/>

    <!-- Handles -->
    <g stroke="#38342C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -14 -8 L -42 -22" stroke="#C4CCC6" stroke-width="6"/>
      <path d="M -14 -8 L -42 -22" stroke="#363A37" stroke-width="1.5" fill="none"/>
      <rect x="-54" y="-32" width="14" height="8" rx="4" transform="rotate(35 -47 -28)" fill="#C2382D" stroke="#4A1713" stroke-width="1.5"/>

      <path d="M 14 8 L 42 24" stroke="#C4CCC6" stroke-width="6"/>
      <path d="M 14 8 L 42 24" stroke="#363A37" stroke-width="1.5" fill="none"/>
      <rect x="40" y="20" width="14" height="8" rx="4" transform="rotate(35 47 24)" fill="#C2382D" stroke="#4A1713" stroke-width="1.5"/>
    </g>
  </g>

  <!-- WOODEN POST / TREE TRUNK STAND -->
  <g id="treePillar" stroke="#382920" stroke-width="1.8" stroke-linejoin="round">
    <path d="M 284 635 C 282 680, 275 740, 268 790 C 262 825, 250 850, 230 870 L 370 870 C 350 850, 336 825, 330 790 C 324 740, 318 680, 316 635 Z" fill="url(#woodPillar)" filter="url(#sketchy)"/>
    <path d="M 292 650 C 290 710, 286 770, 280 840" fill="none" stroke="#261B14" stroke-width="1.6"/>
    <path d="M 306 650 C 308 720, 312 780, 318 840" fill="none" stroke="#261B14" stroke-width="1.6"/>
    <ellipse cx="300" cy="740" rx="6" ry="12" fill="#2B1E17" stroke="#1C130D" stroke-width="1.2"/>

    <path d="M 268 790 C 255 815, 235 845, 215 865 C 225 870, 245 870, 258 870 C 270 855, 278 830, 284 810 Z" fill="#5A453A"/>
    <path d="M 330 790 C 342 815, 360 845, 385 865 C 375 870, 355 870, 342 870 C 330 855, 322 830, 318 810 Z" fill="#5A453A"/>

    <g transform="translate(300, 815) scale(0.9)" fill="#6B5447" stroke="#2A1D16" stroke-width="1.4">
      <path d="M -24 35 C -30 10, -20 -15, -8 -20 C 4 -12, 10 -25, 20 -15 C 28 0, 24 35, 18 45 L -20 45 Z"/>
      <path d="M -18 10 Q -32 25 -38 45" fill="none" stroke-width="2"/>
      <path d="M 14 12 Q 28 25 36 45" fill="none" stroke-width="2"/>
      <circle cx="-6" cy="-5" r="2" fill="#1A120D"/>
      <circle cx="8" cy="-5" r="2" fill="#1A120D"/>
    </g>
  </g>

  <!-- GROUND MOUND -->
  <g id="ground" stroke="#3D3326" stroke-width="1.5" stroke-linejoin="round">
    <path d="M 55 910 C 140 860, 280 850, 480 870 C 530 875, 550 895, 560 920 C 500 935, 350 940, 100 930 Z" fill="#D9C9B2" fill-opacity="0.75" filter="url(#sketchy)"/>
    <path d="M 85 915 C 180 875, 310 865, 460 880 C 490 885, 510 898, 520 915 Z" fill="#BEAB92" fill-opacity="0.85"/>

    <path d="M 120 920 Q 130 905 135 915" fill="none" stroke="#5C4D38" stroke-width="1.4"/>
    <path d="M 200 915 Q 212 900 220 918" fill="none" stroke="#5C4D38" stroke-width="1.4"/>
    <path d="M 420 918 Q 428 902 438 915" fill="none" stroke="#5C4D38" stroke-width="1.4"/>
    <path d="M 470 922 Q 482 910 490 922" fill="none" stroke="#5C4D38" stroke-width="1.4"/>
  </g>

  <!-- 1. FIGURE 1 (LEFT): Girl in blue dress with straw hat waving arm -->
  <g id="girlBlue" transform="translate(125, 755)" stroke="#2B2824" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 35 Q 2 10 -16 -8 Q -28 -20 -38 -28" fill="none" stroke-width="1.8"/>
    <path d="M -38 -28 L -44 -36" fill="none" stroke-width="1.4"/>
    <path d="M -38 -28 L -46 -30" fill="none" stroke-width="1.4"/>
    <path d="M -38 -28 L -42 -22" fill="none" stroke-width="1.4"/>

    <path d="M 36 38 Q 44 58 48 70" fill="none" stroke-width="1.8"/>
    <path d="M 48 70 L 52 76" fill="none" stroke-width="1.4"/>

    <path d="M 20 100 L 18 135" fill="none" stroke-width="2.2" stroke="#2B2824"/>
    <ellipse cx="15" cy="138" rx="7" ry="4" fill="#1B1D1F" stroke="#111"/>

    <path d="M 32 100 L 36 135" fill="none" stroke-width="2.2" stroke="#2B2824"/>
    <ellipse cx="38" cy="138" rx="7" ry="4" fill="#1B1D1F" stroke="#111"/>

    <path d="M 18 32 C 14 55, 6 85, 2 100 L 52 100 C 46 85, 38 55, 34 32 Z" fill="#466B91" stroke="#1F344A" stroke-width="1.6" filter="url(#sketchy)"/>
    <path d="M 20 30 Q 26 36 32 30" fill="#F2EFEB" stroke="#2B2824" stroke-width="1.2"/>

    <circle cx="26" cy="18" r="12" fill="#F4E2D2" stroke="#3D2F27" stroke-width="1.4"/>
    <ellipse cx="22" cy="18" rx="1.5" ry="2" fill="#1C1713"/>
    <ellipse cx="30" cy="18" rx="1.5" ry="2" fill="#1C1713"/>
    <path d="M 24 24 Q 26 26 28 24" fill="none" stroke="#A34538" stroke-width="1.2"/>

    <path d="M 10 10 C 14 2, 38 2, 42 10 C 46 14, 6 14, 10 10 Z" fill="#E5CCA0" stroke="#4A3D28" stroke-width="1.4"/>
    <path d="M -2 14 C 10 10, 42 10, 54 14" fill="none" stroke="#4A3D28" stroke-width="2"/>
  </g>

  <!-- 2. FIGURE 2 (MID-LEFT): Girl with flying blonde hair in green tunic with basket -->
  <g id="girlGreen" transform="translate(210, 750)" stroke="#2B2824" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 18 80 L 10 125 L 4 128" fill="none" stroke-width="2.2" stroke="#26231E"/>
    <path d="M 28 80 L 38 122 L 46 125" fill="none" stroke-width="2.2" stroke="#26231E"/>

    <path d="M 16 32 C 12 50, 8 70, 6 82 L 38 82 C 34 70, 30 50, 26 32 Z" fill="#536B50" stroke="#233821" stroke-width="1.6" filter="url(#sketchy)"/>

    <path d="M 14 36 Q -6 48 -24 50" fill="none" stroke-width="1.8"/>
    <rect x="-46" y="42" width="22" height="20" rx="5" fill="#CDB491" stroke="#423220" stroke-width="1.4"/>
    <path d="M -46 52 L -24 52" stroke="#423220" stroke-width="1"/>
    <path d="M -35 42 L -35 34 Q -30 30 -25 34 L -25 42" fill="none" stroke="#423220" stroke-width="1.4"/>

    <path d="M 26 36 Q 42 22 56 12" fill="none" stroke-width="1.8"/>
    <path d="M 56 12 L 62 8" fill="none" stroke-width="1.4"/>
    <path d="M 56 12 L 64 14" fill="none" stroke-width="1.4"/>

    <circle cx="22" cy="18" r="11" fill="#F4E2D2" stroke="#3D2F27" stroke-width="1.4"/>
    <circle cx="26" cy="17" r="1.5" fill="#1C1713"/>
    <path d="M 25 23 Q 28 24 30 22" fill="none" stroke="#A34538" stroke-width="1.2"/>

    <path d="M 18 10 C 14 -4, -4 -16, -20 -18 C -14 -4, 4 -2, 12 8 Z" fill="#DFBB65" stroke="#4D3F1B" stroke-width="1.4"/>
    <path d="M 22 8 C 24 -12, 6 -24, -12 -28 C -6 -18, 12 -12, 18 6 Z" fill="#F0CE7A" stroke="#4D3F1B" stroke-width="1.2"/>
  </g>

  <!-- 3. FIGURE 3 (RIGHT): Cleric/Scholar in salmon-pink gown with pendulum & crucifix -->
  <g id="scholarPink" transform="translate(400, 755)" stroke="#2B2824" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 26 95 L 26 130 L 32 133" fill="none" stroke-width="2.2" stroke="#2B2824"/>
    <path d="M 40 95 L 42 130 L 48 133" fill="none" stroke-width="2.2" stroke="#2B2824"/>

    <path d="M 24 32 C 18 55, 12 80, 8 98 L 58 98 C 54 80, 46 55, 42 32 Z" fill="#CD6473" stroke="#421A21" stroke-width="1.6" filter="url(#sketchy)"/>
    <path d="M 32 34 L 32 96" stroke="#8F3A47" stroke-width="1.4" fill="none"/>

    <circle cx="33" cy="32" r="6" fill="#FAF7F2" stroke="#3D2F27" stroke-width="1.2"/>

    <path d="M 22 36 Q 4 28 -12 24" fill="none" stroke-width="1.8"/>
    <circle cx="-14" cy="23" r="2.5" fill="#F4E2D2"/>
    <path d="M -14 25 L -14 65" stroke="#40372D" stroke-width="1" fill="none"/>
    <circle cx="-14" cy="66" r="4" fill="#E5B55E" stroke="#423214" stroke-width="1.2"/>
    <path d="M -18 66 L -10 66" stroke="#423214" stroke-width="1"/>

    <circle cx="34" cy="18" r="13" fill="#F4E2D2" stroke="#3D2F27" stroke-width="1.4"/>
    <circle cx="28" cy="16" r="3.5" fill="#FFF" stroke="#1C1713" stroke-width="1.2"/>
    <circle cx="28" cy="16" r="1.8" fill="#1C1713"/>
    <ellipse cx="32" cy="24" rx="2.5" ry="2" fill="#A34538"/>

    <g transform="translate(34, 2)" stroke="#D4A73F" stroke-width="2" stroke-linecap="round">
      <line x1="0" y1="-14" x2="0" y2="0"/>
      <line x1="-5" y1="-9" x2="5" y2="-9"/>
    </g>
  </g>

  <!-- 4. FIGURE 4 (FAR RIGHT): Companion with ear/horns in hooded brown robe -->
  <g id="companionRight" transform="translate(460, 785)" stroke="#261F1A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 14 70 L 14 100" stroke-width="2" fill="none"/>
    <path d="M 24 70 L 26 100" stroke-width="2" fill="none"/>

    <path d="M 12 25 C 8 45, 4 62, 2 72 L 34 72 C 32 62, 28 45, 24 25 Z" fill="#9C5248" stroke="#381C18" stroke-width="1.4" filter="url(#sketchy)"/>

    <circle cx="18" cy="15" r="9" fill="#E8C6AF" stroke="#382418" stroke-width="1.3"/>
    <path d="M 10 10 L 4 -4 L 14 4 Z" fill="#9C5248" stroke="#382418" stroke-width="1.2"/>
    <path d="M 24 10 L 32 -4 L 22 4 Z" fill="#9C5248" stroke="#382418" stroke-width="1.2"/>
    <circle cx="16" cy="15" r="1.2" fill="#1A120D"/>
  </g>

  <!-- Bottom Elegant Title Ribbon -->
  <g transform="translate(300, 995)" text-anchor="middle">
    <line x1="-180" y1="-20" x2="180" y2="-20" stroke="#9E8F7A" stroke-width="1" stroke-opacity="0.6"/>
    <circle cx="0" cy="-20" r="3" fill="#9E8F7A"/>
    <circle cx="-180" cy="-20" r="2" fill="#9E8F7A"/>
    <circle cx="180" cy="-20" r="2" fill="#9E8F7A"/>

    <text y="8" font-family="'Cinzel', 'Playfair Display', serif" font-size="20" font-weight="700" letter-spacing="6" fill="#2E261E">
      X · WHEEL OF FORTUNE
    </text>
    <text y="28" font-family="'Montserrat', sans-serif" font-size="11" font-weight="500" letter-spacing="2" fill="#7A6A58">
      ХУВЬ ЗАЯАНЫ ХҮРД
    </text>
  </g>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 600 }
});
const pngData = resvg.render().asPng();

fs.writeFileSync('public/tarot/wheel-of-fortune.png', pngData);
console.log('Successfully written public/tarot/wheel-of-fortune.png, size:', pngData.length);

if (fs.existsSync('dist/tarot')) {
  fs.writeFileSync('dist/tarot/wheel-of-fortune.png', pngData);
  console.log('Successfully updated dist/tarot/wheel-of-fortune.png');
}
