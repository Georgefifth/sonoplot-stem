import React, { useState } from 'react';
import { CurveAnalysis } from '../types';
import { generateTactileGrid, generateBraillePinDisplay } from '../tactile/brailleGenerator';

interface TactileGridPanelProps {
  analysis: CurveAnalysis;
}

export const TactileGridPanel: React.FC<TactileGridPanelProps> = ({ analysis }) => {
  const [format, setFormat] = useState<'ascii' | 'braille_dots'>('ascii');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const asciiGrid = generateTactileGrid(analysis, {
    width: 45,
    height: 18,
    format: 'ascii',
    includeLabels: true
  });

  const brailleGrid = generateBraillePinDisplay(analysis);
  const activeContent = format === 'ascii' ? asciiGrid : brailleGrid;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tactile_Graph_${analysis.formula.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-[#131B2B] rounded-lg border border-[#2A3854]">
      {/* Header and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3854]/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Tactile Braille & Embosser Matrix (BANA Standard)
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Conforms to Braille Authority of North America (BANA) tactile graphic specifications.
          </p>
        </div>

        {/* Format Selector & Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex rounded border border-[#2A3854] overflow-hidden text-xs">
            <button
              onClick={() => setFormat('ascii')}
              className={`px-3 py-1.5 font-medium transition ${
                format === 'ascii' ? 'bg-[#F59E0B] text-[#0B0F17]' : 'bg-[#1C263B] text-[#94A3B8]'
              }`}
            >
              ASCII Embosser Grid
            </button>
            <button
              onClick={() => setFormat('braille_dots')}
              className={`px-3 py-1.5 font-medium transition ${
                format === 'braille_dots' ? 'bg-[#F59E0B] text-[#0B0F17]' : 'bg-[#1C263B] text-[#94A3B8]'
              }`}
            >
              Unicode Braille Pins
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C263B] hover:bg-[#2A3854] text-[#F8FAFC] rounded border border-[#334155] text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            aria-label="Copy Tactile Grid to Clipboard"
          >
            {copyFeedback ? (
              <span className="text-[#10B981] font-semibold">Copied!</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy Grid</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B0F17] rounded text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
            aria-label="Download Embosser TXT File"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Tactile Matrix Display Canvas / Pre element */}
      <div className="relative">
        <pre
          className="w-full bg-[#0B0F17] text-[#A5F3FC] font-mono text-xs sm:text-sm p-4 rounded-lg border border-[#2A3854] overflow-x-auto leading-tight select-all focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
          tabIndex={0}
          role="region"
          aria-label="Tactile embossed grid representation"
        >
          {activeContent}
        </pre>
      </div>

      {/* TVI Classroom Instructions Box */}
      <div className="p-3 bg-[#0B0F17] rounded border border-[#2A3854] text-xs text-[#94A3B8] leading-relaxed">
        <strong className="text-[#F8FAFC] block mb-1">Educator & TVI Print Instructions:</strong>
        To produce a tactile sheet for blind students: copy this grid into standard Braille translation software (e.g., Duxbury DBT) or print directly onto microcapsule Swell-Touch thermal paper and pass through a thermal fuser. The dark pixels and lines will raise into raised tactile contours readable by fingertips.
      </div>
    </div>
  );
};
