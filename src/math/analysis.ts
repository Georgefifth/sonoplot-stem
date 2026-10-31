import * as math from 'mathjs';
import { Point2D, CriticalPoint, MonotonicInterval, CurveAnalysis } from '../types';

/**
 * Clean and standardize mathematical formula input.
 * Handles common student shorthand like '2x' -> '2*x' or 'x^2' -> 'x^2'.
 */
export function sanitizeFormula(expr: string): string {
  let cleaned = expr.trim();
  // Replace implicit multiplication like 2x, 3(x+1)
  cleaned = cleaned.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
  cleaned = cleaned.replace(/(\))([a-zA-Z0-9(])/g, '$1*$2');
  return cleaned;
}

/**
 * Validate formula syntax before evaluation.
 * Returns null if valid, or a friendly error message if invalid.
 */
export function validateFormula(expr: string): string | null {
  if (!expr || expr.trim().length === 0) {
    return 'Formula cannot be empty.';
  }
  try {
    const sanitized = sanitizeFormula(expr);
    const compiled = math.compile(sanitized);
    // Test evaluation with a dummy value
    compiled.evaluate({ x: 1 });
    return null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Parenthesis') || message.includes('bracket')) {
      return 'Mismatched or unclosed parentheses.';
    }
    if (message.includes('Unexpected') || message.includes('syntax')) {
      return `Syntax error: Please check your operators (e.g. use '*' for multiplication). Details: ${message}`;
    }
    return `Invalid expression: ${message}`;
  }
}

/**
 * Parse CSV text into 2D points.
 * Format: "x, y" on each line, optional header.
 */
export function parseCSVData(csvText: string): Point2D[] {
  const lines = csvText.trim().split(/\r?\n/);
  const points: Point2D[] = [];
  let index = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/,|\t/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0].trim());
      const y = parseFloat(parts[1].trim());
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y, index: index++ });
      }
    }
  }

  // Sort by x ascending
  points.sort((a, b) => a.x - b.x);
  // Re-index
  points.forEach((p, idx) => { p.index = idx; });
  return points;
}

/**
 * Analyze a mathematical formula or custom points array.
 * Extracts domain, range, roots, extrema, slopes, and intervals.
 */
