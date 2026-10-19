import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure public directories exist
const customTarotDir = path.resolve(__dirname, 'public', 'custom-tarot');
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(customTarotDir)) {
  fs.mkdirSync(customTarotDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve uploaded custom tarot images
app.use('/custom-tarot', express.static(customTarotDir));

const CUSTOM_CARDS_FILE = path.resolve(dataDir, 'custom_cards.json');

function loadCustomCards(): Record<string, string> {
  try {
    if (fs.existsSync(CUSTOM_CARDS_FILE)) {
      const content = fs.readFileSync(CUSTOM_CARDS_FILE, 'utf8');
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error('Error reading custom_cards.json:', err);
  }
  return {};
}

function saveCustomCards(data: Record<string, string>) {
  try {
    fs.writeFileSync(CUSTOM_CARDS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving custom_cards.json:', err);
  }
}

// Persistent Shop Configuration & Items
const SHOP_CONFIG_FILE = path.resolve(dataDir, 'shop_config.json');

export interface ServerShopItem {
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

export interface ServerPlanPrices {
  numerology: number;
  love: number;
  full: number;
}

export const DEFAULT_PLAN_PRICES: ServerPlanPrices = {
  numerology: 9900,
  love: 9900,
  full: 19900,
};

export interface ServerSiteBackground {
  type: 'color' | 'image' | 'video';
  color: string;
  imageUrl: string;
  videoUrl: string;
  overlayOpacity: number;
  overlayColor: string;
  showNebulaClouds: boolean;
  headerGlassEnabled: boolean;
  headerGlassBlur: number;
  headerGlassOpacity: number;
  headerGlassBorderOpacity: number;
}

export const DEFAULT_SITE_BACKGROUND: ServerSiteBackground = {
  type: 'color',
  color: '#DAB3AA',
  imageUrl: '',
  videoUrl: '',
  overlayOpacity: 20,
  overlayColor: '#DAB3AA',
  showNebulaClouds: true,
  headerGlassEnabled: true,
  headerGlassBlur: 18,
  headerGlassOpacity: 28,
  headerGlassBorderOpacity: 35,
};

export interface ServerMenuOrderItem {
  id: string;
  label: string;
  enabled: boolean;
}

export const DEFAULT_MENU_ORDER: ServerMenuOrderItem[] = [
  { id: 'daily-horoscope', label: 'Өдрийн зурхай', enabled: true },
  { id: 'numerology', label: 'Тоон зурхай', enabled: true },
  { id: 'free', label: 'Таро уншлага', enabled: true },
  { id: 'love', label: 'Хайр & Харилцаа', enabled: true },
  { id: 'vip', label: 'Бүтэн уншлага', enabled: true },
  { id: 'horoscope', label: 'Ордны шинж', enabled: true },
  { id: 'shop', label: 'Дэлгүүр', enabled: true },
  { id: 'profile', label: 'Профайл', enabled: true },
];

export interface ServerShopConfig {
  shopEnabled: boolean;
  items: ServerShopItem[];
  planPrices: ServerPlanPrices;
  siteBackground: ServerSiteBackground;
  menuOrder: ServerMenuOrderItem[];
}

const DEFAULT_SHOP_ITEMS: ServerShopItem[] = [
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

function loadShopConfig(): ServerShopConfig {
  try {
    if (fs.existsSync(SHOP_CONFIG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SHOP_CONFIG_FILE, 'utf8'));
      const rawPrices = parsed.planPrices || {};
      const rawBg = parsed.siteBackground || {};
      return {
        shopEnabled: typeof parsed.shopEnabled === 'boolean' ? parsed.shopEnabled : true,
        items: Array.isArray(parsed.items) ? parsed.items : DEFAULT_SHOP_ITEMS,
        planPrices: {
          numerology: Number(rawPrices.numerology) > 0 ? Number(rawPrices.numerology) : DEFAULT_PLAN_PRICES.numerology,
          love: Number(rawPrices.love) > 0 ? Number(rawPrices.love) : DEFAULT_PLAN_PRICES.love,
          full: Number(rawPrices.full) > 0 ? Number(rawPrices.full) : DEFAULT_PLAN_PRICES.full,
        },
        siteBackground: {
          type: rawBg.type === 'image' || rawBg.type === 'video' ? rawBg.type : 'color',
          color: typeof rawBg.color === 'string' && rawBg.color ? rawBg.color : DEFAULT_SITE_BACKGROUND.color,
          imageUrl: typeof rawBg.imageUrl === 'string' ? rawBg.imageUrl : DEFAULT_SITE_BACKGROUND.imageUrl,
          videoUrl: typeof rawBg.videoUrl === 'string' ? rawBg.videoUrl : DEFAULT_SITE_BACKGROUND.videoUrl,
          overlayOpacity: typeof rawBg.overlayOpacity === 'number' ? rawBg.overlayOpacity : DEFAULT_SITE_BACKGROUND.overlayOpacity,
          overlayColor: typeof rawBg.overlayColor === 'string' && rawBg.overlayColor ? rawBg.overlayColor : DEFAULT_SITE_BACKGROUND.overlayColor,
          showNebulaClouds: typeof rawBg.showNebulaClouds === 'boolean' ? rawBg.showNebulaClouds : DEFAULT_SITE_BACKGROUND.showNebulaClouds,
          headerGlassEnabled: typeof rawBg.headerGlassEnabled === 'boolean' ? rawBg.headerGlassEnabled : DEFAULT_SITE_BACKGROUND.headerGlassEnabled,
          headerGlassBlur: typeof rawBg.headerGlassBlur === 'number' && !isNaN(rawBg.headerGlassBlur) ? Math.max(0, Math.min(60, rawBg.headerGlassBlur)) : DEFAULT_SITE_BACKGROUND.headerGlassBlur,
          headerGlassOpacity: typeof rawBg.headerGlassOpacity === 'number' && !isNaN(rawBg.headerGlassOpacity) ? Math.max(0, Math.min(95, rawBg.headerGlassOpacity)) : DEFAULT_SITE_BACKGROUND.headerGlassOpacity,
          headerGlassBorderOpacity: typeof rawBg.headerGlassBorderOpacity === 'number' && !isNaN(rawBg.headerGlassBorderOpacity) ? Math.max(0, Math.min(95, rawBg.headerGlassBorderOpacity)) : DEFAULT_SITE_BACKGROUND.headerGlassBorderOpacity,
        },
        menuOrder: Array.isArray(parsed.menuOrder) && parsed.menuOrder.length > 0 ? parsed.menuOrder : DEFAULT_MENU_ORDER,
      };
    }
  } catch (err) {
    console.error('Error reading shop_config.json:', err);
  }
  return {
    shopEnabled: true,
    items: DEFAULT_SHOP_ITEMS,
    planPrices: { ...DEFAULT_PLAN_PRICES },
    siteBackground: { ...DEFAULT_SITE_BACKGROUND },
    menuOrder: [...DEFAULT_MENU_ORDER],
  };
}

function saveShopConfig(config: ServerShopConfig) {
  try {
    fs.writeFileSync(SHOP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving shop_config.json:', err);
  }
}

// Custom Tarot Cards API (Admin Protected for modifications)
const ADMIN_API_TOKEN = 'mystic2026';

function isAuthorizedAdmin(req: Request): boolean {
  const token = req.headers['x-admin-token'] || req.body?.adminToken;
  return token === ADMIN_API_TOKEN || token === 'admin8888' || token === 'mystic';
}

app.get('/api/custom-cards', (_req: Request, res: Response) => {
  const cards = loadCustomCards();
  res.json({ success: true, customCards: cards });
});

app.post('/api/custom-cards', async (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хөзрийн зураг өөрчлөх эрхтэй.' });
    }

    const { cardId, imageData } = req.body;
    if (cardId === undefined || !imageData) {
      return res.status(400).json({ error: 'cardId and imageData are required' });
    }

    const cards = loadCustomCards();
    let savedUrl = '';

    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      // Decode base64 image and save as file
      const matches = imageData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+xml', '');
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `card_${cardId}_${Date.now()}.${ext === 'svg' ? 'svg' : 'png'}`;
        const filePath = path.resolve(customTarotDir, fileName);

        // Remove old file for this card if existed
        const oldUrl = cards[String(cardId)];
        if (oldUrl && oldUrl.startsWith('/custom-tarot/')) {
          const oldFileName = oldUrl.split('?')[0].replace('/custom-tarot/', '');
          const oldFilePath = path.resolve(customTarotDir, oldFileName);
          if (fs.existsSync(oldFilePath)) {
            try { fs.unlinkSync(oldFilePath); } catch {}
          }
        }

        fs.writeFileSync(filePath, buffer);
        savedUrl = `/custom-tarot/${fileName}?v=${Date.now()}`;

        // Also update /tarot/card-back.png if this is the card back
        if (String(cardId) === 'back' || String(cardId) === 'card-back') {
          const publicCardBack = path.resolve(__dirname, 'public', 'tarot', 'card-back.png');
          try {
            fs.writeFileSync(publicCardBack, buffer);
          } catch (e) {
            console.warn('Could not overwrite public/tarot/card-back.png:', e);
          }
        }
      } else {
        savedUrl = imageData;
      }
    } else {
      savedUrl = String(imageData);
    }

    cards[String(cardId)] = savedUrl;
    if (String(cardId) === 'back') cards['card-back'] = savedUrl;
    if (String(cardId) === 'card-back') cards['back'] = savedUrl;
    saveCustomCards(cards);

    res.json({ success: true, cardId, imageUrl: savedUrl, customCards: cards });
  } catch (err: any) {
    console.error('Error in POST /api/custom-cards:', err);
    res.status(500).json({ error: 'Failed to save card image' });
  }
});

app.delete('/api/custom-cards/:cardId', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хөзрийн зураг өөрчлөх эрхтэй.' });
    }
    const cardId = req.params.cardId;
    const cards = loadCustomCards();
    if (cards[cardId]) {
      const oldUrl = cards[cardId];
      if (oldUrl && oldUrl.startsWith('/custom-tarot/')) {
        const oldFileName = oldUrl.split('?')[0].replace('/custom-tarot/', '');
        const oldFilePath = path.resolve(customTarotDir, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          try { fs.unlinkSync(oldFilePath); } catch {}
        }
      }
      delete cards[cardId];
      if (cardId === 'back') delete cards['card-back'];
      if (cardId === 'card-back') delete cards['back'];

      // Restore default card-back.png if back was deleted
      if (cardId === 'back' || cardId === 'card-back') {
        const defaultCardBack = path.resolve(__dirname, 'public', 'tarot', 'card-back-default.png');
        const targetCardBack = path.resolve(__dirname, 'public', 'tarot', 'card-back.png');
        if (fs.existsSync(defaultCardBack)) {
          try { fs.copyFileSync(defaultCardBack, targetCardBack); } catch {}
        }
      }

      saveCustomCards(cards);
    }
    res.json({ success: true, customCards: cards });
  } catch (err: any) {
    console.error('Error in DELETE /api/custom-cards/:cardId:', err);
    res.status(500).json({ error: 'Failed to delete card image' });
  }
});

