import React from 'react';

interface HUDProps {
  tickets: number;
  itemHeld: string;
  interactionPrompt: string | null;
  subtitle: string | null;
  notification: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  tickets,
  itemHeld,
  interactionPrompt,
  subtitle,
  notification,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-5 select-none font-sans">
      {/* Central Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#00d9ff]/90 border border-black/80 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(0,217,255,0.8)]" />

      {/* Ticket Counter */}
      <div className="absolute top-5 left-5 bg-[#0a0f19]/85 border-2 border-[#ffe600] px-5 py-2.5 rounded-lg text-[#ffe600] font-bold text-lg shadow-[0_0_15px_rgba(255,230,0,0.3)]">
        🎟️ Tickets: <span>{tickets}</span>
      </div>

      {/* Inventory Held Item */}
      <div className="absolute top-18 left-5 bg-[#0a0f19]/85 border-2 border-[#00d9ff] px-4 py-2 rounded-lg text-[#00d9ff] font-bold text-base">
        🎒 Item: <span>{itemHeld}</span>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#e60039] text-white px-6 py-2.5 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(230,0,57,0.8)] animate-bounce">
          {notification}
        </div>
      )}

      {/* Interaction Prompt */}
      {interactionPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#0a0f19]/95 border-2 border-[#e60039] text-white px-7 py-3 rounded-full font-semibold text-lg tracking-wider shadow-[0_0_20px_rgba(230,0,57,0.6)]">
          {interactionPrompt}
        </div>
      )}

      {/* Subtitles Bar for Jeff's Voiced Lines */}
      {subtitle && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/85 border-l-4 border-[#ff3333] text-white px-6 py-2.5 rounded text-lg font-bold italic tracking-wide max-w-[80%] text-center shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          Jeff: &quot;{subtitle}&quot;
        </div>
      )}
    </div>
  );
};