export function analyzeCurve(
  formulaOrPoints: string | Point2D[],
  domain: [number, number] = [-5, 5],
  sampleCount: number = 150
): CurveAnalysis {
  let points: Point2D[] = [];
  let formulaStr = '';
  const [xMin, xMax] = domain;

  if (Array.isArray(formulaOrPoints)) {
    points = [...formulaOrPoints];
    formulaStr = 'Custom Lab Dataset';
  } else {
    formulaStr = formulaOrPoints;
    const sanitized = sanitizeFormula(formulaStr);
    const compiled = math.compile(sanitized);
    const step = (xMax - xMin) / (sampleCount - 1);

    for (let i = 0; i < sampleCount; i++) {
      const x = Number((xMin + i * step).toFixed(4));
      let y = 0;
      let isDiscontinuity = false;

      try {
        const val = compiled.evaluate({ x });
        if (typeof val === 'number') {
          if (!isFinite(val) || Math.abs(val) > 1e6) {
            isDiscontinuity = true;
            y = NaN;
          } else {
            y = val;
          }
        } else if (val && typeof val.toDecimal === 'function') {
          y = Number(val.toDecimal());
        } else {
          y = Number(val);
        }
      } catch {
        isDiscontinuity = true;
        y = NaN;
      }

      points.push({
        x,
        y,
        index: i,
        isDiscontinuity
      });
    }
  }

  // Calculate numerical derivatives and identify features
  const validY = points.filter(p => !isNaN(p.y) && !p.isDiscontinuity).map(p => p.y);
  const yMin = validY.length > 0 ? Math.min(...validY) : -10;
  const yMax = validY.length > 0 ? Math.max(...validY) : 10;

  const actualDomain: [number, number] = [
    points.length > 0 ? points[0].x : xMin,
    points.length > 0 ? points[points.length - 1].x : xMax
  ];
  const actualRange: [number, number] = [yMin, yMax];

  const criticalPoints: CriticalPoint[] = [];
  const roots: Point2D[] = [];
  const extrema: Point2D[] = [];
  let yIntercept: Point2D | null = null;

  // Calculate slopes using central difference
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    if (isNaN(curr.y) || curr.isDiscontinuity) continue;

    if (i > 0 && i < points.length - 1) {
      const prev = points[i - 1];
      const next = points[i + 1];
      if (!isNaN(prev.y) && !isNaN(next.y)) {
        curr.slope = (next.y - prev.y) / (next.x - prev.x);
      }
    } else if (i === 0 && points.length > 1) {
      curr.slope = (points[1].y - curr.y) / (points[1].x - curr.x);
    } else if (i === points.length - 1 && points.length > 1) {
      curr.slope = (curr.y - points[i - 1].y) / (curr.x - points[i - 1].x);
    }

    // Check for y-intercept (x near 0)
    if (Math.abs(curr.x) < 0.05 && (!yIntercept || Math.abs(curr.x) < Math.abs(yIntercept.x))) {
      curr.isYIntercept = true;
      yIntercept = curr;
    }
  }

  // Detect roots and extrema
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    if (isNaN(curr.y) || curr.isDiscontinuity) continue;

    // Root detection (zero crossing or very close to 0)
    if (i < points.length - 1) {
      const next = points[i + 1];
      if (!isNaN(next.y) && !next.isDiscontinuity) {
        if ((curr.y <= 0 && next.y >= 0) || (curr.y >= 0 && next.y <= 0)) {
          const rootPoint = Math.abs(curr.y) < Math.abs(next.y) ? curr : next;
          rootPoint.isRoot = true;
          if (!roots.some(r => Math.abs(r.x - rootPoint.x) < 0.25)) {
            roots.push(rootPoint);
            criticalPoints.push({
              type: 'root',
              x: rootPoint.x,
              y: rootPoint.y,
              description: `Zero crossing (root) at x = ${rootPoint.x.toFixed(2)}`
            });
          }
        }
      }
    }

    // Extrema detection: local maximum / minimum within window of neighboring points
    if (i >= 2 && i <= points.length - 3) {
      const pMinus2 = points[i - 2];
      const pMinus1 = points[i - 1];
      const pPlus1 = points[i + 1];
      const pPlus2 = points[i + 2];

      const validNeighbors = !isNaN(pMinus2.y) && !isNaN(pMinus1.y) && !isNaN(pPlus1.y) && !isNaN(pPlus2.y);
      if (validNeighbors) {
        // Local Maximum (Peak): higher than both sides
        if (curr.y >= pMinus1.y && curr.y > pMinus2.y && curr.y >= pPlus1.y && curr.y > pPlus2.y) {
          curr.isLocalMax = true;
          if (!extrema.some(e => Math.abs(e.x - curr.x) < 0.4)) {
            extrema.push(curr);
            criticalPoints.push({
              type: 'local_max',
              x: curr.x,
              y: curr.y,
              description: `Local Maximum (Peak) at x = ${curr.x.toFixed(2)}, y = ${curr.y.toFixed(2)}`
            });
          }
        }
        // Local Minimum (Valley): lower than both sides
        else if (curr.y <= pMinus1.y && curr.y < pMinus2.y && curr.y <= pPlus1.y && curr.y < pPlus2.y) {
          curr.isLocalMin = true;
          if (!extrema.some(e => Math.abs(e.x - curr.x) < 0.4)) {
            extrema.push(curr);
            criticalPoints.push({
              type: 'local_min',
              x: curr.x,
              y: curr.y,
              description: `Local Minimum (Valley) at x = ${curr.x.toFixed(2)}, y = ${curr.y.toFixed(2)}`
            });
          }
        }
      }
    }
  }

  if (yIntercept) {
    criticalPoints.unshift({
      type: 'y_intercept',
      x: yIntercept.x,
      y: yIntercept.y,
      description: `Y-intercept at (0, ${yIntercept.y.toFixed(2)})`
    });
  }

  // Calculate monotonic intervals
  const intervals: MonotonicInterval[] = [];
  if (extrema.length === 0) {
    const overallSlope = points[points.length - 1].y - points[0].y;
    const trend = Math.abs(overallSlope) < 0.05 ? 'constant' : overallSlope > 0 ? 'increasing' : 'decreasing';
    intervals.push({
      start: actualDomain[0],
      end: actualDomain[1],
      trend,
      description: `Strictly ${trend} across the entire domain [${actualDomain[0]}, ${actualDomain[1]}].`
    });
  } else {
    const splitX = [actualDomain[0], ...extrema.map(e => e.x).sort((a, b) => a - b), actualDomain[1]];
    for (let k = 0; k < splitX.length - 1; k++) {
      const start = Number(splitX[k].toFixed(2));
      const end = Number(splitX[k + 1].toFixed(2));
      if (end - start < 0.1) continue;

      const midX = (start + end) / 2;
      const ptNear = points.find(p => Math.abs(p.x - midX) < 0.2);
      const slope = ptNear?.slope ?? 0;
      const trend = Math.abs(slope) < 0.05 ? 'constant' : slope > 0 ? 'increasing' : 'decreasing';
      intervals.push({
        start,
        end,
        trend,
        description: `${trend === 'increasing' ? 'Climbing (increasing)' : 'Falling (decreasing)'} from x = ${start} to x = ${end}`
      });
    }
  }

  // Construct plain-language acoustic & mathematical summary for screen readers
  let summary = `Mathematical Curve Analysis for ${formulaStr}. `;
  summary += `Domain: from x = ${actualDomain[0].toFixed(1)} to ${actualDomain[1].toFixed(1)}. `;
  summary += `Range: from y = ${actualRange[0].toFixed(1)} to ${actualRange[1].toFixed(1)}. `;

  if (roots.length > 0) {
    summary += `Has ${roots.length} root${roots.length > 1 ? 's' : ''} at ${roots.map(r => `x = ${r.x.toFixed(2)}`).join(', ')}. `;
  } else {
    summary += 'Has no real roots within this domain. ';
  }

  if (yIntercept) {
    summary += `Y-intercept is at y = ${yIntercept.y.toFixed(2)}. `;
  }

  if (extrema.length > 0) {
    summary += `Contains ${extrema.length} critical turning point${extrema.length > 1 ? 's' : ''}: ${extrema.map(e => e.isLocalMax ? `Peak at (${e.x.toFixed(2)}, ${e.y.toFixed(2)})` : `Valley at (${e.x.toFixed(2)}, ${e.y.toFixed(2)})`).join(', ')}. `;
  } else {
    summary += 'Has no local extrema (monotonic curve). ';
  }

  return {
    formula: formulaStr,
    domain: actualDomain,
    range: actualRange,
    points,
    criticalPoints,
    intervals,
    yIntercept,
    roots,
    extrema,
    summaryText: summary
  };
}
