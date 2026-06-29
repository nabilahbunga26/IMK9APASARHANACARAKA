/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { authenticateWithGoogle, authenticateWithApple, getFriendlyAuthErrorMessage } from "../utils/firebaseAuthHelper";

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
  onTryGuest: () => void;
}

export default function RegisterPage({ onRegisterSuccess, onGoToLogin, onTryGuest }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Semua bidang harus diisi!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus berisi 6 karakter demi privasi Anda!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan akun baru.");
      }

      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || "Terdapat kendala koneksi atau akun telah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithGoogle();
      onRegisterSuccess();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("[GOOGLE AUTH ERROR]", err);
      }
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithApple();
      onRegisterSuccess();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("[APPLE AUTH ERROR]", err);
      }
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffadf] text-[#1e1c00] flex items-center justify-center p-4 md:p-16 font-body-md relative overflow-hidden">
      {/* Decorative Traditional Border Patterns on Corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#a33818]/30 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#a33818]/30 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#a33818]/30 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#a33818]/30 rounded-br-xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#f6f0bb] rounded-2xl p-6 md:p-8 shadow-[0_8px_0_0_#77574d] border-b-4 border-[#77574d]/20 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-[#c44f2e] text-white rounded-full flex items-center justify-center shadow-[0_4px_0_0_#862303] border-b-4 border-[#ffb5a0]/20">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#a33818]">Pasar Hanacaraka</h1>
            <p className="text-xs text-[#58423c] font-medium tracking-wide uppercase mt-1">Daftar Akun Pedagang Baru</p>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-[#ba1a1a] text-xs font-semibold p-3.5 rounded-xl border border-red-200 flex items-start gap-2 shadow-inner"
          >
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span className="whitespace-pre-line text-left leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs text-[#58423c]" htmlFor="name">
              Nama Lengkap Pedagang (Username)
            </label>
            <input 
              className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl px-4 py-3 shadow-inner focus:ring-2 focus:ring-[#a33818] focus:border-[#a33818] outline-none transition-all placeholder:text-[#dfc0b8]/60 text-sm" 
              id="name" 
              placeholder="e.g. Mas Joko" 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs text-[#58423c]" htmlFor="email">
              Email Surat
            </label>
            <input 
              className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl px-4 py-3 shadow-inner focus:ring-2 focus:ring-[#a33818] focus:border-[#a33818] outline-none transition-all placeholder:text-[#dfc0b8]/60 text-sm" 
              id="email" 
              placeholder="alamat@email.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs text-[#58423c]" htmlFor="password">
              Buat Kata Sandi
            </label>
            <input 
              className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl px-4 py-3 shadow-inner focus:ring-2 focus:ring-[#a33818] focus:border-[#a33818] outline-none transition-all placeholder:text-[#dfc0b8]/60 text-sm" 
              id="password" 
              placeholder="Keamanan minimal 6 abjad" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs text-[#58423c]" htmlFor="confirmPassword">
              Ulangi Kata Sandi
            </label>
            <input 
              className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl px-4 py-3 shadow-inner focus:ring-2 focus:ring-[#a33818] focus:border-[#a33818] outline-none transition-all placeholder:text-[#dfc0b8]/60 text-sm" 
              id="confirmPassword" 
              placeholder="Ulangi kata sandi Anda" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#a33818] text-white font-semibold rounded-xl py-3 px-6 shadow-[0_4px_0_0_#862303] active:translate-y-[4px] active:shadow-none hover:bg-[#c44f2e] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed" 
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Mendaftarkan Akun..." : "Daftar Akun"}</span>
            <span className="material-symbols-outlined">how_to_reg</span>
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full py-2">
          <div className="flex-1 h-px bg-[#dfc0b8]"></div>
          <span className="font-semibold text-xs text-[#58423c] uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-[#dfc0b8]"></div>
        </div>

        {/* Social Options */}
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleGoogleSignUp}
            className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl py-3 px-6 shadow-[0_2px_0_0_#8b716a] hover:bg-neutral-50 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3 font-semibold text-sm cursor-pointer" 
            type="button"
          >
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.8 15.72 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"></path>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.58C14.74 18.24 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.12H2.17V16.97C3.98 20.56 7.71 23 12 23Z" fill="#34A853"></path>
              <path d="M5.84 14.12C5.62 13.46 5.49 12.74 5.49 12C5.49 11.26 5.62 10.54 5.84 9.88V7.03H2.17C1.42 8.52 1 10.21 1 12C1 13.79 1.42 15.48 2.17 16.97L5.84 14.12Z" fill="#FBBC05"></path>
              <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.45 2.08 14.97 1 12 1C7.71 1 3.98 3.44 2.17 7.03L5.84 9.88C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"></path>
            </svg>
            Daftar dengan Google
          </button>

          <button 
            onClick={handleAppleSignUp}
            className="w-full bg-[#1e1c00] text-white rounded-xl py-3 px-6 shadow-[0_2px_0_0_#000000] hover:bg-black active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3 font-semibold text-sm cursor-pointer" 
            type="button"
          >
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.48C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C16.01 1.04 14.87 1.63 14.2 2.42C13.62 3.1 13.11 4.2 13.26 5.46C14.3 5.54 15.3 4.95 15.97 4.17Z"></path>
            </svg>
            Daftar dengan Apple
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-center flex-col items-center gap-4 text-center">
          <button 
            type="button"
            onClick={onTryGuest}
            className="font-bold text-sm text-[#a33818] hover:text-[#c44f2e] underline underline-offset-4 decoration-2 decoration-[#a33818]/30 hover:decoration-[#a33818] transition-colors cursor-pointer"
          >
            Coba Tanpa Akun (Mode Tamu)
          </button>

          <button 
            type="button"
            onClick={onGoToLogin}
            className="font-medium text-xs text-[#58423c] hover:text-black transition-colors cursor-pointer"
          >
            Sudah Punya Akun? <span className="text-[#a33818] underline underline-offset-4 decoration-2 decoration-[#a33818]/30 hover:decoration-[#a33818] font-semibold">Masuk Sekarang</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
