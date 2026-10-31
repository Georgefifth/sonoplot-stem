import React from 'react';
import { CurveAnalysis } from '../types';

interface StructuralReportProps {
  analysis: CurveAnalysis;
  onJumpToPoint: (x: number) => void;
}

export const StructuralReport: React.FC<StructuralReportProps> = ({
  analysis,
  onJumpToPoint
}) => {
  return (
    <div className="flex flex-col gap-4 p-5 bg-[#131B2B] rounded-lg border border-[#2A3854]">
      {/* Header and Summary Narrative */}
      <div>
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Mathematical Architecture Report
        </h3>
        <p className="mt-1 text-sm text-[#CBD5E1] leading-relaxed bg-[#0B0F17] p-3 rounded border border-[#2A3854]">
          {analysis.summaryText}
        </p>
      </div>

      {/* Domain & Range Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0B0F17] p-3 rounded border border-[#2A3854]">
          <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Domain [X_min, X_max]</span>
          <span className="text-base font-bold font-mono text-[#F8FAFC]">
            [{analysis.domain[0].toFixed(1)}, {analysis.domain[1].toFixed(1)}]
          </span>
        </div>

        <div className="bg-[#0B0F17] p-3 rounded border border-[#2A3854]">
          <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Range [Y_min, Y_max]</span>
          <span className="text-base font-bold font-mono text-[#F59E0B]">
            [{analysis.range[0].toFixed(1)}, {analysis.range[1].toFixed(1)}]
          </span>
        </div>

        <div className="bg-[#0B0F17] p-3 rounded border border-[#2A3854]">
          <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Real Roots Count</span>
          <span className="text-base font-bold font-mono text-[#10B981]">
            {analysis.roots.length}
          </span>
        </div>

        <div className="bg-[#0B0F17] p-3 rounded border border-[#2A3854]">
          <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Turning Points</span>
          <span className="text-base font-bold font-mono text-[#06B6D4]">
            {analysis.extrema.length}
          </span>
        </div>
      </div>

      {/* Critical Points Table */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
          Critical Points & Stationary Coordinates
        </h4>

        {analysis.criticalPoints.length === 0 ? (
          <p className="text-xs text-[#94A3B8] italic">No critical points found in this domain window.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-[#2A3854]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1C263B] text-[#94A3B8] border-b border-[#2A3854]">
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold">Coordinate (x, y)</th>
                  <th className="py-2.5 px-3 font-semibold">Calculus Significance</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3854]/60 bg-[#0B0F17]">
                {analysis.criticalPoints.map((cp, idx) => (
                  <tr key={idx} className="hover:bg-[#131B2B] transition">
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 font-medium ${
                        cp.type === 'root' ? 'text-[#10B981]' :
                        cp.type === 'local_max' ? 'text-[#06B6D4]' :
                        cp.type === 'local_min' ? 'text-[#38BDF8]' :
                        'text-[#F59E0B]'
                      }`}>
                        {cp.type === 'root' && '● Root (Zero)'}
                        {cp.type === 'local_max' && '▲ Local Maximum (Peak)'}
                        {cp.type === 'local_min' && '▼ Local Minimum (Valley)'}
                        {cp.type === 'y_intercept' && '◆ Y-Intercept'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#F8FAFC]">
                      ({cp.x.toFixed(2)}, {cp.y.toFixed(2)})
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">
                      {cp.description}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onJumpToPoint(cp.x)}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#1C263B] hover:bg-[#2A3854] text-[#38BDF8] border border-[#334155] transition"
                        aria-label={`Jump audio cursor to point at x = ${cp.x.toFixed(2)}`}
                      >
                        Inspect Point
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monotonic Intervals Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
          Monotonicity & Slope Intervals
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {analysis.intervals.map((inv, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded bg-[#0B0F17] border border-[#2A3854] text-xs"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                inv.trend === 'increasing' ? 'bg-[#10B981]' : inv.trend === 'decreasing' ? 'bg-[#EF4444]' : 'bg-[#94A3B8]'
              }`} />
              <div className="flex flex-col">
                <span className="font-mono font-semibold text-[#F8FAFC]">
                  Interval: [{inv.start.toFixed(1)}, {inv.end.toFixed(1)}]
                </span>
                <span className="text-[#94A3B8]">{inv.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
