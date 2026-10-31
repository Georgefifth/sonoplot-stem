import React from 'react';
import { SonificationOptions } from '../types';

interface SonificationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepLeft: () => void;
  onStepRight: () => void;
  onJumpToRoot: () => void;
  onJumpToExtrema: () => void;
  options: SonificationOptions;
  onOptionsChange: (newOptions: SonificationOptions) => void;
}

export const SonificationControls: React.FC<SonificationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepLeft,
  onStepRight,
  onJumpToRoot,
  onJumpToExtrema,
  options,
  onOptionsChange
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-[#131B2B] rounded-lg border border-[#2A3854]">
      {/* Primary Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onTogglePlay}
          className={`flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg font-semibold text-base transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
            isPlaying
              ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
              : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17]'
          }`}
          aria-label={isPlaying ? 'Pause Continuous Audio Sweep (Shortcut: Space)' : 'Play Continuous Audio Sweep (Shortcut: Space)'}
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>Stop Sweep</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              <span>Play Audio Sweep</span>
            </>
          )}
          <span className="hidden sm:inline-block ml-1 text-xs px-1.5 py-0.5 bg-black/20 rounded font-mono">
            Space
          </span>
        </button>

        {/* Step Navigation Button Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStepLeft}
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-[#1C263B] hover:bg-[#2A3854] text-[#F8FAFC] rounded-lg border border-[#334155] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            aria-label="Step to previous coordinate (Shortcut: Left Arrow)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Step Left</span>
            <span className="hidden md:inline font-mono text-xs text-[#94A3B8]">←</span>
          </button>

          <button
            onClick={onStepRight}
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-[#1C263B] hover:bg-[#2A3854] text-[#F8FAFC] rounded-lg border border-[#334155] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            aria-label="Step to next coordinate (Shortcut: Right Arrow)"
          >
            <span>Step Right</span>
            <span className="hidden md:inline font-mono text-xs text-[#94A3B8]">→</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Feature Jumpers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onJumpToRoot}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-[#064E3B] hover:bg-[#065F46] text-[#A7F3D0] rounded-lg border border-[#047857] text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            aria-label="Jump directly to next Zero Root (Shortcut: R)"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true"></span>
            <span>Next Root</span>
            <span className="font-mono text-[11px] bg-black/20 px-1 rounded">R</span>
          </button>

          <button
            onClick={onJumpToExtrema}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-[#164E63] hover:bg-[#0E7490] text-[#A5F3FC] rounded-lg border border-[#0891B2] text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            aria-label="Jump directly to next Peak or Valley Extrema (Shortcut: M)"
          >
            <span className="w-2 h-2 rotate-45 bg-[#06B6D4]" aria-hidden="true"></span>
            <span>Next Extrema</span>
            <span className="font-mono text-[11px] bg-black/20 px-1 rounded">M</span>
          </button>
        </div>
      </div>

      {/* Audio Toggles & Configuration Bar */}
      <div className="pt-2 border-t border-[#2A3854]/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[#94A3B8]">
        {/* Sweep Duration Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label htmlFor="duration-slider" className="font-medium">Sweep Duration:</label>
            <span className="font-mono text-[#F8FAFC]">{options.sweepDuration.toFixed(1)}s</span>
          </div>
          <input
            id="duration-slider"
            type="range"
            min="1.5"
            max="7.0"
            step="0.5"
            value={options.sweepDuration}
            onChange={(e) => onOptionsChange({ ...options, sweepDuration: parseFloat(e.target.value) })}
            className="w-full accent-[#F59E0B] cursor-pointer"
            aria-label={`Sweep duration ${options.sweepDuration} seconds`}
          />
        </div>

        {/* Volume Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label htmlFor="volume-slider" className="font-medium">Volume:</label>
            <span className="font-mono text-[#F8FAFC]">{Math.round(options.volume * 100)}%</span>
          </div>
          <input
            id="volume-slider"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={options.volume}
            onChange={(e) => onOptionsChange({ ...options, volume: parseFloat(e.target.value) })}
            className="w-full accent-[#F59E0B] cursor-pointer"
            aria-label={`Audio volume ${Math.round(options.volume * 100)} percent`}
          />
        </div>

        {/* Spatial Panning Toggle */}
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={options.stereoPanning}
            onChange={(e) => onOptionsChange({ ...options, stereoPanning: e.target.checked })}
            className="w-4 h-4 accent-[#06B6D4] rounded"
          />
          <span className="text-[#F8FAFC] font-medium">Binaural Stereo Pan</span>
        </label>

        {/* Earcons & Timbre Toggle */}
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={options.playEarcons}
            onChange={(e) => onOptionsChange({ ...options, playEarcons: e.target.checked })}
            className="w-4 h-4 accent-[#10B981] rounded"
          />
          <span className="text-[#F8FAFC] font-medium">Feature Cues (Earcons)</span>
        </label>
      </div>
    </div>
  );
};
