import React, { useState, useRef, useMemo, useEffect } from 'react';
import { TAROT_DECK, CARD_BACK_IMAGE, TarotCard } from '../data/tarotData';
import { CARD_BACK_PRESETS, CardBackPreset } from '../data/cardBackPresets';
import { useCustomCards } from '../context/CustomCardsContext';
import {
  X,
  Upload,
  RotateCcw,
  Search,
  Download,
  FolderInput,
  Sparkles,
  Check,
  Eye,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Palette,
  Lock,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';

export const TarotCardCustomizerModal: React.FC = () => {
  const {
    customCards,
    getCardImage,
    isCardCustomized,
    customizedCount,
    saveCardImage,
    removeCardImage,
    cardBackImage,
    isCardBackCustomized,
    resetAllCards,
    exportDeck,
    importDeck,
    isCustomizerOpen,
    closeCustomizer,
    focusedCardId,
    isLoading,
    isAdmin,
    verifyAdminPassword,
  } = useCustomCards();

  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'back' | 'custom' | 'major' | 'cups' | 'wands' | 'swords' | 'pentacles'>('all');
  const [selectedCardId, setSelectedCardId] = useState<number | 'back' | null>(null);
  const [previewZoomCard, setPreviewZoomCard] = useState<TarotCard | 'back' | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isBackFlipped, setIsBackFlipped] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleCardInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // If opened with a focused card ID, select that card
  useEffect(() => {
    if (focusedCardId !== null) {
      setSelectedCardId(focusedCardId);
      if (focusedCardId === 'back') {
        setActiveTab('back');
      } else {
        const card = TAROT_DECK.find((c) => c.id === focusedCardId);
        if (card) {
          if (card.arcana === 'Major') setActiveTab('major');
          else if (card.suit) setActiveTab(card.suit as any);
        }
      }
    }
  }, [focusedCardId]);

  const filteredCards = useMemo(() => {
    return TAROT_DECK.filter((card) => {
      const isCustom = isCardCustomized(card.id);

      if (activeTab === 'custom' && !isCustom) return false;
      if (activeTab === 'major' && card.arcana !== 'Major') return false;
      if (activeTab === 'cups' && card.suit !== 'cups') return false;
      if (activeTab === 'wands' && card.suit !== 'wands') return false;
      if (activeTab === 'swords' && card.suit !== 'swords') return false;
      if (activeTab === 'pentacles' && card.suit !== 'pentacles') return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        card.name.toLowerCase().includes(q) ||
        card.nameEn.toLowerCase().includes(q) ||
        String(card.number).includes(q) ||
        (card.romanNumeral && card.romanNumeral.toLowerCase().includes(q)) ||
        card.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [activeTab, searchQuery, isCardCustomized]);

  if (!isCustomizerOpen) return null;

  // Security gate: only authenticated admin can view and customize card images
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#FBF3F0] border border-[#DEB76A]/60 shadow-2xl text-center space-y-4">
          <button
            onClick={closeCustomizer}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/70 hover:bg-white text-[#4D2630] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4D2630] text-[#E8C582] flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-mystic font-bold text-[#230F16]">
            Админы Эрх Шаардлагатай
          </h3>
          <p className="text-xs text-[#5C3841] leading-relaxed">
            Хөзрийн зургуудыг админаас өөр хүн солих боломжгүй. Та админы нууц үгээ оруулан нэвтэрнэ үү.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAdminLoginError(null);
              const ok = verifyAdminPassword(adminPassInput);
              if (!ok) {
                mysticAudio.playChime(261, 1);
                setAdminLoginError('Нууц үг буруу байна. (Нууц үг: mystic2026)');
              } else {
                mysticAudio.playChime(639, 2);
              }
            }}
            className="space-y-3 pt-2"
          >
            <input
              type="password"
              placeholder="Админы нууц үг..."
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              className="w-full bg-white border border-[#9C6E65]/40 rounded-xl px-4 py-2.5 text-xs text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
              autoFocus
            />
            {adminLoginError && (
              <p className="text-xs text-rose-600 font-semibold">{adminLoginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#4D2630] hover:bg-[#3D1D25] text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Нэвтрэх & Хөзөр засах
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (cardId: number | 'back', file: File) => {
    try {
      mysticAudio.playCardFlip();
      setUploadStatus(`Зургийг боловсруулж байна...`);
      await saveCardImage(cardId, file);
      mysticAudio.playChime(639, 1.8);
      setUploadStatus(`Амжилттай хадгаллаа!`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`Алдаа гарлаа: ${err?.message || 'Зураг хадгалж чадсангүй'}`);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importDeck(file);
      mysticAudio.playChime(639, 2);
      alert(`Амжилттай! ${count} хөзрийн зураг шинэчлэгдэн сэргээгдлээ.`);
    } catch (err: any) {
      alert(`Файл задлахад алдаа гарлаа: ${err?.message}`);
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleResetAllConfirm = async () => {
    if (window.confirm('Бүх 78 хөзрийн өөрчилсөн зургийг арилгаж, анхны үндсэн зураг руу буцаахдаа итгэлтэй байна уу?')) {
      await resetAllCards();
      mysticAudio.playChime(432, 1.5);
    }
  };

  const selectedCard = typeof selectedCardId === 'number'
    ? TAROT_DECK.find((c) => c.id === selectedCardId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FBF3F0] border border-[#DEB76A]/50 shadow-2xl overflow-hidden text-[#230F16]">
        
        {/* Top Header */}
        <div className="relative px-6 py-5 border-b border-[#DEB76A]/30 bg-gradient-to-r from-[#F6E6E1] via-[#FBF3F0] to-[#F6E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-serif uppercase tracking-[0.25em] gold-kicker font-bold text-[#8E441D]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Таро Картын Зураг Удирдах (Админ)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#230F16]">
              Хөзрүүдийн зургийг өөрчлөх
            </h2>
            <p className="text-xs sm:text-sm text-[#5C3841] font-sans">
              78 Таро хөзөр бүрт өөрийн хүссэн зургаа оруулж хувийн тавцангаа бүтээгээрэй. Бүх уншлага, таталтад шууд шинэчлэгдэнэ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Stats Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-[#EAD5CF] border border-[#DEB76A]/40 text-xs font-serif font-bold text-[#4D2630] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8E441D] animate-pulse" />
              <span>{customizedCount} / 78 өөрчилсөн</span>
            </div>

            <button
              onClick={closeCustomizer}
              className="p-2 rounded-full bg-white/70 hover:bg-white border border-[#9C6E65]/30 text-[#4D2630] hover:text-black transition-colors cursor-pointer"
              title="Хаах"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Mode Switcher (Front vs Back) */}
        <div className="px-6 py-2.5 bg-[#F6E6E1] border-b border-[#DEB76A]/30 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCardId(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab !== 'back'
                ? 'bg-[#4D2630] text-white shadow-md'
                : 'bg-white/70 text-[#5C3841] hover:bg-white hover:text-[#230F16]'
            }`}
          >
            <span>🎴 78 Хөзрийн Нүүрэн Зураг</span>
            <span className="text-[10px] opacity-80">({customizedCount}/78)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('back');
              setSelectedCardId('back');
            }}
            className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'back'
                ? 'bg-[#8E441D] text-white shadow-md'
                : 'bg-white/70 text-[#5C3841] hover:bg-white hover:text-[#230F16]'
            }`}
          >
            <span>🃏 Хөзрийн Арын Зураг (Card Back)</span>
          </button>
        </div>

        {/* Global Action Toolbar */}
        <div className="px-6 py-3.5 bg-white/60 border-b border-[#9C6E65]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          {activeTab !== 'back' ? (
            /* Search bar for cards */
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-[#8E5244] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Хөзрийн нэр, дугаараар хайх (Жишээ: Wheel, Тэнэг, 10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#9C6E65]/35 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2F171E] placeholder:text-[#9A7A80] focus:outline-none focus:border-[#8E5244]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-serif text-[#4D2630] font-semibold">
              <Sparkles className="w-4 h-4 text-[#8E441D]" />
              <span>Тарогийн бүх 78 хөзрийн ар талын загварыг эндээс тохируулна</span>
            </div>
          )}

          {/* Backup / Restore / Reset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportDeck}
              title="Таны оруулсан бүх хөзрийн зургуудыг JSON файлаар татаж хадгалах"
              className="px-3 py-1.5 rounded-lg bg-white border border-[#9C6E65]/30 hover:border-[#8E5244] text-[#4D2630] font-serif font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-stone-50"
            >
              <Download className="w-3.5 h-3.5 text-[#8E441D]" />
              <span>Татах (Backup)</span>
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              title="Өмнө нь татаж авсан хөзрийн цуглуулгыг сэргээх"
              className="px-3 py-1.5 rounded-lg bg-white border border-[#9C6E65]/30 hover:border-[#8E5244] text-[#4D2630] font-serif font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-stone-50"
            >
              <FolderInput className="w-3.5 h-3.5 text-[#8E441D]" />
              <span>Сэргээх (Import)</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {customizedCount > 0 && (
              <button
                onClick={handleResetAllConfirm}
                title="Бүх картын өөрчилсөн зургийг арилгах"
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-serif font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Бүгдийг цэвэрлэх</span>
              </button>
            )}
          </div>
        </div>

        {/* Suit Tabs - only displayed when browsing card fronts */}
        {activeTab !== 'back' && (
          <div className="px-6 pt-3 pb-2 bg-[#F6E8E3]/60 border-b border-[#9C6E65]/15 flex items-center gap-1.5 overflow-x-auto text-xs font-serif">
            {[
              { id: 'all', label: `Бүх хөзөр (78)` },
              { id: 'custom', label: `Шинэчилсэн (${customizedCount})` },
              { id: 'major', label: 'Major Arcana (22)' },
              { id: 'cups', label: 'Аяга (Cups)' },
              { id: 'wands', label: 'Таяг (Wands)' },
              { id: 'swords', label: 'Илд (Swords)' },
              { id: 'pentacles', label: 'Зоос (Pentacles)' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'bg-[#4D2630] text-white shadow-sm font-bold'
                      : 'bg-white/60 text-[#5C3841] hover:bg-white hover:text-[#230F16]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Upload Status Alert if active */}
        {uploadStatus && (
          <div className="px-6 py-2 bg-[#F3D7CD] border-b border-[#DEB76A]/40 text-xs text-[#4D2630] font-serif font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8E441D] animate-spin" />
              {uploadStatus}
            </span>
            <button onClick={() => setUploadStatus(null)} className="text-stone-600 hover:text-black">✕</button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Card Back Special View */}
          {activeTab === 'back' ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Header Banner */}
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 text-[11px] uppercase font-serif tracking-[0.25em] text-[#8E441D] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>78 Хөзрийн Ар Талын Зураг Тохируулах</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-mystic font-bold text-[#230F16]">
                  Хөзрийн Ар Тал (Card Back Studio)
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3841] font-sans">
                  Та өөрийн хүссэн зургаа шууд файл оруулан солих эсвэл доорх бэлэн тансаг сүнслэг загваруудаас нэг товшилтоор сонгох боломжтой.
                </p>
              </div>

              {/* Main 2-Column Studio Area */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Left Column: 3D Flip Card Interactive Preview */}
                <div className="md:col-span-5 flex flex-col items-center space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#8E441D]">
                      {isBackFlipped ? 'Нүүрэн тал (Front Face)' : 'Арын тал (Back Face)'}
                    </span>
                    <p className="text-[10px] text-[#5C3841]">
                      Картан дээр дарж 3D эргүүлэн шалгана уу
                    </p>
                  </div>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => {
                      setIsBackFlipped((prev) => !prev);
                      mysticAudio.playCardFlip();
                    }}
                    className="w-56 h-84 perspective-[1000px] cursor-pointer group"
                  >
                    <div
                      className={`relative w-full h-full duration-700 transform-style-3d transition-transform shadow-2xl rounded-2xl ${
                        isBackFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Back Face (Shown initially) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border-2 border-[#DEB76A] bg-[#0E1520] shadow-2xl">
                        <img
                          src={getCardImage('back', CARD_BACK_IMAGE)}
                          alt="Card Back"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-1.5 rounded-xl border border-[#DEB76A]/30 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-[#2F171E] bg-[#FFF2ED] px-3 py-0.5 rounded-full font-serif font-bold tracking-wider shadow">
                            Эргүүлж харах ↻
                          </span>
                        </div>
                      </div>

                      {/* Front Face (Shown when flipped) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border-2 border-[#DEB76A] bg-[#0F1622] shadow-2xl rotate-y-180 p-3 text-center flex flex-col justify-between">
                        <div className="border-b border-[#DEB76A]/20 pb-1 flex justify-between text-[10px] text-[#E8C582] font-serif font-bold">
                          <span>N° X</span>
                          <span>Major Arcana</span>
                        </div>
                        <div className="w-28 h-36 mx-auto rounded-xl overflow-hidden border border-[#DEB76A]/40 my-auto shadow">
                          <img
                            src={getCardImage(10, '/tarot/wheel-of-fortune.png')}
                            alt="Front sample"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="border-t border-[#DEB76A]/20 pt-1">
                          <h4 className="text-xs font-serif font-bold text-[#FFF6F2]">Wheel of Fortune</h4>
                          <span className="text-[9px] text-[#E8C582]">(Жишээ нүүрэн тал)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick flip button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsBackFlipped((prev) => !prev);
                      mysticAudio.playCardFlip();
                    }}
                    className="text-xs font-serif font-semibold text-[#8E441D] hover:text-[#5E260D] inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>3D Эргүүлэх ({isBackFlipped ? 'Арын тал руу' : 'Нүүрэн тал руу'})</span>
                  </button>
                </div>

                {/* Right Column: Upload Zone & Preset Themes */}
                <div className="md:col-span-7 space-y-6">
                  {/* Upload Card Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload('back', file);
                    }}
                    className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all text-center space-y-4 ${
                      isDragOver
                        ? 'border-[#8E441D] bg-[#FFEAE3] scale-[1.01]'
                        : 'border-[#DEB76A]/60 bg-white hover:border-[#8E441D]/70'
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#F6E8E3] border border-[#DEB76A]/40 flex items-center justify-center text-[#8E441D]">
                      <Upload className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-serif font-bold text-[#230F16]">
                        Өөрийн хүссэн зургийг оруулах
                      </h4>
                      <p className="text-xs text-[#5C3841]">
                        Зургаа энд чирч тавих (Drag & Drop) эсвэл доорх товч дээр даран төхөөрөмжөөсөө сонгоно уу.
                      </p>
                      <p className="text-[10px] text-stone-400">
                        PNG, JPG, WEBP, SVG файлуудыг дэмжинэ (Автомат оновчлолтой)
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 rounded-full bg-[#8E441D] hover:bg-[#703112] text-white font-serif font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Компьютер / Утаснаас зураг сонгох</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('back', file);
                        }}
                      />

                      {isCardCustomized('back') && (
                        <button
                          onClick={() => {
                            removeCardImage('back');
                            mysticAudio.playChime(528, 1.5);
                          }}
                          className="px-4 py-3 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-serif font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Анхны хэвэнд буцаах</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Themes Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#230F16]">
                        <Palette className="w-4 h-4 text-[#8E441D]" />
                        <span>Бэлэн тансаг загварууд (Preset Themes)</span>
                      </div>
                      <span className="text-[10px] text-[#6E4215] font-sans">Нэг даралтаар шууд солих</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CARD_BACK_PRESETS.map((preset) => {
                        const isCurrentActive =
                          (preset.id === 'original' && !isCardCustomized('back')) ||
                          customCards['back'] === preset.image;

                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              if (preset.id === 'original') {
                                removeCardImage('back');
                              } else {
                                saveCardImage('back', preset.image);
                              }
                              mysticAudio.playChime(639, 1.5);
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-center relative group bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                              isCurrentActive
                                ? 'border-[#8E441D] ring-2 ring-[#8E441D]/40 bg-[#FFF5F1]'
                                : 'border-[#DEB76A]/40 hover:border-[#8E441D]'
                            }`}
                          >
                            {/* Preset Thumbnail */}
                            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-[#DEB76A]/40 bg-[#0F1622] mb-2 shadow-xs relative">
                              <img
                                src={preset.image}
                                alt={preset.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {isCurrentActive && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="w-6 h-6 rounded-full bg-[#8E441D] text-white flex items-center justify-center text-xs font-bold shadow">
                                    ✓
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="text-[11px] font-serif font-bold text-[#230F16] truncate">
                                {preset.name}
                              </h5>
                              <p className="text-[9px] text-[#7A4E58] line-clamp-1">
                                {preset.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              className={`mt-2 w-full py-1 rounded-lg text-[10px] font-serif font-bold transition-colors cursor-pointer ${
                                isCurrentActive
                                  ? 'bg-[#8E441D] text-white'
                                  : 'bg-[#F6E8E3] text-[#5C3841] group-hover:bg-[#8E441D] group-hover:text-white'
                              }`}
                            >
                              {isCurrentActive ? 'Идэвхтэй' : 'Сонгох'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Selected Card Focus Bar if a single card is highlighted */}
              {selectedCard && (
                <div className="p-4 sm:p-6 rounded-2xl bg-[#FFF5F1] border-2 border-[#8E441D]/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-32 rounded-xl overflow-hidden border border-[#DEB76A] shadow-md shrink-0 relative bg-black">
                      <img
                        src={getCardImage(selectedCard.id, selectedCard.image)}
                        alt={selectedCard.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-serif text-[#8E441D] font-bold">
                        <span>N° {selectedCard.romanNumeral || selectedCard.number}</span>
                        <span>·</span>
                        <span>{selectedCard.arcana} Arcana</span>
                      </div>
                      <h3 className="text-xl font-mystic font-bold text-[#230F16]">
                        {selectedCard.name}
                      </h3>
                      <p className="text-xs text-[#6C3F49] mt-0.5">
                        {selectedCard.nameEn} · {selectedCard.element}
                      </p>
                      <p className="text-[11px] text-[#5C3841] mt-1 line-clamp-1 italic">
                        {selectedCard.uprightMeaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                      onClick={() => singleCardInputRef.current?.click()}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-[#8E441D] hover:bg-[#723314] text-white text-xs font-serif font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Өөрийн зураг оруулах</span>
                    </button>
                    <input
                      ref={singleCardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(selectedCard.id, file);
                      }}
                    />

                    {isCardCustomized(selectedCard.id) && (
                      <button
                        onClick={() => removeCardImage(selectedCard.id)}
                        className="px-4 py-2.5 rounded-full border border-[#8E441D]/30 text-[#8E441D] hover:bg-white text-xs font-serif font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        title="Анхны үндсэн зураг руу буцаах"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Буцаах</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedCardId(null)}
                      className="px-3 py-2.5 rounded-full border border-stone-300 text-stone-600 hover:text-black hover:bg-white text-xs font-serif"
                    >
                      Болих
                    </button>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              {filteredCards.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#EAD5CF] flex items-center justify-center text-2xl text-[#8E441D]">
                    ✦
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#230F16]">
                    Тохирох хөзөр олдсонгүй
                  </h4>
                  <p className="text-xs text-[#5C3841]">
                    Хайлтын үгээ өөрчлөх эсвэл өөр ангилал сонгоно уу.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                  {filteredCards.map((card) => {
                    const isCustom = isCardCustomized(card.id);
                    const currentImg = getCardImage(card.id, card.image);
                    const isSelected = selectedCardId === card.id;

                    return (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`group relative p-2.5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md ${
                          isSelected
                            ? 'border-[#8E441D] ring-2 ring-[#8E441D]/40 bg-[#FFF5F1]'
                            : isCustom
                            ? 'border-[#DEB76A] bg-[#FFFBF9]'
                            : 'border-[#9C6E65]/25 hover:border-[#8E441D]/60'
                        }`}
                      >
                        {/* Artwork Container */}
                        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative border border-[#DEB76A]/40 bg-[#0F1622] group-hover:border-[#DEB76A]">
                          <img
                            src={currentImg}
                            alt={card.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none">
                            <span className="px-1.5 py-0.5 rounded bg-black/60 text-[#E8C582] text-[9px] font-serif font-bold backdrop-blur-xs">
                              {card.romanNumeral || card.number}
                            </span>
                          </div>

                          {/* Hover Overlay with Upload Action */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
                            <label
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-full bg-[#8E441D] hover:bg-[#703112] text-[10px] font-serif font-bold uppercase tracking-wider cursor-pointer shadow flex items-center gap-1 text-white"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Зураг солих</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileUpload(card.id, f);
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewZoomCard(card);
                              }}
                              className="px-2.5 py-1 rounded-full bg-white/30 hover:bg-white/50 text-[9px] font-serif font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Харах</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Info Footer */}
                        <div className="mt-2 text-center">
                          <h4 className="text-[11px] font-serif font-bold text-[#230F16] truncate">
                            {card.name}
                          </h4>
                          <p className="text-[9px] text-[#7A4E58] truncate">
                            {card.nameEn}
                          </p>
                        </div>

                        {/* Reset button if custom */}
                        {isCustom && (
                          <div className="mt-1 pt-1 border-t border-[#9C6E65]/15 flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCardImage(card.id);
                              }}
                              className="text-[9px] text-[#8E441D] hover:text-[#5B2510] font-serif font-semibold inline-flex items-center gap-1 cursor-pointer"
                              title="Анхны зураг руу буцаах"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Буцаах</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-[#DEB76A]/30 bg-[#F6E6E1] flex items-center justify-between text-xs text-[#5C3841] font-serif">
          <div className="flex items-center gap-2">
            <span className="text-[#8E441D]">✦</span>
            <span>Таны оруулсан бүх зураг аюулгүй хадгалагдаж, хөзөр таталт бүрт шууд ашиглагдана.</span>
          </div>
          <button
            onClick={closeCustomizer}
            className="px-6 py-2 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold uppercase tracking-wider text-xs cursor-pointer shadow"
          >
            Болсон (Хаах)
          </button>
        </div>
      </div>

      {/* Large Image Preview Modal */}
      {previewZoomCard && (
        <div
          onClick={() => setPreviewZoomCard(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#0F1622] rounded-3xl p-4 border border-[#DEB76A] shadow-2xl text-center space-y-3"
          >
            <button
              onClick={() => setPreviewZoomCard(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:text-[#DEB76A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {previewZoomCard === 'back' ? (
              <div className="space-y-3">
                <h4 className="text-sm font-serif font-bold text-[#E8C582]">Хөзрийн ар тал</h4>
                <div className="w-64 h-96 mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#DEB76A]/60">
                  <img
                    src={getCardImage('back', CARD_BACK_IMAGE)}
                    alt="Card Back"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs uppercase font-serif tracking-widest text-[#E8C582] font-bold">
                  N° {previewZoomCard.romanNumeral || previewZoomCard.number} · {previewZoomCard.arcana} Arcana
                </span>
                <h3 className="text-xl font-mystic font-bold text-[#FFF6F2]">
                  {previewZoomCard.name}
                </h3>
                <div className="w-64 h-96 mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#DEB76A]/60">
                  <img
                    src={getCardImage(previewZoomCard.id, previewZoomCard.image)}
                    alt={previewZoomCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-[#DEC5A0] italic">
                  {previewZoomCard.symbolism}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
