/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface SplashPageProps {
  onStart: () => void;
}

export default function SplashPage({ onStart }: SplashPageProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen flex flex-col overflow-hidden m-0 p-0 antialiased bg-[#fffadf]">
      {/* ... (background styles remains same) ... */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center blur-sm scale-105" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDoACzdR-Jb_kLGoQMJ21RMju5PylfwFYMRRyZ0zBvNLFp2hZnxONqS75rCD7FSxBIVZ2aTYX4ejfEQx551sDAp1sIEPAcuL7hnI4UVAub_k8goFBH3ThhLuQ5wfmn9S_sLYt4nKwJXS9ZszSHQ_OuU_wC9QPy6Ff0Qxb7jbuL1-96l2GtBcmY0DdSqbsvapn67g_uiKfKkOBjVtrxPWl6ldfDI07e8JYWw9h6HzO1qa-7dUg9CPh4FII2qRpm4TJfWjcVAdT2PTow')" 
        }}
      />
      <div className="absolute inset-0 bg-[#fffadf]/50" />

      {/* Main Content Canvas */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto h-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center text-center"
        >
          {/* Decorative Circular Logo Element */}
          <div className="mb-6 bg-[#f6f0bb] rounded-full p-6 shadow-xl border-4 border-[#eae4b1] flex items-center justify-center w-32 h-32">
            <span className="material-symbols-outlined text-[80px] text-[#a33818]" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>

          <h1 className="font-display-lg text-[48px] text-[#a33818] drop-shadow-[0_4px_0_#77574d] mb-4 font-bold leading-[56px] tracking-[-0.02em]">
            Pasar<br/>Hanacaraka
          </h1>

          <div className="w-full bg-[#eae4b1] rounded-full h-4 mb-8 overflow-hidden border border-[#a33818]/20">
            <motion.div 
              className="bg-[#a33818] h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <p className="font-body-md text-[16px] text-[#58423c] leading-[24px] font-normal mb-8">
            {progress < 100 ? "Memuat petualangan..." : "Siap dimulai!"}
          </p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={onStart}
            disabled={progress < 100}
            className={`w-64 text-white font-semibold rounded-xl py-4 px-6 shadow-[0_4px_0_0_#862303] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 text-md relative ${progress < 100 ? 'bg-gray-400' : 'bg-[#a33818] hover:bg-[#c44f2e] cursor-pointer'}`}
          >
            <span>{progress < 100 ? "Memuat..." : "Mulai Petualangan"}</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
