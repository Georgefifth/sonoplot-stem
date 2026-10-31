import React, { useRef, useEffect } from 'react';
import { CurveAnalysis } from '../types';

interface AcousticGraphCanvasProps {
  analysis: CurveAnalysis;
  currentPointIndex: number;
  sweepProgress: number | null; // 0.0 to 1.0 or null
  onPointSelect: (index: number) => void;
  className?: string;
}

export const AcousticGraphCanvas: React.FC<AcousticGraphCanvasProps> = ({
  analysis,
  currentPointIndex,
  sweepProgress,
  onPointSelect,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Padding around graph area
    const padding = { top: 32, right: 36, bottom: 48, left: 56 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const [xMin, xMax] = analysis.domain;
    let [yMin, yMax] = analysis.range;

    // Guard against zero range
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    }
    // Add 10% breathing room on Y axis
    const yMargin = (yMax - yMin) * 0.1 || 1;
    const yAxisMin = yMin - yMargin;
    const yAxisMax = yMax + yMargin;

    // Coordinate conversion functions
    const toCanvasX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const toCanvasY = (y: number) => padding.top + ((yAxisMax - y) / (yAxisMax - yAxisMin)) * plotHeight;

    // 1. Clear background
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle gridlines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;

    // Vertical gridlines
    const xStep = Math.max(1, Math.round((xMax - xMin) / 8));
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, padding.top);
      ctx.lineTo(cx, height - padding.bottom);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#64748B';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(x.toString(), cx, height - padding.bottom + 18);
    }

    // Horizontal gridlines
    const yStep = Math.max(1, Math.round((yAxisMax - yAxisMin) / 6));
    for (let y = Math.ceil(yAxisMin); y <= Math.floor(yAxisMax); y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(padding.left, cy);
      ctx.lineTo(width - padding.right, cy);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#64748B';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padding.left - 8, cy + 4);
    }

    // 3. Draw primary X and Y coordinate axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // X axis (y = 0)
    if (yAxisMin <= 0 && yAxisMax >= 0) {
      const cy0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(padding.left, cy0);
      ctx.lineTo(width - padding.right, cy0);
      ctx.stroke();
    }

    // Y axis (x = 0)
    if (xMin <= 0 && xMax >= 0) {
      const cx0 = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(cx0, padding.top);
      ctx.lineTo(cx0, height - padding.bottom);
      ctx.stroke();
    }

    // 4. Draw curve line
    const points = analysis.points;
    if (points.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#F59E0B'; // Oscilloscope Amber
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      let started = false;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (isNaN(pt.y) || pt.isDiscontinuity) {
          started = false;
          continue;
        }
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);

        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Critical Points (Roots, Extrema, Intercept)
    for (const pt of points) {
      if (isNaN(pt.y) || pt.isDiscontinuity) continue;
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);

      // Root marker (Green pulse circle)
      if (pt.isRoot) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Local Maxima (Cyan upward diamond)
      if (pt.isLocalMax) {
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx + 6, cy + 4);
        ctx.lineTo(cx - 6, cy + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Local Minima (Cyan downward triangle)
      if (pt.isLocalMin) {
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 7);
        ctx.lineTo(cx + 6, cy - 4);
        ctx.lineTo(cx - 6, cy - 4);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 6. Draw Continuous Sweep Playhead line (if sweeping)
    if (sweepProgress !== null && sweepProgress >= 0 && sweepProgress <= 1) {
      const sweepX = padding.left + sweepProgress * plotWidth;
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sweepX, padding.top);
      ctx.lineTo(sweepX, height - padding.bottom);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Draw Active Scrubbing Cursor and Point Halo
    const activePoint = points[currentPointIndex];
    if (activePoint && !isNaN(activePoint.y) && !activePoint.isDiscontinuity) {
      const activeX = toCanvasX(activePoint.x);
      const activeY = toCanvasY(activePoint.y);

      // Vertical guide line
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(activeX, padding.top);
      ctx.lineTo(activeX, height - padding.bottom);
      ctx.stroke();
      ctx.restore();

      // Outer ring
      ctx.save();
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(activeX, activeY, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing center pip
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(activeX, activeY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tooltip coordinate badge on canvas
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const text = `(${activePoint.x.toFixed(2)}, ${activePoint.y.toFixed(2)})`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(text).width;
      const badgeX = Math.min(width - padding.right - textWidth - 12, Math.max(padding.left, activeX - textWidth / 2 - 6));
      const badgeY = activeY > padding.top + 35 ? activeY - 24 : activeY + 16;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - 14, textWidth + 12, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'left';
      ctx.fillText(text, badgeX + 6, badgeY);
    }
  }, [analysis, currentPointIndex, sweepProgress]);

  // Handle pointer/touch interaction
  const handlePointerAction = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const paddingLeft = 56;
    const paddingRight = 36;
    const plotWidth = rect.width - paddingLeft - paddingRight;

    if (clickX >= paddingLeft && clickX <= rect.width - paddingRight) {
      const norm = (clickX - paddingLeft) / plotWidth;
      const targetIndex = Math.round(norm * (analysis.points.length - 1));
      if (targetIndex >= 0 && targetIndex < analysis.points.length) {
        onPointSelect(targetIndex);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] sm:h-[400px] rounded-lg overflow-hidden border border-[#2A3854] bg-[#0B0F17] shadow-inner ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
        tabIndex={0}
        role="img"
        aria-label={`Interactive curve plot of ${analysis.formula}. Current position: point ${currentPointIndex + 1} of ${analysis.points.length}. Use Left and Right arrow keys to navigate.`}
        onPointerDown={handlePointerAction}
        onPointerMove={(e) => {
          if (e.buttons === 1) handlePointerAction(e);
        }}
      />
    </div>
  );
};
