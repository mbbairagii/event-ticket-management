import React from 'react';

export default function AlienLogo({ className = "w-8 h-8", glow = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-[#ccff00] rounded-full blur-md opacity-40 animate-pulse pointer-events-none" />
      )}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
      >
        {/* Alien Head Silhouette */}
        <path 
          d="M50 8C26 8 10 28 10 52C10 74 32 94 50 94C68 94 90 74 90 52C90 28 74 8 50 8Z" 
          fill="#0c0d14" 
          stroke="#ccff00" 
          strokeWidth="4" 
          strokeLinejoin="round"
        />
        
        {/* Forehead Circuit Marks */}
        <path 
          d="M50 16V28M42 22H58" 
          stroke="#ccff00" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.8"
        />
        
        {/* Alien Left Eye (Glowing Slanted) */}
        <path 
          d="M26 42C26 42 33 36 41 46C43 49 42 56 36 60C29 64 24 55 26 42Z" 
          fill="#ccff00" 
          stroke="#000" 
          strokeWidth="1.5"
        />
        {/* Left Eye Glint */}
        <circle cx="34" cy="48" r="2" fill="#ffffff" />

        {/* Alien Right Eye (Glowing Slanted) */}
        <path 
          d="M74 42C74 42 67 36 59 46C57 49 58 56 64 60C71 64 76 55 74 42Z" 
          fill="#ccff00" 
          stroke="#000" 
          strokeWidth="1.5"
        />
        {/* Right Eye Glint */}
        <circle cx="66" cy="48" r="2" fill="#ffffff" />

        {/* Nostril Dots */}
        <circle cx="47" cy="70" r="1.5" fill="#ccff00" opacity="0.9" />
        <circle cx="53" cy="70" r="1.5" fill="#ccff00" opacity="0.9" />

        {/* Subtle Chin Line */}
        <path 
          d="M44 80C47 82 53 82 56 80" 
          stroke="#ccff00" 
          strokeWidth="2" 
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
