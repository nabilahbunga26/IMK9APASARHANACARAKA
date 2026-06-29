/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import SplashPage from "./components/SplashPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RoleSelectionPage from "./components/RoleSelectionPage";
import OnboardingPage from "./components/OnboardingPage";
import LevelSelectionPage from "./components/LevelSelectionPage";
import StallSelectionPage from "./components/StallSelectionPage";
import MarketGame from "./components/MarketGame";
import { UserProfile, GameProgress } from "./types";

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'register' | 'role-selection' | 'onboarding-seller' | 'onboarding-buyer' | 'level-selection' | 'stall-selection' | 'game'>('splash');
  const [selectedRole, setSelectedRole] = useState<'pembeli' | 'penjual'>('pembeli');
  const [gameTab, setGameTab] = useState<'pasar' | 'kamus' | 'latihan' | 'juara' | 'toko'>('pasar');
  const [levelOverride, setLevelOverride] = useState<number | undefined>(undefined);
  const [stallOverride, setStallOverride] = useState<'kelontong' | 'jamu' | 'buah' | undefined>(undefined);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);

  const handleNavigateFromFooter = (tab: string) => {
    if (tab === 'pasar') {
      setScreen('role-selection');
    } else {
      let targetTab: 'pasar' | 'kamus' | 'latihan' | 'juara' | 'toko' = 'pasar';
      if (tab === 'belajar') targetTab = 'kamus';
      else if (tab === 'toko') targetTab = 'toko';
      else if (tab === 'rapor') targetTab = 'juara';
      
      setGameTab(targetTab);
      setScreen('game');
    }
  };

  // Validate session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("hanacaraka_auth_token");
    if (!savedToken) {
      setCheckLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${savedToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setToken(savedToken);
          setUser(data.user);
          setProgress(data.progress);
          setScreen('role-selection');
        } else {
          // Token expired or invalid
          localStorage.removeItem("hanacaraka_auth_token");
        }
      } catch (e) {
        console.error("Gagal terhubung dengan server auth. Mengaktifkan fallback luring.", e);
      } finally {
        setCheckLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleStartAdventure = () => {
    // If already logged in, go straight to the role-selection - otherwise show login
    if (user && token) {
      setScreen('role-selection');
    } else {
      setScreen('login');
    }
  };

  const handleLoginSuccess = (authToken: string, loggedUser: UserProfile, gameProgress: GameProgress) => {
    localStorage.setItem("hanacaraka_auth_token", authToken);
    setToken(authToken);
    setUser(loggedUser);
    setProgress(gameProgress);
    setScreen('role-selection');
  };

  const handleRegisterSuccess = () => {
    setScreen('login');
  };

  const handleTryGuest = () => {
    // Attempt to load guest state from browser localStorage
    const savedGuestState = localStorage.getItem("hanacaraka_guest_progress");
    let guestProgress: GameProgress = {
      uid: "guest",
      coins: 350,
      level: 1,
      xp: 0,
      title: "Caliye (Pemula)",
      unlockedStalls: ["kelontong"],
      completedCount: 0,
      lastUpdated: new Date().toISOString()
    };

    if (savedGuestState) {
      try {
        const parsed = JSON.parse(savedGuestState);
        guestProgress = { ...guestProgress, ...parsed, uid: "guest" };
      } catch (e) {
        console.error("Gagal memuat koin tamu, memulihkan data bawaan.");
      }
    }

    setUser(null);
    setToken(null);
    setProgress(guestProgress);
    setScreen('role-selection');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem("hanacaraka_auth_token");
    setToken(null);
    setUser(null);
    setProgress(null);
    setScreen('login');
  };

  if (checkLoading) {
    return (
      <div className="min-h-screen bg-[#fffadf] flex flex-col items-center justify-center font-body-md text-amber-950 gap-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-[#a33818] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase opacity-85">Memuat Gerbang Pasar...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffadf]">
      {screen === 'splash' && (
        <SplashPage onStart={handleStartAdventure} />
      )}
      {screen === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onGoToSignUp={() => setScreen('register')}
          onTryGuest={handleTryGuest}
        />
      )}
      {screen === 'register' && (
        <RegisterPage 
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => setScreen('login')}
          onTryGuest={handleTryGuest}
        />
      )}
      {screen === 'role-selection' && (
        <RoleSelectionPage 
          onSelectRole={(role) => {
            setSelectedRole(role);
            setScreen(role === 'penjual' ? 'onboarding-seller' : 'onboarding-buyer');
            setGameTab('pasar');
          }}
          onNavigateTab={handleNavigateFromFooter}
          onBackToSplash={() => setScreen('splash')}
        />
      )}
      {screen === 'onboarding-seller' && (
        <OnboardingPage 
          role="penjual"
          onStartGame={() => {
            setScreen('stall-selection');
          }}
          onBackToRoles={() => setScreen('role-selection')}
          onNavigateTab={handleNavigateFromFooter}
        />
      )}
      {screen === 'onboarding-buyer' && (
        <OnboardingPage 
          role="pembeli"
          onStartGame={() => {
            setScreen('level-selection');
          }}
          onBackToRoles={() => setScreen('role-selection')}
          onNavigateTab={handleNavigateFromFooter}
        />
      )}
      {screen === 'level-selection' && (
        <LevelSelectionPage 
          userLevel={progress?.level ?? 1}
          onSelectLevel={(lvl) => {
            setLevelOverride(lvl);
            setGameTab('pasar');
            setScreen('game');
          }}
          onNavigateTab={handleNavigateFromFooter}
          onBack={() => setScreen('onboarding-buyer')}
        />
      )}
      {screen === 'stall-selection' && (
        <StallSelectionPage 
          userLevel={progress?.level ?? 1}
          onSelectStall={(st) => {
            setStallOverride(st);
            setGameTab('pasar');
            setScreen('game');
          }}
          onNavigateTab={handleNavigateFromFooter}
          onBack={() => setScreen('onboarding-seller')}
        />
      )}
      {screen === 'game' && (
        <MarketGame 
          user={user}
          initialProgress={progress}
          token={token}
          onLogout={handleLogout}
          selectedRole={selectedRole}
          onSwitchRole={() => {
            setLevelOverride(undefined);
            setStallOverride(undefined);
            setGameTab('pasar');
            setScreen('role-selection');
          }}
          initialTab={gameTab}
          initialLevelOverride={levelOverride}
          initialStallOverride={stallOverride}
        />
      )}
    </div>
  );
}
