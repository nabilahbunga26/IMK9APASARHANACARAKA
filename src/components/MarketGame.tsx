/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameProgress, UserProfile, MarketItem, CustomerOrder, LeaderboardEntry } from "../types";
import { AKSARA_LIST } from "../data/aksara";
import { MARKET_ITEMS, generateRandomOrder } from "../data/items";
import MinecraftMarket3D from "./MinecraftMarket3D";
import WordSearchHanacaraka from "./WordSearchHanacaraka";
import { playMarketAmbience } from "../utils/audioHelper";

const AKSARA_EXAMPLES: Record<string, { script: string; latin: string; eng: string }[]> = {
  "ꦲ": [
    { script: "ꦲꦂꦒ", latin: "Harga", eng: "Price" },
    { script: "ꦲꦱꦶꦭ꧀", latin: "Hasil", eng: "Produce" }
  ],
  "ꦤ": [
    { script: "ꦤꦱꦶ", latin: "Nasi", eng: "Rice" },
    { script: "ꦤꦩꦏ", latin: "Namak (Garam)", eng: "Salt" }
  ],
  "ꦕ": [
    { script: "ꦕꦧꦺ", latin: "Cabai", eng: "Chili" },
    { script: "ꦕꦺꦤꦶꦭ꧀", latin: "Cenil", eng: "Cenil Candy" }
  ],
  "ꦫ": [
    { script: "ꦫꦱ", latin: "Rasa", eng: "Taste" },
    { script: "ꦫꦺꦴꦠꦶ", latin: "Roti", eng: "Bread" }
  ],
  "ꦏ": [
    { script: "ꦏꦺꦴꦥꦶ", latin: "Kopi", eng: "Coffee" },
    { script: "ꦏꦼꦭꦥ", latin: "Kelapa", eng: "Coconut" }
  ],
  "ꦢ": [
    { script: "ꦢꦒꦶꦁ", latin: "Daging", eng: "Meat" },
    { script: "ꦢꦸꦏꦸ", latin: "Duku", eng: "Duku Fruit" }
  ],
  "ꦠ": [
    { script: "ꦠꦺꦴꦩꦠ꧀", latin: "Tomat", eng: "Tomato" },
    { script: "ꦠꦺꦥꦸꦁ", latin: "Tepung", eng: "Flour" }
  ],
  "ꦱ": [
    { script: "ꦱꦩ꧀ꦧꦼꦭ꧀", latin: "Sambel", eng: "Chili Paste" },
    { script: "ꦱꦭꦏ꧀", latin: "Salak", eng: "Snake Fruit" }
  ],
  "ꦮ": [
    { script: "ꦮꦂꦠꦼꦒ꧀", latin: "Warteg", eng: "Food Stall" },
    { script: "ꦮꦺꦴꦂꦠꦺꦭ꧀", latin: "Wortel", eng: "Carrot" }
  ],
  "ꦭ": [
    { script: "ꦭꦺꦩꦺꦴꦤ꧀", latin: "Lemon", eng: "Lemon" },
    { script: "ꦭꦺꦴꦩ꧀ꦧꦺꦴꦏ꧀", latin: "Lombok", eng: "Chili" }
  ],
  "ꦥ": [
    { script: "ꦥꦺꦥꦪ", latin: "Pepaya", eng: "Papaya" },
    { script: "ꦥꦶꦱꦁ", latin: "Pisang", eng: "Banana" }
  ],
  "ꦝ": [
    { script: "ꦝꦺꦴꦁꦏꦼꦭ꧀", latin: "Dongkel", eng: "Root Tuber" },
    { script: "ꦝꦸꦮꦼꦠ꧀", latin: "Duwet", eng: "Black Plum" }
  ],
  "ꦗ": [
    { script: "ꦗꦩꦸ", latin: "Jamu", eng: "Herbal Elixir" },
    { script: "ꦗꦼꦫꦸꦏ꧀", latin: "Jeruk", eng: "Orange" }
  ],
  "ꦪ": [
    { script: "ꦪꦱ꧀ꦩꦶꦤ꧀", latin: "Yasmin", eng: "Jasmine Tea" },
    { script: "ꦪꦥꦺꦴꦤ꧀", latin: "Yapon", eng: "Traditional Coin" }
  ],
  "ꦚ": [
    { script: "ꦚꦩ꧀ꦥꦭ꧀", latin: "Nyampal", eng: "To snack" },
    { script: "ꦚꦩꦶꦏꦤ꧀", latin: "Nyamikan", eng: "Snacks" }
  ],
  "ꦩ": [
    { script: "ꦩꦢꦸ", latin: "Madu", eng: "Honey" },
    { script: "ꦩꦶꦚꦏ꧀", latin: "Minyak", eng: "Cooking oil" }
  ],
  "ꦒ": [
    { script: "ꦒꦸꦭ", latin: "Gula", eng: "Sugar" },
    { script: "ꦒꦼꦛꦸꦏ꧀", latin: "Gethuk", eng: "Cassava Cake" }
  ],
  "ꦧ": [
    { script: "ꦧꦦꦁ", latin: "Bawang", eng: "Onion/Garlic" },
    { script: "ꦧꦼꦫꦱ꧀", latin: "Beras", eng: "Raw Rice" }
  ],
  "ꦛ": [
    { script: "ꦛꦶꦦꦸꦭ꧀", latin: "Thiwul", eng: "Cassava Rice" },
    { script: "ꦛꦺꦴꦭꦺꦴ", latin: "Tholo", eng: "Cowpeas" }
  ],
  "ꦔ": [
    { script: "ꦔꦸꦤꦸꦠ꧀", latin: "Ngunut", eng: "Market Region" },
    { script: "ꦔꦶꦤꦸꦩ꧀", latin: "Nginum", eng: "Drink" }
  ],
  "ꦶ": [
    { script: "ꦏꦶꦦꦶ", latin: "Kiwi", eng: "Kiwi Fruit" },
    { script: "ꦥꦶꦱꦁ", latin: "Pisang", eng: "Banana" }
  ],
  "ꦸ": [
    { script: "ꦏꦸꦤꦶꦂ", latin: "Kunir", eng: "Turmeric" },
    { script: "ꦠꦶꦦꦸꦭ꧀", latin: "Tiwul", eng: "Cassava Rice" }
  ],
  "ꦺ": [
    { script: "ꦗꦺꦴꦒꦺꦴ", latin: "Jogo", eng: "Storekeeper" },
    { script: "ꦠꦺꦥꦸꦁ", latin: "Tepung", eng: "Flour" }
  ],
  "ꦼ": [
    { script: "ꦧꦼꦫꦱ꧀", latin: "Beras", eng: "Raw Rice" },
    { script: "ꦏꦼꦭꦥ", latin: "Kelapa", eng: "Coconut" }
  ]
};

const STALL_CRAFT_INGREDIENTS = {
  kelontong: [
    { id: "nira", name: "🍯 Nira Aren", color: "bg-amber-100 border-amber-450 text-amber-950" },
    { id: "batok", name: "🥥 Batok Kelapa", color: "bg-amber-200 border-amber-500 text-amber-950" },
    { id: "padi", name: "🌾 Padi Emas", color: "bg-yellow-100 border-yellow-450 text-amber-950" },
    { id: "goni", name: "📦 Karung Goni", color: "bg-stone-200 border-stone-400 text-stone-900" },
    { id: "kopi_biji", name: "🫘 Biji Kopi", color: "bg-amber-900 border-amber-950 text-amber-50" },
    { id: "tali", name: "🪢 Tali Jerami", color: "bg-yellow-200 border-yellow-450 text-amber-950" },
    { id: "tanah", name: "🧱 Tanah Liat", color: "bg-stone-300 border-stone-550 text-stone-900" },
    { id: "air", name: "💧 Air Sumur", color: "bg-blue-100 border-blue-450 text-blue-950" }
  ],
  jamu: [
    { id: "jahe", name: "🫚 Jahe Segar", color: "bg-orange-100 border-orange-450 text-orange-950" },
    { id: "parutan", name: "🪵 Parunan Kayu", color: "bg-amber-200 border-amber-450 text-amber-950" },
    { id: "air_matang", name: "💧 Air Panas", color: "bg-blue-100 border-blue-400 text-blue-950" },
    { id: "kunyit", name: "💛 Kunyit", color: "bg-yellow-150 border-yellow-450 text-amber-950" },
    { id: "asam", name: "Asam Jawa", color: "bg-amber-800 border-amber-950 text-amber-50" },
    { id: "kencur", name: "🫚 Kencur", color: "bg-green-100 border-green-400 text-green-950" },
    { id: "madu", name: "🐝 Madu Alas", color: "bg-yellow-50 border-yellow-400 text-amber-950" },
    { id: "botol", name: "🍾 Botol Kaca", color: "bg-slate-200 border-slate-400 text-slate-900" }
  ],
  buah: [
    { id: "pisang", name: "🍌 Pisang Sisir", color: "bg-yellow-100 border-yellow-400 text-amber-950" },
    { id: "daun", name: "🍃 Daun Pisang", color: "bg-emerald-100 border-emerald-455 text-emerald-950" },
    { id: "nanas_raw", name: "🍍 Nanas Madu", color: "bg-amber-100 border-amber-400 text-amber-950" },
    { id: "pisau", name: "🔪 Pisau Kupas", color: "bg-slate-300 border-slate-500 text-slate-900" },
    { id: "lombok_raw", name: "🌶️ Cabai Rawit", color: "bg-red-100 border-red-400 text-red-950" },
    { id: "ulekan", name: "🪨 Ulekan Batu", color: "bg-stone-300 border-stone-500 text-stone-900" },
    { id: "pala_raw", name: "🌰 Biji Pala", color: "bg-neutral-200 border-neutral-400 text-neutral-900" },
    { id: "tampah", name: "🌾 Nyiru Tampah", color: "bg-amber-100 border-amber-400 text-amber-950" }
  ]
};

const ITEM_CRAFT_RECIPES: Record<string, { label: string; ingredients: string[] }> = {
  "gula": { label: "Gula Jawa", ingredients: ["nira", "batok"] },
  "beras": { label: "Beras Cianjur", ingredients: ["padi", "goni", "tali"] },
  "kopi": { label: "Kopi Tubruk", ingredients: ["kopi_biji", "goni"] },
  "bata": { label: "Bata Merah", ingredients: ["tanah", "air"] },
  "jahe": { label: "Jahe Emprit", ingredients: ["jahe", "parutan", "air_matang"] },
  "kunyit": { label: "Kunyit Kuning", ingredients: ["kunyit", "asam", "air_matang"] },
  "kencur": { label: "Kencur Wangi", ingredients: ["kencur", "air_matang"] },
  "madu": { label: "Madu Alas", ingredients: ["madu", "botol"] },
  "lombok": { label: "Lombok Abang", ingredients: ["lombok_raw", "ulekan"] },
  "gedhang": { label: "Gedhang Raja", ingredients: ["pisang", "daun"] },
  "nanas": { label: "Nanas Madu", ingredients: ["nanas_raw", "pisau"] },
  "pala": { label: "Pala Harum", ingredients: ["pala_raw", "tampah"] }
};

const getAksaraLevelRequired = (index: number): number => {
  if (index < 5) return 1;    // Ha, Na, Ca, Ra, Ka
  if (index < 10) return 3;   // Da, Ta, Sa, Wa, La
  if (index < 15) return 5;   // Pa, Dha, Ja, Ya, Nya
  if (index < 20) return 7;   // Ma, Ga, Ba, Tha, Nga
  return 10;                  // Sandhangan
};

const playPronunciation = (phonetic: string, dialect: 'O' | 'A' = 'O', name?: string) => {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // safe fallback
    }

    let textToSpeak = phonetic.toLowerCase();
    
    // Traditional Javanese "O-vocal" mapping for Aksara Nglegena
    const JAVANESE_O_MAP: Record<string, string> = {
      "ha": "ho",
      "na": "no",
      "ca": "co",
      "ra": "ro",
      "ka": "ko",
      "da": "do",
      "ta": "to",
      "sa": "so",
      "wa": "wo",
      "la": "lo",
      "pa": "po",
      "dha": "dho",
      "ja": "jo",
      "ya": "yo",
      "nya": "nyo",
      "ma": "mo",
      "ga": "go",
      "ba": "bo",
      "tha": "tho",
      "nga": "ngo",
    };

    if (dialect === 'O' && JAVANESE_O_MAP[textToSpeak]) {
      textToSpeak = JAVANESE_O_MAP[textToSpeak];
    }

    // Informative cues for Sandhangan vowels
    if (name && name.toLowerCase().includes("wulu")) {
      textToSpeak = "wulu, mengubah vokal menjadi i";
    } else if (name && name.toLowerCase().includes("suku")) {
      textToSpeak = "suku, mengubah vokal menjadi u";
    } else if (name && name.toLowerCase().includes("taling")) {
      textToSpeak = "taling, mengubah vokal menjadi e";
    } else if (name && name.toLowerCase().includes("pepet")) {
      textToSpeak = "pepet, mengubah vokal menjadi e";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Choose the best voice (jv-ID of Javanese or id-ID for Indonesian)
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === 'jv-ID' || v.lang.startsWith('jv'));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }
};

interface MarketGameProps {
  user: UserProfile | null;
  initialProgress: GameProgress | null;
  token: string | null;
  onLogout: () => void;
  selectedRole?: 'pembeli' | 'penjual';
  onSwitchRole?: () => void;
  initialTab?: 'pasar' | 'kamus' | 'latihan' | 'juara' | 'toko';
  initialLevelOverride?: number;
  initialStallOverride?: 'kelontong' | 'jamu' | 'buah';
}

