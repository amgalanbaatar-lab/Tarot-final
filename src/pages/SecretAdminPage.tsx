import React, { useState, useEffect, useRef } from 'react';
import {
  MysticOrder,
  OrderStatus,
  OrderPlan,
  getOrders,
  fetchServerOrders,
  updateOrderStatusServer,
  deleteOrderServer,
  saveOrder,
} from '../types/order';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  DollarSign,
  Users,
  Plus,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  Sparkles,
  Bell,
  Send,
  Globe,
  Trash2,
  Image as ImageIcon,
  ShoppingBag,
  Edit3,
  Upload,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  Palette,
  Video,
  ArrowUp,
  ArrowDown,
  Layers,
  Sliders,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { useCustomCards } from '../context/CustomCardsContext';
import {
  useShop,
  DEFAULT_SITE_BACKGROUND,
  DEFAULT_MENU_ORDER,
  MenuOrderItem,
} from '../context/ShopContext';
import { TAROT_DECK } from '../data/tarotData';
import { ShopItem } from './ShopPage';
import { optimizeCardImage } from '../utils/imageCompressor';

interface SecretAdminPageProps {
  onBackToSite: () => void;
  onPlanActivated?: (planId: OrderPlan, email: string) => void;
}

const ADMIN_STORAGE_KEY = 'mystic_admin_auth_session';
const DEFAULT_ADMIN_EMAIL = 'admin@mystic.mn';
const VALID_PASSWORDS = ['mystic2026', 'admin8888', 'mystic'];

