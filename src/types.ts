export interface Point2D {
  x: number;
  y: number;
  index: number;
  isRoot?: boolean;
  isLocalMax?: boolean;
  isLocalMin?: boolean;
  isYIntercept?: boolean;
  isInflection?: boolean;
  isDiscontinuity?: boolean;
  slope?: number;
}

export interface CriticalPoint {
  type: 'root' | 'local_max' | 'local_min' | 'y_intercept' | 'inflection' | 'asymptote';
  x: number;
  y: number;
  description: string;
}

export interface MonotonicInterval {
  start: number;
  end: number;
  trend: 'increasing' | 'decreasing' | 'constant';
  description: string;
}

export interface CurveAnalysis {
  formula: string;
  domain: [number, number];
  range: [number, number];
  points: Point2D[];
  criticalPoints: CriticalPoint[];
  intervals: MonotonicInterval[];
  yIntercept: Point2D | null;
  roots: Point2D[];
  extrema: Point2D[];
  summaryText: string;
}

export interface CurriculumPreset {
  id: string;
  title: string;
  domainName: 'Physics' | 'Calculus' | 'Statistics' | 'Chemistry' | 'Biology' | 'Lab Data';
  formula: string;
  rangeX: [number, number];
  description: string;
  learningGoal: string;
  isCustomData?: boolean;
  csvData?: string;
}

export interface SonificationOptions {
  sweepDuration: number; // in seconds (e.g. 3.0)
  minFrequency: number;  // Hz (e.g. 200)
  maxFrequency: number;  // Hz (e.g. 900)
  stereoPanning: boolean;
  playEarcons: boolean;
  harmonicTimbre: boolean; // change timbre for negative values
  volume: number;        // 0.0 to 1.0
}

export interface QuizQuestion {
  id: string;
  title: string;
  formula: string;
  rangeX: [number, number];
  questionText: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}