export default function MarketGame({ user, initialProgress, token, onLogout, selectedRole = 'pembeli', onSwitchRole, initialTab = 'pasar', initialLevelOverride, initialStallOverride }: MarketGameProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'pasar' | 'kamus' | 'latihan' | 'juara' | 'toko'>(initialTab);
  
  // Game state
  const [coins, setCoins] = useState(initialProgress?.coins ?? 350);
  const [level, setLevel] = useState(initialLevelOverride ?? initialProgress?.level ?? 1);
  const [xp, setXp] = useState(initialProgress?.xp ?? 0);
  const [title, setTitle] = useState(initialProgress?.title ?? "Caliye (Pemula)");
  const [unlockedStalls, setUnlockedStalls] = useState<string[]>(initialProgress?.unlockedStalls ?? ["kelontong"]);
  const [completedCount, setCompletedCount] = useState(initialProgress?.completedCount ?? 0);
  const [reputation, setReputation] = useState<number>(5);
  const [countdown, setCountdown] = useState<number>(30);

  // 3D Motion Game states
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  // Active Stall context
  const [currentStall, setCurrentStall] = useState<'kelontong' | 'jamu' | 'buah'>(initialStallOverride ?? 'kelontong');
  
  // Quiz context
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [spellingAnswers, setSpellingAnswers] = useState<string[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isTradingActive, setIsTradingActive] = useState(false);
  const [craftedIngredients, setCraftedIngredients] = useState<string[]>([]);
  const [serviceMode, setServiceMode] = useState<'instant' | 'cook'>('instant');

  // Purchased items from Pasar Krempyeng (Store Tab)
  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hanacaraka_purchased_items");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const buyStoreItem = (itemId: string, cost: number, itemName: string) => {
    if (purchasedItems.includes(itemId)) {
      alert(`Anda sudah memiliki ${itemName}!`);
      return;
    }
    if (coins < cost) {
      alert(`Wah, tabungan Koin Keper Anda belum mencukupi untuk membeli ${itemName}!`);
      return;
    }
    const nextCoins = coins - cost;
    const nextItems = [...purchasedItems, itemId];
    setCoins(nextCoins);
    setPurchasedItems(nextItems);
    localStorage.setItem("hanacaraka_purchased_items", JSON.stringify(nextItems));
    saveProgress(nextCoins, level, xp, title, unlockedStalls, completedCount);
    alert(`Sugeng! Anda berhasil membeli ${itemName}!`);
  };

  // Settings & Ambience context
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAmbienceEnabled, setIsAmbienceEnabled] = useState(false);
  const ambienceSourceRef = useRef<any>(null);

  const toggleAmbience = () => {
    if (isAmbienceEnabled) {
      if (ambienceSourceRef.current) {
        try {
          ambienceSourceRef.current.stop();
        } catch (err) {
          console.warn("Error stopping ambience:", err);
        }
        ambienceSourceRef.current = null;
      }
      setIsAmbienceEnabled(false);
    } else {
      const node = playMarketAmbience();
      if (node) {
        ambienceSourceRef.current = node;
        setIsAmbienceEnabled(true);
      } else {
        alert("Gagal mengaktifkan audio latar belakang. Pastikan Anda memberi izin suara pada peramban.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (ambienceSourceRef.current) {
        try {
          ambienceSourceRef.current.stop();
        } catch (err) {
          console.warn("Cleanup error stopping ambience:", err);
        }
      }
    };
  }, []);

  // Auto-ticking countdown timer for seller gamified pressure
  useEffect(() => {
    if (activeTab !== 'pasar' || selectedRole !== 'penjual' || !currentOrder || quizFeedback) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const deduction = 5;
          setCoins(c => Math.max(0, c - deduction));
          setReputation(r => {
            const nextRep = r - 1;
            if (nextRep <= 0) {
              setQuizFeedback({
                isCorrect: false,
                message: `⌛ Waktu habis & Reputasi Toko Rusak! Pembeli terlalu lama mengantri. Terkena denda ganti rugi -15 Keper, mari kembali fokus!`
              });
              setCoins(c => Math.max(0, c - 15));
              return 5;
            }
            return nextRep;
          });
          
          if (reputation > 1) {
            setQuizFeedback({
              isCorrect: false,
              message: `⌛ Waktu habis! ${currentOrder.customerName} lelah menunggu lalu pergi ke toko sebelah. Koin berkurang -${deduction} Keper.`
            });
          }
          setAdvisorMessage("Waktu pelayanan sangat berharga. Mari percepat membaca pesanan pembeli lain agar reputasi warung Anda tetap harum terpuji.");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrder, quizFeedback, activeTab, selectedRole, reputation]);

  // Reset countdown duration whenever a fresh buyer approaches
  useEffect(() => {
    setCountdown(30);
  }, [currentOrder]);


  // Dictionary state
  const [selectedAksara, setSelectedAksara] = useState<typeof AKSARA_LIST[0] | null>(AKSARA_LIST[0]);
  const [recitingIndex, setRecitingIndex] = useState<number | null>(null);

  // Automatic Javanese recitation sequencer
  useEffect(() => {
    if (recitingIndex === null) return;
    if (recitingIndex >= 20) {
      setRecitingIndex(null);
      return;
    }

    const currentAksara = AKSARA_LIST[recitingIndex];
    setSelectedAksara(currentAksara);

    let textToSpeak = currentAksara.phonetic.toLowerCase();
    
    // Convert to authentic "O" sounds for traditional reciting rhythm
    const JAVANESE_O_MAP: Record<string, string> = {
      "ha": "ho", "na": "no", "ca": "co", "ra": "ro", "ka": "ko",
      "da": "do", "ta": "to", "sa": "so", "wa": "wo", "la": "lo",
      "pa": "po", "dha": "dho", "ja": "jo", "ya": "yo", "nya": "nyo",
      "ma": "mo", "ga": "go", "ba": "bo", "tha": "tho", "nga": "ngo"
    };

    if (JAVANESE_O_MAP[textToSpeak]) {
      textToSpeak = JAVANESE_O_MAP[textToSpeak];
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === 'jv-ID' || v.lang.startsWith('jv'));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    utterance.rate = 0.7; // slower for clarity
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setTimeout(() => {
        setRecitingIndex(prev => prev !== null ? prev + 1 : null);
      }, 450);
    };

    utterance.onerror = () => {
      setRecitingIndex(prev => prev !== null ? prev + 1 : null);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      utterance.onend = null;
      utterance.onerror = null;
    };
  }, [recitingIndex]);

  // Cancel automatic recitation if leaving the tab
  useEffect(() => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // safe fallback
      }
    }
    setRecitingIndex(null);
  }, [activeTab]);

  // Advisor / Mbah Gemini Hint state
  const [advisorMessage, setAdvisorMessage] = useState<string>("Sugeng rawuh! Tekan tombol 'Tanya Mbah' jika Anda bingung membedakan Aksara Jawa di bungkusan pembeli.");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#a33818");
  const [traceChar, setTraceChar] = useState("ꦲ");

  // Shop state variables
  const [unlockedHints, setUnlockedHints] = useState(false);

  // Load new order when stall or level changes
  useEffect(() => {
    generateNewCustomer();
  }, [currentStall]);

  // Sync state with server/local storage on adjustments
  const saveProgress = async (newCoins: number, newLevel: number, newXp: number, newTitle: string, newStalls: string[], newCompleted: number) => {
    // Save locally
    const lState = { coins: newCoins, level: newLevel, xp: newXp, title: newTitle, unlockedStalls: newStalls, completedCount: newCompleted };
    localStorage.setItem("hanacaraka_guest_progress", JSON.stringify(lState));

    if (token && user) {
      try {
        await fetch("/api/game/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            coins: newCoins,
            level: newLevel,
            xp: newXp,
            title: newTitle,
            unlockedStalls: newStalls,
            completedCount: newCompleted
          })
        });
      } catch (e) {
        console.error("Gagal sinkron data ke server", e);
      }
    }
  };

  const generateNewCustomer = () => {
    setSelectedOption(null);
    setSpellingAnswers([]);
    setQuizFeedback(null);
    setIsTradingActive(false);
    setCraftedIngredients([]);
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    const order = generateRandomOrder(currentStall, level, selectedRole);
    setCurrentOrder(order);
  };

  // Upgrades Titles based on XP / Levels
  const checkLevelUp = (currentXp: number, currentLvl: number) => {
    if (!user) return; // Guest users do not level up

    const xpNeeded = currentLvl * 100;
    let nextLvl = currentLvl;
    let nextXp = currentXp;
    
    if (currentXp >= xpNeeded) {
      nextLvl += 1;
      nextXp = currentXp - xpNeeded;
      
      // Determine Javanese Vendor Titles
      let nextTitle = "Caliye (Pemula)";
      if (nextLvl >= 10) nextTitle = "Juragan Ageng (Market Master)";
      else if (nextLvl >= 7) nextTitle = "Bakul Kinasih (Veteran Merchant)";
      else if (nextLvl >= 5) nextTitle = "Sedulur Pasar (Trusted Trader)";
      else if (nextLvl >= 3) nextTitle = "Prakanca (Apprentice)";

      setTitle(nextTitle);
      setLevel(nextLvl);
      
      // Level Up Alarm Announcement
      setQuizFeedback({
        isCorrect: true,
        message: `🎉 SELAMAT! Anda naik pangkat menjadi '${nextTitle}'! Warung Anda semakin ramai pembeli!`
      });
    }
    setXp(nextXp);
    saveProgress(coins, nextLvl, nextXp, title, unlockedStalls, completedCount);
  };

  const getOptionVisuals = (optionText: string, stall: 'kelontong' | 'jamu' | 'buah') => {
    const normalized = optionText.toLowerCase().trim();
    
    if (normalized.includes("gula") || normalized === "ꦒꦸꦭ") {
      return { icon: "shopping_bag", color: "bg-red-100", label: "Gula Aren", textCol: "text-red-700" };
    }
    if (normalized.includes("beras") || normalized === "ꦧꦼꦫꦱ꧀") {
      return { icon: "rice_bowl", color: "bg-amber-100", label: "Beras Cianjur", textCol: "text-amber-800" };
    }
    if (normalized.includes("kopi") || normalized === "ꦏꦺꦴꦥꦶ") {
      return { icon: "coffee", color: "bg-orange-100", label: "Kopi Hitam", textCol: "text-amber-950" };
    }
    if (normalized.includes("bata") || normalized === "ꦧꦠ") {
      return { icon: "layers", color: "bg-stone-200", label: "Bata Merah", textCol: "text-stone-750" };
    }
    if (normalized.includes("jahe") || normalized === "ꦗꦲꦺ") {
      return { icon: "eco", color: "bg-emerald-100", label: "Jahe Emprit", textCol: "text-emerald-800" };
    }
    if (normalized.includes("kunyit") || normalized === "ꦏꦸꦚꦶꦠ꧀") {
      return { icon: "spa", color: "bg-yellow-100", label: "Kunyit Kuning", textCol: "text-yellow-700" };
    }
    if (normalized.includes("kencur") || normalized === "ꦏꦼꦚ꧀ꦕꦸꦂ") {
      return { icon: "grass", color: "bg-green-100", label: "Kencur Wangi", textCol: "text-green-850" };
    }
    if (normalized.includes("madu") || normalized === "ꦩꦢꦸ") {
      return { icon: "hive", color: "bg-yellow-50", label: "Madu Alas", textCol: "text-amber-700" };
    }
    if (normalized.includes("lombok") || normalized === "ꦭꦺꦴꦩ꧀ꦧꦺꦴꦏ꧀") {
      return { icon: "local_fire_department", color: "bg-red-50", label: "Lombok Pedas", textCol: "text-red-700" };
    }
    if (normalized.includes("gedhang") || normalized === "ꦒꦼꦝꦁ") {
      return { icon: "restaurant", color: "bg-yellow-100", label: "Gedhang Raja", textCol: "text-yellow-800" };
    }
    if (normalized.includes("nanas") || normalized === "ꦤꦤꦱ꧀") {
      return { icon: "nutrition", color: "bg-amber-50", label: "Nanas Madu", textCol: "text-amber-900" };
    }
    if (normalized.includes("pala") || normalized === "ꦥꦭ") {
      return { icon: "grid_view", color: "bg-[#e7bdb1]", label: "Pala Harum", textCol: "text-amber-950" };
    }

    const defaults = [
      { icon: "shopping_bag", color: "bg-neutral-100", label: "Kotak Produk", textCol: "text-neutral-700" },
      { icon: "deployed_code", color: "bg-blue-105", label: "Barang Dagang", textCol: "text-blue-800" },
      { icon: "category", color: "bg-purple-100", label: "Bumbu Dapur", textCol: "text-purple-800" },
      { icon: "grain", color: "bg-orange-100", label: "Kemasan Jawi", textCol: "text-orange-900" }
    ];
    const charSum = optionText.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return defaults[charSum % defaults.length];
  };

  const handleSelectOption = (opt: string) => {
    if (quizFeedback || !currentOrder) return;
    setSelectedOption(opt);

    const isMatch = opt === currentOrder.correctAnswer;
    processAnswer(isMatch);
  };

  const handleSpellClick = (letter: string) => {
    if (quizFeedback || !currentOrder) return;
    const nextAnswers = [...spellingAnswers, letter];
    setSpellingAnswers(nextAnswers);

    // If fully spelled
    const fullSpelling = nextAnswers.join("");
    if (fullSpelling.length >= currentOrder.correctAnswer.length) {
      const isMatch = fullSpelling === currentOrder.correctAnswer;
      processAnswer(isMatch);
    }
  };

  const speakJavanese = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      let textToSpeak = text.toLowerCase();
      
      const JAVANESE_O_MAP: Record<string, string> = {
        "ha": "ho", "na": "no", "ca": "co", "ra": "ro", "ka": "ko",
        "da": "do", "ta": "to", "sa": "so", "wa": "wo", "la": "lo",
        "pa": "po", "dha": "dho", "ja": "jo", "ya": "yo", "nya": "nyo",
        "ma": "mo", "ga": "go", "ba": "bo", "tha": "tho", "nga": "ngo",
        "gula": "gulo", "bata": "boto", "pala": "polo", "nanas": "nanos",
        "gedhang": "gedhang"
      };

      if (JAVANESE_O_MAP[textToSpeak]) {
        textToSpeak = JAVANESE_O_MAP[textToSpeak];
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(v => v.lang === 'jv-ID' || v.lang.startsWith('jv'));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'id-ID';
      }

      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  const handleServeCrafted = () => {
    if (!currentOrder) return;
    const currentItemJavaneseName = currentOrder.itemRequested.javaneseName;
    const recipe = ITEM_CRAFT_RECIPES[currentItemJavaneseName];
    if (!recipe) {
      alert("Resep tidak ditemukan untuk barang ini!");
      return;
    }

    const sortedTarget = [...recipe.ingredients].sort().join(",");
    const sortedCurrent = [...craftedIngredients].sort().join(",");

    if (sortedTarget === sortedCurrent) {
      processAnswer(true);
    } else {
      const deduction = Math.max(2, Math.floor(level * 1.5));
      const nextCoins = Math.max(0, coins - deduction);
      setCoins(nextCoins);
      setConsecutiveCorrect(0);

      const targetStallIngredients = STALL_CRAFT_INGREDIENTS[currentStall as 'kelontong' | 'jamu' | 'buah'] || [];

      setReputation(prev => {
        const nextRep = prev - 1;
        if (nextRep <= 0) {
          const brokenDeduction = 20;
          setCoins(c => Math.max(0, c - brokenDeduction));
          setQuizFeedback({
            isCorrect: false,
            message: `💥 REPUTASI WARUNG RUSAK! Pembeli kecewa karena disajikan ramuan keliru berulang-ulang. Koin dipotong -${brokenDeduction} Keper untuk ganti rugi, namun Mbah menyemangati Anda untuk bangkit belajar lagi!`
          });
          return 5;
        } else {
          setQuizFeedback({
            isCorrect: false,
            message: `Salah! Bahan racikan Anda kurang cocok. Koin terpotong -${deduction}. Jawabannya adalah '${recipe.label}' dengan bahan: ${recipe.ingredients.map(i => {
              const ing = targetStallIngredients.find(ingr => ingr.id === i);
              return ing ? ing.name : i;
            }).join(" + ")}!`
          });
        }
        return nextRep;
      });

      setAdvisorMessage(`Eling-eling, Cah Bagus/Cah Ayu. Barang '${currentOrder.itemRequested.name}' butuh racikan '${recipe.label}' yang berisi: ${recipe.ingredients.map(i => {
        const ing = targetStallIngredients.find(ingr => ingr.id === i);
        return ing ? ing.name : i;
      }).join(", ")}.`);

      saveProgress(nextCoins, level, xp, title, unlockedStalls, completedCount);
    }
  };

  const processAnswer = (isCorrect: boolean) => {
    if (!currentOrder) return;

    if (isCorrect) {
      //const rewardCoins = currentOrder.bonusCoins;
      const rewardCoins = currentOrder.bonusCoins;
      // XP only for logged in users
      const rewardXp = user ? 20 + level * 5 : 0;
      const nextCoins = coins + rewardCoins;
      const nextXp = xp + rewardXp;
      const nextCompleted = completedCount + 1;

      setCoins(nextCoins);
      setCompletedCount(nextCompleted);
      setConsecutiveCorrect(prev => prev + 1);
      setReputation(r => Math.min(5, r + 1));

      setQuizFeedback({
        isCorrect: true,
        message: selectedRole === 'pembeli'
          ? `Leres! (Benar!) Anda berhasil bertransaksi membeli barang dan menerima kembalian ${rewardCoins} Koin Jawi serta +${rewardXp} XP!`
          : `Leres! (Benar!) Pembeli menyerahkan ${rewardCoins} Koin Keper Jawi dan memberi Anda +${rewardXp} XP!`
      });

      // Update AI message automatically to keep players engaged
      setAdvisorMessage(selectedRole === 'pembeli'
        ? `Apik sanget! Transaksi berhasil membeli dari ${currentOrder.customerName}. Teruskan berbelanja!`
        : `Apik sanget! Transaksi berhasil dengan ${currentOrder.customerName}. Teruskan melayani pembeli agar tabungan emas Anda menggunung!`
      );

      // Trigger server save
      saveProgress(nextCoins, level, nextXp, title, unlockedStalls, nextCompleted);
      setTimeout(() => checkLevelUp(nextXp, level), 2500);
      
      // Auto speak the Javanese name of the correct product to reinforce learning
      speakJavanese(currentOrder.itemRequested.javaneseName);
    } else {
      const deduction = Math.max(2, Math.floor(level * 1.5));
      const nextCoins = Math.max(0, coins - deduction);
      setCoins(nextCoins);
      setConsecutiveCorrect(0);

      const targetPhonetic = currentOrder.itemRequested.javaneseName;
      
      setReputation(prev => {
        const nextRep = prev - 1;
        if (nextRep <= 0) {
          const brokenDeduction = 20;
          setCoins(c => Math.max(0, c - brokenDeduction));
          setQuizFeedback({
            isCorrect: false,
            message: selectedRole === 'pembeli'
              ? `💥 REPUTASI BELANJA RUSAK! Pedagang kecewa karena Anda keliru menawar beruntun. Koin dipotong -${brokenDeduction} Keper, namun Mbah menyemangati Anda untuk bangkit belajar lagi!`
              : `💥 REPUTASI WARUNG RUSAK! Pembeli kecewa karena pelayanan keliru beruntun. Koin dipotong -${brokenDeduction} Keper untuk ganti rugi, namun Mbah menyemangati Anda untuk bangkit belajar lagi!`
          });
          return 5; // Reset to 5 lives
        } else {
          setQuizFeedback({
            isCorrect: false,
            message: `Salah! Koin terpotong -${deduction}. Jawabannya adalah '${currentOrder.correctAnswer}' (Mengeja '${targetPhonetic}'). Jangan menyerah!`
          });
        }
        return nextRep;
      });

      setAdvisorMessage(`Eling-eling, Cah Bagus/Cah Ayu. Barang '${currentOrder.itemRequested.name}' ditulis dengan aksara Jawa: '${currentOrder.itemRequested.javaneseScript}'. Perhatikan kamus kembali ya.`);

      saveProgress(nextCoins, level, xp, title, unlockedStalls, completedCount);
    }
  };


  // Advisor advice powered by Gemini Client
  const getAdvisorHint = async () => {
    if (!currentOrder) return;
    setAdvisorLoading(true);
    setAdvisorMessage("Mbah sedang mengusap kacamata tuanya...");

    try {
      const res = await fetch("/api/game/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Tolong jelaskan secara singkat dan jenaka cara membaca atau mengeja aksara '${currentOrder.itemRequested.javaneseScript}' yang dibeli oleh ${currentOrder.customerName}. Beri tahu huruf pertamanya dalam logat Javanese kental dan penuh kasih sayang.`,
          characterName: "Mbah Sunar (Penasihat Pasar)",
        })
      });
      const data = await res.json();
      setAdvisorMessage(data.reply || `Mbah menyarankan untuk mencocokkan huruf awal: '${currentOrder.correctAnswer}'.`);
    } catch (e) {
      setAdvisorMessage(`Mbah mengingatkan: '${currentOrder.itemRequested.name}' dieja '${currentOrder.itemRequested.javaneseScript}'. Ketuk huruf awal aksara '${currentOrder.correctAnswer}' untuk melayani.`);
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Load Leaderboard
  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch("/api/game/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (e) {
      console.error("Gagal memuat papan peringkat", e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'juara') {
      loadLeaderboard();
    }
  }, [activeTab]);

  // Shop transactions
  const buyStall = (stallId: string, cost: number) => {
    if (coins < cost) {
      alert("Wah, tabungan Koin Keper Anda belum mencukupi untuk sewa lapak ini!");
      return;
    }
    const nextStalls = [...unlockedStalls, stallId];
    const nextCoins = coins - cost;
    setCoins(nextCoins);
    setUnlockedStalls(nextStalls);
    saveProgress(nextCoins, level, xp, title, nextStalls, completedCount);
    alert(`Sugeng! Anda sukses memperluas dagang ke Lapak ${stallId.toUpperCase()}!`);
  };

  const buyHintMaster = (cost: number) => {
    if (coins < cost) {
      alert("Tabungan emas Anda belum mencukupi!");
      return;
    }
    setCoins(coins - cost);
    setUnlockedHints(true);
    saveProgress(coins - cost, level, xp, title, unlockedStalls, completedCount);
    alert("Sukses membeli 'Kamus Saku Jawa'! Terjemahan fonetik latin dari aksara pembeli akan selalu terlihat!");
  };

  // Canvas Drawing Methods for tracing sandbox
  useEffect(() => {
    if (activeTab === 'latihan') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = brushColor;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [activeTab, brushColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retrieve drawing positions bounding
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (activeTab === 'kamus') {
    const startRecitation = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setRecitingIndex(0);
      }
    };

    const stopRecitation = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setRecitingIndex(null);
    };

    return (
      <div className="bg-[#fffadf] text-[#1e1c00] font-body-md min-h-screen flex flex-col pb-24 md:pb-0 relative">
        {/* TopAppBar */}
        <header className="docked full-width top-0 bg-[#f6f0bb] border-b-2 border-[#dfc0b8] flex justify-between items-center w-full px-4 h-16 z-40 sticky shadow-sm">
          <div className="flex items-center gap-2 max-w-[50%]">
            <button 
              onClick={() => setActiveTab('pasar')}
              className="text-[#a33818] hover:bg-[#dfc0b8]/30 transition-colors active:translate-y-[2px] p-2 rounded-full flex items-center justify-center cursor-pointer border border-[#dfc0b8]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
            </button>
            <h1 className="font-bold text-base sm:text-xl text-[#a33818] truncate" style={{ fontFamily: "'Lexend', sans-serif" }}>Pustaka Aksara</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('latihan')}
              className="bg-[#a33818] text-white hover:bg-[#862303] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-[0_2.5px_0_0_#5a1601] transition-all active:translate-y-[2px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">brush</span>
              <span className="hidden sm:inline">Papan Tulis Pasir</span>
              <span className="sm:hidden">Tulis Pasir</span>
            </button>

            <div className="flex items-center gap-1.5 font-bold text-[#58423c] bg-white border-2 border-[#dfc0b8] px-3.5 py-1.5 rounded-full shadow-sm text-xs md:text-sm">
              <span>{coins}</span>
              <span className="text-sm">🪙</span>
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Promo Sand Writing Blackboard Banner */}
          <div className="bg-[#a33818] text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border-b-4 border-[#5a1601] mt-2">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>brush</span>
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm md:text-base">Papan Tulis Pasir Hanacaraka</h3>
                <p className="text-xs text-[#fffadf]/80 mt-0.5 leading-relaxed">
                  Ingin membiasakan jemari meliuk menulis aksara Jawa? Ikuti jiplakan pola pasir kami!
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('latihan')}
              className="bg-[#fffadf] text-[#a33818] hover:bg-[#ffe4d6] px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_3px_0_0_#a13813]/40 active:translate-y-1 active:shadow-none shrink-0"
            >
              <span className="material-symbols-outlined text-sm font-bold">brush</span>
              <span>Coba Tulis Pasir</span>
            </button>
          </div>

          {/* Active Character Focus Area (The 'Bakul' Concept) */}
          <section className="bg-white border-2 border-[#dfc0b8] rounded-2xl p-6 flex flex-col items-center shadow-md relative overflow-hidden mt-2">
            {/* Ambient background watermark */}
            <div className="absolute right-4 top-4 text-7xl font-bold font-aksara-display opacity-[0.03] select-none pointer-events-none">
              ꦗꦮ
            </div>
            
            <div className="bg-[#fffadf] rounded-2xl border-2 border-[#dfc0b8] p-8 w-full max-w-[180px] aspect-square flex items-center justify-center mb-5 relative shadow-inner">
              <span className="font-aksara-display text-[75px] leading-none text-[#a33818]">
                {selectedAksara ? selectedAksara.char : "ꦲ"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 mb-6 w-full text-center">
              <h2 className="font-bold text-2xl md:text-3xl text-amber-950 flex flex-wrap items-center justify-center gap-2">
                {selectedAksara ? selectedAksara.name : "Ha"}
                <span className="text-xs px-2.5 py-0.5 bg-[#a33818]/10 text-[#a33818] rounded-full font-bold border border-[#a33818]/20">
                  {selectedAksara?.category === 'nglegena' ? 'Aksara Nglegena' : 'Sandhangan Vokal'}
                </span>
              </h2>

              <p className="text-xs text-neutral-500 font-medium max-w-md mx-auto italic">
                {selectedAksara?.category === 'nglegena' 
                  ? "Aksara konsonan utama pembentuk kata dalam bahasa Jawa tradional Ngoko/Krama."
                  : "Modifikator vokal yang disematkan untuk mengubah suara bawaan ketukan konsonan."}
              </p>

              {/* Dual dialect phonetic audio buttons */}
              <div className="flex flex-wrap gap-2.5 justify-center mt-3">
                <button 
                  onClick={() => {
                    if (selectedAksara) {
                      playPronunciation(selectedAksara.phonetic, 'O', selectedAksara.name);
                    }
                  }}
                  className="bg-[#a33818] hover:bg-[#862303] text-white px-4 py-2.5 rounded-xl shadow-[0_3px_0_0_#5a1601] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                  title="Mainkan suara dialek Jawa (O) asli"
                >
                  <span className="material-symbols-outlined text-sm font-bold">volume_up</span>
                  Lafal Jawa (O): <span className="underline font-black">{selectedAksara ? (selectedAksara.category === 'nglegena' ? selectedAksara.phonetic.replace('a', 'o') : selectedAksara.phonetic) : 'ho'}</span>
                </button>

                <button 
                  onClick={() => {
                    if (selectedAksara) {
                      playPronunciation(selectedAksara.phonetic, 'A', selectedAksara.name);
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl shadow-[0_3px_0_0_#913c01] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                  title="Mainkan suara dialek Kawi/Akademis (A)"
                >
                  <span className="material-symbols-outlined text-sm font-bold">volume_up</span>
                  Lafal Kawi (A): <span className="underline font-black">{selectedAksara ? selectedAksara.phonetic : 'ha'}</span>
                </button>
              </div>
            </div>
            
            {/* Example vocabulary list */}
            <div className="w-full bg-[#fffadf]/65 rounded-xl p-4 border border-[#dfc0b8]/60">
              <h3 className="font-bold text-xs text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Contoh Penggunaan Kata
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(AKSARA_EXAMPLES[selectedAksara?.char || "ꦲ"] || [
                  { script: "ꦲꦂꦒ", latin: "Harga", eng: "Price" },
                  { script: "ꦲꦱꦶꦭ꧀", latin: "Hasil", eng: "Produce" }
                ]).map((ex, exIdx) => (
                  <li key={exIdx} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-[#dfc0b8]/30">
                    <span className="font-bold text-amber-950 text-sm">{ex.script} ({ex.latin})</span>
                    <span className="text-neutral-500 text-xs font-semibold">{ex.eng}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Automatic Recitation Control Panel */}
          <section className="bg-amber-50 border-2 border-[#dfc0b8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-[#a33818]/10 text-[#a33818] rounded-full flex items-center justify-center border border-[#a33818]/25 shrink-0">
                <span className="material-symbols-outlined font-bold">autoplay</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-amber-950 text-sm">Lantunan Urutan Hanacaraka otomatis</h4>
                <p className="text-xs text-amber-900/75 leading-relaxed">Sistem akan membacakan baris demi baris 20 huruf utama dengan aksen vokal Jawa medok autentik.</p>
              </div>
            </div>
            {recitingIndex === null ? (
              <button
                onClick={startRecitation}
                className="bg-[#a33818] hover:bg-[#862303] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_3px_0_0_#5a1601] active:translate-y-1 active:shadow-none shrink-0"
              >
                <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                Mulai Lantunan
              </button>
            ) : (
              <button
                onClick={stopRecitation}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_3px_0_0_#911c01] active:translate-y-1 active:shadow-none shrink-0 animate-pulse"
              >
                <span className="material-symbols-outlined text-sm font-bold">stop</span>
                Hentikan ({recitingIndex + 1}/20)
              </button>
            )}
          </section>

          {/* Script Grid - Aksara Nglegena */}
          <section className="mt-2">
            <div className="flex items-center justify-between mb-4.5">
              <h3 className="font-bold text-[#a33818] flex items-center gap-1.5 text-base md:text-lg">
                <span className="material-symbols-outlined text-[#a33818] font-bold">abc</span>
                Aksara Nglegena (Konsonan Utama)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-250 uppercase tracking-widest">
                Semua Terbuka ✨
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3.5">
              {AKSARA_LIST.filter(a => a.category === 'nglegena').map((aksara) => {
                const idx = AKSARA_LIST.findIndex(item => item.char === aksara.char);
                const levelRequired = getAksaraLevelRequired(idx);
                const isSelected = selectedAksara?.char === aksara.char;
                const isRecitingNow = recitingIndex === idx;

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSelectedAksara(aksara);
                      if (recitingIndex !== null) {
                        setRecitingIndex(null);
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }
                    }}
                    className={`${
                      isRecitingNow
                        ? 'bg-[#ffe4d6] border-2 border-[#a33818] text-[#a33818] scale-[1.05] shadow-[0_4px_12px_rgba(163,56,24,0.3)] animate-pulse'
                        : isSelected
                          ? 'bg-[#ffe4d6] text-[#a33818] border-2 border-[#a33818] shadow-[0_3px_0_0_#5a1601]'
                          : 'bg-white hover:bg-amber-100/30 text-amber-950 border border-[#dfc0b8]/80 shadow-[0_3.5px_0_0_#dfc0b8]'
                    } rounded-2xl aspect-square flex flex-col items-center justify-center transition-all active:translate-y-1 active:shadow-none cursor-pointer relative p-2`}
                  >
                    <span className="font-aksara-display text-[35px] md:text-[42px] leading-normal mb-1">{aksara.char}</span>
                    <span className={`text-[11px] md:text-xs font-black leading-none ${isSelected ? 'text-[#a33818]' : 'text-amber-900/80'}`}>{aksara.name}</span>
                    <span className="absolute bottom-1 right-1 px-1 bg-amber-100/40 rounded text-[8px] font-black text-amber-850 border border-amber-200/20">
                      Lvl {levelRequired}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Script Grid - Sandhangan Vokal */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4.5">
              <h3 className="font-bold text-[#a33818] flex items-center gap-1.5 text-base md:text-lg">
                <span className="material-symbols-outlined text-[#a33818] font-bold">translate</span>
                Sandhangan Vokal (Modifikasi Suara)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-250 uppercase tracking-widest">
                Semua Terbuka ✨
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {AKSARA_LIST.filter(a => a.category === 'sandhangan').map((aksara) => {
                const idx = AKSARA_LIST.findIndex(item => item.char === aksara.char);
                const levelRequired = getAksaraLevelRequired(idx);
                const isSelected = selectedAksara?.char === aksara.char;

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSelectedAksara(aksara);
                      if (recitingIndex !== null) {
                        setRecitingIndex(null);
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }
                    }}
                    className={`${
                      isSelected
                        ? 'bg-[#ffe4d6] text-[#a33818] border-2 border-[#a33818] shadow-[0_3px_0_0_#5a1601]'
                        : 'bg-white hover:bg-amber-100/30 text-amber-950 border border-[#dfc0b8]/80 shadow-[0_3.5px_0_0_#dfc0b8]'
                    } rounded-2xl p-4 flex flex-col items-center justify-center transition-all active:translate-y-1 active:shadow-none cursor-pointer relative min-h-[100px]`}
                  >
                    <span className="font-aksara-display text-[35px] md:text-[40px] leading-normal mb-2">{aksara.char}</span>
                    <span className={`text-xs text-center font-black leading-tight ${isSelected ? 'text-[#a33818]' : 'text-amber-900/85'}`}>{aksara.name}</span>
                    <span className="absolute bottom-1 right-1 px-1 bg-amber-100/40 rounded text-[8px] font-black text-amber-850 border border-amber-200/20">
                      Lvl {levelRequired}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Navigation Action */}
          <div className="mt-8 flex justify-center pb-8">
            <button 
              onClick={() => setActiveTab('pasar')}
              className="bg-white text-amber-950 hover:bg-amber-50 border-2 border-[#dfc0b8] rounded-xl px-8 py-4 font-bold shadow-md hover:border-[#a33818] text-[#a33818] transition-all active:translate-y-1 w-full md:w-auto text-center flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined">map</span>
              Kembali ke Pasar Jual-Beli
            </button>
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="bg-[#f6f0bb] border-t-4 border-[#77574d]/10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl">
          {/* Pasar Tab */}
          <button 
            onClick={() => setActiveTab('pasar')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'pasar'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'pasar' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
            <span className="font-semibold text-[11px] mt-1">Pasar</span>
          </button>

          {/* Belajar Tab */}
          <button 
            onClick={() => setActiveTab('kamus')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'kamus' || activeTab === 'latihan'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: (activeTab === 'kamus' || activeTab === 'latihan') ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
            <span className="font-semibold text-[11px] mt-1">Belajar</span>
          </button>

          {/* Toko Tab */}
          <button 
            onClick={() => setActiveTab('toko')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'toko'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'toko' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
            <span className="font-semibold text-[11px] mt-1">Toko</span>
          </button>

          {/* Rapor Tab */}
          <button 
            onClick={() => setActiveTab('juara')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'juara'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'juara' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
            <span className="font-semibold text-[11px] mt-1">Rapor</span>
          </button>
        </nav>
      </div>
    );
  }

  if (activeTab === 'juara') {
    return (
      <div className="bg-[#fffadf] text-[#1e1c00] font-body-md min-h-screen flex flex-col pb-24 relative">
        {/* TopAppBar */}
        <header className="docked full-width top-0 bg-[#f6f0bb] border-b-2 border-[#dfc0b8] flex justify-between items-center w-full px-4 h-16 z-40 sticky shadow-sm">
          <div className="flex items-center gap-2 max-w-[50%]">
            <button 
              onClick={() => setActiveTab('pasar')}
              className="text-[#a33818] hover:bg-[#dfc0b8]/30 transition-colors active:translate-y-[2px] p-2 rounded-full flex items-center justify-center cursor-pointer border border-[#dfc0b8]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
            </button>
            <h1 className="font-bold text-base sm:text-xl text-[#a33818] truncate font-headline-lg-mobile" style={{ fontFamily: "'Lexend', sans-serif" }}>Rapor Pasar</h1>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-[#58423c] bg-white border-2 border-[#dfc0b8] px-3.5 py-1.5 rounded-full shadow-sm text-xs md:text-sm">
            <span>{coins}</span>
            <span className="text-sm">🪙</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 z-10">
          
          {/* Header Rapor */}
          <div className="text-center md:text-left mt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#a33818] mb-1 font-display-lg" style={{ fontFamily: "'Lexend', sans-serif" }}>Rapor Pasar</h2>
            <p className="text-[#58423c] text-sm sm:text-base">Pantau perkembangan daganganmu minggu ini, Juragan.</p>
          </div>

          {/* Total Kekayaan Summary */}
          <section className="bg-[#f6f0bb] rounded-2xl border-b-4 border-[#77574d]/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-[#dfc0b8]/60">
            <div>
              <h3 className="text-lg font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Total Kekayaan</h3>
              <p className="text-xs sm:text-sm text-[#58423c]">Hasil jerih payahmu berniaga Aksara</p>
            </div>
            <div className="flex items-center gap-3 bg-[#fffadf] py-3 px-6 rounded-xl border border-[#dfc0b8]/40 shadow-inner w-full sm:w-auto justify-center">
              <span className="material-symbols-outlined text-[#F59E0B] text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="text-2xl sm:text-3xl font-black text-[#1e1c00] font-mono">{coins.toLocaleString('id-ID')}</span>
            </div>
          </section>

          {/* Bento Grid Layout for Stats & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Statistik Minggu Ini */}
            <section className="md:col-span-2 bg-[#eae4b1]/60 rounded-2xl border-b-4 border-[#77574d]/20 p-5 flex flex-col border border-[#dfc0b8]/60 shadow-xs">
              <h3 className="text-base font-extrabold text-[#1e1c00] mb-4 flex items-center gap-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <span className="material-symbols-outlined text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                Statistik Minggu Ini
              </h3>
              <div className="grid grid-cols-2 gap-4 flex-grow">
                <div className="bg-[#fffadf] rounded-xl p-4 border border-[#dfc0b8]/40 shadow-inner flex flex-col justify-center items-center text-center">
                  <span className="text-[#58423c] text-xs font-bold leading-tight mb-1">Aksara Terjual</span>
                  <span className="text-xl sm:text-2xl font-black text-[#186a22] font-mono">{completedCount * 4}</span>
                </div>
                <div className="bg-[#fffadf] rounded-xl p-4 border border-[#dfc0b8]/40 shadow-inner flex flex-col justify-center items-center text-center">
                  <span className="text-[#58423c] text-xs font-bold leading-tight mb-1">Akurasi Ejaan</span>
                  <span className="text-xl sm:text-2xl font-black text-[#a33818] font-mono">
                    {consecutiveCorrect > 0 ? Math.min(100, 90 + consecutiveCorrect * 2) : 92}%
                  </span>
                </div>
                <div className="bg-[#fffadf] rounded-xl p-4 border border-[#dfc0b8]/40 shadow-inner flex flex-col justify-center items-center text-center">
                  <span className="text-[#58423c] text-xs font-bold leading-tight mb-1">Pelanggan Puas</span>
                  <span className="text-xl sm:text-2xl font-black text-[#77574d] font-mono">{completedCount}</span>
                </div>
                <div className="bg-[#fffadf] rounded-xl p-4 border border-[#dfc0b8]/40 shadow-inner flex flex-col justify-center items-center text-center">
                  <span className="text-[#58423c] text-xs font-bold leading-tight mb-1">Hari Beruntun</span>
                  <span className="text-xl sm:text-2xl font-black text-[#F59E0B] font-mono">
                    {Math.max(1, Math.min(7, Math.floor(completedCount / 3) + 1))}
                  </span>
                </div>
              </div>
            </section>

            {/* Pencapaian list */}
            <section className="bg-[#f6f0bb] rounded-2xl border-b-4 border-[#77574d]/20 p-5 flex flex-col border border-[#dfc0b8]/60 shadow-xs">
              <h3 className="text-base font-extrabold text-[#1e1c00] mb-4 flex items-center gap-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
                <span className="material-symbols-outlined text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                Pencapaian
              </h3>
              <div className="flex flex-col gap-3">
                {/* Badge 1: Juragan Muda */}
                <div className={`flex items-center gap-3 bg-[#fffadf] p-2.5 rounded-xl border border-[#dfc0b8]/30 ${level >= 3 ? 'border-l-4 border-l-[#F59E0B]' : 'opacity-60 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${level >= 3 ? 'bg-[#FEF3C7] border-[#F59E0B]' : 'bg-neutral-100 border-neutral-300'}`}>
                    <span className={`material-symbols-outlined text-sm ${level >= 3 ? 'text-[#F59E0B]' : 'text-neutral-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1e1c00] leading-none">Juragan Muda</h4>
                    <p className="text-[10px] text-[#58423c] mt-1 font-medium">Capai level 3 ({level >= 3 ? 'Selesai' : 'Lvl ' + level + '/3'})</p>
                  </div>
                </div>

                {/* Badge 2: Ejaan Sempurna */}
                <div className={`flex items-center gap-3 bg-[#fffadf] p-2.5 rounded-xl border border-[#dfc0b8]/30 ${consecutiveCorrect >= 3 ? 'border-l-4 border-l-[#186a22]' : 'opacity-60 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${consecutiveCorrect >= 3 ? 'bg-emerald-50 border-[#186a22]' : 'bg-neutral-100 border-neutral-300'}`}>
                    <span className={`material-symbols-outlined text-sm ${consecutiveCorrect >= 3 ? 'text-[#186a22]' : 'text-neutral-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1e1c00] leading-none">Ejaan Sempurna</h4>
                    <p className="text-[10px] text-[#58423c] mt-1 font-medium">3 benar beruntun ({consecutiveCorrect >= 3 ? 'Selesai' : consecutiveCorrect + '/3'})</p>
                  </div>
                </div>

                {/* Badge 3: Saudagar Kaya */}
                <div className={`flex items-center gap-3 bg-[#fffadf] p-2.5 rounded-xl border border-[#dfc0b8]/30 ${coins >= 1000 ? 'border-l-4 border-l-amber-600' : 'opacity-60 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${coins >= 1000 ? 'bg-amber-50 border-amber-600' : 'bg-neutral-100 border-neutral-300'}`}>
                    <span className={`material-symbols-outlined text-sm ${coins >= 1000 ? 'text-amber-600' : 'text-neutral-400'}`}>lock</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1e1c00] leading-none">Saudagar Kaya</h4>
                    <p className="text-[10px] text-[#58423c] mt-1 font-medium">Kumpulkan 1.000 koin ({coins >= 1000 ? 'Selesai' : coins + '/1.000'})</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Papan Peringkat (Leaderboard) */}
          <section className="bg-[#eae4b1]/60 rounded-2xl border-b-4 border-[#77574d]/20 p-5 flex flex-col border border-[#dfc0b8]/60 shadow-xs mt-2">
            <h3 className="text-base font-extrabold text-[#1e1c00] mb-4 flex items-center gap-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
              <span className="material-symbols-outlined text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>social_leaderboard</span>
              Papan Peringkat Saudagar
            </h3>
            
            {leaderboardLoading ? (
              <div className="flex flex-col items-center justify-center p-8 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#a33818] border-t-transparent animate-spin"></div>
                <p className="text-sm font-bold text-[#58423c]">Sedang memuat data pasar...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {leaderboard.length === 0 ? (
                  <div className="text-center p-6 text-[#58423c] font-medium italic">
                    Belum ada saudagar yang tercatat di pasar ini.
                  </div>
                ) : (
                  leaderboard.map((entry, index) => {
                    const isCurrentUser = user && entry.name === user.name;
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isCurrentUser 
                            ? 'bg-[#ffe4bd]/60 border-[#c44f2e] shadow-sm' 
                            : 'bg-[#fffadf] border-[#dfc0b8]/40 shadow-inner'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-bold text-sm border-2 ${
                          index === 0 ? 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B] shadow-sm text-lg' :
                          index === 1 ? 'bg-[#F3F4F6] text-[#9CA3AF] border-[#9CA3AF] shadow-sm' :
                          index === 2 ? 'bg-[#FFF7ED] text-[#B45309] border-[#B45309] shadow-sm' :
                          'bg-transparent text-[#795950] border-transparent'
                        }`}>
                          {index === 0 ? '👑' : `#${index + 1}`}
                        </div>

                        {/* User details */}
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-[#1e1c00] truncate flex items-center gap-1.5">
                            <span>{entry.name}</span>
                            {isCurrentUser && <span className="bg-[#a33818] text-white text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black">Kamu</span>}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-[#58423c] truncate">
                            {entry.title} • Lvl {entry.level}
                          </p>
                        </div>

                        {/* Score/Coins */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-white/50 px-2 py-1 rounded-lg border border-[#dfc0b8]/20">
                          <span className="font-bold text-[#1e1c00]">{entry.coins.toLocaleString('id-ID')}</span>
                          <span className="text-sm">🪙</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* Saran Juragan */}
          <section className="bg-[#c44f2e] text-white rounded-2xl p-6 flex items-start gap-4 shadow-md relative overflow-hidden border-b-4 border-[#862303]">
            {/* Decorative pattern ripple background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
            <span className="material-symbols-outlined text-4xl hidden sm:block relative z-10 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-black mb-1.5" style={{ fontFamily: "'Lexend', sans-serif" }}>Saran Sesepuh Pasar</h3>
              <p className="text-xs sm:text-sm text-[#fffadf]/90 leading-relaxed mb-4">
                "Kemampuanmu merangkai huruf pasangan Aksara Jawa sudah membaik, Juragan! Tapi pembeli sering bingung saat kamu menulis Sandhangan dan Aksara Rekan. Terus perkaya hafalanmu di Pustaka Aksara setiap hari!"
              </p>
              <button 
                onClick={() => setActiveTab('kamus')}
                className="bg-white text-[#a33818] hover:bg-[#fffadf] text-xs font-black tracking-wide px-5 py-2.5 rounded-xl shadow-[0_3px_0_0_#862303]/40 active:translate-y-0.5 cursor-pointer transition-all"
              >
                Kunjungi Pustaka Aksara
              </button>
            </div>
          </section>

          {/* Navigation Action */}
          <div className="mt-4 flex justify-center pb-8">
            <button 
              onClick={() => setActiveTab('pasar')}
              className="bg-white text-[#a33818] hover:bg-amber-50/50 border-2 border-[#dfc0b8] rounded-xl px-8 py-3.5 font-bold shadow-md hover:border-[#a33818] transition-all active:translate-y-1 w-full md:w-auto text-center flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined">storefront</span>
              Kembali ke Pasar Dagang
            </button>
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="bg-[#f6f0bb] border-t-4 border-[#77574d]/10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl">
          {/* Pasar Tab */}
          <button 
            onClick={() => setActiveTab('pasar')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'pasar'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'pasar' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
            <span className="font-semibold text-[11px] mt-1">Pasar</span>
          </button>

          {/* Belajar Tab */}
          <button 
            onClick={() => setActiveTab('kamus')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'kamus' || activeTab === 'latihan'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: (activeTab === 'kamus' || activeTab === 'latihan') ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
            <span className="font-semibold text-[11px] mt-1">Belajar</span>
          </button>

          {/* Toko Tab */}
          <button 
            onClick={() => setActiveTab('toko')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'toko'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'toko' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
            <span className="font-semibold text-[11px] mt-1">Toko</span>
          </button>

          {/* Rapor Tab */}
          <button 
            onClick={() => setActiveTab('juara')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'juara'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'juara' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
            <span className="font-semibold text-[11px] mt-1">Rapor</span>
          </button>
        </nav>
      </div>
    );
  }

  if (activeTab === 'toko') {
    return (
      <div className="bg-[#fffadf] text-[#1e1c00] font-body-md min-h-screen flex flex-col pb-24 relative selection:bg-[#c44f2e]/20 selection:text-[#a33818]">
        {/* TopAppBar */}
        <header className="docked full-width top-0 bg-[#f6f0bb] border-b-2 border-[#dfc0b8] flex justify-between items-center w-full px-4 h-16 z-40 sticky shadow-sm">
          <div className="flex items-center gap-2 max-w-[50%]">
            <button 
              onClick={() => setActiveTab('pasar')}
              className="text-[#a33818] hover:bg-[#dfc0b8]/30 transition-colors active:translate-y-[2px] p-2 rounded-full flex items-center justify-center cursor-pointer border border-[#dfc0b8]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
            </button>
            <h1 className="font-bold text-base sm:text-xl text-[#a33818] truncate font-headline-lg-mobile" style={{ fontFamily: "'Lexend', sans-serif" }}>Pasar Krempyeng</h1>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-[#58423c] bg-white border-2 border-[#dfc0b8] px-3.5 py-1.5 rounded-full shadow-sm text-xs md:text-sm">
            <span>{coins}</span>
            <span className="text-sm">🪙</span>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 z-10 flex-grow">
          {/* Screen Title */}
          <section className="text-center md:text-left mt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#a33818] mb-1 font-display-lg" style={{ fontFamily: "'Lexend', sans-serif" }}>Pasar Krempyeng</h2>
            <p className="text-[#58423c] text-sm sm:text-base">Beli perlengkapan, hiasan warung, dan tenaga ekstra untuk petualanganmu di Pasar Hanacaraka.</p>
          </section>

          {/* Store Categories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8">
            
            {/* Category 1: Skin Karakter (Spans 8 cols on large screens) */}
            <section className="md:col-span-8 bg-[#f6f0bb] rounded-2xl border-b-[8px] border-[#77574d]/20 p-6 shadow-xs flex flex-col gap-6 border border-[#dfc0b8]/60">
              <div className="flex items-center justify-between border-b border-[#dfc0b8]/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#c44f2e] text-white flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">checkroom</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Skin Karakter</h3>
                </div>
                <span className="font-bold text-xs text-[#a33818] bg-[#c44f2e]/10 px-3 py-1 rounded-full border border-[#a33818]/10">Baju Adat</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Card 1: Batik Parang Premium */}
                <div className="bg-[#fffadf] rounded-xl border border-[#dfc0b8]/60 overflow-hidden flex flex-col group relative">
                  <div className="bg-[#eae4b1] relative overflow-hidden flex items-center justify-center p-4 h-32">
                    <img 
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                      alt="Batik Parang Premium" 
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeC0QQvMvAbxrylMgsnNucpV4NFdmzPOphv0y922t6g1_a1UTzHbkxCw_3jWK6y31hvyM0D23Z8z9L1OkNBSpvfcmXzk-DBApDoUqjrDghMw0wrF560Anu5HsgA-bsWWrREVwdEAWCKX7MbSRXC90F3l7TzmN-wvX4bbwWteE-bbCYQqdpRc4P4ijgwlVooDInm5BEtNNolffqUAys833j8yw8b6f_gFQXk23zpRpl8NUnz6G1dmj3LmzRvZrT3Wet_5Vwodk8qzA"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-grow bg-[#fffadf]">
                    <div>
                      <h4 className="text-sm font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Batik Parang Premium</h4>
                      <p className="text-xs text-[#58423c] line-clamp-2 mt-1">Pakaian adat mewah untuk tampil menawan di pasar.</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#dfc0b8]/20">
                      <div className="flex items-center gap-1 font-bold text-xs text-[#1e1c00] bg-[#fbf5c1] px-2.5 py-1 rounded border border-[#dfc0b8]/40 shadow-inner">
                        <span>500</span>
                        <span>🪙</span>
                      </div>
                      {purchasedItems.includes('batik_parang') ? (
                        <button className="bg-[#186a22] text-white text-xs font-bold px-4 py-2 rounded-lg pointer-events-none opacity-90 border-b-2 border-emerald-950/45">
                          Dimiliki
                        </button>
                      ) : (
                        <button 
                          onClick={() => buyStoreItem('batik_parang', 500, 'Batik Parang Premium')}
                          className="bg-[#a33818] hover:bg-[#c44f2e] text-white text-xs font-bold px-4 py-2 rounded-lg border-b-4 border-[#862303] active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer shadow-sm"
                        >
                          Beli
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Item Card 2: Blangkon Solo */}
                <div className="bg-[#fffadf] rounded-xl border border-[#dfc0b8]/60 overflow-hidden flex flex-col group relative">
                  <div className="bg-[#eae4b1] relative overflow-hidden flex items-center justify-center p-4 h-32">
                    <img 
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                      alt="Blangkon Solo" 
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbPvNp0LaZZpcoyyrplAzirApwuVLaHwaY9haomICSssONgYcS_6ShWuEPAdiRyi4VP0A_e0nDQS2WPIGcqf6j0XxaqCF50b7V3xRv6noHTSRSvc1YDpSpy_C353nLI3QCc3nlizs4_hjVoXhknyTt_NnYvP5Sm6KYpR5C-igV_TS4jDtH1X2wsM7fHXA_atAVXdZ0oTSl9HOOc4tdaTxdW-yVhcXMwvs46EfqeCscZd3H_j5vPUvKVI1XJ9YHarvGVbs9PGvC4aA"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-grow bg-[#fffadf]">
                    <div>
                      <h4 className="text-sm font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Blangkon Solo</h4>
                      <p className="text-xs text-[#58423c] line-clamp-2 mt-1">Penutup kepala tradisional khas gaya Surakarta.</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#dfc0b8]/20">
                      <div className="flex items-center gap-1 font-bold text-xs text-[#1e1c00] bg-[#fbf5c1] px-2.5 py-1 rounded border border-[#dfc0b8]/40 shadow-inner">
                        <span>250</span>
                        <span>🪙</span>
                      </div>
                      {purchasedItems.includes('blangkon_solo') ? (
                        <button className="bg-[#186a22] text-white text-xs font-bold px-4 py-2 rounded-lg pointer-events-none opacity-90 border-b-2 border-emerald-950/45">
                          Dimiliki
                        </button>
                      ) : (
                        <button 
                          onClick={() => buyStoreItem('blangkon_solo', 250, 'Blangkon Solo')}
                          className="bg-[#a33818] hover:bg-[#c44f2e] text-white text-xs font-bold px-4 py-2 rounded-lg border-b-4 border-[#862303] active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer shadow-sm"
                        >
                          Beli
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Category 2 & 3: Stacked (Spans 4 cols on large screens) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              
              {/* Category 2: Dekorasi Warung */}
              <section className="bg-[#f6f0bb] rounded-2xl border-b-[8px] border-[#77574d]/20 p-5 shadow-xs flex-grow border border-[#dfc0b8]/60">
                <div className="flex items-center gap-3 border-b border-[#dfc0b8]/50 pb-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#fed3c7]/60 text-[#795950] flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">storefront</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Dekorasi Warung</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* Small Item 1: Umbul-Umbul */}
                  <div className="flex items-center gap-3 bg-[#fffadf] p-3 rounded-xl border border-[#dfc0b8]/60">
                    <div className="w-16 h-16 bg-[#eae4b1] rounded-lg flex-shrink-0 flex items-center justify-center p-1 shadow-inner">
                      <img 
                        className="w-full h-full object-contain" 
                        alt="Umbul-Umbul" 
                        referrerPolicy="no-referrer"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvnkdSDSizl_5bQFV7xnlmukv5Qe5JmMY2aUEWmFLlrrWmeDq3ruRCFBSxoIO6UV5YDmoqG724OcVBd9707d4_M9G0OJgNIXQehEdezgakQh3NbJs2Aaz6moneZ5YYOGvwANJwDEOFxzF6Lx_SZyKL1GhYRBsRgqmceEIoD__MVKtEgg1Rhqm2rKDpcizwDsBrOIKq7k0AvloQBXF00TXNYGP-dgt3jbzGxA_oEVLEKdrDC5BRQwqpdjnb4D2uLhHERdaSLVshWIQ"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-[#1e1c00] text-xs" style={{ fontFamily: "'Lexend', sans-serif" }}>Umbul-Umbul</h4>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-bold text-[#58423c] flex items-center gap-1">100 <span>🪙</span></div>
                        {purchasedItems.includes('umbul_umbul') ? (
                          <button className="bg-[#186a22] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg pointer-events-none opacity-90">
                            Dipasang
                          </button>
                        ) : (
                          <button 
                            onClick={() => buyStoreItem('umbul_umbul', 100, 'Umbul-Umbul')}
                            className="bg-[#a33818] hover:bg-[#c44f2e] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border-b-[4px] border-[#862303] hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer"
                          >
                            Beli
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category 3: XP Boost (Tenaga Ekstra) */}
              <section className="bg-[#f6f0bb] rounded-2xl border-b-[8px] border-[#77574d]/20 p-5 shadow-xs border border-[#dfc0b8]/60 bg-gradient-to-br from-[#f6f0bb] to-[#fed3c7]/10">
                <div className="flex items-center gap-3 border-b border-[#dfc0b8]/50 pb-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#358438] text-white flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">bolt</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Tenaga Ekstra</h3>
                </div>
                
                <div className="bg-[#fffadf] rounded-xl border border-[#dfc0b8]/60 p-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-75/10 rounded-full blur-xl group-hover:bg-emerald-75/20 transition-colors"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-[#a3f69c] rounded-full flex items-center justify-center border border-[#186a22]/10 shadow-xs">
                      <span className="text-2xl">☕</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1e1c00]" style={{ fontFamily: "'Lexend', sans-serif" }}>Kopi Tubruk</h4>
                      <p className="text-[10px] text-[#58423c] mt-0.5 font-medium">XP x2 selama 30 menit</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between relative z-10 pt-2 border-t border-[#dfc0b8]/10">
                    <div className="flex items-center gap-1 font-bold text-xs bg-[#fffadf] px-2.5 py-1 rounded border border-[#dfc0b8]/40 shadow-inner">
                      <span>150</span>
                      <span>🪙</span>
                    </div>
                    {purchasedItems.includes('kopi_tubruk') ? (
                      <button className="bg-[#186a22] text-white text-xs font-bold px-4 py-2 rounded-lg pointer-events-none opacity-90 w-full ml-4 border-b-2 border-emerald-950/45">
                        Aktif
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          buyStoreItem('kopi_tubruk', 150, 'Kopi Tubruk');
                        }}
                        className="bg-[#a33818] hover:bg-[#c44f2e] text-white text-xs font-bold px-4 py-2 rounded-lg border-b-[4px] border-[#862303] hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all w-full ml-4 cursor-pointer"
                      >
                        Minum
                      </button>
                    )}
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="bg-[#f6f0bb] border-t-4 border-[#77574d]/10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl">
          {/* Pasar Tab */}
          <button 
            onClick={() => setActiveTab('pasar')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'pasar'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'pasar' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
            <span className="font-semibold text-[11px] mt-1">Pasar</span>
          </button>

          {/* Belajar Tab */}
          <button 
            onClick={() => setActiveTab('kamus')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'kamus' || activeTab === 'latihan'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: (activeTab === 'kamus' || activeTab === 'latihan') ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
            <span className="font-semibold text-[11px] mt-1">Belajar</span>
          </button>

          {/* Toko Tab */}
          <button 
            onClick={() => setActiveTab('toko')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'toko'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'toko' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
            <span className="font-semibold text-[11px] mt-1">Toko</span>
          </button>

          {/* Rapor Tab */}
          <button 
            onClick={() => setActiveTab('juara')}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
              activeTab === 'juara'
                ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
                : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'juara' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
            <span className="font-semibold text-[11px] mt-1">Rapor</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffadf] text-[#1e1c00] font-body-md flex flex-col pb-24 relative">
      
      {/* HEADER HUD BAR */}
      <header className="bg-[#f6f0bb] border-b-2 border-[#dfc0b8] sticky top-0 z-40 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand & User Progress Summary */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#a33818] text-white rounded-full flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {selectedRole === 'pembeli' ? 'shopping_basket' : 'storefront'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight flex-wrap">
                <span className="font-bold text-amber-900 text-sm md:text-base">{user ? user.name : `Tamu ${selectedRole === 'penjual' ? 'Penjual' : 'Pembeli'}`}</span>
                <span className="text-[10.5px] bg-[#c44f2e]/10 text-[#a33818] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedRole === 'penjual' ? 'PENJUAL' : 'PEMBELI'} : {title}
                </span>
              </div>
              <div className="text-xs text-[#58423c] font-medium flex items-center gap-1 mt-0.5">
                <span>Lvl {level}</span>
                <div className="w-20 md:w-28 bg-[#dfc0b8]/50 h-2 rounded-full overflow-hidden inline-block ml-1">
                  <div 
                    className="bg-[#186a22] h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (xp / (level * 100)) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#186a22] font-bold">({xp}/{level * 100} XP)</span>
              </div>
            </div>
          </div>

          {/* Money Display & Stalls Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#dfc0b8] flex items-center gap-2 shadow-inner">
              <span className="material-symbols-outlined text-[#a33818] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-bold text-[#a33818] text-base md:text-lg select-none">{coins} <span className="text-xs font-semibold">Keper</span></span>
            </div>


            {/* Logout Buttons */}
            <button 
              onClick={onLogout}
              className="px-2.5 py-1.5 text-xs text-[#58423c] hover:text-[#a33818] border border-[#dfc0b8] hover:border-[#a33818] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer bg-amber-50"
            >
              <span>Metu (Logout)</span>
              <span className="material-symbols-outlined text-xs">logout</span>
            </button>
          </div>

        </div>
      </header>



      {/* MAIN GAME APP PLAYGROUND */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col gap-5 z-10 h-full">

        <AnimatePresence mode="wait">
          
          {/* TAB 1: PASAR (ACTIVE TRADING QUIZ PLAYGROUND & 3D SIMULATOR) */}
          {activeTab === 'pasar' && (
            <motion.div 
              key="pasar-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-5 h-full"
            >
              

              {selectedRole === 'penjual' ? (
                /* =========================================================
                   IMMERSIVE 3D MINECRAFT COCKPIT SELLER SIMULATOR IN ROOM
                   ========================================================= */
                <div className="flex flex-col gap-4">
                  {/* IMMERSIVE 3D MINECRAFT MARKET ROOM */}
                  <MinecraftMarket3D
                    currentStall={currentStall}
                    unlockedStalls={unlockedStalls}
                    currentOrder={currentOrder}
                    quizFeedback={quizFeedback}
                    onInteract={() => setIsTradingActive(true)}
                    isTradingActive={isTradingActive}
                    onBonusXpClaim={() => {
                      const bonusXpVal = 15;
                      const nextXp = xp + bonusXpVal;
                      setXp(nextXp);
                      setQuizFeedback(prev => prev ? {
                        ...prev,
                        message: `${prev.message} (+15 XP Bonus diklaim dari Nampan Saji!)`
                      } : null);
                      saveProgress(coins, level, nextXp, title, unlockedStalls, completedCount);
                      setTimeout(() => checkLevelUp(nextXp, level), 800);
                    }}
                  />

                  {/* ACTIVE TRADING CHEST DESK INTERFACE */}
                  {isTradingActive && currentOrder && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-gradient-to-b from-[#38261e] to-[#251712] border-4 border-[#e9a117] rounded-3xl p-5 text-[#fffdf2] shadow-2xl flex flex-col gap-5 pointer-events-auto select-none relative overflow-hidden"
                    >
                      {/* Stylized background ornament simulating wood fiber */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-20" />
                      
                      {/* Transaction HUD Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 z-10">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#f5ba3c] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">point_of_sale</span>
                          Meja Kasir Lapak
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 font-extrabold bg-[#1e1411] px-2.5 py-1 rounded-full border border-[#f5ba3c]/20">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                          <span>Pelanggan Antre</span>
                        </div>
                      </div>

                      {/* Customer dialogue / Floating bubble details */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-br from-[#fffdf4] to-[#fbf7df] border-3 border-[#80503f] text-[#33221b] rounded-2xl p-4 shadow-xl font-sans relative z-10 transition-all duration-300">
                        
                        {/* Customer profile card on left */}
                        <div className="flex items-center gap-3 bg-[#e8debe]/35 border border-[#80503f]/25 px-3 py-2 rounded-xl w-full sm:w-auto">
                          <div className="w-12 h-12 bg-gradient-to-b from-amber-200 to-amber-350 border-2 border-[#80503f] rounded-full flex items-center justify-center text-2xl shadow-md transform rotate-[-3deg]">
                            👤
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black tracking-wider text-rose-800 uppercase leading-none">Pembeli</span>
                            <span className="text-sm font-black text-[#5a3a2d] font-sans tracking-tight">{currentOrder.customerName}</span>
                            <span className="text-[9.5px] font-bold text-neutral-500">Mendarat di toko</span>
                          </div>
                        </div>

                        {/* Interactive puzzle focal point (CENTER SPARK) */}
                        <div className="flex flex-col items-center justify-center bg-white/95 border-2 border-[#a33818]/60 p-3.5 rounded-2xl shadow-inner min-w-[170px] relative">
                          {/* absolute decorative tab */}
                          <span className="absolute -top-2 px-2 py-0.5 bg-[#a33818] text-[#fffdf2] text-[8px] font-black uppercase tracking-wider rounded-md border border-[#a33818]/40 leading-none">
                            Petunjuk Soal
                          </span>

                          {currentOrder.questionType === 'read_script' ? (
                            // Read script challenges: We show Javanese Script so they can translate it to English/Latin
                            <button 
                              type="button"
                              className="mt-1.5 text-3xl font-extrabold font-aksara-display text-[#a33818] hover:scale-110 active:scale-95 cursor-pointer transition-all bg-amber-50 px-4 py-2 rounded-xl border border-amber-300 flex items-center gap-2 group"
                              onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                              title="Klik untuk mendengar suara lafal"
                            >
                              <span className="material-symbols-outlined text-base text-[#a33818] group-hover:animate-bounce">volume_up</span>
                              <span className="tracking-wide select-text">{currentOrder.itemRequested.name}</span>
                            </button>
                          ) : currentOrder.questionType === 'spell_script' ? (
                            // Spell script challenges: Must hide the answer script, show the Latin word beautifully
                            <button 
                              type="button"
                              className="mt-1.5 text-sm font-black font-sans text-neutral-800 hover:scale-105 active:scale-95 cursor-pointer transition-all bg-stone-900 text-amber-350 px-4 py-2.5 rounded-xl border-2 border-amber-500 shadow-md flex items-center gap-1.5"
                              onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                              title="Dengarkan lafal kata untuk dieja"
                            >
                              <span className="material-symbols-outlined text-xs text-amber-400">volume_up</span>
                              <span className="tracking-wide uppercase font-mono">{currentOrder.itemRequested.javaneseName}</span>
                            </button>
                          ) : (
                            // Level 1: Match Javanese Script: We hide the Javanese script, showing only Latin product name in gold frame
                            <button 
                              type="button"
                              className="mt-1.5 text-xs font-bold font-sans text-amber-950 hover:scale-105 active:scale-95 cursor-pointer transition-all bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#a33818] shadow-sm flex items-center gap-1.5"
                              onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                              title="Klik untuk mendengarkan lafal"
                            >
                              <span className="material-symbols-outlined text-xs text-[#a33818]">volume_up</span>
                              <span>{currentOrder.itemRequested.name}</span>
                              <span className="material-symbols-outlined text-xs text-rose-800 animate-pulse">help_outline</span>
                            </button>
                          )}
                          
                          <span className="text-[8px] bg-[#221008] text-amber-200 border border-[#a33818]/15 px-2.5 py-0.5 rounded-full font-black uppercase mt-2 tracking-widest leading-none">
                            {currentOrder.questionType === 'match_word' ? 'Tebak Wadah Aksara' : currentOrder.questionType === 'read_script' ? 'Membaca Tulisan Jawi' : 'Susun Ejaan Aksara'}
                          </span>
                        </div>

                        {/* Customer dialogue speech line */}
                        <div className="flex-1 max-w-[240px] text-center sm:text-right">
                          <p className="text-[11.5px] font-extrabold text-[#3d2a23] italic leading-relaxed">
                            "{currentOrder.dialogue}"
                          </p>
                        </div>
                      </div>

                      {/* Matching Option Board Drawer */}
                      <div className="w-full z-10">
                        {quizFeedback ? (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-5 rounded-2xl border-3 border-[#c29621] bg-[#fffefa] text-center flex flex-col items-center gap-3.5 shadow-2xl min-h-[160px] justify-center text-[#281b16] font-sans relative"
                          >
                            <div className="absolute right-3 top-3 text-2xl">
                              {quizFeedback.isCorrect ? "✨" : "💭"}
                            </div>

                            <span className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${quizFeedback.isCorrect ? 'text-[#166534]' : 'text-[#a33818]'}`}>
                              <span className="material-symbols-outlined">
                                {quizFeedback.isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                              <span>{quizFeedback.isCorrect ? "SABER / LERES! (Benar)" : "LUPUT! (Salah)"}</span>
                            </span>
                            
                            <p className="text-xs font-bold text-[#553a2f] max-w-[420px] leading-relaxed">
                              {quizFeedback.message}
                            </p>
                            
                            <button 
                              type="button"
                              onClick={generateNewCustomer}
                              className="px-6 py-2.5 bg-gradient-to-b from-[#a33818] to-[#802a11] hover:from-[#c44f2e] hover:to-[#a33818] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all border border-red-950/20"
                            >
                              <span>Panggil Pembeli Berikutnya</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          </motion.div>
                        ) : (
                          <div className="w-full animate-fadeIn pt-2">
                             <WordSearchHanacaraka targetScript={currentOrder.itemRequested.javaneseScript} targetWord={currentOrder.itemRequested.javaneseName} onSuccess={() => processAnswer(true)} />
                          </div>
                        )}
                      </div>

                      {/* Mbah Advisor Advice hint bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-sans">
                        <div className="flex items-center gap-1.5 text-amber-250 font-bold max-w-[70%]">
                          <span className="text-sm">👴</span>
                          <span className="truncate">Mbah Hint: <span className="italic font-medium text-stone-400">"{advisorMessage}"</span></span>
                        </div>
                        <button 
                          type="button"
                          disabled={advisorLoading || !!quizFeedback}
                          onClick={getAdvisorHint}
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-[#358438] text-white font-black text-[8px] uppercase tracking-wider cursor-pointer flex items-center gap-1 disabled:opacity-45"
                        >
                          <span>{advisorLoading ? "Tanya..." : "Tanya Mbah"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* =========================================================
                   IMMERSIVE 3D MINECRAFT COCKPIT BUYER SIMULATOR IN ROOM
                   ========================================================= */
                <div className="flex flex-col gap-4">
                  {/* IMMERSIVE 3D MINECRAFT MARKET ROOM */}
                  <MinecraftMarket3D
                    currentStall={currentStall}
                    unlockedStalls={unlockedStalls}
                    currentOrder={currentOrder}
                    quizFeedback={quizFeedback}
                    onInteract={() => setIsTradingActive(true)}
                    isTradingActive={isTradingActive}
                    role="pembeli"
                    onBonusXpClaim={() => {
                      const bonusXpVal = 15;
                      const nextXp = xp + bonusXpVal;
                      setXp(nextXp);
                      setQuizFeedback(prev => prev ? {
                        ...prev,
                        message: `${prev.message} (+15 XP Bonus diklaim dari Nampan Saji!)`
                      } : null);
                      saveProgress(coins, level, nextXp, title, unlockedStalls, completedCount);
                      setTimeout(() => checkLevelUp(nextXp, level), 800);
                    }}
                  />

                  {/* ACTIVE BUYING CABINET DESK INTERFACE */}
                  {isTradingActive && currentOrder && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-gradient-to-b from-[#25130b] via-[#1a0f0a] to-[#120703] border-4 border-[#854d0e] rounded-3xl p-5 text-[#fffdf2] shadow-2xl flex flex-col gap-5 pointer-events-auto select-none relative overflow-hidden"
                    >
                      {/* Stylized background ornament simulating a physical store shelf drawer */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
                      
                      {/* Unique Transaction HUD Header for Buyer */}
                      <div className="flex items-center justify-between border-b border-[#855a30]/30 pb-2.5 z-10 font-sans">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-amber-400 animate-pulse">local_mall</span>
                          Keranjang & Tas Belanja Anda
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-amber-250 font-black bg-[#2e1a12] px-3 py-1 rounded-full border border-amber-500/20 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Navigasi Pembeli</span>
                        </div>
                      </div>

                      {/* =========================================================================
                          THE ROYAL SKEUOMORPHIC PARCHMENT SCROLL ("SERAT BLANJA JAWI")
                          ========================================================================= */}
                      <div className="relative z-10 px-2">
                        {/* Horizontal Scroll Top Roller Pin Ends */}
                        <div className="absolute -top-3.5 left-2 right-2 h-2.5 bg-gradient-to-r from-amber-950 via-[#ffd042] to-amber-950 rounded-full border border-amber-900/40 shadow-md" />
                        
                        <div className="bg-gradient-to-b from-[#fefbf0] via-[#faf5df] to-[#f7f0cf] text-[#2c1a11] border-x-8 border-[#ca8a04]/40 rounded-b-xl shadow-xl p-4.5 font-sans relative overflow-hidden">
                          {/* Royal Javanese Ink Calligraphy Stamp in Background */}
                          <div className="absolute -right-6 -bottom-6 text-7xl font-sans font-black opacity-5 uppercase select-none pointer-events-none rotate-[20deg] text-amber-900">
                            ꦲꦤꦕꦫꦏ
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {/* Merchant Greetings details styled on paper */}
                            <div className="flex items-center gap-3 bg-[#fdfaf2] border-2 border-dashed border-[#855e30]/35 px-3 py-2 rounded-xl w-full sm:w-auto shadow-sm">
                              <div className="w-11 h-11 bg-gradient-to-b from-amber-75 to-amber-150 border-2 border-[#854d0e] rounded-full flex items-center justify-center text-xl shadow-inner transform rotate-[-2deg]">
                                👤
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[8.5px] font-black tracking-wider text-[#a33818] uppercase leading-none font-sans">Penjual Lapap</span>
                                <span className="text-sm font-black text-[#5c4037] font-sans tracking-tight">{currentOrder.customerName}</span>
                                <span className="text-[9.5px] font-semibold text-neutral-500 font-sans">Mempersilakan Anda</span>
                              </div>
                            </div>

                            {/* Center Task Panel Embedded Inside Scroll */}
                            <div className="flex flex-col items-center justify-center bg-[#fffefc] border-3 border-[#854d0e] p-4 rounded-2xl shadow-inner min-w-[190px] relative">
                              <span className="absolute -top-2.5 px-2 py-0.5 bg-[#854d0e] text-amber-50 text-[8px] font-black uppercase tracking-wider rounded border border-[#a16244]/25 leading-none">
                                Serat Tugas Belanja
                              </span>

                              {currentOrder.questionType === 'read_script' ? (
                                <button 
                                  type="button"
                                  className="mt-1 text-3xl font-extrabold font-aksara-display text-[#a33818] hover:scale-105 active:scale-95 cursor-pointer transition-all bg-amber-50 px-5 py-2.5 rounded-xl border-2 border-amber-200 flex items-center gap-2 group mx-auto shadow-sm"
                                  onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                                  title="Lafealkan Suara aksara Jawi"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-[#a33818] group-hover:animate-bounce">volume_up</span>
                                  <span className="tracking-wide">{currentOrder.itemRequested.javaneseScript}</span>
                                </button>
                              ) : currentOrder.questionType === 'spell_script' ? (
                                <button 
                                  type="button"
                                  className="mt-1 text-sm font-black font-sans text-stone-105 hover:scale-105 active:scale-95 cursor-pointer transition-all bg-[#2a170f] text-amber-200 px-5 py-2.5 rounded-xl border-2 border-[#ca9304] shadow-md flex items-center gap-1.5 mx-auto"
                                  onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                                  title="Dengar lafal ejaan cara mengucapkan"
                                >
                                  <span className="material-symbols-outlined text-xs text-amber-400">volume_up</span>
                                  <span className="tracking-wider uppercase font-mono">{currentOrder.itemRequested.javaneseName}</span>
                                </button>
                              ) : (
                                <button 
                                  type="button"
                                  className="mt-1 text-xs font-black font-sans text-stone-800 hover:scale-105 active:scale-95 cursor-pointer transition-all bg-gradient-to-r from-amber-50 to-[#fffefa] px-5 py-2.5 rounded-xl border-2 border-dashed border-[#855e30]/50 shadow-sm flex items-center gap-1.5 mx-auto"
                                  onClick={() => speakJavanese(currentOrder.itemRequested.javaneseName)}
                                  title="Dengar lafal"
                                >
                                  <span className="material-symbols-outlined text-xs text-[#a33818]">volume_up</span>
                                  <span>{currentOrder.itemRequested.name}</span>
                                  <span className="material-symbols-outlined text-xs text-red-850 animate-pulse">help_outline</span>
                                </button>
                              )}
                              
                              <span className="text-[8px] bg-[#3a1d11] text-amber-200 border border-[#ca9304]/20 px-2.5 py-0.5 rounded-full font-black uppercase mt-2.5 tracking-widest leading-none shadow-sm">
                                {currentOrder.questionType === 'match_word' ? 'Tebak Aksara Jawi' : currentOrder.questionType === 'read_script' ? 'Membaca Tulisan Jawi' : 'Susun Ejaan Aksara'}
                              </span>
                            </div>

                            {/* Dialogue details */}
                            <div className="flex flex-col text-center sm:text-right max-w-[210px] border-t sm:border-t-0 sm:border-l border-[#855e30]/20 pt-2.5 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                              <span className="text-[7.5px] uppercase font-black text-[#a33818] tracking-widest mb-0.5">Himbauan Penjual</span>
                              <p className="text-[11.5px] font-extrabold text-[#3d2a23] italic leading-relaxed">
                                "{currentOrder.dialogue}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Horizontal Scroll Bottom Roller End */}
                        <div className="absolute -bottom-3.5 left-2 right-2 h-2.5 bg-gradient-to-r from-amber-950 via-[#ffd042] to-amber-950 rounded-full border border-amber-900/40 shadow-lg" />
                      </div>

                      {/* Spacer for scroll shadow spacing */}
                      <div className="h-0.5" />

                      {/* =========================================================================
                          THE MAJESTIC WOODEN DISPLAY CABINET / COMMERCE RACK
                          ========================================================================= */}
                      <div className="w-full z-10 bg-gradient-to-b from-[#1b0d06] to-[#0c0401] rounded-2xl border-2 border-stone-800 p-4 shadow-2xl relative">
                        {/* Shelf Title Placard */}
                        <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#854d0e] to-[#7c2d12] border border-[#a16244] text-[#ffd97d] text-[8px] font-black uppercase px-3 py-1 rounded shadow-md tracking-wider leading-none">
                          📦 RAK BARANG DAGANGAN TRADISIONAL
                        </div>

                        {quizFeedback ? (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-5 my-1.5 rounded-xl border-3 border-[#c29621] bg-gradient-to-br from-[#ffffff] to-[#fffef8] text-center flex flex-col items-center gap-3.5 shadow-xl min-h-[170px] justify-center text-[#281b16] font-sans relative"
                          >
                            <div className="absolute right-3 top-3 text-2xl">
                              {quizFeedback.isCorrect ? "✨" : "💭"}
                            </div>

                            <span className={`text-lg font-black tracking-tight flex items-center gap-2 ${quizFeedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              <span className="material-symbols-outlined text-xl">
                                {quizFeedback.isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                              <span>{quizFeedback.isCorrect ? "SABER / LERES! (Benar)" : "LUPUT! (Salah)"}</span>
                            </span>
                            
                            <p className="text-xs font-black text-[#553a2f] max-w-[420px] leading-relaxed bg-amber-50/40 p-2.5 rounded-lg border border-[#e8dfc7]/30">
                              {quizFeedback.message}
                            </p>
                            
                            <button 
                              type="button"
                              onClick={generateNewCustomer}
                              className="px-6 py-2.5 bg-gradient-to-b from-[#a33818] to-[#802a11] hover:from-[#c44f2e] hover:to-[#a33818] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all border border-red-950/20"
                            >
                              <span>Kunjungi Lapak Berikutnya</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          </motion.div>
                        ) : (
                          <div className="w-full animate-fadeIn font-sans mt-2">
                            <div className="w-full">
                              <WordSearchHanacaraka targetScript={currentOrder.itemRequested.javaneseScript} targetWord={currentOrder.itemRequested.javaneseName} onSuccess={() => processAnswer(true)} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mbah Advisor Advice hint bar with ancient decoration */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#855a30]/30 text-[9px] font-sans">
                        <div className="flex items-center gap-1.5 text-amber-250 font-bold max-w-[70%]">
                          <span className="text-sm font-sans">👵</span>
                          <span className="truncate">Penunjuk Mbah: <span className="italic font-medium text-amber-100">"{advisorMessage}"</span></span>
                        </div>
                        <button 
                          type="button"
                          disabled={advisorLoading || !!quizFeedback}
                          onClick={getAdvisorHint}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-850 hover:bg-[#358438] text-white font-black text-[8px] uppercase tracking-wider cursor-pointer flex items-center gap-1 disabled:opacity-45 border border-amber-900/10 shadow-md"
                        >
                          <span>{advisorLoading ? "Menanyai..." : "Tanya Mbah"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: KAMUS (HANACARAKA FLASHCARDS DECK) */}
          {activeTab === 'kamus' && (
            <motion.div 
              key="kamus-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-2xl p-5 border-2 border-[#dfc0b8] shadow-md"
            >
              <div className="border-b border-[#dfc0b8] pb-3 mb-5">
                <h2 className="font-headline-lg text-lg font-bold text-[#a33818] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                  Pustaka Lengkap Hanacaraka (Nglegena & Sandhangan)
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Ketuk kartu abjad di bawah untuk mempelajari filosofi makna, lafal latin, dan cara mengejarnya pada bungkusan pesanan!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Left: Scrollable Deck Grid */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {AKSARA_LIST.map((aksara, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAksara(aksara)}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          selectedAksara?.char === aksara.char 
                            ? 'bg-[#a33818] text-white border-[#a33818] shadow-md scale-102' 
                            : 'bg-amber-50/50 hover:bg-amber-50 text-amber-950 border-[#dfc0b8]'
                        }`}
                      >
                        <span className="text-3xl font-aksara-display tracking-wide">{aksara.char}</span>
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-sm uppercase">{aksara.phonetic}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Active Card detail display */}
                <div className="md:col-span-4 bg-[#f6f0bb] border border-[#dfc0b8] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-inner min-h-[300px]">
                  {selectedAksara ? (
                    <motion.div 
                      key={selectedAksara.char}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-white text-[#a33818] border-2 border-[#dfc0b8] rounded-2xl shadow-md flex items-center justify-center mb-4">
                        <span className="text-5xl font-aksara-display">{selectedAksara.char}</span>
                      </div>
                      
                      <h4 className="font-black text-xl text-[#a33818] tracking-tight">{selectedAksara.name}</h4>
                      <span className="text-[10px] uppercase font-black bg-[#a33818] text-white px-2.5 py-0.5 rounded-md mt-1 tracking-wider">Lafal: {selectedAksara.phonetic}</span>

                      <div className="mt-5 text-left w-full border-t border-amber-900/10 pt-4 flex flex-col gap-2.5">
                        <div className="text-xs">
                          <span className="font-bold text-[#58423c] uppercase block text-[9px]">Makna Filosofis:</span>
                          <span className="text-amber-950 font-semibold leading-relaxed">{selectedAksara.meaning}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-[#58423c] uppercase block text-[9px]">Kategori Carakan:</span>
                          <span className="text-amber-950 font-bold capitalize">{selectedAksara.category}</span>
                        </div>
                      </div>

                      {/* Javanese Carakan Story Card snippet placeholder */}
                      <p className="mt-4 text-[10px] text-neutral-500 font-semibold italic p-2 bg-amber-50 rounded-lg max-w-[200px] border border-amber-900/5">
                        {selectedAksara.category === 'nglegena' 
                          ? "Termasuk dalam 20 abjad utama yang menceritakan dua utusan gagah setia dari Prabu Ajisaka."
                          : "Sandhangan vokal yang disisipkan untuk memodifikasi huruf konsonan agar berbunyi merdu."}
                      </p>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-neutral-400">Pilih salah satu abjad untuk membedah maknanya</p>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: LATIHAN (DRAWING CANVAS SANDBOX) */}
          {activeTab === 'latihan' && (
            <motion.div 
              key="latihan-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-2xl p-5 border-2 border-[#dfc0b8] shadow-md flex flex-col gap-4"
            >
              <div className="border-b border-[#dfc0b8] pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div>
                  <h2 className="font-headline-lg text-lg font-bold text-[#a33818] flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>brush</span>
                    Papan Tulis Pasir Hanacaraka
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Mari asah kemampuan menulis jemari Anda! Silahkan pilih salah satu huruf aksara untuk menjiplak goresannya secara virtual.</p>
                </div>
                <div className="flex gap-1.5 self-stretch md:self-auto">
                  <button 
                    onClick={() => setActiveTab('kamus')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#a33818] rounded-lg hover:bg-[#862303] cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xs">arrow_back</span> Kembali Belajar
                  </button>
                  <button 
                    onClick={clearCanvas}
                    className="px-3 py-1.5 text-xs font-bold text-[#a33818] border border-[#a33818] rounded-lg hover:bg-red-50 cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span> Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Letter Picker sidebar */}
                <div className="md:col-span-3 flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold text-[#5c4037]">Pilih panduan pola jiplak:</span>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-amber-50/50 rounded-xl border border-amber-900/10 max-h-[250px] overflow-y-auto">
                    {AKSARA_LIST.filter(a => a.category === 'nglegena').map((aksara, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTraceChar(aksara.char)}
                        className={`w-9 h-9 rounded-lg border text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                          traceChar === aksara.char 
                            ? 'bg-[#a33818] text-white border-[#a33818] scale-105' 
                            : 'bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {aksara.char}
                      </button>
                    ))}
                  </div>
                  
                  {/* Colors helper */}
                  <span className="text-[10px] uppercase font-bold text-[#5c4037] mt-2">Pilihan Warna Kuas:</span>
                  <div className="flex gap-2">
                    {['#a33818', '#186a22', '#1e1c00', '#4285F4'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className="w-7 h-7 rounded-full border border-neutral-300 relative"
                        style={{ backgroundColor: color }}
                      >
                        {brushColor === color && (
                          <span className="material-symbols-outlined text-white text-xs absolute inset-0 flex items-center justify-center">done</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Workbench Card */}
                <div className="md:col-span-9 flex flex-col items-center justify-center">
                  
                  {/* Canvas area centering trace pattern as background text overlay */}
                  <div className="relative border-4 border-dashed border-[#dfc0b8] bg-orange-50/40 rounded-2xl w-full max-w-[500px] h-[300px] overflow-hidden shadow-inner flex items-center justify-center">
                    
                    {/* Ghost vector preview centered backdrop */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
                      <span className="text-[180px] font-aksara-display text-neutral-800">{traceChar}</span>
                    </div>

                    {/* Canvas drawing container */}
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={300}
                      className="absolute inset-0 touch-none cursor-crosshair z-10"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />

                    {/* Instruction labels */}
                    <span className="absolute bottom-2 right-2 text-[9px] text-neutral-400 font-semibold z-20 pointer-events-none">Tekuk diseret di atas papan pasir untuk menggambar</span>
                    <span className="absolute top-2 left-2 text-xs font-bold bg-[#eae4b1] px-2 py-0.5 rounded-md text-[#5d4037] pointer-events-none shadow-sm z-20">Latihan Jiplak Karakter "{traceChar}"</span>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: TOKO (EXPANSION & UPGRADES) */}
          {activeTab === 'toko' && (
            <motion.div 
              key="toko-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-2xl p-5 border-2 border-[#dfc0b8] shadow-md flex flex-col gap-6"
            >
              <div className="border-b border-[#dfc0b8] pb-3">
                <h2 className="font-headline-lg text-lg font-bold text-[#a33818] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                  Sewa & Upgrade Fasilitas Pasar Hanacaraka
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Investasikan tabungan Keper Anda untuk membuka lapak dagang baru dengan komoditas lebih bernilai tinggi, atau asisten pintar pendukung!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Stall 1: Jamu Stall card */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.025,
                    y: -5,
                    boxShadow: "0 12px 24px -10px rgba(163, 56, 24, 0.15)",
                    borderColor: "#a33818"
                  }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="border border-[#dfc0b8] bg-[#fbf5c1]/20 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors duration-250 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-3xl">🌿</span>
                      <h4 className="font-bold text-sm text-[#a33818] mt-2 block">🌿 Lapak Jamu Tradisional</h4>
                      <p className="text-xs text-[#58423c] leading-relaxed mt-1">Melayani jamu racikan (kunyit, jahe, kencur) dengan koin untung 40% lebih banyak!</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center justify-between">
                    <span className="font-bold text-[#a33818] text-xs">Biaya sewa: 150 Keper</span>
                    {unlockedStalls.includes('jamu') ? (
                      <span className="bg-[#186a22] text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-lg shadow-inner">Disewa</span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.06, backgroundColor: "#c44f2e" }}
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          buyStall('jamu', 150);
                        }}
                        className="bg-[#a33818] text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm cursor-pointer transition-colors"
                      >
                        Sewa Lapak
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Stall 2: Fruits Stall Card */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.025,
                    y: -5,
                    boxShadow: "0 12px 24px -10px rgba(163, 56, 24, 0.15)",
                    borderColor: "#a33818"
                  }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="border border-[#dfc0b8] bg-[#fbf5c1]/20 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors duration-250 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-3xl">🍌</span>
                      <h4 className="font-bold text-sm text-[#a33818] mt-2 block">🍌 Lapak Buah & Sayur Segar</h4>
                      <p className="text-xs text-[#58423c] leading-relaxed mt-1">Melayani pisang raja, lombok pedas, nanas perkebunan lereng Merbabu dengan margin koin berlipat!</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center justify-between">
                    <span className="font-bold text-[#a33818] text-xs">Biaya sewa: 300 Keper</span>
                    {unlockedStalls.includes('buah') ? (
                      <span className="bg-[#186a22] text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-lg shadow-inner">Disewa</span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.06, backgroundColor: "#c44f2e" }}
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          buyStall('buah', 300);
                        }}
                        className="bg-[#a33818] text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm cursor-pointer transition-colors"
                      >
                        Sewa Lapak
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Upgrade 1: Hint dictionary helper */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.015,
                    y: -5,
                    boxShadow: "0 12px 24px -10px rgba(163, 56, 24, 0.15)",
                    borderColor: "#a33818"
                  }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="border border-[#dfc0b8] bg-[#fbf5c1]/20 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden md:col-span-2 transition-colors duration-250 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">📖</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#a33818] block">Kamus Saku Jawa (Translator Asisten)</h4>
                      <p className="text-xs text-[#58423c] leading-relaxed mt-1">Dapatkan contekan instan huruf abjad latin tepat di samping bungkusan pesanan tulisan aksara Jawa pembeli agar tidak keliru!</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center justify-between">
                    <span className="font-bold text-[#a33818] text-xs">Biaya Jasa: 100 Keper</span>
                    {unlockedHints || level >= 5 ? (
                      <span className="bg-[#186a22] text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-lg shadow-inner">Aktif</span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.06, backgroundColor: "#c44f2e" }}
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          buyHintMaster(100);
                        }}
                        className="bg-[#a33818] text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm cursor-pointer transition-colors"
                      >
                        Beli Asisten
                      </motion.button>
                    )}
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Decorative Traditional Footer Credit Lines */}
      <footer className="mt-auto py-5 text-center text-[10px] text-neutral-500/80 font-bold uppercase tracking-wider border-t border-[#dfc0b8]/30 max-w-xl mx-auto w-full z-10">
        <div>Karya Seni Aksara Nusantara • Maturnuwun Sanget</div>
      </footer>

      {/* SETTINGS MODAL OVERLAY */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fffdf2] border-4 border-[#a33818] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Wooden Accent Top Header */}
              <div className="bg-[#a33818] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#dfc0b8]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">settings</span>
                  <h3 className="font-bold text-base font-sans tracking-tight">Pengaturan Game</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer text-white"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Settings Body Options */}
              <div className="p-6 flex flex-col gap-5">
                
                {/* AMBIENCE SOUND TOGGLE CARD */}
                <div className="border-2 border-[#dfc0b8]/60 bg-white/70 p-4 rounded-2xl flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-[#a33818] border border-amber-300 rounded-xl flex items-center justify-center self-start shadow-xs">
                        <span className="material-symbols-outlined text-lg">music_note</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-neutral-800 block">Suasana Pasar Tradisional</span>
                        <span className="text-[11px] text-neutral-500 leading-normal block">Mengaktifkan audio latar belakang pasar Jawi yang hangat & imersif</span>
                      </div>
                    </div>

                    {/* Checkbox Toggle Switch */}
                    <button 
                      onClick={toggleAmbience}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isAmbienceEnabled ? "bg-[#186a22]" : "bg-neutral-350"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isAmbienceEnabled ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  {/* Informative Help Text describing the beautiful wave effect */}
                  <p className="text-[10px] text-[#58423c]/90 italic leading-relaxed border-t border-[#dfc0b8]/40 pt-2 flex items-start gap-1">
                    <span className="material-symbols-outlined text-xs text-[#a33818] mt-0.5">info</span>
                    <span>Menggunakan sintesis Audio API organik untuk memproduksi audio alami kebisingan pasar, uap merebus, serta gemisik obrolan tanpa memberatkan memori internet HP Anda!</span>
                  </p>
                </div>

                {/* VISUAL HINT OPTIONS */}
                <div className="border-2 border-[#dfc0b8]/60 bg-white/70 p-4 rounded-2xl flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffe4d6] text-[#a33818] border border-[#a33818]/25 rounded-xl flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-lg text-[#a33818]">graphic_eq</span>
                    </div>
                    <div>
                      <span className="font-bold text-sm text-neutral-800 block">Efek Suara Lapak</span>
                      <span className="text-[11px] text-neutral-500 leading-normal block">Efek ketukan kayu, cobek ulek, dan lonceng saji taktil</span>
                    </div>
                    <span className="ml-auto text-[10px] bg-[#186a22]/10 text-[#186a22] font-black px-1.5 py-0.5 rounded-md uppercase">Aktif</span>
                  </div>
                </div>

                {/* JAVANESE DIALECT CARD REMINDER */}
                <div className="border-2 border-[#dfc0b8]/60 bg-white/70 p-4 rounded-2xl flex flex-col gap-1.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-lg">language</span>
                    </div>
                    <div>
                      <span className="font-bold text-sm text-neutral-800 block">Dialek Tuntunan Suara</span>
                      <span className="text-[11px] text-neutral-500 leading-normal block">Dua logat khas yang didukung asisten pengisi suara</span>
                    </div>
                  </div>
                  <div className="text-[10.5px] text-[#58423c] leading-normal pt-2 border-t border-[#dfc0b8]/40 mt-1">
                    Anda bisa menekan tombol speaker di sub-menu <b>Pustaka Aksara</b> untuk mendengarkan lafal dialek <b>Nglegena (O)</b> maupun <b>Kawi (A)</b> secara gratis!
                  </div>
                </div>

              </div>

              {/* Modal footer back close action */}
              <div className="bg-[#fcf8e3] px-6 py-4 border-t border-[#dfc0b8] flex justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="bg-[#a33818] hover:bg-[#c44f2e] text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition-all active:translate-y-0.5 cursor-pointer"
                >
                  Maturnuwun (Tutup)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BottomNavBar */}
      <nav className="bg-[#f6f0bb] border-t-4 border-[#77574d]/10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl">
        {/* Pasar Tab */}
        <button 
          onClick={() => setActiveTab('pasar')}
          className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
            activeTab === 'pasar'
              ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
              : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'pasar' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
          <span className="font-semibold text-[11px] mt-1">Pasar</span>
        </button>

        {/* Belajar Tab */}
        <button 
          onClick={() => {
            if (isTradingActive) {
                alert("Mohon selesaikan sesi transaksi Anda terlebih dahulu!");
            } else {
                setActiveTab('kamus');
            }
          }}
          className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
            activeTab === 'kamus' || activeTab === 'latihan'
              ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
              : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: (activeTab === 'kamus' || activeTab === 'latihan') ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
          <span className="font-semibold text-[11px] mt-1">Belajar</span>
        </button>

        {/* Toko Tab */}
        <button 
          onClick={() => {
            if (isTradingActive) {
                alert("Mohon selesaikan sesi transaksi Anda terlebih dahulu!");
            } else {
                setActiveTab('toko');
            }
          }}
          className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
            activeTab === 'toko'
              ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
              : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'toko' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
          <span className="font-semibold text-[11px] mt-1">Toko</span>
        </button>

        {/* Rapor Tab */}
        <button 
          onClick={() => {
            if (isTradingActive) {
                alert("Mohon selesaikan sesi transaksi Anda terlebih dahulu!");
            } else {
                setActiveTab('juara');
            }
          }}
          className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform w-[72px] cursor-pointer ${
            activeTab === 'juara'
              ? 'bg-[#c44f2e] text-white shadow-[0_3px_0_0_#862303] active:scale-95 active:translate-y-1'
              : 'text-[#795950] opacity-75 hover:bg-[#fed3c7]/40 active:scale-95 active:translate-y-1'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'juara' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
          <span className="font-semibold text-[11px] mt-1">Rapor</span>
        </button>
      </nav>
    </div>
  );
}