app.delete('/api/custom-cards', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хөзрийн зураг өөрчлөх эрхтэй.' });
    }
    // Clear directory
    const files = fs.readdirSync(customTarotDir);
    for (const f of files) {
      try {
        fs.unlinkSync(path.resolve(customTarotDir, f));
      } catch {}
    }

    // Restore default card-back.png
    const defaultCardBack = path.resolve(__dirname, 'public', 'tarot', 'card-back-default.png');
    const targetCardBack = path.resolve(__dirname, 'public', 'tarot', 'card-back.png');
    if (fs.existsSync(defaultCardBack)) {
      try { fs.copyFileSync(defaultCardBack, targetCardBack); } catch {}
    }

    saveCustomCards({});
    res.json({ success: true, customCards: {} });
  } catch (err: any) {
    console.error('Error in DELETE /api/custom-cards:', err);
    res.status(500).json({ error: 'Failed to reset all card images' });
  }
});

// Shop, Pricing & Site Background API Endpoints
app.get('/api/shop', (_req: Request, res: Response) => {
  const cfg = loadShopConfig();
  res.json({
    success: true,
    shopEnabled: cfg.shopEnabled,
    items: cfg.items,
    planPrices: cfg.planPrices,
    siteBackground: cfg.siteBackground,
  });
});

app.get('/api/site-background', (_req: Request, res: Response) => {
  const cfg = loadShopConfig();
  res.json({ success: true, siteBackground: cfg.siteBackground });
});

app.post('/api/site-background', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ сайтын дэвсгэрийг өөрчлөх эрхтэй.' });
    }
    const cfg = loadShopConfig();
    const incoming = req.body?.siteBackground || req.body || {};

    let finalImageUrl = typeof incoming.imageUrl === 'string' ? incoming.imageUrl : cfg.siteBackground.imageUrl;
    let finalVideoUrl = typeof incoming.videoUrl === 'string' ? incoming.videoUrl : cfg.siteBackground.videoUrl;

    // Save uploaded base64 background image to disk
    if (typeof finalImageUrl === 'string' && finalImageUrl.startsWith('data:image/')) {
      const matches = finalImageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+xml', '');
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `site_bg_${Date.now()}.${ext === 'svg' ? 'svg' : ext === 'webp' ? 'webp' : 'jpg'}`;
        const filePath = path.resolve(customTarotDir, fileName);
        fs.writeFileSync(filePath, buffer);
        finalImageUrl = `/custom-tarot/${fileName}?v=${Date.now()}`;
      }
    }

    // Save uploaded base64 background video to disk
    if (typeof finalVideoUrl === 'string' && finalVideoUrl.startsWith('data:video/')) {
      const matches = finalVideoUrl.match(/^data:video\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const rawExt = matches[1].toLowerCase();
        const ext = rawExt.includes('webm') ? 'webm' : rawExt.includes('ogg') ? 'ogv' : 'mp4';
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `site_video_${Date.now()}.${ext}`;
        const filePath = path.resolve(customTarotDir, fileName);
        fs.writeFileSync(filePath, buffer);
        finalVideoUrl = `/custom-tarot/${fileName}?v=${Date.now()}`;
      }
    }

    cfg.siteBackground = {
      type: incoming.type === 'image' || incoming.type === 'video' ? incoming.type : 'color',
      color: typeof incoming.color === 'string' && incoming.color ? incoming.color : cfg.siteBackground.color,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      overlayOpacity:
        typeof incoming.overlayOpacity === 'number'
          ? Math.max(0, Math.min(90, incoming.overlayOpacity))
          : cfg.siteBackground.overlayOpacity,
      overlayColor:
        typeof incoming.overlayColor === 'string' && incoming.overlayColor
          ? incoming.overlayColor
          : cfg.siteBackground.overlayColor,
      showNebulaClouds:
        typeof incoming.showNebulaClouds === 'boolean'
          ? incoming.showNebulaClouds
          : cfg.siteBackground.showNebulaClouds,
      headerGlassEnabled:
        typeof incoming.headerGlassEnabled === 'boolean'
          ? incoming.headerGlassEnabled
          : cfg.siteBackground.headerGlassEnabled,
      headerGlassBlur:
        typeof incoming.headerGlassBlur === 'number' && !isNaN(incoming.headerGlassBlur)
          ? Math.max(0, Math.min(60, incoming.headerGlassBlur))
          : cfg.siteBackground.headerGlassBlur,
      headerGlassOpacity:
        typeof incoming.headerGlassOpacity === 'number' && !isNaN(incoming.headerGlassOpacity)
          ? Math.max(0, Math.min(95, incoming.headerGlassOpacity))
          : cfg.siteBackground.headerGlassOpacity,
      headerGlassBorderOpacity:
        typeof incoming.headerGlassBorderOpacity === 'number' && !isNaN(incoming.headerGlassBorderOpacity)
          ? Math.max(0, Math.min(95, incoming.headerGlassBorderOpacity))
          : cfg.siteBackground.headerGlassBorderOpacity,
    };

    saveShopConfig(cfg);
    res.json({ success: true, siteBackground: cfg.siteBackground });
  } catch (err: any) {
    console.error('Error in POST /api/site-background:', err);
    res.status(500).json({ error: 'Failed to update site background' });
  }
});

app.get('/api/menu-order', (_req: Request, res: Response) => {
  const cfg = loadShopConfig();
  res.json({ success: true, menuOrder: cfg.menuOrder || DEFAULT_MENU_ORDER });
});

app.post('/api/menu-order', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хуудасны дарааллыг өөрчлөх эрхтэй.' });
    }
    const cfg = loadShopConfig();
    const incoming = req.body?.menuOrder;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ error: 'menuOrder must be a non-empty array' });
    }
    cfg.menuOrder = incoming.map((item: any) => ({
      id: String(item.id || '').trim(),
      label: String(item.label || '').trim(),
      enabled: item.enabled !== false,
    })).filter((i: any) => i.id);
    saveShopConfig(cfg);
    res.json({ success: true, menuOrder: cfg.menuOrder });
  } catch (err: any) {
    console.error('Error in POST /api/menu-order:', err);
    res.status(500).json({ error: 'Failed to update menu order' });
  }
});

app.get('/api/pricing', (_req: Request, res: Response) => {
  const cfg = loadShopConfig();
  res.json({ success: true, planPrices: cfg.planPrices });
});

app.post('/api/pricing', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ төлбөрийн үнийг өөрчлөх эрхтэй.' });
    }
    const cfg = loadShopConfig();
    const incoming = req.body?.planPrices || req.body || {};
    cfg.planPrices = {
      numerology: Number(incoming.numerology) >= 0 ? Number(incoming.numerology) : cfg.planPrices.numerology,
      love: Number(incoming.love) >= 0 ? Number(incoming.love) : cfg.planPrices.love,
      full: Number(incoming.full) >= 0 ? Number(incoming.full) : cfg.planPrices.full,
    };
    saveShopConfig(cfg);
    res.json({ success: true, planPrices: cfg.planPrices });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update plan prices' });
  }
});

app.post('/api/shop/toggle', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ дэлгүүрийн төлөв өөрчлөх эрхтэй.' });
    }
    const cfg = loadShopConfig();
    const nextEnabled = typeof req.body?.shopEnabled === 'boolean' ? req.body.shopEnabled : !cfg.shopEnabled;
    cfg.shopEnabled = nextEnabled;
    saveShopConfig(cfg);
    res.json({ success: true, shopEnabled: cfg.shopEnabled, items: cfg.items, planPrices: cfg.planPrices });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle shop status' });
  }
});

app.post('/api/shop/items', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ бараа нэмэх болон засах эрхтэй.' });
    }
    const item = req.body?.item;
    if (!item || !item.title) {
      return res.status(400).json({ error: 'Барааны мэдээлэл дутуу байна.' });
    }

    const cfg = loadShopConfig();
    const itemId = item.id || `item_${Date.now()}`;
    let finalImageUrl = item.imageUrl || '';

    // Support base64 image upload for shop products
    if (typeof finalImageUrl === 'string' && finalImageUrl.startsWith('data:image/')) {
      const matches = finalImageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+xml', '');
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `shop_${itemId}_${Date.now()}.${ext === 'svg' ? 'svg' : 'png'}`;
        const filePath = path.resolve(customTarotDir, fileName);
        fs.writeFileSync(filePath, buffer);
        finalImageUrl = `/custom-tarot/${fileName}?v=${Date.now()}`;
      }
    }

    const categoryMap: Record<string, string> = {
      physical: 'Бодит бүтээгдэхүүн',
      digital: 'Цахим контент',
      consultation: 'Хувийн зөвлөгөө',
    };
    const cat = (item.category as 'physical' | 'digital' | 'consultation') || 'physical';

    const normalizedItem: ServerShopItem = {
      id: itemId,
      title: String(item.title).trim(),
      category: cat,
      categoryLabel: item.categoryLabel || categoryMap[cat] || 'Бодит бүтээгдэхүүн',
      price: Number(item.price) || 0,
      originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
      badge: item.badge ? String(item.badge).trim() : undefined,
      description: String(item.description || '').trim(),
      features: Array.isArray(item.features)
        ? item.features.map((f: any) => String(f).trim()).filter(Boolean)
        : [],
      imageUrl:
        finalImageUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    };

    const existingIdx = cfg.items.findIndex((i) => i.id === itemId);
    if (existingIdx >= 0) {
      cfg.items[existingIdx] = normalizedItem;
    } else {
      cfg.items.unshift(normalizedItem);
    }

    saveShopConfig(cfg);
    res.json({ success: true, item: normalizedItem, shopEnabled: cfg.shopEnabled, items: cfg.items });
  } catch (err: any) {
    console.error('Error in POST /api/shop/items:', err);
    res.status(500).json({ error: 'Failed to save shop item' });
  }
});

app.delete('/api/shop/items/:id', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ бараа устгах эрхтэй.' });
    }
    const id = req.params.id;
    const cfg = loadShopConfig();
    cfg.items = cfg.items.filter((i) => i.id !== id);
    saveShopConfig(cfg);
    res.json({ success: true, shopEnabled: cfg.shopEnabled, items: cfg.items });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete shop item' });
  }
});

// Server-side Gemini initialization if key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory cache for daily zodiac by date and sign to prevent burning quota
const dailyZodiacCache = new Map<string, any>();