export const SecretAdminPage: React.FC<SecretAdminPageProps> = ({
  onBackToSite,
  onPlanActivated,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'authenticated' ||
      localStorage.getItem(ADMIN_STORAGE_KEY) === 'authenticated'
    );
  });

  // Main Admin Section Tabs: 'orders' | 'pricing' | 'cards' | 'shop' | 'background' | 'menu-order'
  const [activeAdminSection, setActiveAdminSection] = useState<
    'orders' | 'pricing' | 'cards' | 'shop' | 'background' | 'menu-order'
  >('orders');

  // Custom Cards Context
  const {
    getCardImage,
    isCardCustomized,
    customizedCount,
    saveCardImage,
    removeCardImage,
    cardBackImage,
    isCardBackCustomized,
    resetAllCards,
    openCustomizer,
    openCardBackCustomizer,
    isLoading: isCardSaving,
  } = useCustomCards();

  // Shop, Pricing, Site Background & Menu Order Context
  const {
    shopEnabled,
    items: shopItems,
    planPrices,
    siteBackground,
    menuOrder,
    updatePlanPrices,
    updateSiteBackground,
    updateMenuOrder,
    formatPrice,
    toggleShopEnabled,
    saveShopItem,
    deleteShopItem,
    isLoading: isShopSaving,
  } = useShop();

  // Site Background & Liquid Glass Form State inside Admin
  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>(siteBackground.type);
  const [bgColor, setBgColor] = useState<string>(siteBackground.color);
  const [bgImageUrl, setBgImageUrl] = useState<string>(siteBackground.imageUrl);
  const [bgVideoUrl, setBgVideoUrl] = useState<string>(siteBackground.videoUrl);
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState<number>(siteBackground.overlayOpacity);
  const [bgOverlayColor, setBgOverlayColor] = useState<string>(siteBackground.overlayColor);
  const [bgShowNebula, setBgShowNebula] = useState<boolean>(siteBackground.showNebulaClouds);
  const [headerGlassEnabled, setHeaderGlassEnabled] = useState<boolean>(
    siteBackground.headerGlassEnabled ?? true
  );
  const [headerGlassBlur, setHeaderGlassBlur] = useState<number>(
    siteBackground.headerGlassBlur ?? 16
  );
  const [headerGlassOpacity, setHeaderGlassOpacity] = useState<number>(
    siteBackground.headerGlassOpacity ?? 38
  );
  const [isUploadingBgFile, setIsUploadingBgFile] = useState<boolean>(false);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);

  // Menu Order State inside Admin
  const [editableMenuOrder, setEditableMenuOrder] = useState<MenuOrderItem[]>(menuOrder);

  useEffect(() => {
    setEditableMenuOrder(menuOrder);
  }, [menuOrder]);

  useEffect(() => {
    setBgType(siteBackground.type);
    setBgColor(siteBackground.color);
    setBgImageUrl(siteBackground.imageUrl);
    setBgVideoUrl(siteBackground.videoUrl);
    setBgOverlayOpacity(siteBackground.overlayOpacity);
    setBgOverlayColor(siteBackground.overlayColor);
    setBgShowNebula(siteBackground.showNebulaClouds);
    setHeaderGlassEnabled(siteBackground.headerGlassEnabled ?? true);
    setHeaderGlassBlur(siteBackground.headerGlassBlur ?? 16);
    setHeaderGlassOpacity(siteBackground.headerGlassOpacity ?? 38);
  }, [siteBackground]);

  const handleBgImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBgFile(true);
    try {
      const optimizedDataUrl = await optimizeCardImage(file, 1920, 1080, 0.85);
      setBgImageUrl(optimizedDataUrl);
      setBgType('image');
      mysticAudio.playChime(528, 1);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBgImageUrl(reader.result);
          setBgType('image');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingBgFile(false);
      e.target.value = '';
    }
  };

  const handleBgVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 35 * 1024 * 1024) {
      setActionSuccessMsg('⚠️ Бичлэгийн хэмжээ 35MB-аас бага байх шаардлагатай. Эсвэл видео линк (URL) оруулна уу.');
      setTimeout(() => setActionSuccessMsg(null), 5000);
      e.target.value = '';
      return;
    }
    setIsUploadingBgFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBgVideoUrl(reader.result);
        setBgType('video');
        mysticAudio.playChime(528, 1);
      }
      setIsUploadingBgFile(false);
    };
    reader.onerror = () => {
      setIsUploadingBgFile(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveSiteBackground = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await updateSiteBackground({
      type: bgType,
      color: bgColor || '#DAB3AA',
      imageUrl: bgImageUrl.trim(),
      videoUrl: bgVideoUrl.trim(),
      overlayOpacity: Number(bgOverlayOpacity),
      overlayColor: bgOverlayColor || '#DAB3AA',
      showNebulaClouds: bgShowNebula,
      headerGlassEnabled,
      headerGlassBlur: Number(headerGlassBlur),
      headerGlassOpacity: Number(headerGlassOpacity),
    });
    setBgImageUrl(saved.imageUrl);
    setBgVideoUrl(saved.videoUrl);
    mysticAudio.playChime(639, 2);
    const modeLabel =
      saved.type === 'video' ? 'Бичлэг (Video)' : saved.type === 'image' ? 'Зураг (Image)' : `Өнгө (${saved.color})`;
    setActionSuccessMsg(
      `✓ Сайтын дэвсгэр болон Liquid Glass тохиргоо хадгалагдлаа! (${modeLabel} · Blur: ${saved.headerGlassBlur}px)`
    );
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleResetSiteBackground = async () => {
    await updateSiteBackground(DEFAULT_SITE_BACKGROUND);
    mysticAudio.playChime(528, 1.5);
    setActionSuccessMsg('✓ Сайтын дэвсгэр болон Liquid Glass тохиргоог анхны утга руу буцаалаа.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editableMenuOrder.length) return;
    const updated = [...editableMenuOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditableMenuOrder(updated);
    mysticAudio.playChime(528, 0.5);
  };

  const handleToggleMenuItemEnabled = (id: string) => {
    setEditableMenuOrder((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleSaveMenuOrder = async () => {
    await updateMenuOrder(editableMenuOrder);
    mysticAudio.playChime(639, 1.5);
    setActionSuccessMsg('✓ Сайтын хуудаснуудын дараалал амжилттай шинэчлэгдлээ!');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleResetMenuOrder = async () => {
    setEditableMenuOrder(DEFAULT_MENU_ORDER);
    await updateMenuOrder(DEFAULT_MENU_ORDER);
    mysticAudio.playChime(528, 1);
    setActionSuccessMsg('✓ Хуудасны дарааллыг анхны байрлал руу буцаалаа.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Pricing Form State inside Admin
  const [priceNumerologyInput, setPriceNumerologyInput] = useState<string>(String(planPrices.numerology));
  const [priceLoveInput, setPriceLoveInput] = useState<string>(String(planPrices.love));
  const [priceFullInput, setPriceFullInput] = useState<string>(String(planPrices.full));
  const [showQuickPriceEditor, setShowQuickPriceEditor] = useState<boolean>(false);

  useEffect(() => {
    setPriceNumerologyInput(String(planPrices.numerology));
    setPriceLoveInput(String(planPrices.love));
    setPriceFullInput(String(planPrices.full));
  }, [planPrices.numerology, planPrices.love, planPrices.full]);

  const handleSavePlanPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Math.max(0, Number(priceNumerologyInput.replace(/[^0-9]/g, '')) || 0);
    const lovePrice = Math.max(0, Number(priceLoveInput.replace(/[^0-9]/g, '')) || 0);
    const fullPrice = Math.max(0, Number(priceFullInput.replace(/[^0-9]/g, '')) || 0);

    await updatePlanPrices({
      numerology: numPrice,
      love: lovePrice,
      full: fullPrice,
    });
    mysticAudio.playChime(639, 2);
    setActionSuccessMsg(
      `✓ Сайтын төлбөрийн үнийн мэдээлэл амжилттай шинэчлэгдлээ! (Тоон зурхай: ${numPrice.toLocaleString()}₮, Хайр дурлал: ${lovePrice.toLocaleString()}₮, Бүтэн уншлага: ${fullPrice.toLocaleString()}₮)`
    );
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Login form fields
  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders data
  const [orders, setOrders] = useState<MysticOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Direct Activation fields
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPlan, setManualPlan] = useState<OrderPlan>('full');
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Admin Notification Settings state
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [adminEmailNotify, setAdminEmailNotify] = useState('amgalanbaatar652@gmail.com');
  const [isSavingNotifyConfig, setIsSavingNotifyConfig] = useState(false);
  const [isSendingTestNotify, setIsSendingTestNotify] = useState(false);

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [newOrderBanner, setNewOrderBanner] = useState<string | null>(null);
  const [testResultDetails, setTestResultDetails] = useState<{
    telegram?: string;
    webhook?: string;
    emailNotice?: string;
  } | null>(null);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);

  // Card Manager state inside Admin
  const [cardSearch, setCardSearch] = useState('');
  const [cardSuitFilter, setCardSuitFilter] = useState<'all' | 'major' | 'cups' | 'wands' | 'swords' | 'pentacles' | 'custom'>('all');
  const [uploadingCardId, setUploadingCardId] = useState<number | 'back' | null>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  // Shop Item Form state inside Admin
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopTitle, setShopTitle] = useState('');
  const [shopPrice, setShopPrice] = useState('35000');
  const [shopOriginalPrice, setShopOriginalPrice] = useState('');
  const [shopCategory, setShopCategory] = useState<'physical' | 'digital' | 'consultation'>('physical');
  const [shopBadge, setShopBadge] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopFeaturesText, setShopFeaturesText] = useState('');
  const [shopImageUrl, setShopImageUrl] = useState('');
  const shopImageFileRef = useRef<HTMLInputElement>(null);

  // Load orders from server database & sync
  const loadOrders = async (silent = false) => {
    if (!silent) setIsLoadingOrders(true);
    try {
      const serverOrders = await fetchServerOrders();
      setOrders((prev) => {
        if (prev.length > 0 && serverOrders.length > prev.length) {
          const newest = serverOrders[0];
          if (newest && newest.status === 'pending') {
            mysticAudio.playChime(784, 2);
            setNewOrderBanner(
              `🚨 ШИНЭ ТӨЛБӨР ИРЛЭЭ: ${newest.id} - ${newest.userName} (${newest.amount.toLocaleString()}₮)`
            );
            setTimeout(() => setNewOrderBanner(null), 8000);
          }
        }
        return serverOrders;
      });
    } catch {
      setOrders(getOrders());
    } finally {
      if (!silent) setIsLoadingOrders(false);
    }
  };

  const loadAdminEvents = async () => {
    try {
      const res = await fetch('/api/admin/events', {
        headers: { 'x-admin-token': 'mystic2026' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setAdminEvents(data.events);
      }
    } catch {}
  };

  const loadNotificationConfig = async () => {
    try {
      const res = await fetch('/api/admin/notifications-config', {
        headers: { 'x-admin-token': 'mystic2026' },
      });
      const data = await res.json();
      if (data.config) {
        setWebhookUrl(data.config.webhookUrl || '');
        setTelegramBotToken(data.config.telegramBotToken || '');
        setTelegramChatId(data.config.telegramChatId || '');
        setAdminEmailNotify(data.config.adminEmail || 'amgalanbaatar652@gmail.com');
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadNotificationConfig();
      loadAdminEvents();

      const timer = setInterval(() => {
        loadOrders(true);
        loadAdminEvents();
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedPassword = adminPassword.trim();
    if (VALID_PASSWORDS.includes(trimmedPassword)) {
      mysticAudio.playChime(639, 2);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
      localStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
      window.dispatchEvent(new Event('storage'));
      setIsAuthenticated(true);
      loadOrders();
    } else {
      mysticAudio.playChime(261, 1);
      setLoginError('Нууц үг буруу байна. (Нууц үг: mystic2026)');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event('storage'));
    setIsAuthenticated(false);
    setAdminPassword('');
    mysticAudio.playChime(432, 1);
  };

  // Approve order
  const handleApproveOrder = async (order: MysticOrder) => {
    mysticAudio.playChime(639, 2.5);
    const updated = await updateOrderStatusServer(order.id, 'active');
    setOrders(updated);

    try {
      localStorage.setItem('mystic_active_plan', order.planId);
      localStorage.setItem('mystic_current_user_email', order.userEmail);
      localStorage.setItem('mystic_current_user_name', order.userName);
      window.dispatchEvent(new Event('mystic_orders_updated'));
    } catch {}

    setActionSuccessMsg(
      `✓ Захиалга ${order.id} амжилттай баталгаажлаа! ${order.userName} (${order.userEmail})-ийн ${order.planName} эрх "Active" болж серверт хадгалагдлаа.`
    );

    if (onPlanActivated) {
      onPlanActivated(order.planId, order.userEmail);
    }

    loadAdminEvents();
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Reject order
  const handleRejectOrder = async (order: MysticOrder) => {
    const updated = await updateOrderStatusServer(order.id, 'rejected');
    setOrders(updated);
    setActionSuccessMsg(`Захиалга ${order.id} цуцлагдлаа.`);
    loadAdminEvents();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    const updated = await deleteOrderServer(orderId);
    setOrders(updated);
    setActionSuccessMsg(`Захиалга ${orderId} системээс устгагдлаа.`);
    loadAdminEvents();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Direct manual activation by admin
  const handleDirectActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const planName =
      manualPlan === 'full'
        ? 'БҮТЭН УНШЛАГА'
        : manualPlan === 'numerology'
        ? 'ТООН ЗУРХАЙН УНШЛАГА'
        : 'ХАЙР ДУРЛАЛЫН УНШЛАГА';
    const amount =
      manualPlan === 'full'
        ? planPrices.full
        : manualPlan === 'numerology'
        ? planPrices.numerology
        : planPrices.love;

    const newOrder: MysticOrder = {
      id: `MYS-${randomNum}`,
      userName: manualName || 'Гараар нээсэн хэрэглэгч',
      userEmail: manualEmail.trim(),
      userPhone: 'Гараар идэвхжүүлсэн',
      planId: manualPlan,
      planName,
      amount,
      bankName: 'Админ гараар нээсэн',
      transferNote: `MYS-${randomNum} Админ шууд эрх`,
      status: 'active',
      createdAt: new Date().toLocaleString('mn-MN'),
      approvedAt: new Date().toLocaleString('mn-MN'),
    };

    saveOrder(newOrder);
    await loadOrders();

    try {
      localStorage.setItem('mystic_active_plan', manualPlan);
      localStorage.setItem('mystic_current_user_email', manualEmail.trim());
      if (manualName) localStorage.setItem('mystic_current_user_name', manualName);
      window.dispatchEvent(new Event('mystic_orders_updated'));
    } catch {}

    if (onPlanActivated) {
      onPlanActivated(manualPlan, manualEmail.trim());
    }

    setActionSuccessMsg(
      `✓ ${manualEmail} хэрэглэгчийн ${planName} эрхийг шууд идэвхжүүллээ!`
    );
    setManualEmail('');
    setManualName('');
    setShowManualAdd(false);
    mysticAudio.playChime(639, 2);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Add sample test pending order
  const handleCreateTestOrder = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const isFull = Math.random() > 0.5;
    const testOrder: MysticOrder = {
      id: `MYS-${randomNum}`,
      userName: `Шинэ Захиалагч #${randomNum}`,
      userEmail: `user${randomNum}@gmail.com`,
      userPhone: `99${Math.floor(100000 + Math.random() * 900000)}`,
      planId: isFull ? 'full' : 'love',
      planName: isFull ? 'БҮТЭН УНШЛАГА' : 'ХАЙР ДУРЛАЛЫН УНШЛАГА',
      amount: isFull ? planPrices.full : planPrices.love,
      bankName: 'Хаан банк',
      transferNote: `MYS-${randomNum} шилжүүлэг`,
      status: 'pending',
      createdAt: new Date().toLocaleString('mn-MN'),
    };
    saveOrder(testOrder);
    await loadOrders();
    mysticAudio.playChime(528, 1);
    setActionSuccessMsg(
      `✓ Тест захиалга ${testOrder.id} серверт бүртгэгдлээ. "Баталгаажуулах / Эрх нээх" дарж шалгана уу.`
    );
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleSaveNotificationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifyConfig(true);
    try {
      const res = await fetch('/api/admin/notifications-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'mystic2026',
        },
        body: JSON.stringify({
          webhookUrl,
          telegramBotToken,
          telegramChatId,
          adminEmail: adminEmailNotify,
        }),
      });
      const data = await res.json();
      if (data.success) {
        mysticAudio.playChime(639, 2);
        setActionSuccessMsg('✓ Админ мэдэгдлийн тохиргоо серверт амжилттай хадгалагдлаа!');
        loadAdminEvents();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch {} finally {
      setIsSavingNotifyConfig(false);
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTestNotify(true);
    setTestResultDetails(null);
    try {
      const res = await fetch('/api/admin/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'mystic2026',
        },
      });
      const data = await res.json();
      if (data.success) {
        mysticAudio.playChime(528, 2);
        setTestResultDetails(data.results);
        setActionSuccessMsg('✓ Тест захиалгын мэдэгдэл боловсруулагдлаа!');
        loadAdminEvents();
        loadOrders();
        setTimeout(() => setActionSuccessMsg(null), 6000);
      }
    } catch {} finally {
      setIsSendingTestNotify(false);
    }
  };

  // Card image direct upload handler inside Admin
  const handleTriggerCardUpload = (cardId: number | 'back') => {
    setUploadingCardId(cardId);
    cardFileInputRef.current?.click();
  };

  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingCardId === null) return;
    try {
      await saveCardImage(uploadingCardId, file);
      mysticAudio.playChime(639, 1.8);
      setActionSuccessMsg(
        uploadingCardId === 'back'
          ? '✓ Хөзрийн ар талын зураг амжилттай шинэчлэгдлээ!'
          : `✓ Хөзөр #${uploadingCardId}-ийн зураг амжилттай шинэчлэгдлээ!`
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch {} finally {
      setUploadingCardId(null);
      if (cardFileInputRef.current) cardFileInputRef.current.value = '';
    }
  };

  // Shop form helpers
  const openAddShopItemForm = () => {
    setEditingShopItem(null);
    setShopTitle('');
    setShopPrice('35000');
    setShopOriginalPrice('');
    setShopCategory('physical');
    setShopBadge('Шинэ');
    setShopDescription('');
    setShopFeaturesText('Дээд зэргийн чанар\nХүргэлт үнэгүй');
    setShopImageUrl('');
    setShowShopForm(true);
  };

  const openEditShopItemForm = (item: ShopItem) => {
    setEditingShopItem(item);
    setShopTitle(item.title);
    setShopPrice(String(item.price));
    setShopOriginalPrice(item.originalPrice ? String(item.originalPrice) : '');
    setShopCategory(item.category);
    setShopBadge(item.badge || '');
    setShopDescription(item.description);
    setShopFeaturesText((item.features || []).join('\n'));
    setShopImageUrl(item.imageUrl);
    setShowShopForm(true);
  };

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await optimizeCardImage(file);
      setShopImageUrl(dataUrl);
      mysticAudio.playChime(528, 1);
    } catch {} finally {
      if (shopImageFileRef.current) shopImageFileRef.current.value = '';
    }
  };

  const handleSaveShopItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopTitle.trim()) return;

    const featuresList = shopFeaturesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    await saveShopItem({
      id: editingShopItem?.id,
      title: shopTitle.trim(),
      price: Number(shopPrice) || 0,
      originalPrice: shopOriginalPrice ? Number(shopOriginalPrice) : undefined,
      category: shopCategory,
      badge: shopBadge.trim() || undefined,
      description: shopDescription.trim(),
      features: featuresList.length > 0 ? featuresList : ['Өндөр чанартай бүтээгдэхүүн'],
      imageUrl:
        shopImageUrl.trim() ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    });

    mysticAudio.playChime(639, 2);
    setActionSuccessMsg(
      editingShopItem
        ? `✓ "${shopTitle}" барааны мэдээлэл амжилттай шинэчлэгдлээ!`
        : `✓ "${shopTitle}" шинэ бараа дэлгүүрт амжилттай нэмэгдлээ!`
    );
    setShowShopForm(false);
    setEditingShopItem(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userPhone.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  // Filtered Tarot Cards for Admin Card Customizer Tab
  const filteredAdminCards = TAROT_DECK.filter((c) => {
    if (cardSuitFilter === 'custom' && !isCardCustomized(c.id)) return false;
    if (cardSuitFilter === 'major' && c.arcana !== 'Major') return false;
    if (cardSuitFilter === 'cups' && c.suit !== 'cups') return false;
    if (cardSuitFilter === 'wands' && c.suit !== 'wands') return false;
    if (cardSuitFilter === 'swords' && c.suit !== 'swords') return false;
    if (cardSuitFilter === 'pentacles' && c.suit !== 'pentacles') return false;
    if (!cardSearch.trim()) return true;
    const q = cardSearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      String(c.number).includes(q)
    );
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const activeOrders = orders.filter((o) => o.status === 'active').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'active')
    .reduce((sum, o) => sum + o.amount, 0);

  const adminDirectUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/secret-admin` : '/secret-admin';

  // =========================================================================
  // VIEW 1: SECURE ADMIN LOGIN SCREEN (Unauthenticated Gate)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140D12] text-[#F5E6E1] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EAC7C7]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#28161E] border border-[#DEB76A]/40 mx-auto flex items-center justify-center text-[#E8C582] shadow-xl">
              <Lock className="w-8 h-8 text-[#E8C582]" />
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#E8C582] font-serif font-semibold">
              <span>✦</span>
              <span>ТУСДАА НУУЦ СИСТЕМ</span>
              <span>✦</span>
            </div>
            <h1 className="text-3xl font-mystic font-bold text-[#FFF5F2]">
              MYSTIC Админ Нэвтрэх
            </h1>
            <p className="text-xs text-[#DEC0B7] leading-relaxed max-w-sm mx-auto">
              Захиалга баталгаажуулалт, хөзрийн зураг болон дэлгүүрийн барааг удирдах тусдаа нууц удирдлагын хэсэг.
            </p>
          </div>

          <div className="rounded-3xl bg-[#23151D]/90 border border-[#9C6E65]/40 p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-serif tracking-wider text-[#DEC0B7] mb-1.5 font-semibold">
                  Администраторын Имэйл
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@mystic.mn"
                  className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-sm text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-serif tracking-wider text-[#DEC0B7] mb-1.5 font-semibold">
                  Админ Нууц Үг
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 pr-11 text-sm text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DEC0B7] hover:text-white p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-[#1A1016] border border-[#9C6E65]/25 text-[11px] text-[#D8BCB4] flex items-center justify-between">
                <span>Анхдагч нууц үг:</span>
                <button
                  type="button"
                  onClick={() => setAdminPassword('mystic2026')}
                  className="font-mono text-[#E8C582] hover:underline font-bold cursor-pointer"
                >
                  mystic2026
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Админ Системд Нэвтрэх</span>
              </button>
            </form>
          </div>

          <div className="text-center">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 text-xs text-[#DEC0B7] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Үндсэн вебсайт руу буцах</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SECRET ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#160E14] text-[#F8EAE5] py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Hidden file inputs for card & shop image uploads */}
      <input
        type="file"
        ref={cardFileInputRef}
        onChange={handleCardFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={shopImageFileRef}
        onChange={handleShopImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Admin Navigation Bar */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#9C6E65]/30 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-serif tracking-[0.25em] text-[#E8C582] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#E8C582]" />
            <span>MYSTIC ТУСДАА АДМИН СИСТЕМ (/SECRET-ADMIN · /ADMIN)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mystic font-bold text-[#FFF6F3]">
            Удирдлагын Төв Самбар
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#DEC0B7]">
            <span>Тусдаа нэвтрэх линк:</span>
            <code className="px-2 py-0.5 rounded bg-[#281721] text-[#E8C582] font-mono text-[11px] border border-[#DEB76A]/30">
              {adminDirectUrl}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(adminDirectUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="px-2 py-0.5 rounded bg-[#281721] hover:bg-[#36202D] text-[11px] text-[#E8C582] inline-flex items-center gap-1 cursor-pointer border border-[#DEB76A]/30"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Хуулагдлаа' : 'Линк хуулах'}</span>
            </button>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveAdminSection('background')}
            className="px-3.5 py-2 rounded-xl bg-[#281721] border border-[#E8C582]/50 hover:bg-[#341F2B] text-xs font-serif font-bold text-[#E8C582] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Video className="w-3.5 h-3.5 text-[#E8C582]" />
            <span>Сайтын дэвсгэр солих</span>
          </button>

          <button
            onClick={() => openCustomizer()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8E441D] to-[#A65427] hover:opacity-95 text-xs font-serif font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-[#E8C582]/40"
          >
            <Palette className="w-3.5 h-3.5 text-[#FCEBE6]" />
            <span>Хөзрийн багц засах цонх</span>
          </button>

          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="px-3.5 py-2 rounded-xl bg-[#281721] border border-[#DEB76A]/40 hover:bg-[#341F2B] text-xs font-serif font-semibold text-[#E8C582] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-[#E8C582]" />
            <span>Мэдэгдлийн тохиргоо</span>
          </button>

          <button
            onClick={onBackToSite}
            className="px-4 py-2 rounded-xl border border-[#DEC0B7]/40 hover:bg-white/10 text-xs font-serif font-medium text-[#F8EAE5] transition-colors cursor-pointer"
          >
            Үндсэн сайт руу очих
          </button>

          <button
            onClick={handleLogout}
            title="Системээс гарах"
            className="p-2 rounded-xl bg-[#3A1821] hover:bg-[#4E202C] text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary 5 Admin Section Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#22141C] border border-[#9C6E65]/35">
          <button
            onClick={() => setActiveAdminSection('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'orders'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Захиалга & Төлбөр ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                {pendingOrders} хүлээгдэж буй
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminSection('pricing')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'pricing'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>
              2. Төлбөрийн Үнэ ({formatPrice(planPrices.numerology)} / {formatPrice(planPrices.love)} / {formatPrice(planPrices.full)})
            </span>
          </button>

          <button
            onClick={() => setActiveAdminSection('cards')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'cards'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. Хөзрийн Зураг ({customizedCount}/78)</span>
          </button>

          <button
            onClick={() => setActiveAdminSection('shop')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'shop'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              4. Дэлгүүр ({shopEnabled ? 'Нээлттэй' : 'Хаалттай'} · {shopItems.length})
            </span>
          </button>

          <button
            onClick={() => setActiveAdminSection('background')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'background'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>
              5. Дэвсгэр & Liquid Glass ({siteBackground.type === 'video' ? 'Бичлэг' : siteBackground.type === 'image' ? 'Зураг' : 'Өнгө'} · Blur {siteBackground.headerGlassBlur ?? 16}px)
            </span>
          </button>

          <button
            onClick={() => setActiveAdminSection('menu-order')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminSection === 'menu-order'
                ? 'bg-[#E8C582] text-[#221319] shadow-md'
                : 'text-[#DEC0B7] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6. Хуудасны Дараалал ({ editableMenuOrder.length })</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Real-Time Incoming Order Alert Banner */}
        {newOrderBanner && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-[#381B10] to-amber-950 border-2 border-amber-400 text-amber-200 text-sm font-bold flex items-center justify-between gap-3 animate-pulse shadow-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔔</span>
              <span>{newOrderBanner}</span>
            </div>
            <button
              onClick={() => setNewOrderBanner(null)}
              className="text-xs px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 cursor-pointer"
            >
              Хаах ✕
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionSuccessMsg}</span>
          </div>
        )}

        {/* Collapsible Admin Notification Settings */}
        {showNotificationSettings && (
          <div className="p-6 rounded-3xl bg-[#23151D] border-2 border-[#E8C582]/50 shadow-xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#9C6E65]/25 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#E8C582]" />
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#E8C582]">
                    Админ Мэдэгдлийн Тохиргоо (Webhook & Telegram Bot)
                  </h3>
                  <p className="text-[11px] text-[#DEC0B7]">
                    Хэрэглэгч төлбөр төлөх товч дармагц энэхүү тохируулсан сувгуудаар админд шууд мэдээлэгдэнэ.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="text-xs text-[#DEC0B7] hover:text-white cursor-pointer"
              >
                Хаах ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotificationConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-serif tracking-wider text-[#DEC0B7] font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#E8C582]" />
                    <span>Webhook URL (Discord / Slack / Custom)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase font-serif tracking-wider text-[#DEC0B7] font-semibold">
                    Админ Мэдэгдэл Хүлээн Авах Имэйл
                  </label>
                  <input
                    type="email"
                    placeholder="amgalanbaatar652@gmail.com"
                    value={adminEmailNotify}
                    onChange={(e) => setAdminEmailNotify(e.target.value)}
                    className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#190E15] border border-[#9C6E65]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#E8C582]">
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Bot Мэдэгдэл</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#DEC0B7] mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      placeholder="BotFather-аас авсан токен..."
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      className="w-full bg-[#140B11] border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#DEC0B7] mb-1">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      placeholder="Жишээ: 123456789"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full bg-[#140B11] border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>
                </div>
              </div>

              {testResultDetails && (
                <div className="p-4 rounded-2xl bg-[#150B13] border border-[#E8C582]/50 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/50 border border-stone-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#DEB76A] block">Telegram Bot:</span>
                      <p className="font-mono text-[11px] text-amber-300">{testResultDetails.telegram}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-stone-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#DEB76A] block">Webhook:</span>
                      <p className="font-mono text-[11px] text-amber-300">{testResultDetails.webhook}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={isSendingTestNotify}
                  className="px-4 py-2 rounded-xl border border-[#E8C582]/40 bg-[#2D1B26] hover:bg-[#3D2534] text-xs font-serif font-bold text-[#E8C582] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTestNotify ? 'animate-spin' : ''}`} />
                  <span>{isSendingTestNotify ? 'Илгээж байна...' : '🔔 Тест Мэдэгдэл Шалгах'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingNotifyConfig}
                  className="px-6 py-2.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  {isSavingNotifyConfig ? 'Хадгалж байна...' : 'Тохиргоо Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 1: ORDERS & USER ACTIVATION MANAGEMENT
            ========================================================================= */}
        {activeAdminSection === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowManualAdd(!showManualAdd)}
                  className="px-4 py-2 rounded-xl bg-[#281721] border border-[#DEB76A]/40 hover:bg-[#341F2B] text-xs font-serif font-semibold text-[#E8C582] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#E8C582]" />
                  <span>Хэрэглэгчид гараар эрх нээх</span>
                </button>

                <button
                  onClick={() => setShowQuickPriceEditor(!showQuickPriceEditor)}
                  className="px-4 py-2 rounded-xl bg-[#281721] border border-[#E8C582]/50 hover:bg-[#341F2B] text-xs font-serif font-semibold text-[#E8C582] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#E8C582]" />
                  <span>Төлбөрийн үнэ өөрчлөх</span>
                </button>

                <button
                  onClick={handleCreateTestOrder}
                  className="px-4 py-2 rounded-xl bg-[#281721] border border-[#9C6E65]/40 hover:bg-[#341F2B] text-xs font-serif font-semibold text-[#F5E6E1] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E8C582]" />
                  <span>Туршилтын захиалга нэмэх</span>
                </button>
              </div>

              <button
                onClick={() => loadOrders()}
                disabled={isLoadingOrders}
                className="px-4 py-2 rounded-xl bg-[#281721] border border-[#DEB76A]/40 hover:bg-[#341F2B] text-xs font-serif font-semibold text-[#E8C582] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                <span>Захиалга шинэчлэх</span>
              </button>
            </div>

            {/* Collapsible Quick Price Editor inside Orders Tab */}
            {showQuickPriceEditor && (
              <div className="p-6 rounded-3xl bg-[#23151D] border-2 border-[#E8C582]/50 shadow-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#9C6E65]/25 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#E8C582]" />
                    <div>
                      <h3 className="text-sm font-serif font-bold text-[#E8C582]">
                        Уншлагын Багцуудын Төлбөрийн Үнийг Өөрчлөх
                      </h3>
                      <p className="text-[11px] text-[#DEC0B7]">
                        Энд өөрчилсөн үнэ сайтын бүх хуудас, цэс болон төлбөрийн модал цонхон дээр шууд шинэчлэгдэнэ.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuickPriceEditor(false)}
                    className="text-xs text-[#DEC0B7] hover:text-white cursor-pointer"
                  >
                    Хаах ✕
                  </button>
                </div>

                <form onSubmit={handleSavePlanPrices} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Тоон Зурхай (₮)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      required
                      value={priceNumerologyInput}
                      onChange={(e) => setPriceNumerologyInput(e.target.value)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Хайр Дурлал (₮)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      required
                      value={priceLoveInput}
                      onChange={(e) => setPriceLoveInput(e.target.value)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Бүтэн Уншлага (₮)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      required
                      value={priceFullInput}
                      onChange={(e) => setPriceFullInput(e.target.value)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isShopSaving}
                    className="py-2.5 px-4 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isShopSaving ? 'Хадгалж байна...' : 'Үнэ Хадгалах'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Collapsible Direct User Activation Form */}
            {showManualAdd && (
              <div className="p-6 rounded-3xl bg-[#23151D] border border-[#E8C582]/40 shadow-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#9C6E65]/25 pb-3">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#E8C582]">
                    <UserCheck className="w-4 h-4 text-[#E8C582]" />
                    <span>Хэрэглэгчийн Имэйлээр Шууд Багцын Эрх Нээх</span>
                  </div>
                  <button
                    onClick={() => setShowManualAdd(false)}
                    className="text-xs text-[#DEC0B7] hover:text-white cursor-pointer"
                  >
                    Хаах ✕
                  </button>
                </div>

                <form onSubmit={handleDirectActivation} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Хэрэглэгчийн Имэйл
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Хэрэглэгчийн Нэр
                    </label>
                    <input
                      type="text"
                      placeholder="Билгүүн"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                      Идэвхжүүлэх Багц
                    </label>
                    <select
                      value={manualPlan}
                      onChange={(e) => setManualPlan(e.target.value as OrderPlan)}
                      className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-3.5 py-2 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                    >
                      <option value="full">БҮТЭН УНШЛАГА ({formatPrice(planPrices.full)})</option>
                      <option value="love">ХАЙР ДУРЛАЛЫН УНШЛАГА ({formatPrice(planPrices.love)})</option>
                      <option value="numerology">ТООН ЗУРХАЙН УНШЛАГА ({formatPrice(planPrices.numerology)})</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Шууд Эрх Нээх</span>
                  </button>
                </form>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#23151D] border border-[#9C6E65]/30 shadow-md space-y-1">
                <div className="flex items-center justify-between text-xs text-[#D8BCB4]">
                  <span className="font-serif">Нийт Захиалга</span>
                  <Users className="w-4 h-4 text-[#E8C582]" />
                </div>
                <div className="text-3xl font-mystic font-bold text-[#FFF5F2] tabular-nums">
                  {totalOrders}
                </div>
                <p className="text-[11px] text-[#B89C94]">Бүх бүртгэлүүд</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#2B1B15] border-2 border-amber-500/60 shadow-md space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span className="font-serif">Шалгагдаж буй</span>
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div className="text-3xl font-mystic font-bold text-amber-200 tabular-nums">
                  {pendingOrders}
                </div>
                <p className="text-[11px] text-amber-300/80">Зөвшөөрөл хүлээж буй</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#142318] border border-emerald-500/60 shadow-md space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                  <span className="font-serif">Идэвхжсэн</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-mystic font-bold text-emerald-200 tabular-nums">
                  {activeOrders}
                </div>
                <p className="text-[11px] text-emerald-300/80">Баталгаажсан хэрэглэгчид</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#23151D] border border-[#9C6E65]/30 shadow-md space-y-1">
                <div className="flex items-center justify-between text-xs text-[#D8BCB4]">
                  <span className="font-serif">Баталгаажсан Орлого</span>
                  <DollarSign className="w-4 h-4 text-[#E8C582]" />
                </div>
                <div className="text-3xl font-mystic font-bold text-[#E8C582] tabular-nums">
                  {totalRevenue.toLocaleString()}₮
                </div>
                <p className="text-[11px] text-[#B89C94]">Идэвхтэй захиалгуудын дүн</p>
              </div>
            </div>

            {/* Filter and Table Container */}
            <div className="p-5 rounded-3xl bg-[#20131A] border border-[#9C6E65]/35 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-[#180E14] rounded-full border border-[#9C6E65]/30 overflow-x-auto">
                  {[
                    { id: 'all', label: `Бүгд (${orders.length})` },
                    { id: 'pending', label: `Шалгагдаж буй (${pendingOrders})` },
                    { id: 'active', label: `Идэвхжсэн (${activeOrders})` },
                    { id: 'rejected', label: `Цуцлагдсан` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-4 py-1.5 text-xs font-serif rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === tab.id
                          ? 'bg-[#E8C582] text-[#221319] font-bold shadow-sm'
                          : 'text-[#D8BCB4] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#E8C582] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Код, нэр, имэйл, утсаар хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl pl-9 pr-4 py-2 text-xs text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#9C6E65]/30 bg-[#190F16]">
                <table className="w-full text-left text-xs text-[#EEDCD6]">
                  <thead className="bg-[#26151F] text-[#E8C582] font-serif uppercase tracking-wider text-[11px] border-b border-[#9C6E65]/30">
                    <tr>
                      <th className="py-3 px-4">Захиалгын Код</th>
                      <th className="py-3 px-4">Хэрэглэгч</th>
                      <th className="py-3 px-4">Сонгосон Багц / Бараа</th>
                      <th className="py-3 px-4">Төлбөрийн Дүн</th>
                      <th className="py-3 px-4">Гүйлгээний Утга</th>
                      <th className="py-3 px-4">Огноо</th>
                      <th className="py-3 px-4">Төлөв</th>
                      <th className="py-3 px-4 text-right">Админы Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#9C6E65]/15 font-sans">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                          Тохирох захиалга олдсонгүй.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#E8C582]">
                            {order.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#FFF5F2]">{order.userName}</div>
                            <div className="text-[11px] text-[#DEC0B7]">{order.userEmail}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{order.userPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-serif font-bold text-[#F8EAE5]">
                              {order.planName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-sm text-[#E8C582]">
                            {order.amount.toLocaleString()}₮
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-[#F0D5CD]">{order.transferNote}</div>
                            <div className="text-[10px] text-stone-400">{order.bankName}</div>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#D8BCB4] whitespace-nowrap">
                            {order.createdAt}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {order.status === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/70">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>Шалгагдаж байна</span>
                              </span>
                            )}
                            {order.status === 'active' && (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/70">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Идэвхтэй</span>
                                </span>
                                {order.used ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-800 text-stone-300 border border-stone-600">
                                    ✓ Уншлага авсан (1/1 дууссан)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/70 text-[#E8C582] border border-[#E8C582]/40">
                                    ● 1 удаа унших эрх нээлттэй
                                  </span>
                                )}
                              </div>
                            )}
                            {order.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/70">
                                <XCircle className="w-3 h-3" />
                                <span>Цуцлагдсан</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {order.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveOrder(order)}
                                    className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Баталгаажуулах / Эрх нээх</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order)}
                                    className="px-2.5 py-1.5 rounded-full border border-rose-600/60 text-rose-300 hover:bg-rose-950/50 font-serif text-[11px] transition-colors cursor-pointer"
                                  >
                                    Цуцлах
                                  </button>
                                </>
                              ) : order.status === 'active' ? (
                                <span className="text-[11px] text-emerald-300 font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40">
                                  ✓ Эрх нээгдсэн
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-500">Цуцлагдсан</span>
                              )}

                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Захиалгыг устгах"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TAROT CARD IMAGE CUSTOMIZER (78 CARDS + CARD BACK)
            ========================================================================= */}
        {activeAdminSection === 'cards' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Card Back Banner */}
            <div className="p-6 rounded-3xl bg-[#23151D] border border-[#E8C582]/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-24 h-36 rounded-2xl overflow-hidden border-2 border-[#E8C582] shadow-lg shrink-0 bg-[#140B10] relative group">
                  <img
                    src={cardBackImage}
                    alt="Card Back"
                    className="w-full h-full object-cover"
                  />
                  {isCardBackCustomized && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                      Сольсон
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#E8C582] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Таро Хөзрүүдийн Зураг Удирдах Хэсэг</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3]">
                    Хөзрийн Ар Тал & 78 Хөзрийн Зураг Солих
                  </h2>
                  <p className="text-xs text-[#DEC0B7] max-w-xl leading-relaxed">
                    Та эндээс хөзрийн ар талын зураг болон 78 хөзөр тус бүрийн зургийг өөрийн хүссэн зургаар сольж хадгалах боломжтой. Өөрчилсөн зураг бүх уншлага дээр шууд харагдана.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerCardUpload('back')}
                      disabled={isCardSaving}
                      className="px-4 py-2 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ар талын зураг солих</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCardBackCustomizer()}
                      className="px-4 py-2 rounded-xl bg-[#2E1A26] hover:bg-[#3A2130] border border-[#E8C582]/40 text-[#E8C582] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Бэлэн загваруудаас сонгох</span>
                    </button>

                    {isCardBackCustomized && (
                      <button
                        type="button"
                        onClick={() => removeCardImage('back')}
                        className="px-3 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-950/50 text-xs font-serif flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Анхны зураг руу буцаах</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openCustomizer()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8E441D] to-[#A65427] text-white text-xs font-serif font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Дэлгэрэнгүй зураг засах цонх нээх</span>
                </button>
                {customizedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => resetAllCards()}
                    className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs font-serif flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Бүх хөзрийг анхны төлөвт буцаах ({customizedCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Bar for 78 Cards */}
            <div className="p-5 rounded-3xl bg-[#20131A] border border-[#9C6E65]/35 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Бүх 78 хөзөр' },
                    { id: 'major', label: 'Major Arcana (22)' },
                    { id: 'cups', label: 'Cups (Цом)' },
                    { id: 'wands', label: 'Wands (Саваа)' },
                    { id: 'swords', label: 'Swords (Илд)' },
                    { id: 'pentacles', label: 'Pentacles (Зоос)' },
                    { id: 'custom', label: `Өөрчилсөн (${customizedCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCardSuitFilter(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                        cardSuitFilter === tab.id
                          ? 'bg-[#E8C582] text-[#221319] font-bold shadow-sm'
                          : 'bg-[#180E14] text-[#D8BCB4] hover:text-white border border-[#9C6E65]/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-[#E8C582] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Хөзрийн нэр, дугаараар хайх..."
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl pl-9 pr-4 py-2 text-xs text-[#FFF5F2] placeholder:text-stone-500 focus:outline-none focus:border-[#E8C582]"
                  />
                </div>
              </div>

              {/* Grid of Cards with Direct Upload & Reset */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAdminCards.map((card) => {
                  const imgSrc = getCardImage(card.id, card.image);
                  const isCustom = isCardCustomized(card.id);

                  return (
                    <div
                      key={card.id}
                      className={`rounded-2xl p-3 border transition-all flex flex-col justify-between space-y-2.5 ${
                        isCustom
                          ? 'bg-[#281622] border-[#E8C582]'
                          : 'bg-[#180E14] border-[#9C6E65]/30 hover:border-[#E8C582]/50'
                      }`}
                    >
                      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#10090E] border border-[#DEB76A]/30">
                        <img
                          src={imgSrc}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[#E8C582] text-[10px] font-serif font-bold">
                          #{card.number}
                        </span>
                        {isCustom && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                            Шинэ
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 text-center">
                        <h4 className="text-xs font-serif font-bold text-[#FFF5F2] truncate" title={card.name}>
                          {card.name}
                        </h4>
                        <p className="text-[10px] text-[#DEC0B7] truncate">{card.nameEn}</p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleTriggerCardUpload(card.id)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] text-[11px] font-serif font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Зураг солих</span>
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => removeCardImage(card.id)}
                            title="Анхны зураг руу буцаах"
                            className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SHOP MANAGEMENT (OPEN/CLOSE SHOP + ADD/EDIT/DELETE PRODUCTS)
            ========================================================================= */}
        {activeAdminSection === 'shop' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Shop Status Toggle & Add Product Header */}
            <div className="p-6 rounded-3xl bg-[#23151D] border border-[#E8C582]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#E8C582] uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Дэлгүүрийн (Shop) Төлөв ба Барааны Удирдлага</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-mystic font-bold text-[#FFF6F3]">
                  Дэлгүүр: {shopEnabled ? '🟢 НЭЭЛТТЭЙ БАЙНА' : '🔴 ХААЛТТАЙ БАЙНА'}
                </h2>
                <p className="text-xs text-[#DEC0B7] max-w-xl leading-relaxed">
                  Та дэлгүүрийн хэсгийг үндсэн сайт дээр харуулах эсвэл түр хаах, мөн барааны нэр, зураг, үнэ зэргийг өөрчлөх болон шинэ бараа нэмэх боломжтой.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    toggleShopEnabled(!shopEnabled);
                    mysticAudio.playChime(528, 1.5);
                    setActionSuccessMsg(
                      !shopEnabled
                        ? '✓ Дэлгүүрийн хэсэг үндсэн сайт дээр НЭЭГДЛЭЭ!'
                        : '✓ Дэлгүүрийн хэсэг үндсэн сайт дээр ХААГДЛАА!'
                    );
                    setTimeout(() => setActionSuccessMsg(null), 4000);
                  }}
                  className={`px-5 py-3 rounded-2xl font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                    shopEnabled
                      ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {shopEnabled ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      <span>Дэлгүүрийг Хаах</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      <span>Дэлгүүрийг Нээх</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={openAddShopItemForm}
                  className="px-5 py-3 rounded-2xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Шинэ Бараа Нэмэх</span>
                </button>
              </div>
            </div>

            {/* Add / Edit Shop Product Modal or Collapsible Form */}
            {showShopForm && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#261620] border-2 border-[#E8C582] shadow-2xl space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#9C6E65]/30 pb-3">
                  <h3 className="text-lg font-mystic font-bold text-[#E8C582]">
                    {editingShopItem ? `Бараа засах: ${editingShopItem.title}` : 'Шинэ Бараа Нэмэх'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShopForm(false);
                      setEditingShopItem(null);
                    }}
                    className="text-xs text-[#DEC0B7] hover:text-white cursor-pointer"
                  >
                    Хаах ✕
                  </button>
                </div>

                <form onSubmit={handleSaveShopItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Барааны Нэр
                      </label>
                      <input
                        type="text"
                        required
                        value={shopTitle}
                        onChange={(e) => setShopTitle(e.target.value)}
                        placeholder="Жишээ: Rider-Waite Таро Хөзөр"
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Ангилал
                      </label>
                      <select
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value as any)}
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      >
                        <option value="physical">Бодит бүтээгдэхүүн (Хүргэлттэй)</option>
                        <option value="digital">Цахим ном & PDF</option>
                        <option value="consultation">Хувийн зөвлөгөө</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Зарах Үнэ (₮)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={shopPrice}
                        onChange={(e) => setShopPrice(e.target.value)}
                        placeholder="35000"
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Хямдралын өмнөх үнэ (Заавал биш)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={shopOriginalPrice}
                        onChange={(e) => setShopOriginalPrice(e.target.value)}
                        placeholder="45000"
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Онцлох Шошго (Заавал биш)
                      </label>
                      <input
                        type="text"
                        value={shopBadge}
                        onChange={(e) => setShopBadge(e.target.value)}
                        placeholder="Жишээ: Шилдэг борлуулалт"
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>
                  </div>

                  {/* Image Upload or URL */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase font-serif text-[#DEC0B7] font-semibold">
                      Барааны Зураг (Компьютероос оруулах эсвэл линк тавих)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      {shopImageUrl && (
                        <img
                          src={shopImageUrl}
                          alt="Preview"
                          className="w-24 h-16 rounded-xl object-cover border border-[#E8C582]/50 shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        value={shopImageUrl}
                        onChange={(e) => setShopImageUrl(e.target.value)}
                        placeholder="Зургийн URL эсвэл баруун талын товчоор зураг хуулна уу..."
                        className="flex-1 w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                      <button
                        type="button"
                        onClick={() => shopImageFileRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#2E1A26] hover:bg-[#3A2130] border border-[#E8C582]/50 text-[#E8C582] text-xs font-serif font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Зураг хуулах</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Дэлгэрэнгүй Тайлбар
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={shopDescription}
                        onChange={(e) => setShopDescription(e.target.value)}
                        placeholder="Барааны дэлгэрэнгүй танилцуулга..."
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1 font-semibold">
                        Давуу талууд (Мөр тус бүрт 1 онцлог бичнэ)
                      </label>
                      <textarea
                        rows={3}
                        value={shopFeaturesText}
                        onChange={(e) => setShopFeaturesText(e.target.value)}
                        placeholder={'78 бүрэн хөзөр\nМонгол гарын авлагатай\nХүргэлт үнэгүй'}
                        className="w-full bg-[#180E14] border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowShopForm(false);
                        setEditingShopItem(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-[#9C6E65]/40 text-xs text-[#DEC0B7] hover:text-white cursor-pointer"
                    >
                      Болих
                    </button>
                    <button
                      type="submit"
                      disabled={isShopSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
                    >
                      {isShopSaving
                        ? 'Хадгалж байна...'
                        : editingShopItem
                        ? 'Өөрчлөлтийг Хадгалах'
                        : 'Шинэ Бараа Нэмэх'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Shop Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shopItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#20131A] border border-[#9C6E65]/40 overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div className="relative aspect-[16/10] bg-[#140B10]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#8E441D] text-white text-[10px] font-serif font-bold">
                        {item.badge}
                      </span>
                    )}
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded bg-black/70 text-[#E8C582] text-[10px]">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-base font-mystic font-bold text-[#FFF5F2] line-clamp-1">
                        {item.title}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-mystic font-bold text-[#E8C582]">
                          {item.price.toLocaleString()}₮
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            {item.originalPrice.toLocaleString()}₮
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#DEC0B7] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#9C6E65]/25">
                      <button
                        type="button"
                        onClick={() => openEditShopItemForm(item)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] text-xs font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Засах (Нэр, зураг, үнэ)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteShopItem(item.id);
                          mysticAudio.playChime(396, 1);
                          setActionSuccessMsg(`"${item.title}" бараа устгагдлаа.`);
                          setTimeout(() => setActionSuccessMsg(null), 3000);
                        }}
                        title="Барааг устгах"
                        className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PRICING MANAGEMENT (ТӨЛБӨРИЙН ҮНЭ ӨӨРЧЛӨХ ХЭСЭГ)
            ========================================================================= */}
        {activeAdminSection === 'pricing' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#23151D] border-2 border-[#E8C582]/45 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#9C6E65]/25 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-serif tracking-widest text-[#E8C582]">
                    <DollarSign className="w-4 h-4" />
                    <span>Сайтын Үнийн Удирдлага</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#FFF5F2]">
                    Төлбөрийн Үнийг Өөрчлөх Хэсэг
                  </h2>
                  <p className="text-xs sm:text-sm text-[#DEC0B7]">
                    Та доорх уншлагын багцуудын үнийг өөрчилж хадгалснаар сайтын бүх хуудас, цэс болон төлбөрийн модал цонхон дээрх үнийн мэдээлэл шууд шинэчлэгдэнэ.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setPriceNumerologyInput('9900');
                    setPriceLoveInput('9900');
                    setPriceFullInput('19900');
                    await updatePlanPrices({
                      numerology: 9900,
                      love: 9900,
                      full: 19900,
                    });
                    mysticAudio.playChime(528, 1.5);
                    setActionSuccessMsg('Анхны үнийн тохиргоог (9,900₮ / 9,900₮ / 19,900₮) сэргээлээ.');
                    setTimeout(() => setActionSuccessMsg(null), 4000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#2B1923] hover:bg-[#38212E] border border-[#9C6E65]/40 text-xs font-serif font-bold text-[#DEC0B7] hover:text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Анхны үнэ рүү буцаах</span>
                </button>
              </div>

              <form onSubmit={handleSavePlanPrices} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Numerology Price Card */}
                  <div className="p-6 rounded-2xl bg-[#180E14] border border-[#E8C582]/35 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-serif tracking-wider text-[#E8C582] font-bold">
                        1. Тоон Зурхай
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8C582]/15 text-[#E8C582] text-xs font-bold">
                        Одоо: {formatPrice(planPrices.numerology)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-mystic font-bold text-[#FFF5F2]">
                        Пифагорын Тоон Зурхай
                      </h4>
                      <p className="text-xs text-[#B89C94] mt-0.5">
                        Тоон зурхай цэс болон төлбөрийн модал дээр харагдах үнэ
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1.5 font-semibold">
                        Шинэ Үнэ (Төгрөгөөр - ₮)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        required
                        value={priceNumerologyInput}
                        onChange={(e) => setPriceNumerologyInput(e.target.value)}
                        className="w-full bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-3 text-base font-bold text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>
                  </div>

                  {/* 2. Love Reading Price Card */}
                  <div className="p-6 rounded-2xl bg-[#180E14] border border-[#E8C582]/35 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-serif tracking-wider text-[#E8C582] font-bold">
                        2. Хайр Дурлалын Уншлага
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8C582]/15 text-[#E8C582] text-xs font-bold">
                        Одоо: {formatPrice(planPrices.love)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-mystic font-bold text-[#FFF5F2]">
                        Хайр Дурлал & Сэтгэл Зүй
                      </h4>
                      <p className="text-xs text-[#B89C94] mt-0.5">
                        Хайр дурлал цэс, Нүүр хуудас болон Багцууд дээр харагдах үнэ
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1.5 font-semibold">
                        Шинэ Үнэ (Төгрөгөөр - ₮)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        required
                        value={priceLoveInput}
                        onChange={(e) => setPriceLoveInput(e.target.value)}
                        className="w-full bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-3 text-base font-bold text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>
                  </div>

                  {/* 3. Full Reading Price Card */}
                  <div className="p-6 rounded-2xl bg-[#180E14] border border-[#E8C582]/35 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-serif tracking-wider text-[#E8C582] font-bold">
                        3. Бүтэн Уншлага
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8C582]/15 text-[#E8C582] text-xs font-bold">
                        Одоо: {formatPrice(planPrices.full)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-mystic font-bold text-[#FFF5F2]">
                        Амьдралын Гүнзгийрүүлсэн Тайлал
                      </h4>
                      <p className="text-xs text-[#B89C94] mt-0.5">
                        Бүтэн уншлага цэс, Нүүр хуудас болон Багцууд дээр харагдах үнэ
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-serif text-[#DEC0B7] mb-1.5 font-semibold">
                        Шинэ Үнэ (Төгрөгөөр - ₮)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        required
                        value={priceFullInput}
                        onChange={(e) => setPriceFullInput(e.target.value)}
                        className="w-full bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-3 text-base font-bold text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isShopSaving}
                    className="px-8 py-3.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isShopSaving ? 'Хадгалж байна...' : 'Өөрчилсөн Үнийг Сайт Дээр Хадгалах'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: SITE BACKGROUND MANAGEMENT (САЙТЫН ДЭВСГЭР ӨНГӨ / ЗУРАГ / БИЧЛЭГ СОЛИХ)
            ========================================================================= */}
        {activeAdminSection === 'background' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Hidden file inputs for image & video upload */}
            <input
              ref={bgImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleBgImageFileUpload}
              className="hidden"
            />
            <input
              ref={bgVideoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/*"
              onChange={handleBgVideoFileUpload}
              className="hidden"
            />

            <div className="p-6 sm:p-8 rounded-3xl bg-[#23151D] border-2 border-[#E8C582]/45 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#9C6E65]/25 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-serif tracking-widest text-[#E8C582]">
                    <Palette className="w-4 h-4" />
                    <span>Сайтын Харагдах Байдал & Дэвсгэр</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#FFF5F2]">
                    Сайтын Дэвсгэрийг Өнгө, Зураг эсвэл Бичлэгээр Солих
                  </h2>
                  <p className="text-xs sm:text-sm text-[#DEC0B7]">
                    Та үндсэн сайтын дэвсгэрийг дурын өнгөөр будах, компьютероос зураг эсвэл хөдөлгөөнт бичлэг (видео) оруулах болон линк тавьж солих боломжтой.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetSiteBackground}
                  className="px-4 py-2.5 rounded-xl bg-[#2B1923] hover:bg-[#38212E] border border-[#9C6E65]/40 text-xs font-serif font-bold text-[#DEC0B7] hover:text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Анхны дэвсгэр рүү буцаах</span>
                </button>
              </div>

              <form onSubmit={handleSaveSiteBackground} className="space-y-6">
                {/* 1. Background Mode Selector (Color / Image / Video) */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-serif text-[#DEC0B7] font-semibold">
                    1. Дэвсгэрийн Төрөл Сонгох
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBgType('color')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        bgType === 'color'
                          ? 'bg-[#E8C582]/15 border-2 border-[#E8C582] text-[#FFF5F2] shadow-md'
                          : 'bg-[#180E14] border-[#9C6E65]/35 text-[#DEC0B7] hover:border-[#E8C582]/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#E8C582]/20 border border-[#E8C582]/40 flex items-center justify-center shrink-0">
                        <Palette className="w-5 h-5 text-[#E8C582]" />
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold">Дэвсгэр Өнгө</div>
                        <div className="text-[11px] text-[#B89C94]">Цул өнгө болон мананцар</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBgType('image')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        bgType === 'image'
                          ? 'bg-[#E8C582]/15 border-2 border-[#E8C582] text-[#FFF5F2] shadow-md'
                          : 'bg-[#180E14] border-[#9C6E65]/35 text-[#DEC0B7] hover:border-[#E8C582]/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#E8C582]/20 border border-[#E8C582]/40 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-[#E8C582]" />
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold">Дэвсгэр Зураг</div>
                        <div className="text-[11px] text-[#B89C94]">Зураг хуулах эсвэл URL тавих</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBgType('video')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        bgType === 'video'
                          ? 'bg-[#E8C582]/15 border-2 border-[#E8C582] text-[#FFF5F2] shadow-md'
                          : 'bg-[#180E14] border-[#9C6E65]/35 text-[#DEC0B7] hover:border-[#E8C582]/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#E8C582]/20 border border-[#E8C582]/40 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-[#E8C582]" />
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold">Дэвсгэр Бичлэг (Video)</div>
                        <div className="text-[11px] text-[#B89C94]">MP4/WebM бичлэг эсвэл линк</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Mode Specific Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left 7 columns: Controls */}
                  <div className="lg:col-span-7 space-y-5 p-6 rounded-2xl bg-[#180E14] border border-[#E8C582]/35">
                    {bgType === 'color' && (
                      <div className="space-y-4">
                        <h4 className="text-base font-mystic font-bold text-[#FFF5F2]">
                          Дэвсгэр Өнгө Сонгох
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-16 h-12 rounded-xl border border-[#E8C582]/50 bg-transparent cursor-pointer"
                          />
                          <div className="flex-1 min-w-[180px]">
                            <label className="block text-[11px] uppercase font-serif text-[#DEC0B7] mb-1">
                              Өнгөний Код (HEX)
                            </label>
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              placeholder="#DAB3AA"
                              className="w-full bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-2.5 text-sm font-mono text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                            />
                          </div>
                        </div>

                        {/* Preset Colors */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-serif text-[#DEC0B7] block">
                            Бэлэн өнгөний сонголтууд:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {[
                              { label: 'Mystic Rose (Анхны)', hex: '#DAB3AA', swatchClass: 'bg-[#DAB3AA]' },
                              { label: 'Цайвар Сувд (Parchment)', hex: '#F3EAE0', swatchClass: 'bg-[#F3EAE0]' },
                              { label: 'Алтан Шампань (Champagne)', hex: '#E6D3BE', swatchClass: 'bg-[#E6D3BE]' },
                              { label: 'Зөөлөн Лаванда (Lavender)', hex: '#D8CCE2', swatchClass: 'bg-[#D8CCE2]' },
                              { label: 'Маргад Ногоон (Celestial Sage)', hex: '#C9D6CE', swatchClass: 'bg-[#C9D6CE]' },
                              { label: 'Шөнийн Тэнгэр (Midnight)', hex: '#1E1118', swatchClass: 'bg-[#1E1118]' },
                            ].map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setBgColor(preset.hex)}
                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                                  bgColor.toLowerCase() === preset.hex.toLowerCase()
                                    ? 'border-[#E8C582] bg-[#2D1A24]'
                                    : 'border-[#9C6E65]/30 bg-[#22131B] hover:border-[#E8C582]/50'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-full border border-white/40 shrink-0 ${preset.swatchClass}`}
                                />
                                <span className="text-xs text-[#FFF5F2] truncate">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {bgType === 'image' && (
                      <div className="space-y-4">
                        <h4 className="text-base font-mystic font-bold text-[#FFF5F2]">
                          Дэвсгэр Зураг Оруулах
                        </h4>
                        <div className="space-y-2">
                          <label className="block text-xs uppercase font-serif text-[#DEC0B7] font-semibold">
                            Зургийн URL линк эсвэл компьютероос хуулах
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                              type="text"
                              value={bgImageUrl}
                              onChange={(e) => setBgImageUrl(e.target.value)}
                              placeholder="https://... эсвэл баруун талын товчоор зураг оруулна уу"
                              className="flex-1 bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                            />
                            <button
                              type="button"
                              onClick={() => bgImageInputRef.current?.click()}
                              disabled={isUploadingBgFile}
                              className="px-4 py-2.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingBgFile ? 'Уншиж байна...' : 'Зураг Оруулах'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Preset Mystic Background Images */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-serif text-[#DEC0B7] block">
                            Бэлэн мистик дэвсгэр зургууд:
                          </span>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              {
                                label: 'Ягаан Үүлс & Тэнгэр',
                                url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
                              },
                              {
                                label: 'Одтой Галактик & Мананцар',
                                url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
                              },
                              {
                                label: 'Алтан Нарны Туяа & Үүлс',
                                url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
                              },
                              {
                                label: 'Торгон Цайвар Дэвсгэр',
                                url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&auto=format&fit=crop&q=80',
                              },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setBgImageUrl(preset.url)}
                                className={`p-2 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                                  bgImageUrl === preset.url
                                    ? 'border-[#E8C582] bg-[#2D1A24]'
                                    : 'border-[#9C6E65]/30 bg-[#22131B] hover:border-[#E8C582]/50'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-10 h-8 rounded-lg object-cover shrink-0 border border-white/20"
                                />
                                <span className="text-xs text-[#FFF5F2] truncate">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {bgType === 'video' && (
                      <div className="space-y-4">
                        <h4 className="text-base font-mystic font-bold text-[#FFF5F2]">
                          Дэвсгэр Бичлэг (Видео) Оруулах
                        </h4>
                        <div className="space-y-2">
                          <label className="block text-xs uppercase font-serif text-[#DEC0B7] font-semibold">
                            Бичлэгийн URL (.mp4 / .webm) эсвэл компьютероос оруулах
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                              type="text"
                              value={bgVideoUrl}
                              onChange={(e) => setBgVideoUrl(e.target.value)}
                              placeholder="https://.../video.mp4 эсвэл баруун талын товчоор бичлэг оруулна уу"
                              className="flex-1 bg-[#24141D] border border-[#E8C582]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFF5F2] focus:outline-none focus:border-[#E8C582]"
                            />
                            <button
                              type="button"
                              onClick={() => bgVideoInputRef.current?.click()}
                              disabled={isUploadingBgFile}
                              className="px-4 py-2.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingBgFile ? 'Уншиж байна...' : 'Бичлэг Оруулах'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Preset Ambient Videos */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-serif text-[#DEC0B7] block">
                            Бэлэн хөдөлгөөнт дэвсгэр бичлэгүүд:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              {
                                label: '✨ Алтан Тоосонцор & Гэрэл (Golden Particles)',
                                url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
                              },
                              {
                                label: '🌸 Ягаан Үүлс & Тэнгэрийн Хөдөлгөөн',
                                url: 'https://assets.mixkit.co/videos/preview/mixkit-pink-sunset-clouds-time-lapse-4161-large.mp4',
                              },
                              {
                                label: '🌙 Шөнийн Оддын Орчил (Celestial Night)',
                                url: 'https://assets.mixkit.co/videos/preview/mixkit-turning-stars-in-the-night-sky-4158-large.mp4',
                              },
                              {
                                label: '🕯️ Зөөлөн Лааны Гэрэл & Энерги',
                                url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-gold-bokeh-light-background-32809-large.mp4',
                              },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setBgVideoUrl(preset.url)}
                                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                                  bgVideoUrl === preset.url
                                    ? 'border-[#E8C582] bg-[#2D1A24]'
                                    : 'border-[#9C6E65]/30 bg-[#22131B] hover:border-[#E8C582]/50'
                                }`}
                              >
                                <Video className="w-4 h-4 text-[#E8C582] shrink-0" />
                                <span className="text-xs text-[#FFF5F2] truncate">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overlay & Ambient Cloud Controls */}
                    <div className="pt-4 border-t border-[#9C6E65]/25 space-y-4">
                      {(bgType === 'image' || bgType === 'video') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#DEC0B7] mb-1">
                              <span>Дэвсгэр Бүдгэрүүлэлт (Overlay):</span>
                              <span className="font-bold text-[#E8C582]">{bgOverlayOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={85}
                              step={5}
                              value={bgOverlayOpacity}
                              onChange={(e) => setBgOverlayOpacity(Number(e.target.value))}
                              className="w-full accent-[#E8C582] cursor-pointer"
                            />
                            <p className="text-[11px] text-[#B89C94] mt-1">
                              Бичвэр тод уншигдахад зориулсан өнгөний уусалт (0% = зураг/бичлэг дангаараа)
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={bgOverlayColor}
                              onChange={(e) => setBgOverlayColor(e.target.value)}
                              className="w-12 h-10 rounded-xl border border-[#E8C582]/40 bg-transparent cursor-pointer shrink-0"
                            />
                            <div>
                              <span className="text-xs text-[#DEC0B7] block font-serif">
                                Уусалтын Туяаны Өнгө
                              </span>
                              <span className="text-[11px] font-mono text-[#E8C582]">
                                {bgOverlayColor}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-serif font-bold text-[#FFF5F2] block">
                            Зөөлөн мананцар туяа (Nebula Clouds)
                          </span>
                          <span className="text-[11px] text-[#B89C94]">
                            Дэвсгэр дээр мистик зөөлөн гэрлийн уусалт нэмэх
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBgShowNebula(!bgShowNebula)}
                          className="text-[#E8C582] cursor-pointer flex items-center gap-1.5 text-xs font-serif font-bold"
                        >
                          {bgShowNebula ? (
                            <>
                              <ToggleRight className="w-7 h-7 text-emerald-400" />
                              <span className="text-emerald-300">Идэвхтэй</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-7 h-7 text-stone-400" />
                              <span className="text-stone-400">Унтраасан</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Liquid Glass Header Panel & Blur Controls */}
                      <div className="pt-4 border-t border-[#9C6E65]/35 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#E8C582]">
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Сайтын Гарчгуудын Liquid Glass Панель & Blur Effect</span>
                            </div>
                            <span className="text-[11px] text-[#B89C94] block mt-0.5">
                              Сайтын хуудас бүрийн гарчиг болон дээд цэсний шилэн (Liquid Glass) бүрхүүлийн бүдгэрэлтийг тохируулах
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setHeaderGlassEnabled(!headerGlassEnabled)}
                            className="text-[#E8C582] cursor-pointer flex items-center gap-1.5 text-xs font-serif font-bold shrink-0"
                          >
                            {headerGlassEnabled ? (
                              <>
                                <ToggleRight className="w-7 h-7 text-emerald-400" />
                                <span className="text-emerald-300">Идэвхтэй</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-7 h-7 text-stone-400" />
                                <span className="text-stone-400">Унтраасан</span>
                              </>
                            )}
                          </button>
                        </div>

                        {headerGlassEnabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#22131B] border border-[#E8C582]/30">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-[#DEC0B7]">
                                <span>Шилэн Бүдгэрэлт (Blur Effect):</span>
                                <span className="font-mono font-bold text-[#E8C582]">{headerGlassBlur}px</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={40}
                                step={2}
                                value={headerGlassBlur}
                                onChange={(e) => setHeaderGlassBlur(Number(e.target.value))}
                                className="w-full accent-[#E8C582] cursor-pointer"
                              />
                              <div className="flex items-center justify-between text-[10px] text-[#B89C94]">
                                <span>0px (Тунгалаг)</span>
                                <span>16px (Стандарт)</span>
                                <span>40px (Гүн Кристал)</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-[#DEC0B7]">
                                <span>Шилэн Гадаргуугийн Тунгалагшилт:</span>
                                <span className="font-mono font-bold text-[#E8C582]">{headerGlassOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min={5}
                                max={85}
                                step={5}
                                value={headerGlassOpacity}
                                onChange={(e) => setHeaderGlassOpacity(Number(e.target.value))}
                                className="w-full accent-[#E8C582] cursor-pointer"
                              />
                              <div className="flex items-center justify-between text-[10px] text-[#B89C94]">
                                <span>5% (Маш нимгэн)</span>
                                <span>40% (Тэнцвэртэй)</span>
                                <span>85% (Тод сувдан)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right 5 columns: Live Preview Box */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-serif tracking-wider text-[#E8C582] font-bold">
                        Урьдчилсан Харагдац (Live Preview)
                      </span>
                      <span className="text-[11px] text-[#DEC0B7]">
                        {bgType === 'video' ? '🎬 Бичлэг' : bgType === 'image' ? '🖼️ Зураг' : '🎨 Өнгө'} · Blur {headerGlassEnabled ? `${headerGlassBlur}px` : 'Off'}
                      </span>
                    </div>

                    <style>{`
                      .admin-preview-bg { background-color: ${bgColor || '#DAB3AA'}; }
                      .admin-preview-overlay { background-color: ${bgOverlayColor || '#DAB3AA'}; opacity: ${Math.max(0, Math.min(90, bgOverlayOpacity)) / 100}; }
                      .admin-preview-liquid-glass {
                        background: ${
                          headerGlassEnabled
                            ? `linear-gradient(135deg, rgba(255, 253, 249, ${(Math.min(92, headerGlassOpacity + 15) / 100).toFixed(2)}) 0%, rgba(246, 232, 226, ${(headerGlassOpacity / 100).toFixed(2)}) 100%)`
                            : 'transparent'
                        };
                        backdrop-filter: ${headerGlassEnabled ? `blur(${headerGlassBlur}px) saturate(160%)` : 'none'};
                        -webkit-backdrop-filter: ${headerGlassEnabled ? `blur(${headerGlassBlur}px) saturate(160%)` : 'none'};
                        border: ${headerGlassEnabled ? '1px solid rgba(255, 255, 255, 0.55)' : '1px dashed rgba(255,255,255,0.25)'};
                      }
                    `}</style>
                    <div className="relative h-64 rounded-3xl border-2 border-[#E8C582]/50 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center admin-preview-bg">
                      {bgType === 'image' && bgImageUrl && (
                        <img
                          src={bgImageUrl}
                          alt="Background preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {bgType === 'video' && bgVideoUrl && (
                        <video
                          key={bgVideoUrl}
                          src={bgVideoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {(bgType === 'image' || bgType === 'video') && bgOverlayOpacity > 0 && (
                        <div className="absolute inset-0 admin-preview-overlay" />
                      )}

                      {bgShowNebula && (
                        <div className="absolute inset-0 bg-nebula-clouds opacity-60 pointer-events-none" />
                      )}

                      <div className="relative z-10 p-5 rounded-3xl shadow-xl max-w-xs space-y-1.5 admin-preview-liquid-glass">
                        <div className="text-[10px] uppercase tracking-widest text-[#8E441D] font-bold">
                          ✦ LIQUID GLASS ГАРЧИГ ✦
                        </div>
                        <div className="text-base font-mystic font-bold text-[#2A1118]">
                          Сайтын Гарчгийн Харагдац
                        </div>
                        <p className="text-[11px] text-[#542B34]">
                          Хуудас бүрийн гарчиг энэ Liquid Glass шилэн панель дотор (Blur: {headerGlassEnabled ? `${headerGlassBlur}px` : '0px'}) харагдана.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#9C6E65]/25">
                  <button
                    type="submit"
                    disabled={isShopSaving || isUploadingBgFile}
                    className="px-8 py-3.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isShopSaving ? 'Хадгалж байна...' : 'Дэвсгэр & Liquid Glass Хадгалах'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: PAGE / MENU ORDER & LIQUID GLASS QUICK CONTROLS
            ========================================================================= */}
        {activeAdminSection === 'menu-order' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#23151D] border-2 border-[#E8C582]/45 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#9C6E65]/25 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-serif tracking-widest text-[#E8C582]">
                    <Layers className="w-4 h-4" />
                    <span>Сайтын Бүтэц & Навигацийн Удирдлага</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#FFF5F2]">
                    Сайтын Хуудаснууд Байрлах Дараалал Өөрчлөх
                  </h2>
                  <p className="text-xs sm:text-sm text-[#DEC0B7]">
                    Сайтын дээд цэсэнд байрлах хуудаснуудын дарааллыг дээш (↑) болон доош (↓) шилжүүлэн өөрчлөх эсвэл түр нуух боломжтой.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetMenuOrder}
                    className="px-4 py-2.5 rounded-xl bg-[#2B1923] hover:bg-[#38212E] border border-[#9C6E65]/40 text-xs font-serif font-bold text-[#DEC0B7] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Анхны дараалал руу буцаах</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMenuOrder}
                    disabled={isShopSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isShopSaving ? 'Хадгалж байна...' : 'Дараалал Хадгалах'}</span>
                  </button>
                </div>
              </div>

              {/* Reorderable List of Site Pages */}
              <div className="space-y-3">
                {editableMenuOrder.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      item.enabled
                        ? 'bg-[#180E14] border-[#E8C582]/40 text-[#FFF5F2]'
                        : 'bg-[#140B10]/60 border-[#9C6E65]/20 text-stone-500 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-[#E8C582]/15 border border-[#E8C582]/40 flex items-center justify-center font-mono text-xs font-bold text-[#E8C582] shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-mystic font-bold flex items-center gap-2">
                          <span>{item.label}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#26151F] text-[#DEC0B7] border border-[#9C6E65]/30">
                            #{item.id}
                          </span>
                        </div>
                        <p className="text-xs text-[#B89C94]">
                          {idx === 0
                            ? 'Сайтын хамгийн эхний цэс болж харагдана'
                            : `${idx + 1}-р байрлалд харагдана`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleMenuItemEnabled(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#24141D] border border-[#9C6E65]/30 text-xs font-serif flex items-center gap-1.5 cursor-pointer hover:border-[#E8C582]/50"
                      >
                        {item.enabled ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-300 font-bold">Идэвхтэй</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-stone-500" />
                            <span className="text-stone-400">Нуусан</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveMenuItem(idx, 'up')}
                        title="Дээш шилжүүлэх"
                        className="p-2 rounded-xl bg-[#24141D] hover:bg-[#321C29] disabled:opacity-30 border border-[#E8C582]/30 text-[#E8C582] cursor-pointer transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === editableMenuOrder.length - 1}
                        onClick={() => handleMoveMenuItem(idx, 'down')}
                        title="Доош шилжүүлэх"
                        className="p-2 rounded-xl bg-[#24141D] hover:bg-[#321C29] disabled:opacity-30 border border-[#E8C582]/30 text-[#E8C582] cursor-pointer transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-[#9C6E65]/25">
                <button
                  type="button"
                  onClick={handleSaveMenuOrder}
                  disabled={isShopSaving}
                  className="px-8 py-3.5 rounded-xl bg-[#E8C582] hover:bg-[#F3D596] text-[#221319] font-serif font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isShopSaving ? 'Хадгалж байна...' : 'Хуудасны Дарааллыг Хадгалах'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
