import React, { useState } from 'react';
import { Keybindings } from '../types';

interface ControlsMenuProps {
  keybindings: Keybindings;
  onUpdateKeybinding: (action: keyof Keybindings, newCode: string) => void;
  onBack: () => void;
}

export const ControlsMenu: React.FC<ControlsMenuProps> = ({
  keybindings,
  onUpdateKeybinding,
  onBack,
}) => {
  const [activeRebindAction, setActiveRebindAction] = useState<keyof Keybindings | null>(null);

  const getKeyDisplay = (code: string): string => {
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code === 'Space') return 'SPACE';
    if (code.startsWith('Arrow')) return code.slice(5).toUpperCase() + ' ARROW';
    return code.toUpperCase();
  };

  const startRebinding = (action: keyof Keybindings) => {
    if (activeRebindAction) return;

    setActiveRebindAction(action);

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code !== 'Escape') {
        onUpdateKeybinding(action, e.code);
      }

      setActiveRebindAction(null);
      window.removeEventListener('keydown', handleKeyDown);
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030508]/92 backdrop-blur-md select-none">
      <div className="bg-[#0a0f19]/95 border-2 border-[#00d9ff] p-8 sm:p-10 rounded-xl flex flex-col items-center min-w-[320px] sm:min-w-[450px] max-w-[550px] shadow-[0_10px_50px_rgba(0,0,0,0.95)]">
        <h2 className="text-3xl font-black tracking-[4px] text-[#00d9ff] uppercase mb-6 drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
          Controls
        </h2>

        <div className="w-full space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {(Object.entries(keybindings) as [keyof Keybindings, { label: string; code: string }][]).map(
            ([action, config]) => {
              const isWaiting = activeRebindAction === action;
              return (
                <div key={action} className="flex justify-between items-center w-full py-1 text-base sm:text-lg">
                  <span className="text-white font-medium">{config.label}</span>
                  <button
                    onClick={() => startRebinding(action)}
                    className={`px-4 py-1.5 min-w-[130px] font-mono font-bold text-sm sm:text-base border cursor-pointer transition-all ${
                      isWaiting
                        ? 'bg-[#ffe600] text-black border-[#ffe600] animate-pulse'
                        : 'bg-[#080c14] text-[#00d9ff] border-[#00d9ff] hover:bg-[#00d9ff] hover:text-black hover:shadow-[0_0_15px_rgba(0,217,255,0.8)]'
                    }`}
                  >
                    {isWaiting ? 'PRESS KEY...' : getKeyDisplay(config.code)}
                  </button>
                </div>
              );
            }
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-8 px-8 py-3 bg-white/5 border-3 border-[#e60039] text-white font-bold text-lg tracking-[2px] uppercase cursor-pointer transition-all duration-200 shadow-[0_0_15px_rgba(230,0,57,0.3)] hover:bg-[#e60039] hover:shadow-[0_0_30px_rgba(230,0,57,0.9)] hover:scale-105"
        >
          Back
        </button>
      </div>
    </div>
  );
};
