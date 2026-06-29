/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { authenticateWithGoogle, authenticateWithApple, getFriendlyAuthErrorMessage, resetUserPassword } from "../utils/firebaseAuthHelper";

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any, progress: any) => void;
  onGoToSignUp: () => void;
  onTryGuest: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoToSignUp, onTryGuest }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Surat email dan kata sandi harus diisi!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk ke akun.");
      }

      onLoginSuccess(data.token, data.user, data.progress);
    } catch (err: any) {
      setError(err.message || "Email atau kata sandi Anda keliru.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    console.log("Password reset button clicked!");
    const emailToReset = email;
    if (!emailToReset) {
      setError("Harap masukkan email di kolom email terlebih dahulu untuk mereset kata sandi.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await resetUserPassword(emailToReset);
      setSuccess("Email reset kata sandi telah dikirim!");
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithGoogle();
      onLoginSuccess(result.token, result.user, result.progress);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("[GOOGLE AUTH ERROR]", err);
      }
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithApple();
      onLoginSuccess(result.token, result.user, result.progress);
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
            <p className="text-xs text-[#58423c] font-medium tracking-wide uppercase mt-1">Gerbang Selamat Datang Pedagang</p>
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

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 text-[#186a22] text-xs font-semibold p-3.5 rounded-xl border border-green-200 flex items-start gap-2 shadow-inner"
          >
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span className="whitespace-pre-line text-left leading-relaxed">{success}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
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
            <div className="flex justify-between items-center">
              <label className="font-semibold text-xs text-[#58423c]" htmlFor="password">
                Kata Sandi
              </label>
              <button type="button" onClick={handlePasswordReset} className="text-xs text-[#a33818] hover:underline relative z-20">Lupa Password?</button>
            </div>
            <input 
              className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl px-4 py-3 shadow-inner focus:ring-2 focus:ring-[#a33818] focus:border-[#a33818] outline-none transition-all placeholder:text-[#dfc0b8]/60 text-sm" 
              id="password" 
              placeholder="••••••••" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#a33818] text-white font-semibold rounded-xl py-3 px-6 shadow-[0_4px_0_0_#862303] active:translate-y-[4px] active:shadow-none hover:bg-[#c44f2e] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed" 
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Sedang Masuk..." : "Masuk Pasar"}</span>
            <span className="material-symbols-outlined">login</span>
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full py-2">
          <div className="flex-1 h-px bg-[#dfc0b8]"></div>
          <span className="font-semibold text-xs text-[#58423c] uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-[#dfc0b8]"></div>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-[#1e1c00] border border-[#8b716a] rounded-xl py-3 px-6 shadow-[0_2px_0_0_#8b716a] hover:bg-neutral-50 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3 font-semibold text-sm cursor-pointer" 
            type="button"
          >
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.8 15.72 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"></path>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.58C14.74 18.24 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.12H2.17V16.97C3.98 20.56 7.71 23 12 23Z" fill="#34A853"></path>
              <path d="M5.84 14.12C5.62 13.46 5.49 12.74 5.49 12C5.49 11.26 5.62 10.54 5.84 9.88V7.03H2.17C1.42 8.52 1 10.21 1 12C1 13.79 1.42 15.48 2.17 16.97L5.84 14.12Z" fill="#FBBC05"></path>
              <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.45 2.08 14.97 1 12 1C7.71 1 3.98 3.44 2.17 7.03L5.84 9.88C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"></path>
            </svg>
            Masuk dengan Google
          </button>

          <button 
            onClick={handleAppleSignIn}
            className="w-full bg-[#1e1c00] text-white rounded-xl py-3 px-6 shadow-[0_2px_0_0_#000000] hover:bg-black active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3 font-semibold text-sm cursor-pointer" 
            type="button"
          >
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.148 13.921c-0.038-3.085 2.528-4.57 2.646-4.636-1.429-2.091-3.642-2.378-4.42-2.42-1.897-0.194-3.702 1.116-4.665 1.116-0.963 0-2.457-1.087-4.04-1.057-2.046 0.029-3.931 1.19-4.981 3.013-2.128 3.687-0.544 9.141 1.533 12.146 1.018 1.474 2.228 3.125 3.834 3.066 1.549-0.059 2.144-0.999 4.02-0.999 1.867 0 2.404 0.999 4.04 0.969 1.675-0.03 2.709-1.503 3.717-2.977 1.168-1.704 1.649-3.354 1.678-3.443-0.038-0.015-3.23-1.24-3.362-4.778zM11.968 4.542c0.852-1.031 1.426-2.466 1.27-3.896-1.233 0.05-2.715 0.821-3.593 1.849-0.785 0.902-1.473 2.364-1.297 3.766 1.378 0.107 2.763-0.686 3.615-1.719z"></path>
            </svg>
            Masuk dengan Apple
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-center flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center">
            <button 
              type="button"
              onClick={onTryGuest}
              id="try-guest-btn"
              className="font-bold text-sm text-[#a33818] hover:text-[#c44f2e] underline underline-offset-4 decoration-2 decoration-[#a33818]/30 hover:decoration-[#a33818] transition-colors cursor-pointer"
            >
              Coba Tanpa Akun (Mode Tamu)
            </button>
            <p className="text-[10px] text-[#58423c] mt-2 italic">Catatan: Progres tidak akan tersimpan tanpa akun</p>
          </div>

          <button 
            type="button"
            onClick={onGoToSignUp}
            className="font-medium text-xs text-[#58423c] hover:text-black transition-colors cursor-pointer"
          >
            Belum Punya Akun? <span className="text-[#a33818] underline underline-offset-4 decoration-2 decoration-[#a33818]/30 hover:decoration-[#a33818] font-semibold">Daftar Sekarang</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
