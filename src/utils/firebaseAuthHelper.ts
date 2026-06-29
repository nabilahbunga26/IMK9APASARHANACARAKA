/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider, sendPasswordResetEmail } from "firebase/auth";

export interface SocialAuthResult {
  token: string;
  user: any;
  progress: any;
}

/**
 * Triggers Firebase password reset email.
 */
export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Translates Firebase Auth errors to beautiful, localized, actionable Indonesian instructions.
 */
export function getFriendlyAuthErrorMessage(err: any): string {
  if (!err) return "Terjadi kesalahan autentikasi yang tidak diketahui.";
  
  const code = err.code || "";
  const msg = err.message || String(err);
  
  if (
    code === "auth/popup-closed-by-user" || 
    code === "auth/cancelled-popup-request" ||
    msg.includes("popup-closed-by-user") ||
    msg.includes("cancelled-popup-request")
  ) {
    return "Jendela masuk ditutup atau dibatalkan otomatis.\n\nSaran Penting iFrame browser:\nJika Anda menjalankan game ini di panel preview AI Studio, silakan klik tombol 'Buka di Tab Baru' (Open in New Tab) di sudut kanan atas preview untuk membuka aplikasi secara penuh. Ini menghindari pencekalan komunikasi antar-jendela oleh iFrame.";
  }
  
  if (code === "auth/popup-blocked" || msg.includes("popup-blocked")) {
    return "Jendela pop-up diblokir oleh browser Anda.\n\nHarap izinkan pop-up untuk situs ini pada setelan browser Anda, atau gunakan tombol 'Buka di Tab Baru' (Open in New Tab) di sudut kanan atas preview.";
  }
  
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
    return "Koneksi jaringan gagal. Harap periksa koneksi internet Anda atau matikan VPN/Ad-Blocker yang mungkin memblokir komunikasi dengan Firebase.";
  }

  if (code === "auth/user-not-found") {
    return "Email tidak terdaftar.";
  }
  
  if (code === "auth/invalid-email") {
    return "Format email tidak valid.";
  }

  return msg;
}

/**
 * Triggers Google Sign-in with Firebase popup and syncs with the app's server
 */
export async function authenticateWithGoogle(): Promise<SocialAuthResult> {
  const providerInstance = new GoogleAuthProvider();
  providerInstance.setCustomParameters({
    prompt: "select_account"
  });

  console.log("[FIREBASE AUTH] Direct Google Sign-In Triggered");
  const result = await signInWithPopup(auth, providerInstance);
  const firebaseUser = result.user;

  if (!firebaseUser.email) {
    throw new Error("Akun Google Anda tidak menyediakan informasi email.");
  }

  return await syncSocialWithServer(
    firebaseUser.email,
    firebaseUser.displayName || firebaseUser.email.split("@")[0],
    "google"
  );
}

/**
 * Triggers Apple Sign-in with Firebase popup and syncs with the app's server
 */
export async function authenticateWithApple(): Promise<SocialAuthResult> {
  const providerInstance = new OAuthProvider("apple.com");
  
  console.log("[FIREBASE AUTH] Direct Apple Sign-In Triggered");
  const result = await signInWithPopup(auth, providerInstance);
  const firebaseUser = result.user;

  if (!firebaseUser.email) {
    throw new Error("Akun Apple Anda tidak menyediakan informasi email.");
  }

  return await syncSocialWithServer(
    firebaseUser.email,
    firebaseUser.displayName || "Pengguna Apple",
    "apple"
  );
}

/**
 * Syncs the Firebase authentication details with our game database server
 */
async function syncSocialWithServer(email: string, name: string, provider: "google" | "apple"): Promise<SocialAuthResult> {
  const res = await fetch("/api/auth/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      name: name.trim(),
      provider: provider
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal mensinkronisasikan sesi sosial dengan server Pasar Hanacaraka.");
  }

  return {
    token: data.token,
    user: data.user,
    progress: data.progress
  };
}
