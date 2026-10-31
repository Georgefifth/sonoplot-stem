import React, { useState, useEffect, useCallback } from 'react';
import { CURRICULUM_PRESETS } from './curriculumData';
import { analyzeCurve, parseCSVData } from './math/analysis';
import { sonifier } from './audio/sonifier';
import { CurriculumPreset, SonificationOptions, CurveAnalysis } from './types';
import { AcousticGraphCanvas } from './components/AcousticGraphCanvas';
import { SonificationControls } from './components/SonificationControls';
import { PointInspector } from './components/PointInspector';
import { CurriculumPresets } from './components/CurriculumPresets';
import { FormulaInput } from './components/FormulaInput';
import { StructuralReport } from './components/StructuralReport';
import { TactileGridPanel } from './components/TactileGridPanel';
import { EarTrainingDrill } from './components/EarTrainingDrill';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export const App: React.FC = () => {
  // Preset & Analysis State
  const initialPreset = CURRICULUM_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [analysis, setAnalysis] = useState<CurveAnalysis>(() =>
    analyzeCurve(initialPreset.formula, initialPreset.rangeX, 150)
  );

  // Playback & Cursor State
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number | null>(null);
  const [options, setOptions] = useState<SonificationOptions>(sonifier.defaultOptions);

  // View Navigation State
  const [activeTab, setActiveTab] = useState<'explorer' | 'report' | 'tactile' | 'quiz'>('explorer');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>(
    'Welcome to SonoPlot STEM. Projectile Trajectory loaded. Press Space to hear the continuous sonification sweep, or use Left and Right arrows to scrub points.'
  );

  const activePoint = analysis.points[currentPointIndex] || analysis.points[0];

  // Helper to announce and play audio for a given point index
  const selectPoint = useCallback(
    (index: number, playAudio: boolean = true) => {
      if (index < 0 || index >= analysis.points.length) return;
      setCurrentPointIndex(index);

      const pt = analysis.points[index];
      if (!pt) return;

      if (playAudio) {
        sonifier.playDiscretePoint(
          pt,
          analysis.range[0],
          analysis.range[1],
          analysis.domain[0],
          analysis.domain[1],
          options
        );
      }

      // Build concise ARIA announcement
      let desc = `x is ${pt.x.toFixed(2)}, y is ${pt.y.toFixed(2)}. `;
      if (pt.isRoot) desc += 'Zero root crossing. ';
      if (pt.isLocalMax) desc += 'Local peak maximum. ';
      if (pt.isLocalMin) desc += 'Local valley minimum. ';
      if (pt.isYIntercept) desc += 'Y axis intercept. ';
      if (pt.slope !== undefined) {
        desc += Math.abs(pt.slope) < 0.05 ? 'Slope is flat. ' : pt.slope > 0 ? 'Slope is rising. ' : 'Slope is falling. ';
      }
      setAriaAnnouncement(desc);
    },
    [analysis, options]
  );

  // Play / Stop Sweep
  const togglePlaySweep = useCallback(async () => {
    if (isPlaying) {
      sonifier.stopSweep();
      setIsPlaying(false);
      setSweepProgress(null);
      setAriaAnnouncement('Audio sweep paused.');
    } else {
      setIsPlaying(true);
      setAriaAnnouncement(`Playing continuous audio sweep for ${analysis.formula} from left to right ear.`);
      await sonifier.playContinuousSweep(
        analysis.points,
        analysis.range[0],
        analysis.range[1],
        analysis.domain[0],
        analysis.domain[1],
        options,
        (idx) => {
          setCurrentPointIndex(idx);
          setSweepProgress(idx / (analysis.points.length - 1));
        },
        () => {
          setIsPlaying(false);
          setSweepProgress(null);
          setAriaAnnouncement('Continuous audio sweep complete.');
        }
      );
    }
  }, [isPlaying, analysis, options]);

  // Jump to next root
  const handleJumpToRoot = useCallback(() => {
    const nextRoots = analysis.roots.filter(r => r.index > currentPointIndex);
    const target = nextRoots.length > 0 ? nextRoots[0] : analysis.roots[0];
    if (target) {
      selectPoint(target.index);
    } else {
      setAriaAnnouncement('No real roots found on this curve.');
    }
  }, [analysis, currentPointIndex, selectPoint]);

  // Jump to next extrema
  const handleJumpToExtrema = useCallback(() => {
    const nextExtrema = analysis.extrema.filter(e => e.index > currentPointIndex);
    const target = nextExtrema.length > 0 ? nextExtrema[0] : analysis.extrema[0];
    if (target) {
      selectPoint(target.index);
    } else {
      setAriaAnnouncement('No local extrema found on this curve.');
    }
  }, [analysis, currentPointIndex, selectPoint]);

  // Switch Curriculum Preset
  const handleSelectPreset = (preset: CurriculumPreset) => {
    setSelectedPresetId(preset.id);
    sonifier.stopSweep();
    setIsPlaying(false);
    setSweepProgress(null);

    let newAnalysis: CurveAnalysis;
    if (preset.isCustomData && preset.csvData) {
      const parsedPoints = parseCSVData(preset.csvData);
      newAnalysis = analyzeCurve(parsedPoints);
    } else {
      newAnalysis = analyzeCurve(preset.formula, preset.rangeX, 150);
    }

    setAnalysis(newAnalysis);
    setCurrentPointIndex(0);
    setAriaAnnouncement(`Loaded preset: ${preset.title}. Formula: y = ${preset.formula}. ${newAnalysis.summaryText}`);
  };

  // Custom Formula input
  const handleApplyFormula = (formulaStr: string, domain: [number, number]) => {
    sonifier.stopSweep();
    setIsPlaying(false);
    setSweepProgress(null);
    setSelectedPresetId('custom');

    const newAnalysis = analyzeCurve(formulaStr, domain, 150);
    setAnalysis(newAnalysis);
    setCurrentPointIndex(0);
    setAriaAnnouncement(`Applied custom equation: y = ${formulaStr}. ${newAnalysis.summaryText}`);
  };

  // Custom CSV input
  const handleApplyCSV = (csvText: string) => {
    sonifier.stopSweep();
    setIsPlaying(false);
    setSweepProgress(null);
    setSelectedPresetId('custom_csv');

    const points = parseCSVData(csvText);
    const newAnalysis = analyzeCurve(points);
    setAnalysis(newAnalysis);
    setCurrentPointIndex(0);
    setAriaAnnouncement(`Parsed experimental lab data with ${points.length} coordinates. ${newAnalysis.summaryText}`);
  };

  // Jump by X coordinate from report table
  const handleJumpToX = (targetX: number) => {
    const closestIdx = analysis.points.reduce((prevIdx, curr, currIdx, arr) => {
      return Math.abs(curr.x - targetX) < Math.abs(arr[prevIdx].x - targetX) ? currIdx : prevIdx;
    }, 0);
    selectPoint(closestIdx);
    setActiveTab('explorer');
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        togglePlaySweep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        selectPoint(Math.max(0, currentPointIndex - step));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        selectPoint(Math.min(analysis.points.length - 1, currentPointIndex + step));
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectPoint(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        selectPoint(analysis.points.length - 1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleJumpToRoot();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleJumpToExtrema();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setOptions(prev => {
          const next = { ...prev, stereoPanning: !prev.stereoPanning };
          setAriaAnnouncement(`Binaural stereo panning ${next.stereoPanning ? 'enabled' : 'disabled'}.`);
          return next;
        });
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === '1') {
        setActiveTab('explorer');
      } else if (e.key === '2') {
        setActiveTab('report');
      } else if (e.key === '3') {
        setActiveTab('tactile');
      } else if (e.key === '4') {
        setActiveTab('quiz');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentPointIndex,
    analysis,
    togglePlaySweep,
    selectPoint,
    handleJumpToRoot,
    handleJumpToExtrema
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-[#F8FAFC]">
      {/* Header Bar */}
      <header className="border-b border-[#2A3854] bg-[#131B2B]/95 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-[#0B0F17] shadow-md">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#F8FAFC]">
                  SonoPlot <span className="text-[#F59E0B]">STEM</span>
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0B0F17] text-[#38BDF8] border border-[#2A3854]">
                  AccessED Hacks 2026
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Multimodal Auditory & Tactile Graph Explorer for Blind STEM Learners
              </p>
            </div>
          </div>

          {/* Quick Shortcuts Trigger & Compliance Badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C263B] hover:bg-[#2A3854] text-xs text-[#E2E8F0] border border-[#334155] transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              aria-label="Open Keyboard Shortcuts Guide (Shortcut: ?)"
            >
              <kbd className="px-1.5 py-0.5 bg-[#0B0F17] rounded text-[11px] font-mono text-[#F59E0B] font-bold">?</kbd>
              <span>Keyboard Cheatsheet</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#10B981] bg-[#064E3B]/40 px-2.5 py-1 rounded-full border border-[#047857]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              WCAG 2.2 AAA
            </span>
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto border-t border-[#2A3854]/60">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'explorer'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1C263B]/50'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
            aria-current={activeTab === 'explorer' ? 'page' : undefined}
          >
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">1</span>
            <span>Curve Sonifier & Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'report'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1C263B]/50'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
            aria-current={activeTab === 'report' ? 'page' : undefined}
          >
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">2</span>
            <span>Calculus Feature Report</span>
          </button>

          <button
            onClick={() => setActiveTab('tactile')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'tactile'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1C263B]/50'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
            aria-current={activeTab === 'tactile' ? 'page' : undefined}
          >
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">3</span>
            <span>BANA Tactile Braille Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'quiz'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1C263B]/50'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
            aria-current={activeTab === 'quiz' ? 'page' : undefined}
          >
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">4</span>
            <span>Acoustic Ear-Training Lab</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* TAB 1: CURVE SONIFIER & EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="flex flex-col gap-5">
            {/* Curriculum Presets Ribbon */}
            <CurriculumPresets
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
            />

            {/* Custom Formula & Domain Bar */}
            <FormulaInput
              currentFormula={analysis.formula}
              domain={analysis.domain}
              onApplyFormula={handleApplyFormula}
              onApplyCSVData={handleApplyCSV}
            />

            {/* Oscilloscope Canvas & Point Indicator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Canvas Area */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <AcousticGraphCanvas
                  analysis={analysis}
                  currentPointIndex={currentPointIndex}
                  sweepProgress={sweepProgress}
                  onPointSelect={(idx) => selectPoint(idx)}
                />

                {/* Primary Sonification Audio Controls */}
                <SonificationControls
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlaySweep}
                  onStepLeft={() => selectPoint(Math.max(0, currentPointIndex - 1))}
                  onStepRight={() => selectPoint(Math.min(analysis.points.length - 1, currentPointIndex + 1))}
                  onJumpToRoot={handleJumpToRoot}
                  onJumpToExtrema={handleJumpToExtrema}
                  options={options}
                  onOptionsChange={setOptions}
                />
              </div>

              {/* Point Inspector & ARIA Transcript Column */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <PointInspector
                  point={activePoint}
                  totalPoints={analysis.points.length}
                  yMin={analysis.range[0]}
                  yMax={analysis.range[1]}
                  xMin={analysis.domain[0]}
                  xMax={analysis.domain[1]}
                  options={options}
                  ariaAnnouncement={ariaAnnouncement}
                />

                {/* Educational Before-and-After Context Card */}
                <div className="p-4 rounded-lg bg-[#131B2B] border border-[#2A3854] text-xs flex flex-col gap-2">
                  <span className="font-bold text-[#F59E0B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How To Experience the Barrier Removal
                  </span>
                  <div className="space-y-1.5 text-[#94A3B8] leading-relaxed">
                    <p>
                      <strong className="text-[#F8FAFC]">1. Continuous Gestalt:</strong> Press <kbd className="px-1 bg-[#0B0F17] rounded text-[#38BDF8]">Space</kbd>. Listen to the sound pan from your left ear (min x) to right ear (max x). Notice the pitch climbing to the peak.
                    </p>
                    <p>
                      <strong className="text-[#F8FAFC]">2. Discrete Step Inspection:</strong> Tap <kbd className="px-1 bg-[#0B0F17] rounded text-[#38BDF8]">←</kbd> and <kbd className="px-1 bg-[#0B0F17] rounded text-[#38BDF8]">→</kbd> to step along each coordinate. Notice the bell chime earcon when crossing zero.
                    </p>
                    <p>
                      <strong className="text-[#F8FAFC]">3. Tactile & Analysis:</strong> Switch to Tab 2 and Tab 3 for full calculus feature tables and printable BANA Braille tactile sheets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CALCULUS FEATURE REPORT */}
        {activeTab === 'report' && (
          <StructuralReport
            analysis={analysis}
            onJumpToPoint={handleJumpToX}
          />
        )}

        {/* TAB 3: TACTILE BRAILLE GRID */}
        {activeTab === 'tactile' && (
          <TactileGridPanel
            analysis={analysis}
          />
        )}

        {/* TAB 4: ACOUSTIC EAR-TRAINING LAB */}
        {activeTab === 'quiz' && (
          <EarTrainingDrill />
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-[#2A3854] bg-[#0B0F17] py-6 px-4 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            SonoPlot STEM — Created for <strong>AccessED Hacks 2026</strong>. Dedicated to opening doors in STEM for blind and visually impaired learners.
          </p>
          <div className="flex items-center gap-4 text-[#94A3B8]">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:underline text-xs"
            >
              Shortcuts Guide
            </button>
            <span>•</span>
            <span>Client-Side Web Audio (100% Privacy)</span>
            <span>•</span>
            <span>WCAG 2.2 AAA Compliant</span>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
