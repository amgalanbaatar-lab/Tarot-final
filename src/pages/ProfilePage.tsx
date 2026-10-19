import React, { useState, useEffect } from 'react';
import { UserAccount } from '../components/AuthModal';
import { MysticOrder, getOrders } from '../types/order';
import {
  User,
  Sparkles,
  Heart,
  Crown,
  Copy,
  Check,
  Compass,
  LogOut,
  Trash2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { mysticAudio } from '../utils/audio';
import { FormattedReading, cleanMarkdownText, cleanHeaderTitle } from '../components/FormattedReading';

interface ProfilePageProps {
  currentUser: UserAccount | null;
  activePlan: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateToTab: (tabId: string) => void;
  onNavigateToAdmin?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  activePlan,
  onOpenAuth,
  onLogout,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'tarot' | 'numerology' | 'orders'>('all');
  const [tarotHistory, setTarotHistory] = useState<any[]>([]);
  const [numerologyHistory, setNumerologyHistory] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<MysticOrder[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItemForView, setSelectedItemForView] = useState<any | null>(null);

  const loadUserHistory = () => {
    try {
      const readings = JSON.parse(localStorage.getItem('mystic_readings_history') || '[]');
      setTarotHistory(Array.isArray(readings) ? readings : []);
    } catch {
      setTarotHistory([]);
    }

    try {
      const nums = JSON.parse(localStorage.getItem('mystic_numerology_history') || '[]');
      setNumerologyHistory(Array.isArray(nums) ? nums : []);
    } catch {
      setNumerologyHistory([]);
    }

    try {
      const orders = getOrders();
      const myEmail = currentUser?.email?.toLowerCase();
      const myOrders = orders.filter((o) =>
        myEmail ? o.userEmail?.toLowerCase() === myEmail : true
      );
      setUserOrders(myOrders);
    } catch {
      setUserOrders([]);
    }
  };

  useEffect(() => {
    loadUserHistory();
    window.addEventListener('mystic_history_updated', loadUserHistory);
    window.addEventListener('mystic_orders_updated', loadUserHistory);
    window.addEventListener('storage', loadUserHistory);
    return () => {
      window.removeEventListener('mystic_history_updated', loadUserHistory);
      window.removeEventListener('mystic_orders_updated', loadUserHistory);
      window.removeEventListener('storage', loadUserHistory);
    };
  }, [currentUser]);

  // Combine tarotHistory and any standalone numerologyHistory items without duplicates
  const combinedArchive = React.useMemo(() => {
    const list: any[] = [...tarotHistory];
    const seenIds = new Set(list.map((i) => i.id));
    for (const num of numerologyHistory) {
      if (num && num.id && !seenIds.has(num.id)) {
        seenIds.add(num.id);
        list.push({
          ...num,
          category: 'numerology',
          type: num.title || 'Пифагорын Тоон Зурхай',
          cards: [
            `Замын тоо: ${num.lifePath || '-'}`,
            `Төрсөн өдөр: ${num.birthdayNumber || '-'}`,
          ],
        });
      }
    }
    return list;
  }, [tarotHistory, numerologyHistory]);

  const paidArchive = React.useMemo(
    () =>
      combinedArchive.filter(
        (item) =>
          item.category === 'love' ||
          item.category === 'full' ||
          item.category === 'numerology' ||
          item.type === 'numerology'
      ),
    [combinedArchive]
  );

  const tarotOnlyArchive = React.useMemo(
    () =>
      combinedArchive.filter(
        (item) =>
          item.category === 'tarot' ||
          item.category === 'love' ||
          item.category === 'full' ||
          item.category === 'horoscope' ||
          (!item.category && item.type !== 'numerology')
      ),
    [combinedArchive]
  );

  const numerologyOnlyArchive = React.useMemo(
    () =>
      combinedArchive.filter(
        (item) => item.category === 'numerology' || item.type === 'numerology'
      ),
    [combinedArchive]
  );

  const getFullItemText = (item: any): string => {
    if (!item) return '';
    if (item.reading) return item.reading;
    if (item.content) return item.content;
    if (item.details?.content) return item.details.content;
    if (item.details?.sections) {
      const s = item.details.sections;
      return [
        s.overview ? `1. Ерөнхий зураг:\n${s.overview}` : '',
        s.deepDive ? `2. Сэтгэл зүй ба мэдрэмж:\n${s.deepDive}` : '',
        s.career ? `2. Ажил мэргэжил ба замнал:\n${s.career}` : '',
        s.karmic ? `3. Хувь заяаны холбоо:\n${s.karmic}` : '',
        s.finance ? `3. Санхүү ба баялаг:\n${s.finance}` : '',
        s.energyExchange ? `4. Сэтгэлийн тэнцвэрт байдал:\n${s.energyExchange}` : '',
        s.growth ? `4. Хувь хүний дотоод өсөлт:\n${s.growth}` : '',
        s.emotionalBlocks ? `5. Сэтгэл хөдлөлийн саад:\n${s.emotionalBlocks}` : '',
        s.health ? `5. Эрүүл мэнд ба эрч хүч:\n${s.health}` : '',
        s.timeline ? `6. Цаг хугацааны баримжаа:\n${s.timeline}` : '',
        s.decision ? `6. Чухал шийдвэр ба сонголт:\n${s.decision}` : '',
        s.scenarios ? `7. Боломжит хувилбарууд:\n${s.scenarios}` : '',
        s.talents ? `7. Далд авьяас ба боломжууд:\n${s.talents}` : '',
        s.actionableAdvice ? `8. Бодит зөвлөгөө:\n${s.actionableAdvice}` : '',
        s.customQA ? `8. Таны хувийн асуултын хариу:\n${s.customQA}` : '',
        s.affirmation ? `✨ Сэтгэлийн батламж:\n"${s.affirmation}"` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    return item.summary || 'Уншлагын дэлгэрэнгүй тайлал хадгалагдсан байна.';
  };

  const getItemBadge = (item: any) => {
    if (item.category === 'full') {
      return {
        label: 'Бүтэн Уншлага (Төлбөртэй)',
        cls: 'bg-amber-100 text-[#8E441D] border-[#D4AF37]',
      };
    }
    if (item.category === 'love') {
      return {
        label: 'Хайр Дурлалын Тайлал (Төлбөртэй)',
        cls: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    }
    if (item.category === 'numerology' || item.type === 'numerology') {
      return {
        label: 'Тоон Зурхай (Төлбөртэй)',
        cls: 'bg-purple-100 text-purple-800 border-purple-300',
      };
    }
    if (item.category === 'horoscope') {
      return {
        label: 'Өдрийн Одон Зурхай',
        cls: 'bg-sky-100 text-sky-800 border-sky-300',
      };
    }
    return {
      label: 'Таро 3 Хөзрийн Уншлага',
      cls: 'bg-[#FAF0E4] text-[#6D3B47] border-[#D4AF37]/40',
    };
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    mysticAudio.playChime(528, 1);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSingleItem = (id: string) => {
    try {
      const nextReadings = tarotHistory.filter((i) => i.id !== id);
      setTarotHistory(nextReadings);
      localStorage.setItem('mystic_readings_history', JSON.stringify(nextReadings));

      const nextNums = numerologyHistory.filter((i) => i.id !== id);
      setNumerologyHistory(nextNums);
      localStorage.setItem('mystic_numerology_history', JSON.stringify(nextNums));
      mysticAudio.playChime(261, 1);
    } catch {}
  };

  const handleClearAllHistory = () => {
    localStorage.removeItem('mystic_readings_history');
    localStorage.removeItem('mystic_numerology_history');
    setTarotHistory([]);
    setNumerologyHistory([]);
    mysticAudio.playChime(261, 1);
  };

  const renderArchiveGrid = (items: any[], emptyMessage: string, ctaTab: string, ctaLabel: string) => {
    if (items.length === 0) {
      return (
        <div className="p-12 text-center rounded-3xl bg-white/80 border border-[#D4AF37]/35 space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E8C582]/20 flex items-center justify-center text-[#8E441D]">
            <BookOpen className="w-7 h-7" />
          </div>
          <p className="text-sm text-[#542B34] font-medium">{emptyMessage}</p>
          <button
            onClick={() => onNavigateToTab(ctaTab)}
            className="px-6 py-2.5 rounded-full bg-[#8E441D] text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md hover:bg-[#783715] transition-all cursor-pointer"
          >
            {ctaLabel} →
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item, idx) => {
          const badge = getItemBadge(item);
          const fullText = getFullItemText(item);
          const itemTitle = cleanHeaderTitle(item.title || item.type || 'Хувийн Таро уншлага');

          return (
            <div
              key={item.id || idx}
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/45 shadow-md space-y-3.5 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#D4AF37]/25 pb-2.5">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <h4 className="text-sm sm:text-base font-mystic font-bold text-[#2A1118]">
                      {itemTitle}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#7A4E58] font-medium">{item.date}</span>
                    {item.id && (
                      <button
                        onClick={() => handleDeleteSingleItem(item.id)}
                        className="p-1 rounded-lg text-[#9A7A80] hover:text-rose-700 transition-colors cursor-pointer"
                        title="Устгах"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {item.cards && Array.isArray(item.cards) && item.cards.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.cards.map((c: any, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-[#D4AF37]/40 text-[11px] font-serif font-semibold text-[#6D3B47]"
                      >
                        {typeof c === 'string'
                          ? cleanMarkdownText(c)
                          : cleanMarkdownText(c.card?.name || c.name || `Карт ${i + 1}`)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-[#3D1E25] line-clamp-4 leading-relaxed whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-[#D4AF37]/25">
                  {cleanMarkdownText(fullText)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/20">
                <button
                  onClick={() => setSelectedItemForView(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8E441D] hover:bg-[#783715] text-white text-xs font-serif font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Бүтнээр нь унших</span>
                </button>
                <button
                  onClick={() => handleCopyText(cleanMarkdownText(fullText), `item_${item.id || idx}`)}
                  className="text-xs font-serif font-semibold text-[#7A4E58] hover:text-[#2A1118] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === `item_${item.id || idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === `item_${item.id || idx}` ? 'Хуулагдлаа' : 'Хуулах'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title with Liquid Glass Panel */}
      <div className="text-center space-y-2 mystic-liquid-glass-header p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-mystic font-bold text-[#2A1118]">
          Таны Профайл ба Хадгалсан Уншлагууд
        </h1>
        <p className="text-xs sm:text-sm text-[#4E2B34] max-w-xl mx-auto font-sans">
          Төлбөр төлж авсан 1 удаагийн багцын уншлагууд, тоон зурхай болон таро тайлалууд таны профайл дотор цэгцтэй хадгалагдана.
        </p>
      </div>

      {/* User Identity Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF9F7] via-[#FFF3EF] to-[#FCEBE6] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center text-[#8E441D] shadow-md shrink-0">
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-10 h-10 text-[#8E441D]" />
            )}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#8E441D]">
                Хэрэглэгчийн Танхим
              </span>
              {currentUser?.provider === 'google' && (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Google Verified
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2A1118]">
              {currentUser?.name || 'Зочин хэрэглэгч'}
            </h2>
            <p className="text-xs sm:text-sm text-[#542B34]">
              {currentUser?.email || 'Имэйл холбогдоогүй · Төхөөрөмж дээрх уншлагууд хадгалагдаж байна'}
            </p>
          </div>
        </div>

        {/* Action buttons & Subscription badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active plan status */}
          <div className="px-4 py-2 rounded-2xl bg-white border border-[#D4AF37]/50 text-xs shadow-xs">
            <span className="text-[10px] text-[#7A4E58] uppercase font-serif font-bold block">
              Одоо ашиглах боломжтой эрх:
            </span>
            <div className="flex items-center gap-1.5 font-mystic font-bold text-[#8E441D] text-sm">
              {activePlan === 'full' ? (
                <>
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                  <span>БҮТЭН УНШЛАГА (1 УДАА)</span>
                </>
              ) : activePlan === 'love' ? (
                <>
                  <Heart className="w-4 h-4 text-[#8E441D]" />
                  <span>ХАЙРЫН БАГЦ (1 УДАА)</span>
                </>
              ) : activePlan === 'numerology' ? (
                <>
                  <Compass className="w-4 h-4 text-[#8E441D]" />
                  <span>ТООН ЗУРХАЙ (1 УДАА)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#8E441D]" />
                  <span>СУУРЬ БАГЦ</span>
                </>
              )}
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-xs font-serif font-bold text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Гарах</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-[#8E441D] hover:bg-[#783715] text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Нэвтрэх / Бүртгүүлэх</span>
            </button>
          )}
        </div>
      </div>

      {/* History Tabs Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#D4AF37]/30 pb-2">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-serif font-bold">
          {[
            { id: 'all', label: `Бүх Хадгалсан Тайлал (${combinedArchive.length})` },
            { id: 'paid', label: `Төлбөртэй Тайлалууд (${paidArchive.length})` },
            { id: 'tarot', label: `Таро Уншлага (${tarotOnlyArchive.length})` },
            { id: 'numerology', label: `Тоон Зурхай (${numerologyOnlyArchive.length})` },
            { id: 'orders', label: `Захиалгын Төлөв (${userOrders.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  mysticAudio.playChime(528, 1);
                }}
                className={`pb-2.5 px-3 transition-colors cursor-pointer whitespace-nowrap relative ${
                  isActive ? 'text-[#8E441D] font-bold' : 'text-[#7A4E58] hover:text-[#2A1118]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8E441D]" />
                )}
              </button>
            );
          })}
        </div>

        {combinedArchive.length > 0 && activeTab !== 'orders' && (
          <button
            onClick={handleClearAllHistory}
            className="text-xs text-rose-700 hover:text-rose-900 font-serif font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Түүх цэвэрлэх</span>
          </button>
        )}
      </div>

      {/* Tab Views */}
      {activeTab === 'all' &&
        renderArchiveGrid(
          combinedArchive,
          'Одоогоор хадгалагдсан уншлага болон зурхай алга байна.',
          'free-reading',
          'Шинэ уншлага эхлүүлэх'
        )}

      {activeTab === 'paid' &&
        renderArchiveGrid(
          paidArchive,
          'Та одоогоор төлбөртэй багцын уншлага (Хайр дурлал, Бүтэн уншлага, Тоон зурхай) аваагүй байна.',
          'pricing',
          'Багцуудтай танилцах'
        )}

      {activeTab === 'tarot' &&
        renderArchiveGrid(
          tarotOnlyArchive,
          'Одоогоор хадгалсан Таро уншлага алга байна.',
          'free-reading',
          'Таро уншлага эхлүүлэх'
        )}

      {activeTab === 'numerology' &&
        renderArchiveGrid(
          numerologyOnlyArchive,
          'Одоогоор хадгалсан Тоон зурхайн тайлал алга байна.',
          'numerology',
          'Тоон зурхай үзэх'
        )}

      {/* Tab 5: Orders Status List */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-mystic font-bold text-[#2A1118]">
              Таны Захиалгууд ба Төлбөрийн Төлөв
            </h3>
            <span className="text-xs text-[#6D3B47] font-serif">
              Төлбөр баталгаажсан багц бүр 1 удаа уншлага үүсгээд Профайл дотор хадгалагдана.
            </span>
          </div>

          {userOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 border border-[#D4AF37]/30 space-y-3">
              <p className="text-sm text-[#542B34] font-medium">
                Одоогоор ямар нэгэн захиалга хийгдээгүй байна.
              </p>
              <button
                onClick={() => onNavigateToTab('pricing')}
                className="px-6 py-2.5 rounded-full bg-[#8E441D] text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md hover:bg-[#783715] transition-all cursor-pointer"
              >
                Багц сонгох →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((ord) => {
                const isApproved = ord.status === 'active';
                const isConsumed = Boolean(ord.consumed);
                const isPending = ord.status === 'pending';

                return (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4AF37]/35 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#2A1118]">
                          {ord.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold ${
                            isApproved && !isConsumed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isApproved && isConsumed
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isApproved && !isConsumed
                            ? '✓ Нээлттэй (1 удаа ашиглах эрхтэй)'
                            : isApproved && isConsumed
                            ? '✓ Ашиглагдсан (Профайлд хадгалагдсан)'
                            : isPending
                            ? '⏳ Хүлээгдэж байна (Шалгаж буй)'
                            : 'Цуцлагдсан'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-mystic font-bold text-[#8E441D]">
                        {ord.planName}
                      </h4>
                      <p className="text-xs text-[#7A4E58]">
                        Үнэ: {ord.amount.toLocaleString()}₮ · Банк: {ord.bankName} · Огноо: {ord.createdAt}
                        {ord.consumedAt ? ` · Уншлага авсан: ${ord.consumedAt}` : ''}
                      </p>
                    </div>

                    <div className="text-right sm:text-left self-start sm:self-center">
                      <span className="text-[11px] text-[#7A4E58] block font-serif">Гүйлгээний утга:</span>
                      <span className="text-xs font-mono font-bold text-[#2A1118] bg-[#FFF5F2] px-2 py-1 rounded-md border border-[#D4AF37]/30">
                        {ord.transferNote}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal to view full saved reading or numerology */}
      {selectedItemForView && (
        <div
          onClick={() => setSelectedItemForView(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 pt-20 sm:pt-24 pb-6 bg-black/65 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full max-h-[calc(100vh-6rem)] rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EC] to-[#F6EFE4] border-2 border-[#D4AF37]/65 p-6 sm:p-8 space-y-4 shadow-2xl flex flex-col text-[#2F171E]"
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3 gap-3">
              <div>
                <span className="text-[11px] font-serif text-[#8E441D] font-bold block">
                  {selectedItemForView.date}
                </span>
                <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#2A1118]">
                  {cleanHeaderTitle(selectedItemForView.title || selectedItemForView.type || 'Хадгалсан уншлага')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopyText(cleanMarkdownText(getFullItemText(selectedItemForView)), 'modal_copy')
                  }
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#D4AF37]/45 hover:bg-[#FAF1E4] text-xs font-serif font-bold text-[#6D3B47] flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'modal_copy' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === 'modal_copy' ? 'Хуулагдлаа' : 'Хуулах'}</span>
                </button>
                <button
                  onClick={() => setSelectedItemForView(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#281620] hover:bg-[#3A212E] text-[#E8C582] text-xs font-serif font-bold cursor-pointer"
                >
                  Хаах
                </button>
              </div>
            </div>

            {selectedItemForView.cards &&
              Array.isArray(selectedItemForView.cards) &&
              selectedItemForView.cards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedItemForView.cards.map((c: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white border border-[#D4AF37]/45 text-xs font-serif font-bold text-[#8E441D]"
                    >
                      {typeof c === 'string'
                        ? cleanMarkdownText(c)
                        : cleanMarkdownText(c.card?.name || c.name || `Карт ${idx + 1}`)}
                    </span>
                  ))}
                </div>
              )}

            <div className="flex-1 overflow-y-auto pr-2 bg-[#FFFDF9] p-5 rounded-2xl border border-[#C59B27]/40 shadow-inner">
              <FormattedReading
                content={getFullItemText(selectedItemForView)}
                theme="light"
                hideMainBanner={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
