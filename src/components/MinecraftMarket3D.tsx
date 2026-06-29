import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coffee, Flame, Sparkles, Heart, Smile, Bell, HelpCircle, Utensils, CheckCircle } from "lucide-react";
import { playWoodChopSound, playStoneGrindSound, playBubblingSound, playBellRingSound } from "../utils/audioHelper";

interface MinecraftMarket3DProps {
  currentStall: "kelontong" | "jamu" | "buah";
  unlockedStalls: string[];
  currentOrder: any;
  quizFeedback: { isCorrect: boolean; message: string } | null;
  onInteract: () => void;
  isTradingActive: boolean;
  onBonusXpClaim?: () => void;
  role?: "pembeli" | "penjual";
}

// Map custom customer names to recognizable Javanese avatar styles
const CUSTOMER_AVATARS: Record<string, {
  emoji: string;
  role: string;
  color: string;
  description: string;
  accent: string;
}> = {
  "Pak Tani": {
    emoji: "👨‍🌾",
    role: "Petani Setia",
    color: "from-amber-600 to-yellow-800",
    description: "Memakai caping bambu dan lurik lurik tradisional, menyukai hasil bumi segar.",
    accent: "border-amber-500 text-amber-100"
  },
  "Mbah Putri": {
    emoji: "👵",
    role: "Pinisepuh",
    color: "from-green-700 to-emerald-900",
    description: "Nenek anggun berkebaya lurik hijau javit, sabar namun menyukai racikan jamu pas.",
    accent: "border-emerald-500 text-emerald-100"
  },
  "Bu Lurah": {
    emoji: "👩",
    role: "Priayi Desa",
    color: "from-pink-600 to-rose-805",
    description: "Sangat rapi berkebaya sutra, memegang kipas kertas Jawi, punya kriteria tinggi.",
    accent: "border-rose-400 text-rose-100"
  },
  "Bocah Jawi": {
    emoji: "👦",
    role: "Sinoman Cilik",
    color: "from-blue-600 to-indigo-850",
    description: "Anak lincah berikat kepala blangkon mini, menyukai cemilan buah manis segar.",
    accent: "border-blue-400 text-blue-100"
  }
};

