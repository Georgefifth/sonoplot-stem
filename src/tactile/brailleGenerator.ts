import { CurveAnalysis } from '../types';

export interface TactileGridOptions {
  width: number;  // characters wide (default: 45)
  height: number; // lines high (default: 20)
  format: 'ascii' | 'braille_dots';
  includeLabels: boolean;
}

/**
 * Maps numerical values to Unicode 2x4 Braille pattern symbols (U+2800 to U+28FF)
 */
function getBrailleDotChar(dotPositions: number[]): string {
  // Dot 1: 0x01, Dot 2: 0x02, Dot 3: 0x04, Dot 4: 0x08, Dot 5: 0x10, Dot 6: 0x20, Dot 7: 0x40, Dot 8: 0x80
  let code = 0x2800;
  for (const pos of dotPositions) {
    if (pos >= 1 && pos <= 8) {
      code |= 1 << (pos - 1);
    }
  }
  return String.fromCharCode(code);
}

/**
 * Generate a 2D ASCII & Braille tactile graphic grid conforming to BANA standards.
 */
export function generateTactileGrid(
  analysis: CurveAnalysis,
  options: TactileGridOptions = {
    width: 45,
    height: 20,
    format: 'ascii',
    includeLabels: true
  }
): string {
  const { width, height } = options;
  const [xMin, xMax] = analysis.domain;
  const [yMin, yMax] = analysis.range;

  // Create a 2D character matrix
  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ' ')
  );

  // Determine row index for X-axis (y = 0)
  const xAxisRow = yMin <= 0 && yMax >= 0
    ? Math.round(((yMax - 0) / (yMax - yMin)) * (height - 1))
    : -1;

  // Determine column index for Y-axis (x = 0)
  const yAxisCol = xMin <= 0 && xMax >= 0
    ? Math.round(((0 - xMin) / (xMax - xMin)) * (width - 1))
    : -1;

  // Draw X-axis
  if (xAxisRow >= 0 && xAxisRow < height) {
    for (let c = 0; c < width; c++) {
      grid[xAxisRow][c] = '-';
    }
  }

  // Draw Y-axis
  if (yAxisCol >= 0 && yAxisCol < width) {
    for (let r = 0; r < height; r++) {
      grid[r][yAxisCol] = '|';
    }
  }

  // Draw axis intersection origin
  if (xAxisRow >= 0 && xAxisRow < height && yAxisCol >= 0 && yAxisCol < width) {
    grid[xAxisRow][yAxisCol] = '+';
  }

  // Plot curve points
  for (const pt of analysis.points) {
    if (isNaN(pt.y) || pt.isDiscontinuity) continue;

    const col = Math.round(((pt.x - xMin) / (xMax - xMin)) * (width - 1));
    const row = Math.round(((yMax - pt.y) / (yMax - yMin)) * (height - 1));

    if (row >= 0 && row < height && col >= 0 && col < width) {
      let char = '*';
      if (options.format === 'braille_dots') {
        char = '⠿'; // High-density Braille tactile pin
      } else {
        if (pt.isLocalMax) char = '^';
        else if (pt.isLocalMin) char = 'v';
        else if (pt.isRoot) char = 'O';
        else if (col === yAxisCol && row === xAxisRow) char = '@';
      }
      grid[row][col] = char;
    }
  }

  // Construct formatted document with BANA header and legend
  const lines: string[] = [];
  lines.push('=== TACTILE GRAPH SPECIFICATION (BANA TACTILE GUIDELINES) ===');
  lines.push(`Title: Graph of ${analysis.formula}`);
  lines.push(`Domain: [${xMin.toFixed(1)}, ${xMax.toFixed(1)}] | Range: [${yMin.toFixed(1)}, ${yMax.toFixed(1)}]`);
  lines.push(`Dimensions: ${width} cells wide x ${height} lines high`);
  lines.push('');
  lines.push('TACTILE LEGEND:');
  lines.push('  ^ = Local Maximum (Peak)      v = Local Minimum (Valley)');
  lines.push('  O = Root (Zero Crossing)      + = Origin (0, 0)');
  lines.push('  - = X-Axis                    | = Y-Axis');
  lines.push('  * = Function Curve Path       # = Discontinuity/Asymptote');
  lines.push('');
  lines.push(` y_max = ${yMax.toFixed(1)}`);

  // Append grid rows
  for (let r = 0; r < height; r++) {
    const rowStr = grid[r].join('');
    lines.push(`|${rowStr}|`);
  }

  lines.push(` y_min = ${yMin.toFixed(1)}`);
  lines.push(` x_min = ${xMin.toFixed(1)}`.padEnd(width + 2, ' ') + `x_max = ${xMax.toFixed(1)}`);
  lines.push('');
  lines.push('NEMETH / UEB MATHEMATICAL FEATURE SUMMARY:');
  if (analysis.roots.length > 0) {
    lines.push(`Roots (Zeros): ${analysis.roots.map(r => `x = ${r.x.toFixed(2)}`).join('; ')}`);
  } else {
    lines.push('Roots (Zeros): None within domain');
  }
  if (analysis.extrema.length > 0) {
    lines.push(`Turning Points: ${analysis.extrema.map(e => `${e.isLocalMax ? 'Max' : 'Min'} at (${e.x.toFixed(2)}, ${e.y.toFixed(2)})`).join('; ')}`);
  }
  lines.push('');
  lines.push('Ready for standard swell-touch thermal paper or embossers (e.g. Index Braille, ViewPlus).');

  return lines.join('\n');
}

/**
 * Generate a compact Unicode Braille Dot string suitable for refreshable Braille displays.
 */
export function generateBraillePinDisplay(analysis: CurveAnalysis): string {
  const width = 30;
  const height = 10;
  const [xMin, xMax] = analysis.domain;
  const [yMin, yMax] = analysis.range;

  const lines: string[] = [];
  lines.push(`⠠⠛⠗⠁⠏⠓⠀⠕⠋⠀${analysis.formula}`);

  for (let r = 0; r < height; r++) {
    const rowChars: string[] = [];
    for (let c = 0; c < width; c++) {
      const x = xMin + (c / (width - 1)) * (xMax - xMin);
      const targetY = yMax - (r / (height - 1)) * (yMax - yMin);

      const ptNear = analysis.points.find(p => Math.abs(p.x - x) < (xMax - xMin) / (width * 1.5));
      if (ptNear && !isNaN(ptNear.y) && Math.abs(ptNear.y - targetY) < (yMax - yMin) / (height * 1.5)) {
        rowChars.push(getBrailleDotChar([1, 2, 4, 5])); // Dense tactile block
      } else if (Math.abs(targetY) < (yMax - yMin) / height) {
        rowChars.push('⠤'); // Horizontal axis line
      } else {
        rowChars.push('⠀'); // Empty space
      }
    }
    lines.push(rowChars.join(''));
  }

  return lines.join('\n');
}
