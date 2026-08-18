import React, { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

// High-quality atmospheric royalty-free jazz / lounge tracks
const JAZZ_AUDIO_SOURCES = [
  // Upbeat Smooth Lounge Jazz
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=smooth-jazz-ambient-112199.mp3',
  // Classic Relaxing Jazz Piano
  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=midnight-jazz-10825.mp3',
  // Live Jazz Club Stream
  'https://ia801503.us.archive.org/15/items/audio_202008/smooth_jazz.mp3'
];

export default function JazzAmbiencePlayer({ isPlaying, setIsPlaying }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Audio playback was prevented by browser autoplay policy:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  return (
    <>
      <audio
        ref={audioRef}
        src={JAZZ_AUDIO_SOURCES[0]}
        loop
        preload="auto"
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Floating Now Playing Pill when Audio is Active */}
      {isPlaying && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#11121a]/95 backdrop-blur-xl border border-[#ccff00]/60 p-3 shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#ccff00]">
            <Volume2 size={15} className="animate-pulse" />
            <span className="font-bold tracking-wider uppercase">JAZZ LOUNGE AMBIENCE</span>
          </div>

          <div className="flex items-end gap-[3px] h-3.5 px-2">
            <span className="w-[3px] bg-[#ccff00] h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-[3px] bg-[#ccff00] h-3.5 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-[3px] bg-[#ccff00] h-1.5 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-[3px] bg-[#ccff00] h-3 animate-bounce" style={{ animationDelay: '450ms' }} />
          </div>

          <button
            onClick={() => setIsPlaying(false)}
            className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer uppercase ml-1"
          >
            MUTE
          </button>
        </div>
      )}
    </>
  );
}