export default function MinecraftMarket3D({
  currentStall,
  unlockedStalls,
  currentOrder,
  quizFeedback,
  onInteract,
  isTradingActive,
  onBonusXpClaim,
  role = "penjual",
}: MinecraftMarket3DProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [cookingSteam, setCookingSteam] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showBellRing, setShowBellRing] = useState(false);
  const [cookingAnimateState, setCookingAnimateState] = useState<"idle" | "chopping" | "stirring" | "success" | "fail">("idle");
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // Reset bonus claimed status when quiz feedback or order changes
  useEffect(() => {
    if (!quizFeedback) {
      setBonusClaimed(false);
    }
  }, [quizFeedback]);

  useEffect(() => {
    setBonusClaimed(false);
  }, [currentOrder]);

  const handleNampanClick = () => {
    if (quizFeedback?.isCorrect) {
      if (!bonusClaimed) {
        setBonusClaimed(true);
        playBellRingSound();
        setCookingAnimateState("success");
        if (onBonusXpClaim) {
          onBonusXpClaim();
        }
      }
    } else {
      // Wood sound for visual empty click
      playWoodChopSound();
      triggerManualSteam();
    }
  };

  // Determine active customer avatar
  const customerName = currentOrder?.customerName || "Buku Tamu";
  const matchedAvatar = CUSTOMER_AVATARS[customerName] || {
    emoji: "👤",
    role: "Pembeli Agung",
    color: "from-[#3e2723] to-[#1b110c]",
    description: "Penduduk lokal Jawi yang mampir belanja.",
    accent: "border-stone-500 text-stone-100"
  };

  // Monitor quiz feedbacks to trigger gorgeous chef animations and steam particles
  useEffect(() => {
    if (quizFeedback) {
      if (quizFeedback.isCorrect) {
        setCookingAnimateState("success");
        // Pop happy steam loops
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            setCookingSteam((prev) => [
              ...prev,
              { id: Date.now() + i, x: 25 + Math.random() * 50, y: 30 + Math.random() * 20 }
            ]);
          }, i * 150);
        }
      } else {
        setCookingAnimateState("fail");
      }
      
      const timer = setTimeout(() => {
        setCookingAnimateState("idle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [quizFeedback]);

  // Clean steam particles periodically
  useEffect(() => {
    if (cookingSteam.length > 0) {
      const timer = setTimeout(() => {
        setCookingSteam((prev) => prev.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cookingSteam]);

  // Handle active cooking interactions (for flavor matching visuals)
  const triggerManualSteam = () => {
    setCookingAnimateState(currentStall === "jamu" ? "stirring" : "chopping");
    setCookingSteam((prev) => [
      ...prev,
      { id: Date.now(), x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 }
    ]);
    setTimeout(() => {
      setCookingAnimateState("idle");
    }, 1200);
  };

  // Style properties based on stall category
  const getStallStyles = () => {
    if (role === 'pembeli') {
      switch (currentStall) {
        case "kelontong":
          return {
            canopyBg: "bg-gradient-to-r from-indigo-700 via-fuchsia-500 to-indigo-700 border-b-4 border-indigo-950",
            canopyPattern: "stripes-indigo",
            deskBg: "bg-[#4a1c11] border-t-8 border-amber-400",
            bannerName: "🍥 BUTIK NINGRAT KELONTONG 🍥",
            accentColor: "border-indigo-650",
            stationLabel: "Meja Kasir Ningrat",
          };
        case "jamu":
          return {
            canopyBg: "bg-gradient-to-r from-teal-700 via-lime-400 to-teal-700 border-b-4 border-teal-950",
            canopyPattern: "stripes-teal",
            deskBg: "bg-[#0f1f15] border-t-8 border-lime-400",
            bannerName: "🌿 JAMU SAKRAL KERATON 🌿",
            accentColor: "border-teal-600",
            stationLabel: "Dapur Racik Keraton",
          };
        case "buah":
          return {
            canopyBg: "bg-gradient-to-r from-rose-700 via-yellow-250 to-rose-700 border-b-4 border-rose-950",
            canopyPattern: "stripes-rose",
            deskBg: "bg-[#5a1811] border-t-8 border-yellow-350",
            bannerName: "🍎 KEBUN BUAH RAJA SULTAN 🍎",
            accentColor: "border-rose-500",
            stationLabel: "Talenan Emas",
          };
      }
    }

    switch (currentStall) {
      case "kelontong":
        return {
          canopyBg: "bg-gradient-to-r from-red-700 via-white to-red-700 border-b-4 border-red-900",
          canopyPattern: "stripes-red",
          deskBg: "bg-[#4e2f1d] border-t-8 border-[#ca8a04]",
          bannerName: "🍥 KELONTONG MBAH JOYO 🍥",
          accentColor: "border-red-650",
          stationLabel: "Dandang Gula & Beras",
        };
      case "jamu":
        return {
          canopyBg: "bg-gradient-to-r from-emerald-700 via-yellow-400 to-emerald-700 border-b-4 border-emerald-950",
          canopyPattern: "stripes-emerald",
          deskBg: "bg-[#331d0f] border-t-8 border-[#10b981]",
          bannerName: "🌿 JAMU ALAS MAJAPAHIT 🌿",
          accentColor: "border-emerald-600",
          stationLabel: "Kuali Bubbling Tanah Liat",
        };
      case "buah":
        return {
          canopyBg: "bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 border-b-4 border-orange-900",
          canopyPattern: "stripes-orange",
          deskBg: "bg-[#54301a] border-t-8 border-[#f97316]",
          bannerName: "🍌 BUAH UTAMA RAJA JAWI 🍌",
          accentColor: "border-orange-500",
          stationLabel: "Talenan Iris Pisau Kayu",
        };
    }
  };

  const stallProps = getStallStyles();

  return (
    <div id="cozy-market-game-wrapper" className="relative w-full flex flex-col gap-3 font-sans">
      
      {/* GAME VIEWPORT */}
      <div 
        className="relative w-full h-[360px] rounded-2xl overflow-hidden border-4 border-[#5c4037] shadow-xl text-stone-900 select-none bg-[#0a0604] shadow-inner"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 70%),
            linear-gradient(to bottom, #140b07 0%, #0d0603 100%)
          `
        }}
      >
        {/* PARALLAX BAZAAR BACKGROUND */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#5c4037_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Cozy Traditional Hang Banners in Background */}
        <div className="absolute top-2 left-6 right-6 flex justify-between pointer-events-none select-none">
          <div className="text-[10px] text-amber-200/45 px-2 py-0.5 border border-amber-900/40 rounded-md bg-[#1d120a]/80 font-mono">
            {role === 'pembeli' ? "👑 ROYAL BUYER SUITE" : "🏯 REJO AGUNG MARKETPLACE"}
          </div>
          <div className="text-[10px] text-amber-200/45 px-2 py-0.5 border border-amber-900/40 rounded-md bg-[#1d120a]/80 font-mono">
            {role === 'pembeli' ? "💎 BOUTIQUE TRADING 3D" : "🏺 TRADITIONAL GAWI 3D CAPTAIN"}
          </div>
        </div>

        {/* STALL ARCHWAY ROOF / CANOPY */}
        <div className={`absolute top-0 inset-x-0 h-10 ${stallProps.canopyBg} shadow-md flex items-center justify-center z-10 font-sans`}>
          <div className="text-[11px] font-black tracking-widest text-[#fffdf2] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] px-5 py-1 bg-amber-950/80 border border-amber-600/35 rounded-full uppercase">
            {stallProps.bannerName}
          </div>
        </div>

        {/* HANGING COZY GLOWING LANTERNS (Left & Right) */}
        <div className="absolute top-8 left-4 flex flex-col items-center z-10 animate-pulse pointer-events-none">
          <div className="w-0.5 h-6 bg-stone-700" />
          <div className="w-4 h-5 rounded bg-gradient-to-b from-amber-400 to-red-600 shadow-[0_0_15px_#f59e0b] border border-amber-300" />
        </div>
        <div className="absolute top-8 right-4 flex flex-col items-center z-10 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}>
          <div className="w-0.5 h-6 bg-stone-700" />
          <div className="w-4 h-5 rounded bg-gradient-to-b from-amber-400 to-red-600 shadow-[0_0_15px_#f59e0b] border border-amber-300" />
        </div>

        {/* ACTIVE COZY CHATTER DIALOGUE IF WAITING FOR PLAY */}
        {!isTradingActive && currentOrder && (
          <div className="absolute top-[52px] left-[15%] right-[15%] text-center z-10 animate-bounce">
            <button
              onClick={onInteract}
              className="bg-[#2d1b15]/95 hover:bg-[#3f271e] text-amber-200 border-2 border-[#ca8a04] px-4 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-1.5 mx-auto transition-all transform hover:scale-105"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-swing" />
              <span>
                {role === 'pembeli' 
                  ? `🛍️ HUBUNGI LAPAK ${matchedAvatar.emoji} ${currentOrder.customerName}! (Mulai)`
                  : `🔔 LAYANI ${matchedAvatar.emoji} ${currentOrder.customerName}! (Mulai)`
                }
              </span>
            </button>
          </div>
        )}

        {/* MAIN GAME SCENE STALL */}
        <div className="absolute inset-x-0 bottom-0 h-[220px] flex flex-col justify-end">
          
          {/* THE SELLER CHEF (Mbah / Cozy Merchant Player Avatar - Right Side) */}
          <div className="absolute right-[12%] bottom-[50px] w-[130px] h-[155px] flex flex-col items-center z-20">
            {/* Action State Visualizer bubbles above Seller head */}
            {cookingAnimateState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-12 bg-[#fffdf0] border border-amber-800 text-[#5c4033] px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md pointer-events-none text-center flex items-center gap-1"
              >
                {cookingAnimateState === "chopping" && <span>🔪 Iris Tipis!</span>}
                {cookingAnimateState === "stirring" && <span>🫗 Aduk Racikan!</span>}
                {cookingAnimateState === "success" && <span className="text-emerald-700">🎉 Maturnuwun!</span>}
                {cookingAnimateState === "fail" && <span className="text-red-700">😅 Lho, Luput...</span>}
              </motion.div>
            )}

            {/* Seller Blangkon & Head */}
            <motion.div 
              className="relative w-16 h-16 flex flex-col items-center"
              animate={
                cookingAnimateState === "chopping" ? { y: [0, -6, 0, -6, 0], rotate: [0, -2, 2, -2, 0] } :
                cookingAnimateState === "stirring" ? { x: [0, 2, -2, 2, 0] } :
                cookingAnimateState === "success" ? { y: [0, -12, 0], scale: [1, 1.08, 1] } :
                cookingAnimateState === "fail" ? { rotate: [0, -4, 4, -4, 0] } :
                { y: [0, -2, 0] } // Idle breathe
              }
              transition={{ repeat: Infinity, duration: cookingAnimateState === "idle" ? 3 : 0.8 }}
            >
              {/* Blangkon Protrusion (Mundu Back Knot symbol of Javanese cap) */}
              <div className="absolute -top-2 bg-[#5c3e35] w-3 h-3 rounded-full border border-stone-850" />
              {/* Blangkon main cap */}
              <div className="w-14 h-6 rounded-t-full bg-gradient-to-b from-[#70483c] to-[#452b22] border-b-2 border-amber-900 flex items-center justify-center relative shadow-sm">
                {/* Traditional Batik strip decoration */}
                <div className="absolute inset-x-2 bottom-0.5 h-1 bg-amber-400 opacity-60" />
              </div>
              
              {/* Face */}
              <div className="w-12 h-11 bg-[#fedbb0] rounded-b-xl border-x-2 border-b-2 border-[#caa880] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {/* Cheerful Chef Eyes */}
                <div className="flex gap-2.5 mt-1">
                  {cookingAnimateState === "success" ? (
                    <>
                      <span className="text-[10px] font-bold text-emerald-800">^</span>
                      <span className="text-[10px] font-bold text-emerald-800">^</span>
                    </>
                  ) : cookingAnimateState === "fail" ? (
                    <>
                      <span className="text-[10px] font-bold text-red-800">O</span>
                      <span className="text-[10px] font-bold text-red-800">O</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3a221d]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3a221d]" />
                    </>
                  )}
                </div>
                {/* Javanese Traditional White Mustache */}
                <div className="w-8 h-2 bg-stone-50 rounded-full mt-1.5 border border-stone-200" />
                {/* Smiling mouth */}
                <div className="w-3.5 h-1.5 rounded-b-full bg-red-600" />
              </div>
            </motion.div>

            {/* Seller Torso (Traditional Lurik striped shirt) */}
            <motion.div 
              className="w-20 h-20 bg-[#4e3629] rounded-t-2xl border-x-4 border-t-4 border-[#331f15] relative overflow-hidden"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, #4e3629, #4e3629 6px, #2a1a11 6px, #2a1a11 12px)"
              }}
              animate={cookingAnimateState === "chopping" ? { y: [0, -3, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              {/* Red traditional Javanese waist sash (Udheng Sabuk) */}
              <div className="absolute bottom-1 inset-x-0 h-3 bg-red-700 border-y border-red-900" />
              
              {/* Core Chef Medal / Javanese Badge */}
              <div className="absolute top-1 left-2 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center border border-amber-600">
                <span className="text-[5px] font-black">⭐</span>
              </div>

              {/* Hands with traditional spoon paddles or tools */}
              <motion.div 
                className="absolute bottom-4 left-1 w-5 h-5 rounded-full bg-[#fedbb0] border border-[#caa880] flex items-center justify-center"
                animate={cookingAnimateState === "chopping" ? { y: [0, -12, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.25 }}
              >
                <span className="text-[11px]">🔪</span>
              </motion.div>
              <motion.div 
                className="absolute bottom-4 right-1 w-5 h-5 rounded-full bg-[#fedbb0] border border-[#caa880] flex items-center justify-center"
                animate={cookingAnimateState === "stirring" ? { x: [-4, 4, -4] } : {}}
                transition={{ repeat: Infinity, duration: 0.3 }}
              >
                <span className="text-[11px]">🥄</span>
              </motion.div>
            </motion.div>
          </div>

          {/* THE SHOPPER CUSTOMER (Animated Javanese Actor - Left Side) */}
          <div className="absolute left-[10%] bottom-[50px] w-[130px] h-[155px] flex flex-col items-center z-20">
            {isTradingActive && currentOrder ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -60 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex flex-col items-center"
              >
                {/* SPEECH DIALOGUE BUBBLE with Javanese characters */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#fffff4] text-stone-900 px-3 py-1.5 rounded-2xl border-2 border-[#5c4037] text-center shadow-lg relative min-w-[130px]"
                >
                  <p className="text-[7.5px] font-black text-amber-900 uppercase tracking-wider leading-none">
                    {role === 'pembeli' ? "TAG PENULISAN BARANG:" : "MEMINTA DISERAHKAN:"}
                  </p>
                  <p className="text-[8.5px] text-stone-600 italic font-bold">"{currentOrder.itemRequested.name}"</p>
                  {/* Bubble Pointer Arrow */}
                  <div className="absolute bottom-[-8px] left-[50%] transform translate-x-[-50%] w-0 h-0 border-t-[8px] border-t-[#5c4037] border-x-[8px] border-x-transparent" />
                  <div className="absolute bottom-[-6px] left-[50%] transform translate-x-[-50%] w-0 h-0 border-t-[6px] border-t-[#fffff4] border-x-[6px] border-x-transparent" />
                </motion.div>

                {/* Patient / Anger Mood Indicator over Customer head */}
                <div className="flex items-center gap-0.5 mt-2 mb-1">
                  {cookingAnimateState === "success" ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-400 px-1.5 py-0.5 rounded-full font-black animate-bounce flex items-center gap-0.5">
                      {role === 'pembeli' ? "🎉 Berhasil Membeli!" : "❤️ Maturnuwun!"}
                    </span>
                  ) : cookingAnimateState === "fail" ? (
                    <span className="text-[8px] bg-red-100 text-[#a33818] border border-red-400 px-1.5 py-0.5 rounded-full font-black animate-shake flex items-center gap-0.5">
                      {role === 'pembeli' ? "⚡ Transaksi Gagal!" : "⚡ Luput! Kak keleru!"}
                    </span>
                  ) : (
                    <div className="w-[80px] bg-black/40 h-2 rounded-full overflow-hidden border border-amber-900/30 shadow-inner flex items-center">
                      {/* Active green-yellow-red patient bar indicator */}
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"
                        initial={{ width: "100%" }}
                        animate={{ width: "20%" }}
                        transition={{ duration: 40, ease: "linear" }}
                      />
                    </div>
                  )}
                </div>

                {/* THE CUSTOMER VECTOR AVATAR */}
                <motion.div 
                  className="flex flex-col items-center relative"
                  animate={
                    cookingAnimateState === "success" ? { y: [0, -35, 0], scale: [1, 1.15, 1] } :
                    cookingAnimateState === "fail" ? { x: [-6, 6, -6, 6, 0], rotate: [-4, 4, -4, 4, 0] } :
                    { y: [0, -3, 0], scale: [1, 1.01, 1] } // gentle waddle wait
                  }
                  transition={{ repeat: Infinity, duration: cookingAnimateState === "idle" ? 2.5 : 0.6 }}
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${matchedAvatar.color} border-2 border-amber-400 flex items-center justify-center text-3xl shadow-md relative`}>
                    <span className="drop-shadow-md">{matchedAvatar.emoji}</span>
                    
                    {/* Golden traditional brooch / scarf icon */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-yellow-400 border border-amber-600 flex items-center justify-center text-[8px] font-black font-mono">
                      ⚜️
                    </div>
                  </div>

                  {/* Customer Badge Label */}
                  <div className="bg-[#1b110c] border border-amber-500/50 text-amber-200 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 shadow-sm uppercase tracking-wide">
                    {currentOrder.customerName}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              // If NO active shopper is loaded, show a silhouette walking up
              <motion.div 
                className="flex flex-col items-center opacity-65 cursor-pointer"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={onInteract}
              >
                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-stone-500 flex items-center justify-center text-2xl shadow-inner">
                  <span>👣</span>
                </div>
                <div className="animate-pulse bg-zinc-950 px-2 py-0.5 rounded-md text-[8.5px] font-bold text-amber-200 border border-stone-800 uppercase tracking-widest mt-1.5">
                  Menunggu Pembeli...
                </div>
              </motion.div>
            )}
          </div>

          {/* DUST PARTICLES & STEAM GRAPHICS CONTAINER */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
            {cookingSteam.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0.8, y: 180, x: `${item.x}%`, scale: 0.5 }}
                animate={{ opacity: 0, y: 70, scale: 2.5 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute text-2xl text-stone-300 font-bold select-none"
              >
                ☁️
              </motion.div>
            ))}

            {/* Glowing success gold rain coins */}
            {cookingAnimateState === "success" && (
              Array.from({ length: 12 }).map((_, idx) => {
                const startX = 10 + Math.random() * 80;
                const delay = Math.random() * 0.8;
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: -30, x: `${startX}%`, opacity: 0, rotate: 0 }}
                    animate={{ y: 320, opacity: [0, 1, 1, 0], rotate: 360 }}
                    transition={{ duration: 1.5, delay, ease: "easeIn" }}
                    className="absolute text-xl z-30"
                  >
                    🪙
                  </motion.div>
                );
              })
            )}

            {/* Glowing success bursting hearts */}
            {cookingAnimateState === "success" && (
              Array.from({ length: 8 }).map((_, idx) => {
                const sX = 15 + Math.random() * 20;
                const distY = 50 + Math.random() * 60;
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: 150, x: `${sX}%`, opacity: 1, scale: 0.5 }}
                    animate={{ y: 150 - distY, x: `${sX + (Math.random() * 20 - 10)}%`, opacity: 0, scale: 2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute text-lg text-red-500 font-bold"
                  >
                    💖
                  </motion.div>
                );
              })
            )}
          </div>

          {/* TRADING/COOKING COUNTER BAR DESK (Foreground) */}
          <div className={`w-full h-16 ${stallProps.deskBg} relative shadow-xl z-25 flex items-center justify-between px-6 border-b-6 border-[#2d1a10]`}>
            
            {/* Left: Mortar/Grind cobek & Chopping board station */}
            <div className="flex gap-4 items-center">
              {/* TALENAN CHOPPING BLOCK BOARD */}
              <div 
                className="bg-[#d2b48c] border-2 border-[#8b5a2b] w-12 h-8 rounded shadow-md flex items-center justify-center relative cursor-pointer hover:border-amber-400 active:scale-95 transition-all text-stone-900 group"
                onClick={() => {
                  playWoodChopSound();
                  triggerManualSteam();
                }}
                title="Papan Iris Bahan (Irisan Talenan)"
              >
                <div className="absolute inset-0.5 border border-dashed border-[#8b5a2b]/30" />
                <span className="text-xs group-hover:scale-125 duration-100">🪵</span>
                {/* Visual Knife tilting accent overlay */}
                <span className="absolute -top-1 -right-1 text-[9px] font-black select-none transform group-hover:rotate-[-30deg] duration-150">🔪</span>
                <span className="absolute bottom-[0.5px] text-[5px] font-black uppercase text-[#5c4033]/60 tracking-tighter">Talenan</span>
              </div>

              {/* STONE MORTAR (Cobek Batu Tradisional Jawi) */}
              <div 
                className="bg-stone-500 border-2 border-stone-750 w-11 h-8 rounded-full shadow-md flex items-center justify-center relative cursor-pointer hover:bg-stone-400 active:scale-95 transition-all group"
                onClick={() => {
                  playStoneGrindSound();
                  triggerManualSteam();
                }}
                title="Cobek Gilingan Batu (Ulekan Sambal & Jamu)"
              >
                <span className="text-[10px] group-hover:scale-125 duration-100">🪨</span>
                {/* Ulekan stone pestle inside */}
                <div className="absolute -top-1 right-2 bg-stone-700 border border-stone-900 w-2 h-4 rounded-full transform rotate-30 group-hover:translate-x-1" />
                <span className="absolute bottom-[0.5px] text-[5px] font-black uppercase text-stone-900 tracking-tighter">Cobek</span>
              </div>
            </div>

            {/* Center Area: Traditional Bell / Lonceng service */}
            <div className="flex flex-col items-center">
              {!isTradingActive ? (
                <div className="relative group">
                  {/* Glowing notification ping */}
                  <div className="absolute -inset-1 rounded-full bg-yellow-400/50 animate-ping" />
                  
                  <button
                    onClick={() => {
                      setShowBellRing(true);
                      setTimeout(() => setShowBellRing(false), 900);
                      playBellRingSound();
                      onInteract();
                    }}
                    className={`bg-gradient-to-b from-amber-300 to-yellow-600 border-2 border-[#5c4037] w-12 h-12 rounded-full cursor-pointer shadow-lg flex flex-col items-center justify-center relative transform hover:scale-110 active:scale-90 transition-all ${
                      showBellRing ? "animate-bounce" : ""
                    }`}
                  >
                    <span className="text-lg">🛎️</span>
                    <span className="text-[6px] font-black uppercase text-amber-955 font-sans tracking-widest mt-[-2px]">TAP bell</span>
                  </button>
                </div>
              ) : (
                // If interactive, show cooking activity progress or station tag
                <div className="bg-[#1b110c]/90 px-3 py-1 rounded-full border border-amber-600/50 text-amber-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px] text-orange-500 animate-pulse">local_fire_department</span>
                  <span>{stallProps.stationLabel} Aktif</span>
                </div>
              )}
            </div>

            {/* Right: Steam cauldron boiling boiler Anglo Stove */}
            <div className="flex gap-4 items-center">
              {/* NAMPAN SAJI (Interactive 3D Wood Tray with claimable XP) */}
              <div
                className={`w-14 h-9 rounded-md border-2 bg-gradient-to-br from-[#d7ccc8] to-[#b0bec5] shadow-md flex items-center justify-center relative cursor-pointer select-none transition-all duration-150 transform active:scale-95 group ${
                  quizFeedback?.isCorrect && !bonusClaimed
                    ? "border-yellow-400 animate-bounce shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                    : "border-[#5d4037] hover:border-amber-400"
                }`}
                onClick={handleNampanClick}
                title="Nampan Saji Tradisional (Klik untuk Bonus XP!)"
              >
                {/* Visual wood handles */}
                <div className="absolute -left-1.5 top-2.5 w-1.5 h-4 bg-yellow-600 rounded-l border-y border-l border-yellow-850" />
                <div className="absolute -right-1.5 top-2.5 w-1.5 h-4 bg-yellow-600 rounded-r border-y border-r border-yellow-850" />
                
                {/* Inside tray visual: the food card or letters */}
                {quizFeedback?.isCorrect ? (
                  !bonusClaimed ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs animate-pulse">🎁</span>
                      <span className="absolute -top-4 bg-yellow-500 text-amber-955 font-black text-[7px] uppercase tracking-wider px-1 py-0.5 rounded shadow border border-yellow-300 scale-90 whitespace-nowrap">
                        +15 XP
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-60">
                      <span className="text-[10px]">✅</span>
                      <span className="text-[5px] font-black uppercase text-stone-700 tracking-tighter leading-none mt-0.5">Diklaim</span>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-xs grayscale opacity-60">🍽️</span>
                    <span className="absolute bottom-[0.5px] text-[5px] font-black uppercase text-stone-600 tracking-tighter leading-none">Nampan</span>
                  </div>
                )}
              </div>

              {/* BUBBLING TRADITIONAL STOVE ( Anglo Anglo Terakota ) */}
              <div 
                className="w-13 h-10 bg-[#1e1b18] rounded-t-xl border-x-2 border-t-2 border-[#caa885]/30 relative flex flex-col items-end pt-1 pr-1 cursor-pointer hover:border-orange-500 transition-all group"
                onClick={() => {
                  playBubblingSound();
                  triggerManualSteam();
                }}
                title="Anglo Tungku Tanah Liat / Anglo Api"
              >
                {/* Cooking Vessel with Boiling bubbles */}
                <div className="absolute -top-3 left-[15%] w-8 h-5 rounded-t-full bg-[#5c4033] border border-[#2a1a11] flex items-center justify-center shadow-md">
                  <div className="absolute -top-1 w-5 h-1.5 rounded bg-amber-900 border border-amber-955" />
                  <span className="text-[6px] text-amber-100 font-extrabold animate-pulse">♨️ Bubbles</span>
                  {/* Boiling liquid animation inside */}
                  <div className="absolute inset-x-1 bottom-0.5 h-1 bg-gradient-to-t from-red-600 to-amber-400 opacity-60 animate-pulse" />
                </div>
                
                {/* Glowing red hot coal fire bed underneath */}
                <div className="w-[85%] h-2.5 mx-auto rounded-full bg-gradient-to-r from-red-650 via-orange-500 to-amber-500 border border-red-950 flex items-center justify-center animate-pulse mt-3.5">
                  <Flame className="w-2 h-2 text-yellow-300" />
                </div>
                <span className="absolute bottom-[2px] right-2 text-[5.5px] font-bold uppercase text-amber-100 tracking-tighter">Anglo Api</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED SIMULATION MANUAL GUIDE */}
      <div className="flex justify-between items-center bg-[#291e19] border border-amber-900/40 rounded-xl px-4 py-2 text-amber-100/90 text-[10px] font-medium font-sans">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {role === 'pembeli' 
              ? (<><b>Meja Transaksi Belanja:</b><span> Ketuk <b>Anglo</b>, <b>Talenan</b>, atau <b>Cobek</b> untuk keriuhan dekorasi, serta <b>Nampan Saji</b> yang berkedip emas saat bertransaksi untuk klaim <b>Bonus +15 XP</b> tambahan!</span></>)
              : (<><b>Meja Interaktif Lapak:</b><span> Ketuk <b>Anglo</b>, <b>Talenan</b>, atau <b>Cobek</b> untuk keriuhan, serta <b>Nampan Saji</b> yang berkedip emas saat pesanan tepat untuk klaim <b>Bonus +15 XP</b> tambahan!</span></>)
            }
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="text-[8.5px] bg-[#1a110a] border border-amber-900/30 px-2 py-1 rounded hover:text-white cursor-pointer"
          >
            {showTutorial ? "OK Sembunyikan" : "Buka Panduan"}
          </button>
        </div>
      </div>

    </div>
  );
}
