import React, { useState } from 'react';
import { titleMusic } from '../utils/audio';

interface TitleScreenProps {
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onPlay,
  onOpenSettings,
  onOpenControls,
}) => {
  const [isMuted, setIsMuted] = useState(titleMusic.getMutedState());

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = titleMusic.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030508]/92 backdrop-blur-md select-none transition-opacity duration-300">
      {/* Game Title */}
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-[12px] text-[#e60039] uppercase -rotate-2 drop-shadow-[0_0_35px_rgba(230,0,57,0.8)] [text-shadow:-4px_4px_0px_#00d9ff,0_0_35px_rgba(230,0,57,0.8)] mb-4 font-sans">
        GORDON
      </h1>

      {/* Music Banner */}
      <div className="flex items-center gap-3 px-5 py-2.5 mb-8 rounded-full bg-[#0a0f19]/85 border border-[#00d9ff] text-[#00d9ff] text-sm font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)]">
        <span>🎵 Now Playing: <strong className="text-white">Du bist gut genug</strong></span>
        <button
          onClick={handleToggleMusic}
          className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-[#e60039] hover:bg-[#ff3366] text-white transition-all transform hover:scale-105 cursor-pointer"
        >
          {isMuted ? 'PLAY' : 'MUTE'}
        </button>
      </div>

      {/* Main Menu Buttons */}
      <div className="flex flex-col gap-3 min-w-[280px]">
        <button
          onClick={onPlay}
          className="px-10 py-3.5 bg-white/5 border-3 border-[#e60039] text-white font-bold text-xl tracking-[3px] uppercase cursor-pointer text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105 hover:rotate-1 active:translate-y-0.5"
        >
          Enter Park
        </button>

        <button
          onClick={onOpenSettings}
          className="px-10 py-3.5 bg-white/5 border-3 border-[#e60039] text-white font-bold text-xl tracking-[3px] uppercase cursor-pointer text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105 hover:rotate-1 active:translate-y-0.5"
        >
          Settings
        </button>

        <button
          onClick={onOpenControls}
          className="px-10 py-3.5 bg-white/5 border-3 border-[#e60039] text-white font-bold text-xl tracking-[3px] uppercase cursor-pointer text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105 hover:rotate-1 active:translate-y-0.5"
        >
          Controls
        </button>
      </div>
    </div>
  );
};
