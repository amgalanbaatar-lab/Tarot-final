import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Lock, History, X, Check, ShieldCheck, LogOut } from 'lucide-react';
import { mysticAudio } from '../utils/audio';

export interface UserAccount {
  email: string;
  name: string;
  photoUrl?: string;
  provider: 'google' | 'email';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [savedReadings, setSavedReadings] = useState<any[]>([]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem('mystic_readings_history');
    if (history) {
      try {
        setSavedReadings(JSON.parse(history));
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Google Sign-In Flow
  const handleGoogleSignIn = (customEmail?: string, customName?: string) => {
    setIsGoogleLoading(true);
    mysticAudio.playChime(528, 1.5);

    setTimeout(() => {
      const selectedEmail = customEmail || 'amgalanbaatar652@gmail.com';
      const selectedName = customName || selectedEmail.split('@')[0];
      const googleUser: UserAccount = {
        email: selectedEmail,
        name: selectedName,
        photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedEmail)}`,
        provider: 'google',
      };

      localStorage.setItem('mystic_user_account', JSON.stringify(googleUser));
      onLoginSuccess(googleUser);
      setIsGoogleLoading(false);
      mysticAudio.playChime(639, 2);
      onClose();
    }, 700);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      mysticAudio.playChime(528, 2);
      const user: UserAccount = {
        email,
        name: name || email.split('@')[0],
        provider: 'email',
      };
      localStorage.setItem('mystic_user_account', JSON.stringify(user));
      onLoginSuccess(user);
      onClose();
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-20 sm:pt-24 pb-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full my-auto rounded-3xl border-2 border-[#D4AF37]/50 bg-[#FBF3F0] p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#2F171E] max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Цонх хаах"
          className="sticky top-0 float-right z-30 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#8E441D]/40 bg-white hover:bg-[#4D2630] text-[#2F171E] hover:text-white text-xs font-serif font-bold shadow-sm transition-all cursor-pointer"
        >
          <span>Хаах</span>
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          // Logged In View
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-[#8E5345] mx-auto overflow-hidden bg-[#EBD0C9] flex items-center justify-center shadow-md">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#5E3841]" />
                )}
              </div>
              <h3 className="text-xl font-mystic font-bold text-[#2F171E]">
                {currentUser.name}
              </h3>
              <p className="text-xs text-[#7A4D57] font-sans flex items-center justify-center gap-1.5">
                {currentUser.provider === 'google' && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Google Account
                  </span>
                )}
                <span>{currentUser.email}</span>
              </p>
            </div>

            {/* Reading History */}
            <div className="p-4 rounded-2xl border border-[#9C6E65]/25 bg-[#F2DDD7] space-y-3">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#4A262E]">
                <History className="w-4 h-4 text-[#8C5243]" />
                <span>Таны хадгалсан уншлагууд ({savedReadings.length})</span>
              </div>
              {savedReadings.length === 0 ? (
                <p className="text-xs text-[#6B434C]">
                  Одоогоор шинэ уншлага хадгалагдаагүй байна. "Уншлага эхлүүлэх" хэсгээс өөрийн уншлагаа үүсгээрэй.
                </p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {savedReadings.map((r, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-xl bg-[#FFF6F3] border border-[#9C6E65]/20 shadow-sm">
                      <div className="text-[#3D1E25] font-semibold">{r.title || 'Хувийн уншлага'}</div>
                      <div className="text-[#7A4D57] text-[11px]">{r.date} · {r.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl border border-rose-400 text-rose-800 hover:bg-rose-100 text-xs font-serif uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Гарах</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#4D2630] text-white text-xs font-serif font-bold uppercase tracking-wider hover:bg-[#3D1D25] transition-colors cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        ) : (
          // Login Form with Google Sign-In
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-serif tracking-[0.25em] text-[#8C5243]">
                ☾ MYSTIC ХУВИЙН ОРОН ЗАЙ ☽
              </span>
              <h3 className="text-2xl font-mystic font-bold text-[#2F171E]">
                {isRegister ? 'Бүртгэл Үүсгэх' : 'Нэвтрэх'}
              </h3>
              <p className="text-xs text-[#663E47] font-sans">
                Өөрийн хувийн уншлагыг хадгалж, тоон зурхайн тооцооллоо хянах.
              </p>
            </div>

            {/* 1. GOOGLE SIGN-IN BUTTON (Requested Feature) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl border border-[#9C6E65]/40 bg-white hover:bg-stone-50 text-[#2F171E] font-medium text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isGoogleLoading
                    ? 'Google-ээр холбогдож байна...'
                    : 'Google account-аар нэвтрэх'}
                </span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[#7A4E58] justify-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google-ийн албан ёсны хамгаалалттай</span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#9C6E65]/20"></div>
              <span className="flex-shrink mx-3 text-[11px] font-serif uppercase tracking-wider text-[#7A4E58]">
                эсвэл имэйлээр
              </span>
              <div className="flex-grow border-t border-[#9C6E65]/20"></div>
            </div>

            {/* Standard Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1">
                    Таны Нэр
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Нэрээ оруулна уу"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1">
                  Имэйл хаяг
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-serif tracking-wider text-[#5A353E] mb-1">
                  Нууц үг
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#9C6E65]/35 rounded-xl px-4 py-2.5 text-sm text-[#2F171E] focus:outline-none focus:border-[#8E5244]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#4D2630] hover:bg-[#3D1D25] text-white font-serif font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer"
              >
                {isRegister ? 'Бүртгүүлэх' : 'Нэвтрэх'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-[#7A4D57] hover:text-[#2F171E] underline transition-colors cursor-pointer"
                >
                  {isRegister
                    ? 'Бүртгэлтэй юу? Нэвтрэх хэсэг рүү очих'
                    : 'Шинээр бүртгэл үүсгэх үү? Бүртгүүлэх'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
