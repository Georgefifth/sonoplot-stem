import React from 'react';
import { CurriculumPreset } from '../types';
import { CURRICULUM_PRESETS } from '../curriculumData';

interface CurriculumPresetsProps {
  selectedPresetId: string;
  onSelectPreset: (preset: CurriculumPreset) => void;
}

export const CurriculumPresets: React.FC<CurriculumPresetsProps> = ({
  selectedPresetId,
  onSelectPreset
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
          Curriculum Presets (STEM Models)
        </h3>
        <span className="text-xs text-[#64748B]">Click or Tab to select</span>
      </div>

      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-thin">
        {CURRICULUM_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex flex-col text-left p-3 rounded-lg border transition text-xs shrink-0 w-[240px] sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
                isSelected
                  ? 'bg-[#1C263B] border-[#F59E0B] shadow-sm'
                  : 'bg-[#131B2B] border-[#2A3854] hover:bg-[#1A2338]'
              }`}
              aria-pressed={isSelected}
              aria-label={`Select preset ${preset.title}. Formula: ${preset.formula}. ${preset.description}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-sm text-[#F8FAFC] truncate">
                  {preset.title.split(':')[0]}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono rounded bg-[#0B0F17] text-[#38BDF8] border border-[#2A3854]">
                  {preset.domainName}
                </span>
              </div>

              <span className="font-mono text-[#F59E0B] font-medium truncate mb-1">
                y = {preset.formula}
              </span>

              <p className="text-[#94A3B8] text-[11px] line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
