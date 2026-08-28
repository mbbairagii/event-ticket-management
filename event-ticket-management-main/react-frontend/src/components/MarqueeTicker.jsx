import React from 'react';
import { motion } from 'framer-motion';

export default function MarqueeTicker({
  text = "EVENTIFIED // LIVE EVENTS • CONCERTS • ART EXHIBITIONS • COMEDY • TECH SUMMITS • FESTIVALS • NIGHTLIFE // AUTO-DETECT NEARBY SHOWS // FAIR TICKETING // ",
  speed = 25,
  reverse = false,
  variant = "lime", // "lime" | "dark" | "outline"
  className = ""
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "lime":
        return "bg-[#ccff00] text-black font-syne font-black text-xl md:text-2xl py-3 tracking-wider";
      case "dark":
        return "bg-[#0f1017] text-white border-y border-white/10 font-syne font-bold text-lg md:text-xl py-3 tracking-widest";
      case "outline":
        return "bg-black text-transparent stroke-text-lime font-syne font-extrabold text-2xl md:text-4xl py-4";
      default:
        return "bg-[#ccff00] text-black font-syne font-black text-xl py-3";
    }
  };

  const repeatedText = Array(6).fill(text).join(" ");

  return (
    <div className={`w-full overflow-hidden whitespace-nowrap flex select-none ${getVariantStyles()} ${className}`}>
      <motion.div
        className="flex shrink-0 items-center gap-6"
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed
        }}
      >
        <span>{repeatedText}</span>
        <span>{repeatedText}</span>
      </motion.div>
    </div>
  );
}
