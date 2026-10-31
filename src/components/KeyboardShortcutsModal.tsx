import React, { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start or Stop continuous audio frequency sweep' },
    { key: '← / →', desc: 'Scrub left / right to adjacent coordinate point (plays pitch + speaks)' },
    { key: 'Shift + ← / →', desc: 'Fast scrub by jumping 5 coordinate points' },
    { key: 'Home / End', desc: 'Jump directly to the start (min X) or end (max X) of the curve' },
    { key: 'R', desc: 'Jump cursor to the next real Root (zero crossing)' },
    { key: 'M', desc: 'Jump cursor to the next critical Extrema (local peak or valley)' },
    { key: 'T', desc: 'Toggle binaural stereo panning on or off' },
    { key: '1, 2, 3', desc: 'Switch views: Explorer (1), Calculus Report (2), Tactile Grid (3)' },
    { key: '?', desc: 'Toggle this keyboard shortcut guide' },
    { key: 'Esc', desc: 'Close dialog or stop audio playback' }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#131B2B] rounded-xl border border-[#2A3854] shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2A3854] pb-3">
          <h2 id="shortcuts-title" className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <span className="p-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-sm">⌨</span>
            Accessible Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C263B] transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            aria-label="Close keyboard shortcuts modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          SonoPlot STEM is designed for 100% hands-free non-visual operation. You can control all sonification and inspection directly from the keyboard without a mouse.
        </p>

        <div className="overflow-y-auto max-h-[360px] divide-y divide-[#2A3854]/60">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-[#CBD5E1] pr-4">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-[#0B0F17] text-[#38BDF8] border border-[#2A3854] rounded font-mono font-semibold shrink-0 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#2A3854]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-semibold text-xs rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
          >
            Got it, return to App [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
