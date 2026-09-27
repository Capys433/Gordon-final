import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onQuitToMain: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onOpenSettings,
  onOpenControls,
  onQuitToMain,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030508]/92 backdrop-blur-md select-none">
      <h1 className="text-5xl sm:text-6xl font-black tracking-[10px] text-[#e60039] uppercase mb-8 drop-shadow-[0_0_25px_rgba(230,0,57,0.8)]">
        PAUSED
      </h1>

      <div className="flex flex-col gap-3 min-w-[270px]">
        <button
          onClick={onResume}
          className="px-10 py-3.5 bg-white/5 border-3 border-[#e60039] text-white font-bold text-xl tracking-[3px] uppercase cursor-pointer text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105 hover:rotate-1 active:translate-y-0.5"
        >
          Resume
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

        <button
          onClick={onQuitToMain}
          className="px-10 py-3.5 bg-white/5 border-3 border-[#e60039] text-white font-bold text-xl tracking-[3px] uppercase cursor-pointer text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105 hover:rotate-1 active:translate-y-0.5"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
