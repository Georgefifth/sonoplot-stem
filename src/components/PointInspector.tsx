import React from 'react';
import { Point2D, SonificationOptions } from '../types';
import { sonifier } from '../audio/sonifier';

interface PointInspectorProps {
  point: Point2D | null;
  totalPoints: number;
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
  options: SonificationOptions;
  ariaAnnouncement: string;
}

export const PointInspector: React.FC<PointInspectorProps> = ({
  point,
  totalPoints,
  yMin,
  yMax,
  xMin,
  xMax,
  options,
  ariaAnnouncement
}) => {
  if (!point) return null;

  const freq = sonifier.mapYToFrequency(point.y, yMin, yMax, options.minFrequency, options.maxFrequency);
  const pan = sonifier.mapXToPan(point.x, xMin, xMax);
  const panPercent = Math.round(Math.abs(pan) * 100);
  const panLabel = pan < -0.1 ? `${panPercent}% Left` : pan > 0.1 ? `${panPercent}% Right` : 'Center';

  const slopeDesc = point.slope !== undefined
    ? Math.abs(point.slope) < 0.05
      ? 'Flat (Slope ≈ 0)'
      : point.slope > 0
      ? `Rising (+${point.slope.toFixed(2)})`
      : `Falling (${point.slope.toFixed(2)})`
    : 'N/A';

  return (
    <div className="bg-[#131B2B] rounded-lg border border-[#2A3854] p-4 flex flex-col gap-3">
      {/* Visual Header / Readout Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3854]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-semibold">Active Inspector</span>
          <span className="text-xs font-mono px-2 py-0.5 bg-[#1C263B] text-[#38BDF8] rounded border border-[#2A3854]">
            Point {point.index + 1} of {totalPoints}
          </span>
        </div>

        {/* Badges for critical points */}
        <div className="flex items-center gap-1.5">
          {point.isRoot && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#064E3B] text-[#A7F3D0] border border-[#047857]">
              Root (Zero)
            </span>
          )}
          {point.isLocalMax && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#164E63] text-[#A5F3FC] border border-[#0891B2]">
              Local Peak
            </span>
          )}
          {point.isLocalMin && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#164E63] text-[#A5F3FC] border border-[#0891B2]">
              Local Valley
            </span>
          )}
          {point.isYIntercept && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#431407] text-[#FED7AA] border border-[#9A3412]">
              Y-Axis Intercept
            </span>
          )}
        </div>
      </div>

      {/* Numerical Data Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {/* X Coordinate */}
        <div className="bg-[#0B0F17] p-2.5 rounded border border-[#2A3854]">
          <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">X Coordinate</span>
          <span className="text-xl font-bold font-mono text-[#F8FAFC]">{point.x.toFixed(2)}</span>
        </div>

        {/* Y Coordinate */}
        <div className="bg-[#0B0F17] p-2.5 rounded border border-[#2A3854]">
          <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">Y Coordinate</span>
          <span className="text-xl font-bold font-mono text-[#F59E0B]">{point.y.toFixed(2)}</span>
        </div>

        {/* Audio Frequency in Hz */}
        <div className="bg-[#0B0F17] p-2.5 rounded border border-[#2A3854]">
          <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">Pitch (Frequency)</span>
          <span className="text-xl font-bold font-mono text-[#06B6D4]">{Math.round(freq)} Hz</span>
        </div>

        {/* Spatial Stereo Panning */}
        <div className="bg-[#0B0F17] p-2.5 rounded border border-[#2A3854]">
          <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">Stereo Position</span>
          <span className="text-xl font-bold font-mono text-[#38BDF8]">{panLabel}</span>
        </div>
      </div>

      {/* Slope & Derivative Context */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8] bg-[#1C263B] px-3 py-2 rounded">
        <span>Instantaneous Slope f'(x): <strong className="text-[#F8FAFC] font-mono">{slopeDesc}</strong></span>
        <span>Curvature: <strong className="text-[#F8FAFC]">{point.y < 0 ? 'Negative (Sub-zero)' : 'Positive'}</strong></span>
      </div>

      {/* Dedicated Screen Reader Live Announcement Banner */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {ariaAnnouncement}
      </div>

      {/* Visible Screen Reader Transcript for Sighted Helpers/Teachers */}
      <div className="text-xs text-[#94A3B8] bg-[#0B0F17]/80 p-2 rounded border border-[#2A3854]/80 flex items-start gap-2">
        <span className="font-semibold text-[#F59E0B] shrink-0">Screen Reader Feed:</span>
        <span className="italic text-[#E2E8F0]">{ariaAnnouncement || `At x = ${point.x.toFixed(2)}, y = ${point.y.toFixed(2)}. ${slopeDesc}.`}</span>
      </div>
    </div>
  );
};
