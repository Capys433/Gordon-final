import React from 'react';

interface BloodyNoteOverlayProps {
  onClose: () => void;
}

export const BloodyNoteOverlay: React.FC<BloodyNoteOverlayProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-black/88 p-4 font-mono select-none">
      <div className="bg-[#1c1510] border-4 border-[#8b0000] p-8 sm:p-10 max-w-[580px] text-[#ff3333] text-lg sm:text-xl font-bold leading-relaxed shadow-[0_0_40px_rgba(139,0,0,0.9),inset_0_0_60px_rgba(0,0,0,0.9)] -rotate-1 rounded-md relative [text-shadow:0_0_8px_rgba(255,0,0,0.8)]">
        &quot;I have hidden somewhere in the amusement park and I am hiding from one of the mascots specifically the tall teal fork guy, look if I don&apos;t make it alive please someone or anyone come and stop this madness oh no! The mascot heard me panicking...&quot;
      </div>

      <button
        onClick={onClose}
        className="mt-6 bg-[#8b0000] text-white border-2 border-[#ff3333] px-8 py-2.5 font-bold text-base cursor-pointer tracking-widest transition-all hover:bg-[#ff3333] hover:text-black"
      >
        CLOSE NOTE [ESC]
      </button>
    </div>
  );
};
