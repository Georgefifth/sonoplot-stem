import { CurriculumPreset, QuizQuestion } from './types';

export const CURRICULUM_PRESETS: CurriculumPreset[] = [
  {
    id: 'projectile',
    title: 'Kinematics: Projectile Trajectory',
    domainName: 'Physics',
    formula: '-0.5 * x^2 + 2 * x + 6',
    rangeX: [-2, 6],
    description: 'Trajectory of a ball launched into the air. Features a launch height, peak apogee, and ground impact root.',
    learningGoal: 'Hear how the pitch rises to the maximum apex at x = 2, then falls until hitting the ground (zero crossing root) at x = 6.'
  },
  {
    id: 'cubic',
    title: 'Calculus: Cubic with Inflection Point',
    domainName: 'Calculus',
    formula: 'x^3 - 3 * x',
    rangeX: [-2.5, 2.5],
    description: 'Classic cubic function showing local maximum, local minimum, inflection point, and three distinct roots.',
    learningGoal: 'Identify two turning points: local peak at x = -1, and local valley at x = 1, crossing zero three times.'
  },
  {
    id: 'damped_oscillator',
    title: 'Physics: Damped Harmonic Oscillator',
    domainName: 'Physics',
    formula: 'e^(-0.3 * x) * cos(3 * x)',
    rangeX: [0, 10],
    description: 'Vibrating guitar string or shock absorber dying down over time due to friction and air resistance.',
    learningGoal: 'Listen to the alternating high and low frequency waves that gradually decay towards zero.'
  },
  {
    id: 'gaussian',
    title: 'Statistics: Standard Normal Distribution',
    domainName: 'Statistics',
    formula: '4 * e^(-0.5 * x^2)',
    rangeX: [-3.5, 3.5],
    description: 'The ubiquitous Gaussian bell curve found across genetics, IQ test scoring, and physical measurement errors.',
    learningGoal: 'Notice the perfect symmetry: flat baseline on the left, climbing to a smooth central maximum at x = 0, falling symmetrically.'
  },
  {
    id: 'titration',
    title: 'Chemistry: Acid-Base Titration Sigmoid',
    domainName: 'Chemistry',
    formula: '14 / (1 + e^(-2 * (x - 4)))',
    rangeX: [0, 8],
    description: 'pH curve when adding strong base into acid. Remains acidic, then rapidly shoots up through the equivalence point at x = 4.',
    learningGoal: 'Experience a sharp frequency cliff: low pitch plateau, rapid vertical frequency leap, high pitch alkaline plateau.'
  },
  {
    id: 'enzyme',
    title: 'Biology: Michaelis-Menten Kinetics',
    domainName: 'Biology',
    formula: '(10 * x) / (1.5 + x)',
    rangeX: [0, 10],
    description: 'Rate of enzymatic substrate conversion approaching maximum velocity V_max as enzyme active sites become saturated.',
    learningGoal: 'Observe diminishing returns: steep frequency climb near x = 0 tapering off into a horizontal ceiling (asymptote).'
  },
  {
    id: 'lab_pendulum',
    title: 'Lab Data: Real Pendulum Photogate Sensor',
    domainName: 'Lab Data',
    formula: 'Lab Experiment: Angle vs Time',
    rangeX: [0, 5],
    description: 'Empirical sensor data recorded from a physics photogate timing sensor tracking angular displacement (degrees vs seconds).',
    learningGoal: 'Demonstrates sonification on real-world experimental lab data points with real sensor noise.',
    isCustomData: true,
    csvData: `# Time(s), Angle(deg)
0.0, 18.2
0.2, 16.5
0.4, 11.8
0.6, 4.3
0.8, -4.1
1.0, -11.9
1.2, -16.4
1.4, -15.9
1.6, -11.0
1.8, -3.2
2.0, 5.1
2.2, 12.4
2.4, 15.6
2.6, 13.9
2.8, 8.2
3.0, 0.4
3.2, -7.5
3.4, -13.1
3.6, -14.2
3.8, -10.8
4.0, -3.9
4.2, 4.2
4.4, 10.9
4.6, 13.5
4.8, 11.2
5.0, 5.8`
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz_1',
    title: 'Challenge 1: Identify the Trajectory',
    formula: '-0.5 * x^2 + 8',
    rangeX: [-4, 4],
    questionText: 'Listen to the sonification sweep. Which of the following physical scenarios does this sound profile describe?',
    hint: 'Notice that pitch starts low on the left, reaches a single clear peak in the center, and falls back down.',
    options: [
      {
        id: 'opt_1a',
        label: 'A projectile launched into the air, reaching a peak apogee and falling back down (Inverted Parabola)',
        isCorrect: true,
        explanation: 'Correct! The pitch sweeps smoothly up to a maximum at x = 0, then symmetrically drops, which is the hallmark of a downward-opening parabola.'
      },
      {
        id: 'opt_1b',
        label: 'Exponential population growth exploding without bounds',
        isCorrect: false,
        explanation: 'Incorrect. Exponential growth would keep rising continuously to the highest pitch rather than turning and falling back down.'
      },
      {
        id: 'opt_1c',
        label: 'A recurring sine wave oscillating forever',
        isCorrect: false,
        explanation: 'Incorrect. There is only a single peak, not a repeating periodic oscillation.'
      }
    ]
  },
  {
    id: 'quiz_2',
    title: 'Challenge 2: Spot the Decay Trend',
    formula: 'e^(-0.4 * x) * sin(4 * x)',
    rangeX: [0, 8],
    questionText: 'Listen to this sound. How are the oscillations behaving as time progresses from left to right?',
    hint: 'Compare the pitch swings at the beginning (left ear) versus near the end (right ear).',
    options: [
      {
        id: 'opt_2a',
        label: 'The oscillations grow louder and wider (Resonance catastrophe)',
        isCorrect: false,
        explanation: 'Incorrect. The pitch fluctuations get tighter and die down, rather than expanding.'
      },
      {
        id: 'opt_2b',
        label: 'The oscillations steadily decrease in amplitude until settling near zero (Damped oscillation)',
        isCorrect: true,
        explanation: 'Correct! The high-low pitch swings start large and diminish smoothly, representing mechanical energy dissipation.'
      },
      {
        id: 'opt_2c',
        label: 'The frequency stays strictly flat at a single monotone pitch',
        isCorrect: false,
        explanation: 'Incorrect. The pitch rises and falls repeatedly.'
      }
    ]
  },
  {
    id: 'quiz_3',
    title: 'Challenge 3: Chemical Phase Transition',
    formula: '1 / (1 + e^(-4 * (x - 2)))',
    rangeX: [0, 4],
    questionText: 'Listen carefully to the pitch transition. What is happening in the middle of the sweep?',
    hint: 'Listen for a flat low plateau that suddenly leaps to a flat high plateau.',
    options: [
      {
        id: 'opt_3a',
        label: 'A steep S-curve (Sigmoid) jumping rapidly from an initial low baseline to a high plateau',
        isCorrect: true,
        explanation: 'Correct! This is a classic logistic / titration sigmoid curve with an inflection point at x = 2.'
      },
      {
        id: 'opt_3b',
        label: 'A U-shaped valley with a single minimum at the bottom',
        isCorrect: false,
        explanation: 'Incorrect. The curve never reverses direction; it is strictly monotonic increasing.'
      },
      {
        id: 'opt_3c',
        label: 'A straight 45-degree linear diagonal climb',
        isCorrect: false,
        explanation: 'Incorrect. The slope is nearly zero at the ends and very steep in the center, unlike a linear constant slope.'
      }
    ]
  }
];
