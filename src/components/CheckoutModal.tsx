import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, ShieldCheck, Clock, ArrowRight, X, Building, AlertCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { MysticOrder, OrderPlan, saveOrder, getOrders, updateOrderStatus } from '../types/order';
import { mysticAudio } from '../utils/audio';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: OrderPlan;
    name: string;
    price: string;
    amount: number;
  };
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  onOrderSubmitted?: (order: MysticOrder) => void;
  onNavigateToReading?: (planId: OrderPlan) => void;
}

const BANK_ACCOUNTS = [
  {
    id: 'khaan',
    bankName: 'Khaanbank',
    bankSubName: 'Хаан банк',
    iban: '74000500',
    directAccount: '5168987442',
    accountHolder: 'Амгаланбаатар Одмаа',
  },
  {
    id: 'golomt',
    bankName: 'Golomt bank',
    bankSubName: 'Голомт банк',
    iban: '88001500',
    directAccount: '1105425539',
    accountHolder: 'Ариунзаяа Алтангэрэл',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentUserEmail,
  currentUserName,
  onOrderSubmitted,
  onNavigateToReading,
}) => {
  // Generate random order code e.g. MYS-7821
  const [orderId, setOrderId] = useState(() => `MYS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [userName, setUserName] = useState(currentUserName || '');
  const [userEmail, setUserEmail] = useState(currentUserEmail || '');
  const [userPhone, setUserPhone] = useState('99112233');
  const [selectedBank, setSelectedBank] = useState('Хаан банк');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status view: 'form' | 'submitted_pending'
  const [viewState, setViewState] = useState<'form' | 'submitted_pending'>('form');
  const [createdOrder, setCreatedOrder] = useState<MysticOrder | null>(null);
  const [activeBankId, setActiveBankId] = useState<'khaan' | 'golomt'>('khaan');
  const [orderCurrentStatus, setOrderCurrentStatus] = useState<string>('pending');

  // Keep state updated with user props
  useEffect(() => {
    if (currentUserEmail) setUserEmail(currentUserEmail);
    if (currentUserName) setUserName(currentUserName);
  }, [currentUserEmail, currentUserName]);

  // Reset orderId and viewState when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setOrderId(`MYS-${Math.floor(1000 + Math.random() * 9000)}`);
      setViewState('form');
      setOrderCurrentStatus('pending');
      setCreatedOrder(null);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Listen for admin order approval in real time (cross-device and local)
  useEffect(() => {
    if (!createdOrder) return;

    const checkOrderStatus = async () => {
      // 1. Direct server query for instant cross-device approval
      try {
        const res = await fetch(`/api/orders/${createdOrder.id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === 'active') {
            setOrderCurrentStatus('active');
            localStorage.setItem('mystic_active_plan', data.planId || createdOrder.planId);
            localStorage.setItem('mystic_current_user_email', data.userEmail || createdOrder.userEmail);
            updateOrderStatus(createdOrder.id, 'active');
            return;
          }
        }
      } catch {}

      // 2. Fallback to local storage
      const allOrders = getOrders();
      const current = allOrders.find((o) => o.id === createdOrder.id);
      if (current && current.status === 'active') {
        setOrderCurrentStatus('active');
        localStorage.setItem('mystic_active_plan', current.planId);
        localStorage.setItem('mystic_current_user_email', current.userEmail);
      }
    };

    checkOrderStatus();
    const interval = setInterval(checkOrderStatus, 2500);
    window.addEventListener('mystic_orders_updated', checkOrderStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mystic_orders_updated', checkOrderStatus);
    };
  }, [createdOrder]);

  // Unconditional calculations
  const activeBank = BANK_ACCOUNTS.find((b) => b.id === activeBankId) || BANK_ACCOUNTS[0];
  const transferNote = `${orderId} ${userPhone || 'Утас'}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    mysticAudio.playChime(528, 0.8);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Safe early exit AFTER all React hooks are executed
  if (!isOpen) return null;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    mysticAudio.playChime(639, 2);

    const safeEmail = userEmail?.trim() || 'user@example.com';
    const safeName = userName?.trim() || 'Хэрэглэгч';
    const safePhone = userPhone?.trim() || 'Тодорхойгүй';

    const newOrder: MysticOrder = {
      id: orderId,
      userName: safeName,
      userEmail: safeEmail,
      userPhone: safePhone,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      bankName: selectedBank,
      transferNote: transferNote,
      status: 'pending',
      createdAt: new Date().toLocaleString('mn-MN'),
    };

    // Store user session so site remembers who placed the order
    try {
      localStorage.setItem('mystic_current_user_email', safeEmail);
      localStorage.setItem('mystic_current_user_name', safeName);
      const existingAccount = localStorage.getItem('mystic_user_account');
      if (!existingAccount) {
        localStorage.setItem(
          'mystic_user_account',
          JSON.stringify({ name: safeName, email: safeEmail, phone: safePhone })
        );
      }
    } catch {}

    saveOrder(newOrder);
    setCreatedOrder(newOrder);
    setOrderCurrentStatus('pending');
    setViewState('submitted_pending');
    if (onOrderSubmitted) onOrderSubmitted(newOrder);
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pt-20 sm:pt-24 pb-6 bg-black/65 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-xl w-full my-auto rounded-3xl bg-[#FFF6F3] border-2 border-[#D4AF37]/55 shadow-2xl relative text-[#2F171E] max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden"
      >
        {/* Sticky Top Header Bar with Always-Visible Close Button */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-7 py-3.5 bg-[#FFF6F3]/95 backdrop-blur-sm border-b border-[#9C6E65]/25 shrink-0">
          <span className="text-[11px] uppercase font-serif tracking-[0.22em] text-[#8E5244] font-bold">
            ☾ ДАНСААР ШИЛЖҮҮЛЭХ ☽
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Цонх хаах"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#8E441D]/45 bg-white hover:bg-[#4D2630] text-[#2F171E] hover:text-white text-xs font-serif font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Хаах</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 pt-4 overflow-y-auto flex-1 space-y-6">
          {viewState === 'form' ? (
            <div className="space-y-6">
              {/* Plan Title & Price */}
              <div className="text-center space-y-1 border-b border-[#9C6E65]/20 pb-4">
                <h3 className="text-xl sm:text-2xl font-mystic font-bold text-[#2F171E]">
                  {plan.name} Төлбөр
                </h3>
                <div className="text-3xl font-mystic font-bold text-[#8E441D]">
                  {plan.price}
                </div>
              </div>

            {/* Step 1: Bank Account Details Card */}
            <div className="rounded-2xl bg-white border border-[#9C6E65]/30 p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#9C6E65]/15 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#4A262E]">
                  <Building className="w-4 h-4 text-[#8E5244]" />
                  <span>Манай Байгууллагын Дансны Мэдээлэл</span>
                </div>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  Баталгаажсан
                </span>
              </div>

              {/* Bank Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4E4E0] rounded-xl border border-[#9C6E65]/20">
                {BANK_ACCOUNTS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setActiveBankId(b.id as 'khaan' | 'golomt');
                      setSelectedBank(b.bankSubName);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      activeBankId === b.id
                        ? 'bg-[#4D2630] text-white shadow-sm'
                        : 'bg-transparent text-[#6B434C] hover:bg-white/60'
                    }`}
                  >
                    <span>{b.bankName}</span>
                    <span className="text-[10px] font-normal opacity-85">{b.bankSubName}</span>
                  </button>
                ))}
              </div>

              {/* Bank Name & Holder */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#7A4E58]">Хүлээн авах банк:</span>
                  <p className="font-semibold text-[#2F171E]">{activeBank.bankName} ({activeBank.bankSubName})</p>
                </div>
                <div>
                  <span className="text-[#7A4E58]">Дансны эзэмшигч:</span>
                  <p className="font-semibold text-[#2F171E]">{activeBank.accountHolder}</p>
                </div>
              </div>

              {/* IBAN Copy Box */}
              <div className="p-3 rounded-xl bg-[#F8EBE7] border border-[#9C6E65]/25 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#DEB76A]/30 text-[#4D2630]">IBAN</span>
                    <span className="text-[11px] text-[#7A4E58]">{activeBank.bankName} IBAN дугаар:</span>
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-mono font-bold text-[#4D2630] tracking-wider select-all">
                    {activeBank.iban}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeBank.iban, 'iban')}
                  className="px-3 py-1.5 rounded-lg border border-[#8E5244]/40 bg-white hover:bg-stone-50 text-xs font-serif font-medium text-[#4D2630] flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'iban' ? 'Хуулагдлаа' : 'IBAN хуулах'}</span>
                </button>
              </div>

              {/* Direct Account */}
              <div className="p-2.5 rounded-xl bg-white/80 border border-[#9C6E65]/20 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-[#7A4E58] block">{activeBank.bankSubName}-ны данс:</span>
                  <span className="text-sm font-mono font-bold text-[#4D2630] tracking-wider select-all">
                    {activeBank.directAccount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeBank.directAccount, 'direct')}
                  className="px-2.5 py-1 rounded-lg border border-[#8E5244]/30 bg-[#F8EBE7] hover:bg-[#F2DDD7] text-xs font-serif font-medium text-[#4D2630] flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                >
                  {copiedField === 'direct' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'direct' ? 'Хуулагдлаа' : 'Хуулах'}</span>
                </button>
              </div>

              {/* Transfer Note Copy Box */}
              <div className="p-3 rounded-xl bg-[#F8EBE7] border border-[#9C6E65]/25 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#7A4E58] block">Гүйлгээний утга (Заавал бичих):</span>
                  <span className="text-sm font-mono font-bold text-[#4D2630]">
                    {transferNote}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(transferNote, 'note')}
                  className="px-3 py-1.5 rounded-lg border border-[#8E5244]/40 bg-white hover:bg-stone-50 text-xs font-serif font-medium text-[#4D2630] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedField === 'note' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'note' ? 'Хуулагдлаа' : 'Хуулах'}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Confirmation Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1 font-semibold">
                      Таны Нэр
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Таны нэр"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1 font-semibold">
                      Утасны дугаар
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="99xxxxxx"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1 font-semibold">
                    Имэйл хаяг
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1 font-semibold">
                    Шилжүүлсэн банк
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-3.5 py-2 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                  >
                    <option value="Хаан банк">Хаан банк (Khan Bank)</option>
                    <option value="Голомт банк">Голомт банк (Golomt Bank)</option>
                    <option value="Төрийн банк">Төрийн банк (State Bank)</option>
                    <option value="Худалдаа хөгжлийн банк">ХХБ (TDB)</option>
                    <option value="Монпай / SocialPay">Монпай / SocialPay</option>
                  </select>
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F8EBE7] border border-[#9C6E65]/20 text-[11px] text-[#6B434C] leading-relaxed">
                <AlertCircle className="w-4 h-4 text-[#8E5244] shrink-0 mt-0.5" />
                <span>
                  Та дээрх данс руу <strong>{plan.price}</strong> шилжүүлсний дараа доорх товчийг дарж шалгуулна уу. Админ шалгаад таны багцын эрхийг шуурхай нээнэ.
                </span>
              </div>

              {/* Confirm Payment button (Requirement 1) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Төлбөр төлсөн, шалгах (Confirm Payment)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================
             PENDING / ACTIVE CONFIRMATION SCREEN
             ======================================================== */
          <div className="text-center py-4 space-y-6 animate-fadeIn">
            {orderCurrentStatus === 'active' ? (
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-700 shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center text-amber-700 shadow-md">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
            )}

            <div className="space-y-2">
              {orderCurrentStatus === 'active' ? (
                <>
                  <span className="text-[11px] uppercase font-serif tracking-widest text-emerald-800 font-bold px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 inline-flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✓ Төлөв: Идэвхжсэн (Active)</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-mystic font-bold text-[#2F171E] pt-2">
                    Таны Эрх Амжилттай Нээгдлээ!
                  </h3>
                  <p className="text-sm text-[#46232D] max-w-md mx-auto leading-relaxed">
                    Админ таны шилжүүлгийг шалгаж <strong>{createdOrder?.planName}</strong> эрхийг баталгаажууллаа. Та одоо шууд дэлгэрэнгүй уншлагаа авах боломжтой.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-[11px] uppercase font-serif tracking-widest text-amber-800 font-bold px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
                    ⏳ Төлбөр шалгагдаж байна (Pending)
                  </span>
                  <h3 className="text-2xl font-mystic font-bold text-[#2F171E] pt-2">
                    Захиалга Амжилттай Бүртгэгдлээ
                  </h3>
                  <p className="text-sm text-[#5C3841] max-w-md mx-auto leading-relaxed">
                    Таны төлбөр шалгагдсаны дараа админ таны багцын эрхийг удахгүй нээх болно. Түр хүлээнэ үү.
                  </p>
                </>
              )}
            </div>

            {/* Order Summary Receipt */}
            <div className="rounded-2xl bg-white border border-[#9C6E65]/30 p-5 text-left text-xs text-[#4A262E] space-y-2.5 max-w-md mx-auto shadow-sm">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-[#7A4E58]">Захиалгын дугаар:</span>
                <strong className="font-mono text-sm text-[#4D2630]">{createdOrder?.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A4E58]">Сонгосон багц:</span>
                <strong className="font-serif text-[#2F171E]">{createdOrder?.planName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A4E58]">Төлбөрийн дүн:</span>
                <strong className="text-sm text-[#4D2630]">{createdOrder?.amount.toLocaleString()}₮</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A4E58]">Хэрэглэгч:</span>
                <span>{createdOrder?.userName} ({createdOrder?.userPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A4E58]">Огноо:</span>
                <span>{createdOrder?.createdAt}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                <span className="text-[#7A4E58]">Төлөв:</span>
                {orderCurrentStatus === 'active' ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                    ✓ Идэвхтэй (Active)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Шалгагдаж байна (Pending)
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              {orderCurrentStatus === 'active' ? (
                <button
                  type="button"
                  onClick={() => {
                    mysticAudio.playChime(639, 2);
                    onClose();
                    if (onNavigateToReading && createdOrder) {
                      onNavigateToReading(createdOrder.planId);
                    }
                  }}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white font-serif uppercase tracking-widest text-xs font-bold cursor-pointer shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Шууд Дэлгэрэнгүй Уншлага руу Шилжих →</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const all = getOrders();
                      const current = all.find((o) => o.id === createdOrder?.id);
                      if (current?.status === 'active') {
                        setOrderCurrentStatus('active');
                        mysticAudio.playChime(639, 2);
                      } else {
                        mysticAudio.playChime(432, 1);
                      }
                    }}
                    className="w-full py-2.5 rounded-full border border-[#8E5244]/40 bg-white text-[#4A262E] hover:bg-[#FFF6F3] text-xs font-serif uppercase tracking-wider font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Төлөв дахин шалгах</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 rounded-full bg-[#4D2630] text-white hover:bg-[#3D1D25] text-xs font-serif uppercase tracking-widest font-semibold cursor-pointer shadow-md transition-all"
                  >
                    Ойлголоо, Хаах
                  </button>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