// Helper to clean markdown characters (#, *, _) and awkward machine-translated phrases from AI text
function sanitizeAiMongolianText(raw: string): string {
  return raw
    .replace(
      /\[?\s*✨?\s*МЭРГЭЖЛИЙН ТОСЛОЛТ БОЛОН ТОМИЛОЛТ:\s*#?(\d+)\s*АМЬДРАЛЫН ЗАМ\s*\]?/gi,
      ''
    )
    .replace(/#(\d+)\s*Амьдралын зам(нал)?/gi, 'Амьдралын замын $1-р тоо')
    .replace(/Амьдралын зам(нал)?\s*#(\d+)/gi, 'Амьдралын замын $2-р тоо')
    .replace(/Life Path\s*#?(\d+)/gi, 'Амьдралын замын $1-р тоо')
    .replace(/задргаа/g, 'тайлал')
    .replace(/Задргаа/g, 'Тайлал')
    .replace(/^\s*\[LOVE & RELATIONSHIP DEEP-DIVE READING\]\s*$/gim, '')
    .replace(/^\s*\[👑\s*VIP ULTIMATE READING[^\]]*\]\s*$/gim, '')
    .replace(/^\s*\[FREE 3-CARD READING\]\s*$/gim, '')
    .replace(/#(\d+)/g, '$1')
    .replace(/^[#\s]+/gm, '')
    .replace(/[*_`~]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Helper to call Gemini with graceful fallback between models and clean quota handling
async function callGeminiText(
  systemInstruction: string,
  userPrompt: string,
  responseMimeType?: string
): Promise<string | null> {
  if (!ai) return null;

  // Try flash-lite first as it has lower latency and separate quota pool, then flash
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.75,
          ...(responseMimeType ? { responseMimeType } : {}),
        },
      });

      const text = response.text?.trim();
      if (text) {
        return responseMimeType === 'application/json' ? text : sanitizeAiMongolianText(text);
      }
    } catch (err: any) {
      const isQuotaExceeded =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.message?.includes('429') ||
        err?.message?.includes('Quota exceeded') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaExceeded) {
        console.info(`[Gemini] Quota limit reached on model ${model}, attempting alternative or local synthesis.`);
        continue;
      } else {
        console.info(`[Gemini] Notice on model ${model}:`, err?.message || 'Generation skipped');
      }
    }
  }

  return null;
}

// API endpoint for personalized Mystic reading
app.post('/api/reading', async (req: Request, res: Response) => {
  try {
    const {
      name,
      birthDate,
      birthTime,
      birthPlace,
      question,
      vipCustomQuestion,
      category,
      numerology,
      tarotCards,
      plan = 'free',
    } = req.body;

    const cardsSummary = Array.isArray(tarotCards)
      ? tarotCards.map((c: any) => `• ${c.position}: ${c.name} (${c.upright ? 'Шулуун' : 'Эргэсэн'}) - ${c.meaning}`).join('\n')
      : 'Таро карт сонгоогүй';

    const isLoveReading =
      plan === 'love' ||
      category === 'love' ||
      category === 'Хайр дурлал' ||
      /хайр|хос|харилцаа|гэрлэлт|хайрт|дурлал/i.test(question || '');

    let systemPrompt: string;
    let userPrompt: string;

    if (isLoveReading) {
      systemPrompt = `Та бол мэргэжлийн Таро тайлагч болон хосын сэтгэл зүйн зөвлөх юм. Хэрэглэгчийн татсан хөзрүүд болон тэдний асуултад үндэслэн хайр дурлал, сэтгэлийн холбооны гүнзгийрүүлсэн, уянгалаг, урам зориг өгөхүйц тайлбарыг цэвэр, яруу монгол хэлээр бичиж өгнө.

ТАВИГДАХ ШААРДЛАГА:
1. Текст болон гарчиг дотор #, *, _ зэрэг markdown тэмдэгтүүд болон англи үг хэллэг огт ашиглахгүй. Машин орчуулга шиг үг хэрэглэлгүй, байгалийн зөв, уянгалаг монгол хэлээр найруулна.
2. Нөхцөлтэй ("Хэрэв гэрлэсэн бол..." гэх мэт) байдлаар таамаглаж бичихгүй. Картуудын илэрхийлж буй сэтгэл зүйн өнгө аяс, харилцан уялдааг мэргэжлийн түвшинд тайлбарлана.
3. Хариулт нь ямар нэгэн ерөнхий гарчиггүйгээр шууд дараах 8 хэсгийн дагуу цэгцтэй гарна:

1. Картуудын энергийн ерөнхий дүр зураг:
- (Татсан хөзрүүд хоорондоо хэрхэн уялдаж, ямар ерөнхий уур амьсгал үүсгэж байгааг дүгнэх)

2. Сэтгэл зүй ба далд мэдрэмжийн тайлал:
- Таны болон нөгөө хүний дотоод өнгө аяс:
- Харилцаанд тулгарч буй далд сорилт:

3. Хувь заяаны холбоо ба далд учир шалтгаан:
- (Энэ харилцааны сүнслэг сургамж, бие биедээ өгөх ухаарал)

4. Хосын сэтгэлийн тэнцвэрт байдал:
- (Харилцан халамж, сэтгэлийн өгөөж ба тэнцвэрийг хэрхэн хадгалах тухай)

5. Сэтгэл хөдлөлийн саад ба болгоомжлол:
- Таны тал дээр:
- Нөгөө хүний тал дээр:

6. Цаг хугацааны чиг баримжаа:
- Ойрын 1-3 долоо хоногт:
- Ирэх 1-3 сарын хугацаанд:

7. Хамгийн сайнаар болон муугаар эргэх хувилбар:
- Хамгийн таатай өөрчлөлт:
- Анхаарвал зохих эрсдэл:

8. Бодит зөвлөгөө ба хийх алхмууд:
- Юуг эрхэмлэх хэрэгтэй вэ?:
- Юунаас зайлсхийх ёстой вэ?:

✨ Сэтгэлийн батламж үг:
- (Тухайн уншлагыг дүгнэсэн сэтгэл сэргээх уянгалаг өгүүлбэр)`;

      userPrompt = `Оролтод өгөгдөх мэдээлэл:
- Хэрэглэгчийн татсан хөзрүүд:
${cardsSummary}
- Хэрэглэгчийн асуулт: ${question?.trim() || 'Бидний харилцааны сэтгэл зүйн төлөв, далд уялдаа болон ирээдүйн чиг хандлага'}
${name ? `- Хэрэглэгчийн нэр: ${name}` : ''}`;
    } else if (plan === 'full' || plan === 'vip' || category === 'vip') {
      systemPrompt = `Та бол мэргэжлийн Таро тайлагч, сэтгэл зүйн зөвлөх болон амьдралын чиглүүлэгч юм. Хэрэглэгчийн татсан 3 хөзөр, тэдний ерөнхий болон тусгай асуултад үндэслэн амьдралын бүхий л чухал салбарыг хамарсан цогц, гүнзгийрүүлсэн, урам зориг өгөхүйц тайлбарыг цэвэр, уянгалаг монгол хэлээр бичиж өгнө.

ТАВИГДАХ ШААРДЛАГА:
1. Текст болон гарчиг дотор #, *, _ зэрэг markdown тэмдэгтүүд болон англи үг хэллэг огт ашиглахгүй. Машин орчуулга шиг эвгүй үгс хэрэглэлгүй, байгалийн зөв, яруу монгол хэлээр бичнэ.
2. Нөхцөлтэй ("Хэрэв та гэрлэсэн бол..." гэх мэт) байдлаар таамаглаж бичихгүй. Хөзрүүдийн илэрхийлж буй утга санаа, сэтгэл зүйн уялдааг мэргэжлийн түвшинд тайлбарлана.
3. Хариулт нь ямар нэгэн ерөнхий гарчиггүйгээр шууд доорх 8 хэсгийн дагуу цэгцтэй гарна:

1. Картуудын энергийн ерөнхий дүр зураг:
- (Татсан 3 хөзөр хоорондоо хэрхэн уялдаж, одоогийн амьдралын хэмнэлийг яаж тодорхойлж байгааг дүгнэх)

2. 💼 Ажил мэргэжил ба замнал:
- Ирэх 6 сарын чиг хандлага болон анхаарах гол зүйлс:

3. 💰 Санхүү ба элбэг хангалуун байдал:
- Орлогын урсгал, санхүүгийн тогтвортой байдал болон баялгийг татах арга зам:

4. 🌱 Хувь хүний дотоод өсөлт ба сүнслэг хөгжил:
- Одоогийн замнал болон даван туулах дотоод сорилт, ухаарал:

5. 🌿 Эрүүл мэнд ба эрч хүчний тэнцвэр:
- Бие махбодь болон оюун санааны ядралыг тайлах, эрч хүчээ сэлбэх зөвлөмж:

6. 🔀 Чухал шийдвэр ба сонголт:
- Амьдралын эргэлтийн цэг дээр баримтлах чиглэл ба анхааруулга:

7. ✨ Далд авьяас ба шинэ боломжууд:
- Таны дотор орших нөөц бололцоо болон ойрын үед нээгдэх гарцууд:

8. 🔮 Хэрэглэгчийн хувийн асуултын тусгай хариу:
- Хэрэглэгчийн бичсэн тодорхой асуултад татсан хөзрүүд дээр үндэслэн өгөх шууд бөгөөд оновчтой зөвлөгөө:

✨ Сэтгэлийн батламж үг:
- (Тухайн хүний амьдралд хүч чадал, итгэл найдвар өгөх уянгалаг өгүүлбэр)`;

      userPrompt = `Оролтод өгөгдөх мэдээлэл:
- Хэрэглэгчийн татсан хөзрүүд:
${cardsSummary}
- Хэрэглэгчийн ерөнхий асуулт: ${question?.trim() || 'Амьдралын ерөнхий замнал, эрч хүч ба чиг хандлага'}
- Хэрэглэгчийн тусгайлан асуусан асуулт: ${vipCustomQuestion?.trim() || question?.trim() || 'Миний ажил мэргэжил, санхүү ба ойрын шийдвэрүүдэд хамгийн чухал зөвлөгөө юу вэ?'}`;
    } else {
      systemPrompt = `Та бол дулаан сэтгэл зүйтэй, мэргэжлийн өндөр түвшний Таро тайлагч юм.
Хэрэглэгчийн тавьсан асуулт болон дэлгэсэн 3 Таро хөзөр дээр үндэслэн өнгөрсөн, одоо, ирээдүйн уялдааг цэгцтэй, ойлгомжтой, байгалийн уянгалаг монгол хэлээр зөв найруулан бичнэ.
Текст болон гарчиг дотор #, *, _ зэрэг markdown тэмдэгтүүд болон англи үг огт ашиглахгүй.

Бүтэц (ямар нэгэн ерөнхий гарчиггүйгээр шууд эхэлнэ):
1. 🌿 Өнгөрсөн суурь:
- Өнгөрсөн үеийн сургамж ба суурь нөхцөл.

2. 💎 Одоо цагийн нөхцөл:
- Одоогийн бодит байдал ба дотоод нөөц бололцоо.

3. ⚡ Ирээдүйн чиг хандлага:
- Ойрын хугацааны боломж ба анхаарах зүйлс.

🔮 Таны асуултад өгөх гол зөвлөмж:
- Хөзрүүдийн өгч буй нэгдсэн хариулт ба гарц.

🕊 Өдрийн сэтгэлийн батламж:
- Өөртөө хэлэх богино, уянгалаг батламж үг.`;

      userPrompt = `Хэрэглэгчийн асуулт: ${question || 'Одоогийн нөхцөл байдал, ойрын хугацааны чиг хандлагын тухай'}

Сонгогдсон Таро хөзрүүд:
${cardsSummary}

Эдгээр 3 хөзрийн өгүүлэмжийг нэгтгэн, ямар ч markdown тэмдэгт (#, *, _) ашиглалгүйгээр цэвэр, уянгалаг монгол хэлээр тайлбарлан бичнэ үү.`;
    }

    if (ai) {
      try {
        const readingText = await callGeminiText(systemPrompt, userPrompt);
        if (readingText) {
          return res.json({
            success: true,
            source: 'gemini',
            reading: readingText,
          });
        }
      } catch {
        // Fallback to local mystic synthesis below
      }
    }

    // High quality rich Mongolian fallback synthesis
    const fallbackReading = generateFallbackReading(
      name,
      birthDate,
      birthTime,
      birthPlace,
      question,
      category,
      numerology,
      tarotCards,
      plan,
      vipCustomQuestion
    );
    return res.json({
      success: true,
      source: 'local-mystic',
      reading: fallbackReading,
    });
  } catch (error: any) {
    console.error('Error in /api/reading:', error?.message || error);
    return res.status(500).json({ error: 'Уншлага үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.' });
  }
});

// API endpoint for Daily Zodiac Horoscope powered by Gemini API
app.post('/api/daily-zodiac', async (req: Request, res: Response) => {
  try {
    const { signId, signName, signEn, element, dateStr } = req.body;

    if (!signId || !signName) {
      return res.status(400).json({ error: 'Ордны мэдээлэл дутуу байна.' });
    }

    const todayDate = dateStr || new Date().toLocaleDateString('mn-MN');
    const cacheKey = `${todayDate}_${signId}`;

    // Return cached result if available to save quota and respond instantly
    if (dailyZodiacCache.has(cacheKey)) {
      return res.json({
        success: true,
        source: 'cached',
        zodiac: dailyZodiacCache.get(cacheKey),
      });
    }

    const prompt = `Та бол мэргэжлийн, урам зориг өгөгч, дулаан сэтгэл зүйтэй монгол одон оронч ба өдрийн зурхайч "MYSTIC" юм.
Өнөөдөр: ${todayDate}.
Орд: ${signName} (${signEn || signId}), Махбод: ${element || 'Ерөнхий'}.

Дараах JSON форматаар өнөөдрийн энэхүү ордод зориулсан урам зориг өгөх, өөдрөг, яруу, ойлгомжтой өдрийн зурхайг бэлтгэж өгнө үү:
{
  "general": "Өнөөдрийн оддын байрлал, ерөнхий сэтгэл санаа ба энергийн тухай 2-3 дулаан өгүүлбэр",
  "mood": "Өдрийн уур амьсгал (Жишээ нь: Бүтээлч ба Тайван, Шинэ боломж, Зөн совин сэргэг)",
  "love": "Хайр дурлал, харилцаанд анхаарах дулаан, бодитой зөвлөгөө (2 өгүүлбэр)",
  "career": "Ажил хэрэг, суралцах, санхүүгийн тухай зөвлөгөө (2 өгүүлбэр)",
  "luckyNumber": 7,
  "luckyColor": "Champagne Rose (Сарнайн алтлаг ягаан)",
  "affirmation": "Өнөөдөр өөртөө хэлэх богино, хүчтэй өдрийн батламж үг"
}`;

    if (ai) {
      try {
        const rawText = await callGeminiText(
          'Та зөвхөн цэвэр, алдаагүй JSON объект буцаах үүрэгтэй. Текст монгол хэлээр, туйлын эелдэг, дулаан байх ёстой.',
          prompt,
          'application/json'
        );

        if (rawText) {
          const parsed = JSON.parse(rawText);
          dailyZodiacCache.set(cacheKey, parsed);
          return res.json({
            success: true,
            source: 'gemini',
            zodiac: parsed,
          });
        }
      } catch {
        // Fall through to rich fallback
      }
    }

    // High quality rich astrological fallback
    const fallback = generateFallbackZodiac(signId, signName, element, todayDate);
    dailyZodiacCache.set(cacheKey, fallback);

    return res.json({
      success: true,
      source: 'local-mystic',
      zodiac: fallback,
    });
  } catch (error: any) {
    console.error('Error in /api/daily-zodiac:', error?.message || error);
    return res.status(500).json({ error: 'Өдрийн зурхай үүсгэхэд алдаа гарлаа.' });
  }
});

// Admin Notifications & Orders Persistence
const ORDERS_FILE = path.resolve(dataDir, 'server_orders.json');
const ADMIN_CONFIG_FILE = path.resolve(dataDir, 'admin_config.json');

interface AdminNotificationConfig {
  webhookUrl?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  adminEmail?: string;
}

function loadAdminConfig(): AdminNotificationConfig {
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
    }
  } catch {}
  return {
    webhookUrl: process.env.ADMIN_WEBHOOK_URL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    adminEmail: process.env.ADMIN_EMAIL || 'amgalanbaatar652@gmail.com',
  };
}

function saveAdminConfig(cfg: AdminNotificationConfig) {
  try {
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save admin_config.json:', e);
  }
}

const ADMIN_EVENTS_FILE = path.resolve(dataDir, 'admin_events.json');

function logAdminEvent(event: any) {
  try {
    let events: any[] = [];
    if (fs.existsSync(ADMIN_EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(ADMIN_EVENTS_FILE, 'utf8')) || [];
    }
    const fullEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleString('mn-MN'),
      ...event,
    };
    events = [fullEvent, ...events.slice(0, 99)];
    fs.writeFileSync(ADMIN_EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
    return fullEvent;
  } catch (e) {
    console.error('Failed to log admin event:', e);
  }
}

async function dispatchAdminNotification(order: any) {
  const cfg = loadAdminConfig();
  const summaryText = `🔮 [MYSTIC ШИНЭ ЗАХИАЛГА]
📌 Захиалгын дугаар: ${order.id}
👤 Хэрэглэгч: ${order.userName} (${order.userPhone || 'Утасгүй'})
✉️ Имэйл: ${order.userEmail}
📦 Багц / Бараа: ${order.planName} (${order.amount.toLocaleString()}₮)
🏦 Банк: ${order.bankName}
📝 Гүйлгээний утга: ${order.transferNote}
⏰ Огноо: ${order.createdAt || new Date().toLocaleString('mn-MN')}`;

  console.info(`[Admin Notification] New order ${order.id} placed by ${order.userName} (${order.amount}₮)`);

  const results: { telegram?: string; webhook?: string; emailNotice?: string } = {};

  // 1. Telegram Bot Notification
  const tgToken = cfg.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = cfg.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChat,
          text: summaryText,
        }),
      });
      const tgRes = await response.json().catch(() => ({}));
      if (response.ok && tgRes.ok !== false) {
        results.telegram = `Амжилттай илгээгдлээ (Chat: ${tgChat})`;
        console.info(`[Telegram Bot] Notification delivered to chat ${tgChat}`);
        logAdminEvent({
          type: 'telegram_sent',
          status: 'success',
          orderId: order.id,
          recipient: tgChat,
          details: `Telegram notification delivered successfully`,
        });
      } else {
        const errMsg = tgRes.description || response.statusText || 'Telegram delivery failed';
        results.telegram = `Алдаа: ${errMsg}`;
        console.warn(`[Telegram Bot] Failed: ${errMsg}`);
        logAdminEvent({
          type: 'telegram_sent',
          status: 'error',
          orderId: order.id,
          recipient: tgChat,
          error: errMsg,
        });
      }
    } catch (tgErr: any) {
      results.telegram = `Сүлжээний алдаа: ${tgErr?.message}`;
      console.warn('[Telegram Bot] Failed to send notification:', tgErr?.message);
      logAdminEvent({
        type: 'telegram_sent',
        status: 'error',
        orderId: order.id,
        error: tgErr?.message,
      });
    }
  } else {
    results.telegram = 'Тохируулаагүй (Bot token / Chat ID хоосон)';
  }

  // 2. Webhook Notification (Discord / Slack / Zapier / Make / Custom)
  const webhookUrl = cfg.webhookUrl || process.env.ADMIN_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const isDiscord = webhookUrl.includes('discord.com/api/webhooks');
      const payload = isDiscord
        ? {
            content: `🔮 **[MYSTIC ШИНЭ ЗАХИАЛГА]**\n📌 Захиалга: \`${order.id}\` | 👤 ${order.userName} (${order.userPhone || 'Утасгүй'}) | 💰 **${order.amount.toLocaleString()}₮**`,
            embeds: [
              {
                title: `📦 ${order.planName}`,
                color: 0xDEB76A,
                fields: [
                  { name: '👤 Захиалагч', value: `${order.userName}\n✉️ ${order.userEmail}\n📞 ${order.userPhone || '—'}`, inline: true },
                  { name: '🏦 Төлбөр & Банк', value: `${order.bankName}\nДүн: **${order.amount.toLocaleString()}₮**\nУтга: \`${order.transferNote}\``, inline: true },
                ],
                footer: { text: `Mystic Tarot Admin System · ${new Date().toLocaleString('mn-MN')}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : {
            event: 'order.created',
            order,
            summaryText,
            timestamp: new Date().toISOString(),
          };

      const whRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Mystic-Event': 'order.created' },
        body: JSON.stringify(payload),
      });

      if (whRes.ok) {
        results.webhook = `Амжилттай илгээгдлээ (Status: ${whRes.status})`;
        console.info(`[Webhook] Notification posted to ${webhookUrl}`);
        logAdminEvent({
          type: 'webhook_sent',
          status: 'success',
          orderId: order.id,
          url: webhookUrl.replace(/\/webhooks\/\d+\/.+$/, '/webhooks/***'),
          statusCode: whRes.status,
        });
      } else {
        const errText = await whRes.text().catch(() => '');
        results.webhook = `Алдаа: HTTP ${whRes.status} (${errText.slice(0, 100)})`;
        logAdminEvent({
          type: 'webhook_sent',
          status: 'error',
          orderId: order.id,
          statusCode: whRes.status,
          error: errText.slice(0, 150),
        });
      }
    } catch (whErr: any) {
      results.webhook = `Сүлжээний алдаа: ${whErr?.message}`;
      console.warn('[Webhook] Failed to dispatch webhook:', whErr?.message);
      logAdminEvent({
        type: 'webhook_sent',
        status: 'error',
        orderId: order.id,
        error: whErr?.message,
      });
    }
  } else {
    results.webhook = 'Тохируулаагүй (Webhook URL хоосон)';
  }

  // 3. Admin Email Log
  results.emailNotice = cfg.adminEmail
    ? `Админ имэйл хаяг бүртгэгдсэн: ${cfg.adminEmail}`
    : 'Админ имэйл тохируулаагүй';

  logAdminEvent({
    type: 'order_registered',
    status: 'received',
    orderId: order.id,
    orderSummary: `${order.userName} (${order.planName} - ${order.amount}₮)`,
    results,
  });

  return results;
}

// GET all orders from server database
app.get('/api/orders', (_req: Request, res: Response) => {
  try {
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
    }
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const activeCount = orders.filter((o) => o.status === 'active').length;
    return res.json({
      success: true,
      orders,
      stats: {
        total: orders.length,
        pending: pendingCount,
        active: activeCount,
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/orders:', err);
    return res.status(500).json({ error: 'Failed to read orders' });
  }
});

// GET single order status for client real-time polling
app.get('/api/orders/:id/status', (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
    }
    const found = orders.find((o) => o.id === orderId);
    if (!found) {
      return res.status(404).json({ error: 'Order not found', id: orderId });
    }
    return res.json({
      success: true,
      id: found.id,
      status: found.status,
      planId: found.planId,
      userEmail: found.userEmail,
      approvedAt: found.approvedAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to read order status' });
  }
});

// Update order status (Approve / Reject) by Admin
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хандах эрхтэй.' });
    }
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status || !['pending', 'active', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (pending, active, rejected) required' });
    }

    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
    }

    let updatedOrder: any = null;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          status,
          approvedAt: status === 'active' ? new Date().toLocaleString('mn-MN') : o.approvedAt,
        };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found to update' });
    }

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), 'utf8');

    logAdminEvent({
      type: 'order_status_updated',
      orderId,
      newStatus: status,
      customer: `${updatedOrder.userName} (${updatedOrder.userEmail})`,
    });

    return res.json({ success: true, order: updatedOrder, orders: updated });
  } catch (err: any) {
    console.error('Error in PATCH /api/orders/:id/status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Consume a single-use approved order when reading/horoscope is generated
app.post('/api/orders/consume', (req: Request, res: Response) => {
  try {
    const { orderId, plan, userEmail, userPhone, readingId } = req.body || {};
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
    }

    const cleanEmail = userEmail ? String(userEmail).toLowerCase().trim() : '';
    const cleanPhone = userPhone ? String(userPhone).replace(/\s+/g, '') : '';

    let consumedOrder: any = null;
    const updated = orders.map((o) => {
      if (consumedOrder) return o;
      if (orderId && o.id === orderId) {
        consumedOrder = {
          ...o,
          consumed: true,
          consumedAt: Date.now(),
          consumedReadingId: readingId || o.consumedReadingId,
        };
        return consumedOrder;
      }
      if (plan && o.plan === plan && o.status === 'approved' && !o.consumed) {
        const emailMatch = cleanEmail && String(o.userEmail || '').toLowerCase().trim() === cleanEmail;
        const phoneMatch = cleanPhone && String(o.userPhone || '').replace(/\s+/g, '') === cleanPhone;
        if (emailMatch || phoneMatch || (!cleanEmail && !cleanPhone)) {
          consumedOrder = {
            ...o,
            consumed: true,
            consumedAt: Date.now(),
            consumedReadingId: readingId || o.consumedReadingId,
          };
          return consumedOrder;
        }
      }
      return o;
    });

    if (consumedOrder) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    }

    return res.json({ success: true, order: consumedOrder, orders: updated });
  } catch (err: any) {
    console.error('Error in POST /api/orders/consume:', err);
    return res.status(500).json({ error: 'Failed to consume order' });
  }
});

// Delete an order (Admin only)
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedAdmin(req)) {
      return res.status(403).json({ error: 'Зөвхөн админ хандах эрхтэй.' });
    }
    const orderId = req.params.id;
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
    }
    const updated = orders.filter((o) => o.id !== orderId);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), 'utf8');

    logAdminEvent({
      type: 'order_deleted',
      orderId,
    });

    return res.json({ success: true, removedId: orderId, orders: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Receive new order & notify admin
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order details missing' });
    }

    let existingOrders: any[] = [];
    try {
      if (fs.existsSync(ORDERS_FILE)) {
        existingOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')) || [];
      }
    } catch {}

    const updated = [order, ...existingOrders.filter((o) => o.id !== order.id)];
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    } catch {}

    // Dispatch notification asynchronously and capture results
    dispatchAdminNotification(order).catch((e) => console.error('Dispatch error:', e));

    return res.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error('Error in POST /api/orders:', err);
    return res.status(500).json({ error: 'Failed to record order' });
  }
});

// Admin Notification Configuration GET & POST
app.get('/api/admin/notifications-config', (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Зөвхөн админ хандах эрхтэй.' });
  }
  return res.json({ success: true, config: loadAdminConfig() });
});

app.post('/api/admin/notifications-config', (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Зөвхөн админ тохиргоо өөрчлөх эрхтэй.' });
  }
  const { webhookUrl, telegramBotToken, telegramChatId, adminEmail } = req.body;
  const cfg = {
    webhookUrl: webhookUrl || '',
    telegramBotToken: telegramBotToken || '',
    telegramChatId: telegramChatId || '',
    adminEmail: adminEmail || 'amgalanbaatar652@gmail.com',
  };
  saveAdminConfig(cfg);
  return res.json({ success: true, config: cfg });
});

// Admin Notification Events History
app.get('/api/admin/events', (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Зөвхөн админ хандах эрхтэй.' });
  }
  try {
    let events: any[] = [];
    if (fs.existsSync(ADMIN_EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(ADMIN_EVENTS_FILE, 'utf8')) || [];
    }
    return res.json({ success: true, events });
  } catch {
    return res.json({ success: true, events: [] });
  }
});

app.post('/api/admin/test-notification', async (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Зөвхөн админ тест хийх эрхтэй.' });
  }
  const testOrder = {
    id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    userName: 'Тест Захиалагч (Админ шалгалт)',
    userEmail: 'amgalanbaatar652@gmail.com',
    userPhone: '99112233',
    planId: 'full',
    planName: 'БҮРЭН ЦОГЦ ТАЙЛАЛ (Тест шалгалт)',
    amount: 19900,
    bankName: 'Хаан банк',
    transferNote: 'TEST-1234 Шалгалт',
    createdAt: new Date().toLocaleString('mn-MN'),
    status: 'pending',
  };
  const results = await dispatchAdminNotification(testOrder);
  return res.json({
    success: true,
    message: 'Тест мэдэгдлийн хүсэлтийг боловсрууллаа!',
    results,
    testOrder,
  });
});

// Dynamic Gemini API endpoint for Numerology Deep Analysis
app.post('/api/numerology', async (req: Request, res: Response) => {
  try {
    const { birthDate, name, lifePath, birthdayNumber, personalYear, expressionNumber } = req.body;

    const systemPrompt = `Та бол эртний Пифагорын тоон зурхай, хувь хүний сэтгэл зүй болон хувь заяаны замналын мэргэжлийн шинжээч юм.
Хэрэглэгчийн төрсөн огноо болон тооцоолсон тоонууд дээр үндэслэн тухайн хүний амьдралын замнал, төрөлхийн авьяас, 2026 оны хувийн жилийн өнгө аяс, хайр дурлал болон анхаарах сургамжийг байгалийн зөв, уянгалаг, утга төгөлдөр монгол хэлээр тайлбарлаж өгнө үү.
ЧУХАЛ ШААРДЛАГА:
- Текст болон гарчиг дотор #, *, _ зэрэг markdown тэмдэгтүүд огт ашиглахгүй.
- "Мэргэжлийн тослолт", "#7 Амьдралын зам", "Life Path" гэх мэт машин орчуулга шиг үг хэллэг огт бичихгүй. Харин "Амьдралын замын ${lifePath}-р тоо", "2026 оны хувийн ${personalYear}-р жил" гэж цэвэр монгол найруулгаар бичнэ.
- Ямар нэгэн ерөнхий толгой гарчиг тавилгүйгээр шууд 1-р хэсгээс эхэлнэ.`;

    const userPrompt = `Хэрэглэгчийн мэдээлэл:
- Нэр: ${name || 'Эрхэм хэрэглэгч'}
- Төрсөн огноо: ${birthDate || 'Тодорхойгүй'}
- Амьдралын замын тоо: ${lifePath}
- Төрсөн өдрийн тоо: ${birthdayNumber}
- 2026 оны хувийн жилийн тоо: ${personalYear}
${expressionNumber ? `- Нэрийн илэрхийллийн тоо: ${expressionNumber}` : ''}

Дараах 5 хэсгийн дагуу цэвэр, уянгалаг монгол хэлээр тоон зурхайн дэлгэрэнгүй тайлбарыг бичнэ үү (#, *, _ тэмдэгт огт хэрэглэхгүй):

1. 🌟 Хувь заяаны дуудлага ба төрөлхийн авьяас:
(Энэ хүний төрөлх мөн чанар, давуу тал болон амьдралд бүтээх үнэ цэнийг тодорхойлох)

2. 💎 2026 оны хувийн жилийн хэмнэл ба боломжууд (${personalYear}-р жил):
(Энэ онд анхаарах ажил хэрэг, санхүү, шинэ эхлэл ба шийдвэрүүд)

3. 💖 Хайр дурлал ба сэтгэлийн зохицол:
(Дотно харилцаанд баримтлах зарчим, итгэлцэл ба харилцан ойлголцол)

4. 🌿 Эрүүл мэнд, дотоод тэнцвэр ба анхаарах сургамж:
(Бие сэтгэлийн амар амгалангаа хадгалах арга зам)

5. 🕊 Өдөр тутмын сэтгэлийн батламж:
(Энэ хүнд урам зориг, итгэл өгөх уянгалаг өгүүлбэр)`;

    if (ai) {
      try {
        const generatedText = await callGeminiText(systemPrompt, userPrompt);
        if (generatedText) {
          return res.json({
            success: true,
            source: 'gemini',
            reading: generatedText,
          });
        }
      } catch (err: any) {
        console.warn('Gemini numerology call failed, falling back:', err?.message);
      }
    }

    // High quality rich fallback for numerology
    const fallbackText = `1. 🌟 Хувь заяаны дуудлага ба төрөлхийн авьяас:
Амьдралын замын ${lifePath}-р тоо нь таныг гүн гүнзгий ухаарал, дотоод зөн совингоороо бусдад гэрэл гэгээ түгээх онцгой өгөгдөлтэйг илтгэж байна. Та аливаа зүйлийн өнгөн хэсгийг бус, цаад мөн чанарыг нь танин мэдэх төрөлхийн торгон мэдрэмжтэй бөгөөд бусдад зөв чиглэл өгөх, шинжлэн судлах, бүтээлчээр сэтгэх тал дээр таны авьяас чадвар тод илэрнэ.

2. 💎 2026 оны хувийн жилийн хэмнэл ба боломжууд (${personalYear}-р жил):
2026 он бол таны хувьд хувийн ${personalYear}-р жилийн мөчлөг бөгөөд дотоод нөөцөө бататгах, шинэ ур чадвар эзэмших, санхүүгийн тогтвортой суурийг цогцлоох таатай цаг үе юм. Яаруу сандруу алхмаас зайлсхийж, өөрийн үнэт зүйл, урт хугацааны зорилгодоо тууштай байвал бодит амжилт таныг угтах болно.

3. 💖 Хайр дурлал ба сэтгэлийн зохицол:
Та дотно харилцаанд чин сэтгэлийн итгэлцэл, хүндэтгэл, үнэнч байдлыг хамгийн дээгүүрт тавьдаг. Зарим үед бүхнийг дотроо хадгалах хандлагаа зөөллөж, мэдрэмжээ илэн далангүй, дулаан үгээр хуваалцаж байх нь хосын харилцааг илүү бат бөх, халуун дулаан болгоно.

4. 🌿 Эрүүл мэнд, дотоод тэнцвэр ба анхаарах сургамж:
Оюун санааны хэт ачааллаас сэргийлж, байгалийн сайханд алхах, тайван амьсгалын дасгал хийх, нойр амралтаа зөв зохицуулах нь таны эрч хүчийг хамгийн сайнаар сэлбэнэ.

5. 🕊 Өдөр тутмын сэтгэлийн батламж:
"Миний амьдралын замнал орчлон ертөнцийн гэгээн хэмнэлтэй төгс нийцэж, би өдөр бүр өөрийн хамгийн сайн сайхан боломжуудыг нээж байна."`;

    return res.json({
      success: true,
      source: 'local-mystic',
      reading: fallbackText,
    });
  } catch (error: any) {
    console.error('Error in /api/numerology:', error);
    return res.status(500).json({ error: 'Тоон зурхайн тайлал үүсгэхэд алдаа гарлаа.' });
  }
});

function generateFallbackZodiac(signId: string, signName: string, element?: string, dateStr?: string) {
  const zodiacProfiles: Record<string, any> = {
    aries: {
      general: 'Өнөөдөр таны гал махбод танд хүчтэй эрч хүч, санаачилгыг бэлэглэж байна. Удаан эргэлзсэн шийдвэрээ зоригтой эхлүүлэхэд од эрхэс таны талд байх болно.',
      mood: 'Зоримог & Тэвчээртэй',
      love: 'Хайртай хүнтэйгээ чин сэтгэлийн илэн далангүй яриа өрнүүлбэл та хоёрын харилцаа шинэ шатанд гарна. Ганц бие хүмүүс гэнэтийн таатай уулзалттай учирч магадгүй.',
      career: 'Ажил дээрээ шинэ санаа дэвшүүлэхэд хамт олон тань нааштай хүлээж авна. Санхүүгийн жижиг тооцоог анхааралтай нягтлаарай.',
      luckyNumber: 9,
      luckyColor: 'Champagne Coral (Шүрэн ягаан)',
      affirmation: 'Би өөрийн зорилгодоо итгэлтэйгээр алхам бүрээ ухамсартай хийж байна.',
    },
    taurus: {
      general: 'Шороо махбодын тогтвортой тайван энерги өнөөдөр таныг хүрээлж байна. Аливаа яаруу сандруу алхмаас зайлсхийж, өөрийн хэмнэлээр урагшлах нь хамгийн том ялалт авчирна.',
      mood: 'Тайван & Бат бөх',
      love: 'Халуун дулаан халамж, амттай хоол, ая тухтай орчин харилцаанд тань баяр баясал нэмнэ. Бусдын үзэл бодлыг хүндэтгэн сонсоорой.',
      career: 'Төлөвлөгөөт ажлууд амжилттай урагшилна. Урт хугацааны хөрөнгө оруулалт болон хувийн хуримтлалаа эргэцүүлэхэд тохиромжтой өдөр.',
      luckyNumber: 6,
      luckyColor: 'Rose Gold (Сарнайн алтлаг)',
      affirmation: 'Миний сэтгэлд амар амгалан оршиж, миний бүтээсэн бүхэн өсөн дэвжиж байна.',
    },
    gemini: {
      general: 'Хий махбодын хурц оюун ухаан, харилцааны өндөр чадвар өнөөдөр гялалзах болно. Сонирхолтой мэдээ, шинэ танил танд шинэ үүд хаалгыг нээж өгнө.',
      mood: 'Оюунлаг & Сониуч',
      love: 'Хөнгөн инээмсэглэл, хөгжилтэй яриа хосын хоорондын бяцхан үл ойлголцлыг арилгана. Чин сэтгэлээсээ анхаарал тавиарай.',
      career: 'Төсөл танилцуулах, хэлэлцээр хийхэд маш таатай. Олон ажлыг зэрэг барьж авахын оронд хамгийн чухлыг нь эхэнд тавьж төвлөрөөрэй.',
      luckyNumber: 5,
      luckyColor: 'Blush Champagne (Цайвар оргилуун ягаан)',
      affirmation: 'Би шинэ мэдлэг, эерэг боломж бүрийг нээлттэй угтан авч байна.',
    },
    cancer: {
      general: 'Ус махбодын давуу тал болох гүн зөн совин тань өнөөдөр маш хүчтэй байна. Дотоод мэдрэмж тань таныг зөв зам руу хөтөлнө.',
      mood: 'Зөн совинтой & Халамжтай',
      love: 'Гэр бүл, дотны хүмүүстээ халуун дулаан үг хэлж, сэтгэлээ нээх өдөр. Хайртай хүний тань жижиг ч гэсэн үйлдэл сэтгэлийг тань дулаацуулна.',
      career: 'Бүтээлч шийдлүүд толгойд тань орж ирнэ. Ажлын хамтрагчдынхаа сэтгэл зүйг ойлгож харилцвал багийн ажил илүү үр дүнтэй болно.',
      luckyNumber: 2,
      luckyColor: 'Pearl Silver & Pink (Сувдан ягаан)',
      affirmation: 'Миний зөн совин бол миний найдвартай луужин юм.',
    },
    leo: {
      general: 'Таны гэрэлтсэн, өгөөмөр зан чанар өнөөдөр бусдад урам зориг өгнө. Өөртөө итгэх итгэл тань оргилдоо хүрч, эргэн тойрноо эерэг энергиэр цэнэглэнэ.',
      mood: 'Гэрэлтсэн & Урам зоригтой',
      love: 'Романтик гэнэтийн бэлэг эсвэл хамтдаа өнгөрүүлэх онцгой цаг мөч харилцааг тань бадраана. Өөрийн мэдрэмжээ шууд илэрхийлээрэй.',
      career: 'Манлайлах чадвараа харуулахад тун таатай үе. Таны санаачилгыг удирдлага болон түншүүд өндрөөр үнэлэх боломжтой.',
      luckyNumber: 1,
      luckyColor: 'Warm Gold (Алтан наран)',
      affirmation: 'Би амьдралдаа талархаж, гэрэл гэгээгээ бусадтай хуваалцаж байна.',
    },
    virgo: {
      general: 'Нарийн нягт сэтгэлгээ, эмх цэгц өнөөдөр таны хамгийн том зэвсэг болно. Цэгцлэгдээгүй байсан асуудлууд бүгд өөрийн байраа олох болно.',
      mood: 'Цэгцтэй & Мэргэн',
      love: 'Энгийн өдөр тутмын анхаарал халамж нь сүржин үгнээс илүү үнэ цэнтэй. Хайртай хүндээ жижиг ч болов сэтгэлийн тус дэм үзүүлээрэй.',
      career: 'Бичиг баримт, санхүү, нарийн ширийн ажлууд саадгүй бүтнэ. Өөрийн хийсэн ажлын чанарт итгэлтэй байж, өөрийгөө хэт бүү шүүмжлээрэй.',
      luckyNumber: 4,
      luckyColor: 'Dusty Rose (Зөөлөн шаргал сарнай)',
      affirmation: 'Би алхам алхмаар төгс зохицол, амар тайванг бий болгож байна.',
    },
    libra: {
      general: 'Гоо зүй, зохицол, шударга тэнцвэрийн энерги өнөөдөр таны амьдралд хүчтэй үйлчилж байна. Аливаа маргаантай асуудлыг эв найрамдлаар шийдвэрлэх боломж бүрдэнэ.',
      mood: 'Тэнцвэртэй & Гоёмсог',
      love: 'Хосын харилцаанд харилцан хүндэтгэл, тэгш эрх маш чухал байна. Тааламжтай, яруу уур амьсгал өнөөдөр та хоёрыг холбоно.',
      career: 'Хамтран ажиллах, шинэ гэрээ хэлцэл байгуулахад өндөр амжилт хүлээнэ. Таны эелдэг дипломат зан бүхний түлхүүр болно.',
      luckyNumber: 7,
      luckyColor: 'Champagne Pink (Оргилуун ягаан)',
      affirmation: 'Миний дотор төгс тэнцвэр, гоо үзэсгэлэн, амар амгалан оршиж байна.',
    },
    scorpio: {
      general: 'Гүн гүнзгий өөрчлөлт, шинэчлэлийн хүчирхэг урсгал танд ирж байна. Хуучирсан, танд үнэ цэнгүй болсон бодлуудаа орхисноор шинэ хүч танд цутгана.',
      mood: 'Хүчирхэг & Зоримог',
      love: 'Чин сэтгэлийн үнэнч байдал, гүн холбоо чухал болно. Итгэлцлээ бэхжүүлж, нууцлаг байдлаасаа бага зэрэг дэлгээд үзээрэй.',
      career: 'Нуугдмал байсан боломжуудыг соргогоор олж харах чадвар тань нэмэгдэнэ. Санхүүгийн ашигтай саналууд орж ирж магадгүй.',
      luckyNumber: 8,
      luckyColor: 'Deep Plum (Гүн чавган ягаан)',
      affirmation: 'Би хуучныг үдэж, шинэ дэвшил бүрийг бүрэн хүчээрээ хүлээн авч байна.',
    },
    sagittarius: {
      general: 'Өөдрөг үзэл, алсын хараа, эрх чөлөөний хүсэл таныг хөглөнө. Өнөөдөр ямар нэг шинэ зүйл туршиж, алсын төлөвлөгөөгөө зурахад гайхалтай тохиромжтой.',
      mood: 'Өөдрөг & Тэлэгч',
      love: 'Хамтдаа сонирхолтой газарт очих эсвэл ирээдүйн аяллын тухай ярилцах нь харилцааг сэргээнэ. Чөлөөт орон зайг бие биедээ олгоорой.',
      career: 'Суралцах, гадаад харилцаа, шинэ чиглэл нээхэд оддын ивээл өндөр байна. Том зорилго тавихаас бүү эмээгээрэй.',
      luckyNumber: 3,
      luckyColor: 'Celestial Violet (Тэнгэрийн ягаан)',
      affirmation: 'Миний амьдрал шинэ боломж, баяр баясгалан, өсөлтөөр дүүрэн байна.',
    },
    capricorn: {
      general: 'Зорилгодоо үнэнч тууштай байдал, тэвчээр өнөөдөр үр дүнгээ өгч эхэлнэ. Бага багаар хийсэн ажлууд тань томоохон суурь болж бэхжинэ.',
      mood: 'Тууштай & Найдвартай',
      love: 'Харилцаанд найдвартай тулгуур болж буйгаа мэдрүүлэх нь хамгийн том хайрын баталгаа. Сэтгэлээсээ цаг гаргаж ярилцаарай.',
      career: 'Мэргэжлийн түвшинд нэр хүнд тань өсөх таатай үйл явдал болно. Санхүүгээ урт хугацаанд төлөвлөхөд хамгийн шилдэг өдөр.',
      luckyNumber: 10,
      luckyColor: 'Earth Charcoal & Bronze (Хүрэл бор)',
      affirmation: 'Миний хичээл зүтгэл бүхэн бодит амжилт болон хувирч байна.',
    },
    aquarius: {
      general: 'Өвөрмөц шинэ санаа, чөлөөт сэтгэлгээ тань өнөөдөр бусдыг гайхшруулна. Хэвшмэл ойлголтоос ангижирч, өөрийнхөөрөө байх нь амжилтын нууц.',
      mood: 'Шинэчлэгч & Чөлөөт',
      love: 'Найз нөхдийн холбоон дээр суурилсан гүн хайр өнөөдөр цэцэглэнэ. Бие биенийхээ өвөрмөц онцлогийг бахархан хүлээж аваарай.',
      career: 'Технологи, олон нийтийн төсөл, бүтээлч ажлуудад гэнэтийн шинэ боломж нээгдэнэ. Хамт олноороо хамтран ажиллах нь үр өгөөжтэй.',
      luckyNumber: 11,
      luckyColor: 'Electric Sky Blue & Pink (Оргилуун цэнхэр)',
      affirmation: 'Би өөрийн өвөрмөц гэрлийг ертөнцөд айдасгүйгээр түгээж байна.',
    },
    pisces: {
      general: 'Сэтгэлийн мэдрэмж, уран бүтээлч сэтгэлгээ, өрөвч энэрэнгүй чанар тань өнөөдөр хүчтэй байна. Өөрийгөө болон бусдыг ойлгох гайхамшигтай өдөр.',
      mood: 'Мэдрэмтгий & Уран бүтээлч',
      love: 'Гүн сэтгэлийн дотно байдал, романтик мэдрэмжүүд таныг хөглөнө. Хайрын дулаан эрчим таны зүрхийг дүүргэх болно.',
      career: 'Зөн совингоо дагаж гаргасан шийдвэр тань онох магадлал өндөр. Урлаг, дизайн, хүмүүнлэгийн үйлсэд амжилт дагалдана.',
      luckyNumber: 12,
      luckyColor: 'Mystic Lavender (Эрхэм нил ягаан)',
      affirmation: 'Би орчлон ертөнцийн урсгалд итгэж, сэтгэл зүрхнийхээ дуу хоолойг дагаж байна.',
    },
  };

  return zodiacProfiles[signId] || zodiacProfiles.libra;
}

function generateLoveFallbackReading(
  cards?: any[],
  question?: string,
  _name?: string
): string {
  const cardsList = Array.isArray(cards) && cards.length > 0 ? cards : [];
  const c1 = cardsList[0] || { name: 'The Lovers', meaning: 'Сэтгэлийн гүн зохицол ба сонголт', upright: true, position: '1-р карт' };
  const c2 = cardsList[1] || { name: 'Two of Cups', meaning: 'Харилцан итгэлцэл ба сэтгэлийн холбоо', upright: true, position: '2-р карт' };
  const c3 = cardsList[2] || { name: 'The Star', meaning: 'Итгэл найдвар ба сүнслэг удирдамж', upright: true, position: '3-р карт' };
  const c4 = cardsList[3] || { name: 'Four of Wands', meaning: 'Бат бөх тулгуур ба эв нэгдэл', upright: true, position: '4-р карт' };
  const c5 = cardsList[4] || { name: 'The Sun', meaning: 'Гэрэл гэгээ, баяр баясгалан, ил тод байдал', upright: true, position: '5-р карт' };

  return `1. Картуудын энергийн ерөнхий дүр зураг:
- Дэлгэгдсэн хөзрүүд (${c1.name}, ${c2.name}, ${c3.name}${cardsList.length > 3 ? `, ${c4.name}, ${c5.name}` : ''}) нь та хоёрын харилцаанд сэтгэл зүйн болон дотоод мэдрэмжийн гүн өөрчлөлт явагдаж буйг илтгэж байна. Хөзрүүдийн голлох уур амьсгал нь бие биеэ илүү гүн танин мэдэх, далд эргэлзээг тайлах, мөн харилцан итгэлцлийн шинэ шатанд шилжих хүчтэй таталцлыг үүсгэж байна. Өнгөц сэтгэл хөдлөлөөс илүү суурь үнэ цэнэ дээрээ тулгуурлах цаг иржээ.

2. Сэтгэл зүй ба далд мэдрэмжийн тайлал:
- Таны болон нөгөө хүний дотоод өнгө аяс: Таны зүгээс харилцаандаа чин сэтгэлийн тогтвортой байдал, үнэнч нээлттэй харилцааг хүсэмжилж байгаа бол нөгөө хүний хувьд дотоод мэдрэмжээ шууд илэрхийлэхээс бага зэрэг эмээсэн, болгоомжилсон байр суурьтай байна. Гэвч гүндээ та хоёр хоёул бие биедээ аюулгүй, хүлээн зөвшөөрөгдсөн орон зайг бий болгохыг тэмүүлж буй нь тод харагдаж байна.
- Харилцаанд тулгарч буй далд сорилт: Өнгөрсөн туршлагаас үүдэлтэй болгоомжлол болон буруугаар ойлгогдох вий гэсэн далд айдас нь хоорондоо илэн далангүй, тайван ярилцахад үл үзэгдэх саад болж байна.

3. Хувь заяаны холбоо ба далд учир шалтгаан:
- Энэхүү харилцаа нь тохиолдлын учрал бус, харин өөрсдийн хувийн орон зай, тэвчээр, өөрийгөө болон бусдыг чин сэтгэлээсээ ойлгож хайрлах чадварт суралцах чухал хичээл юм. Бие биенийхээ эмзэг талыг тольдон харуулж, сэтгэл зүйн хувьд илүү боловсорч өсөхөд туслах утга учиртай холбоо юм.

4. Хосын сэтгэлийн тэнцвэрт байдал:
- Одоогийн байдлаар сэтгэлийн санаачилга, анхаарал халамжийг нэг тал нь арай илүү гаргаж, нөгөө тал нь үүнийг дотроо талархалтай хүлээж авдаг ч ил гаргахдаа хүлээцтэй байгаа дүр зураг ажиглагдаж байна. Харилцаа урт хугацаанд эрүүл оршихын тулд өгөх ба авах тэнцвэрийг ярилцаж, хүлээлтээ нэгтгэх нь чухал.

5. Сэтгэл хөдлөлийн саад ба болгоомжлол:
- Таны тал дээр: Сэтгэлээ бүрэн дэлгэвэл эмзэг байдалд орж магадгүй гэсэн дотоод түгшүүр болон хариу үйлдэл хүлээсэн чимээгүй хүлээлт.
- Нөгөө хүний тал дээр: Өөрийн бие даасан байдлаа алдахаас эмээх эсвэл том хариуцлагын өмнө өөрийгөө бэлэн бус гэж дутуу үнэлэх сэтгэл зүйн хаалт.

6. Цаг хугацааны чиг баримжаа:
- Ойрын 1-3 долоо хоногт: Сэтгэл хөдлөлийн хэлбэлзэл аажмаар намжиж, өдөр тутмын харилцаанд ойлголцлын дулаан уур амьсгал сэргэх тайван үе тохионо.
- Ирэх 1-3 сарын хугацаанд: Харилцааны цаашдын чиг баримжаа тодорхой болж, хэн хэн нь бодит алхам хийх, харилцаагаа шинэ шатанд гаргах чухал мөчид хүрнэ.

7. Хамгийн сайнаар болон муугаар эргэх хувилбар:
- Хамгийн таатай өөрчлөлт: Хоёр тал бие биенийхээ дотоод хэрэгцээг хүлээн зөвшөөрч, сэтгэлийн гүн итгэлцэл дээр суурилсан, бие биенээ дэмждэг урт хугацааны бат бөх зохицолд хүрэх.
- Анхаарвал зохих эрсдэл: Бодит яриа өрнүүлэхийн оронд дотроо гомдол, таамаглал хуримтлуулж, бие биенээсээ хөндийрөн зай барих.

8. Бодит зөвлөгөө ба хийх алхмууд:
- Юуг эрхэмлэх хэрэгтэй вэ?: Асуудлыг хурцатгахгүйгээр өөрийн мэдрэмжээ тайван хуваалцах, бие биедээ цаг хугацаа болон тайван орон зай олгох.
- Юунаас зайлсхийх ёстой вэ?: Нөгөө хүний бодол, үйлдэлд урьдчилсан таамаг дэвшүүлэн буруутгах, сэтгэл хөдлөлөөр түргэдэн дүгнэлт хийхээс зайлсхийх.

✨ Сэтгэлийн батламж үг:
- "Би өөрийн зүрх сэтгэлийн дуудлагад итгэж, харилцаандаа хүндэтгэл, үнэнч хайр, амар амгаланг хүлээн авч байна. Бидний сэтгэлийн холбоо өдөр бүр тэнцвэртэйгээр бэхжиж байна."`;
}
function generateVipFallbackReading(
  cards?: any[],
  question?: string,
  vipCustomQuestion?: string,
  _name?: string
): string {
  const cardsList = Array.isArray(cards) && cards.length > 0 ? cards : [];
  const c1 = cardsList[0] || { name: 'Илбэчин (The Magician)', upright: true, position: '1. Өнгөрсөн суурь' };
  const c2 = cardsList[1] || { name: 'Хувь тавилангийн хүрд (Wheel of Fortune)', upright: true, position: '2. Одоо цагийн нөхцөл' };
  const c3 = cardsList[2] || { name: 'Нар (The Sun)', upright: true, position: '3. Ирээдүйн чиг хандлага' };

  const targetQ = vipCustomQuestion?.trim() || question?.trim() || 'Миний ажил мэргэжил, санхүү ба ойрын шийдвэрүүдэд хамгийн чухал зөвлөгөө юу вэ?';

  return `1. Картуудын энергийн ерөнхий дүр зураг:
- Таны дэлгэсэн 3 хөзөр (${c1.name}, ${c2.name}, ${c3.name}) нь таны амьдралын одоогийн ерөнхий хэмнэл шинэ өсөлт, ухаарал ба шинэчлэлийн хүчирхэг мөчлөгт шилжиж буйг тодорхойлж байна. Эхний хөзөр суурь нөөц бололцоог сэрээж, дундах хөзөр хувь тавилангийн таатай эргэлтийг эхлүүлэн, гурав дахь хөзөр нь бодит үр дүн, амжилт, гэрэл гэгээг чиглүүлж байна.

2. 💼 Ажил мэргэжил ба замнал:
- Ирэх 6 сарын чиг хандлага болон анхаарах гол зүйлс: Ажил мэргэжлийн талбарт манлайлах, шинэ санаачилга гаргах орон зай тэлнэ. Хөндлөнгийн саад бэрхшээлийг боломж болгон хувиргах уян хатан арга барил баримталж, өөрийн ур чадварыг дутуу үнэлэхгүй байх нь нэн чухал. Ирэх хагас жилд төсөл амжилттай хэрэгжих, хамтын ажиллагаа шинэ шатанд гарах таатай чиг хандлага давамгайлж байна.

3. 💰 Санхүү ба элбэг хангалуун байдал:
- Орлогын урсгал, санхүүгийн тогтвортой байдал болон баялгийг татах нь: Санхүүгийн урсгал шинэ орлогын эх үүсвэр болон оновчтой хөрөнгө оруулалтын шийдвэрээр тэлэх боломжтой. Элбэг хангалуун байдлыг цогцлоохын тулд хомсдолын айдсаа орхиж, бодит үнэ цэнэ бүтээх зарчимд төвлөрөх нь үр өгөөжтэй. Сэтгэл хөдлөлөөр хийгдэх зардлыг хянаж, урт хугацааны хуримтлалаа бэхжүүлээрэй.

4. 🌱 Хувь хүний дотоод өсөлт ба сүнслэг хөгжил:
- Одоогийн замнал болон даван туулах дотоод сорилт: Та өөрийгөө хуучин хязгаарлагдмал хүрээнээс чөлөөлөх чухал үе дээр зогсож байна. Гол дотоод сорилт нь өөртөө эргэлзэх болон тодорхойгүй байдлаас эмээх сэтгэл юм. Энэхүү эргэлзээг даван туулж, өөрийн дотоод зөн совиндоо итгэх нь таныг шинэ ухааралд хөтөлнө.

5. 🌿 Эрүүл мэнд ба эрч хүчний тэнцвэр:
- Бие махбодь болон оюун санааны ядралыг тайлах, эрч хүчээ сэлбэх арга зам: Сэтгэл зүйн болон биеийн ачааллыг тэнцвэржүүлэхэд байгальтай ойр байх, нойрны чанартаа анхаарах, мэдээллийн хэт ачааллаас түр завсарлага авах нь тустай. Өдөр бүр хэдэн хором өөртэйгөө тайван байх нь таны эрч хүчийг богино хугацаанд нөхөн сэргээнэ.

6. 🔀 Чухал шийдвэр ба сонголт:
- Амьдралын томоохон эргэлт дээр баримтлах чиглэл ба анхааруулга: Чухал сонголтын өмнө шийдвэр гаргахдаа айдаст бус, өөрийн урт хугацааны алсын хараанд тулгуурлаарай. Бусдын шахалтаар яаран шийдвэр гаргахаас сэргийлж, бодит баримт болон зүрх сэтгэлийн дотоод амар амгаланг нийцүүлэх чиглэлийг баримтална уу.

7. ✨ Далд авьяас ба шинэ боломжууд:
- Анзаараагүй байгаа нөөц бололцоо болон ирээдүйд нээгдэх гарцууд: Таны доторх торгон мэдрэмж, бусдыг удирдан чиглүүлэх болон ээдрээтэй нөхцөл байдлыг цэгцлэх ур чадвар бүрэн нээгдэж байна. Шинэ мэдлэг эзэмших, өөрийн өвөрмөц санааг зоригтой хэрэгжүүлэх үед таатай боломжууд нээгдэнэ.

8. 🔮 Хэрэглэгчийн хувийн асуултын тусгай хариу:
- Таны тавьсан "${targetQ}" асуултад хөзрүүд дараах зөвлөгөөг өгч байна: Гаднын хүлээлтэд өөрийгөө баригдуулалгүйгээр, төлөвлөсөн эхний бодит алхмаа өөртөө итгэлтэй хийхийг хөзрүүд зөвлөж байна. Нөхцөл байдал таны талд эргэх таатай урсгал бүрдсэн тул эргэлзэлгүй урагшлаарай.

✨ Сэтгэлийн батламж үг:
- "Би өөрийн амьдралын замналыг ухамсартайгаар бүтээгч бөгөөд бүхий л салбарт элбэг хангалуун байдал, хүч чадал, амар амгаланг талархалтайгаар хүлээн авч байна."`;
}

function generateFallbackReading(
  name?: string,
  _birthDate?: string,
  _birthTime?: string,
  _birthPlace?: string,
  question?: string,
  category?: string,
  _numerology?: any,
  tarotCards?: any[],
  plan?: string,
  vipCustomQuestion?: string
): string {
  const isLove =
    plan === 'love' ||
    category === 'love' ||
    category === 'Хайр дурлал' ||
    /хайр|хос|харилцаа|гэрлэлт|хайрт|дурлал/i.test(question || '');

  if (isLove) {
    return generateLoveFallbackReading(tarotCards, question, name);
  }

  const isVip =
    plan === 'full' ||
    plan === 'vip' ||
    category === 'vip';

  if (isVip) {
    return generateVipFallbackReading(tarotCards, question, vipCustomQuestion, name);
  }

  const cardsText = (tarotCards || [])
    .map(
      (c) =>
        `• ${c.position}: ${c.name} (${c.upright ? 'Эгц' : 'Урвуу'}) — ${c.meaning}`
    )
    .join('\n');

  const greeting = name?.trim()
    ? `Эрхэм ${name.trim()} танд энэ өдрийн мэндийг хүргэе.`
    : `Танд энэ өдрийн мэндийг хүргэе.`;

  return `${greeting} Таны сонирхсон "${question || category || 'Амьдралын замнал ба сонголт'}" сэдвийн хүрээнд дэлгэсэн Таро хөзрүүдийн тайлбарыг толилуулж байна.

1. 🌿 Өнгөрсөн суурь ба хуримтлуулсан туршлага
Таны туулж өнгөрүүлсэн зам мөр бол одоогийн таныг бүтээсэн үнэ цэнтэй суурь юм. Өнгөрсөн үеийн сорилтууд танд аливаа үзэгдлийн цаад мөн чанарыг таних гүн ухаарал, уян хатан чанарыг бэлэглэжээ. Хуучин эргэлзээ, өнгөрсөнд үлдсэн ачааг сэтгэлээсээ чөлөөлснөөр та шинэ боломжийг бүрэн дүүрэн хүлээн авах болно.

2. 💎 Одоо цагийн нөхцөл байдал ба дотоод нөөц
Одоогийн мөчид танд дараах давуу тал болон дотоод хүч бүрдсэн байна:
• Зөн совингийн торгон мэдрэмж: Аливаа шийдвэрийн зөв чигийг дотоод мэдрэмжээрээ таних чадвар.
• Сэтгэлийн тэнхээ ба тууштай байдал: Эгзэгтэй мөчид өөрийн хүчээр шийдэл олох далд чадавх.
• Бие даасан зарчимч байдал: Бусдын явцуу хандлагад автахгүйгээр өөрийн үнэт зүйлдээ үнэнч алхах чанар.

3. ⚡ Ирээдүйн чиг хандлага ба анхаарах зүйлс
Ойрын хугацаанд анхаарвал зохих зөвлөмжүүд:
• Хэт их эргэлзэн бодохоос зайлсхийх: Жижиг саадыг сэтгэлдээ томруулан төсөөлж, эхлэх алхмаа бүү хойшлуулаарай.
• Сэтгэлийн ачааллыг ганцаараа үүрэхгүй байх: Амарч хүчээ сэлбэх цагийг өөртөө заавал гаргаарай.
• Алхам бүртээ талархах: Жижиг ахиц дэвшил бүр таныг том зорилгод тань хөтөлдөг.

🔮 Таны асуултад өгөх бодит гарц ба зөвлөгөө
Сонгогдсон хөзрүүдийн өгүүлэмж:
${cardsText}

Нэгдсэн тайлал:
Таны бодож буй энэхүү асуудал бол дараагийн шинэ шатанд гарах чухал боломж юм. Хөзрүүд танд гаднаас баталгаа хайхын оронд өөрийн дотоод зөн совиндоо итгэхийг зөвлөж байна. Яаралгүй, уужуу тайван сэтгэлээр гаргасан шийдвэр тань хамгийн зөв гарц байх болно.

🕊 Өдрийн сэтгэлийн батламж
"Би амьдралынхаа бүх үе шатанд зөв цагтаа, зөв газраа алхаж байна. Өнгөрсөн бүхэн надад ухаарал болж, ирээдүй надад гэрэлт боломжуудыг нээж байна."`;
}

// Development with Vite vs Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MYSTIC Server running on http://localhost:${PORT}`);
  });
}

startServer();
