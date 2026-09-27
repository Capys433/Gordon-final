import React from 'react';
import { Settings } from '../types';

interface SettingsMenuProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onBack: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030508]/92 backdrop-blur-md select-none">
      <div className="bg-[#0a0f19]/95 border-2 border-[#00d9ff] p-8 sm:p-10 rounded-xl flex flex-col items-center min-w-[320px] sm:min-w-[450px] shadow-[0_10px_50px_rgba(0,0,0,0.95)]">
        <h2 className="text-3xl font-black tracking-[4px] text-[#00d9ff] uppercase mb-6 drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
          Settings
        </h2>

        <div className="w-full space-y-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <label htmlFor="sensitivity-range" className="text-white">Mouse Sensitivity</label>
            <div className="flex items-center gap-3">
              <input
                id="sensitivity-range"
                type="range"
                min="1"
                max="10"
                value={settings.sensitivity}
                onChange={(e) => onUpdateSettings({ sensitivity: Number(e.target.value) })}
                className="accent-[#e60039] cursor-pointer"
              />
              <span className="text-[#00d9ff] font-mono text-base w-6">{settings.sensitivity}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <label htmlFor="fov-range" className="text-white">Field of View (FOV)</label>
            <div className="flex items-center gap-3">
              <input
                id="fov-range"
                type="range"
                min="60"
                max="110"
                value={settings.fov}
                onChange={(e) => onUpdateSettings({ fov: Number(e.target.value) })}
                className="accent-[#e60039] cursor-pointer"
              />
              <span className="text-[#00d9ff] font-mono text-base w-8">{settings.fov}°</span>
            </div>
          </div>
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
