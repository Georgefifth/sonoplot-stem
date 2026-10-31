import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../curriculumData';
import { analyzeCurve } from '../math/analysis';
import { sonifier } from '../audio/sonifier';

export const EarTrainingDrill: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlayingMystery, setIsPlayingMystery] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;

  const handlePlayMysterySound = async () => {
    setIsPlayingMystery(true);
    const analysis = analyzeCurve(currentQ.formula, currentQ.rangeX, 100);
    await sonifier.playContinuousSweep(
      analysis.points,
      analysis.range[0],
      analysis.range[1],
      analysis.domain[0],
      analysis.domain[1],
      {
        ...sonifier.defaultOptions,
        sweepDuration: 3.0
      },
      undefined,
      () => {
        setIsPlayingMystery(false);
      }
    );
  };

  const handleSelectOption = (optId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);

    const chosen = currentQ.options.find(o => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      setScore(prev => prev + 1);
      sonifier.playEarcon('root'); // cheerful bell
    } else {
      sonifier.playEarcon('asymptote'); // low buzz
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setShowHint(false);
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // restart
      setCurrentQuestionIndex(0);
      setScore(0);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-[#131B2B] rounded-lg border border-[#2A3854]">
      {/* Header and Score Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3854]/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Acoustic Ear-Training Lab (Hearing Math Shapes)
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Train your auditory perception to identify mathematical inflection points, curves, and trends by ear.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#94A3B8]">
            Question <strong className="text-[#F8FAFC]">{currentQuestionIndex + 1}</strong> of {QUIZ_QUESTIONS.length}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1C263B] text-[#10B981] border border-[#047857]">
            Score: {score} / {QUIZ_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Mystery Sound Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#0B0F17] border border-[#2A3854]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#F59E0B] font-bold block mb-1">Step 1: Listen to the Secret Curve</span>
          <p className="text-sm text-[#F8FAFC] font-medium">{currentQ.questionText}</p>
        </div>

        <button
          onClick={handlePlayMysterySound}
          disabled={isPlayingMystery}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shrink-0 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
            isPlayingMystery
              ? 'bg-[#1C263B] text-[#94A3B8] cursor-not-allowed'
              : 'bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B0F17]'
          }`}
          aria-label="Play Mystery Sound Sweep"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          <span>{isPlayingMystery ? 'Playing Audio...' : 'Play Mystery Sound'}</span>
        </button>
      </div>

      {/* Multiple Choice Options */}
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Answer options">
        <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-semibold">
          Step 2: Choose the Matching Model
        </span>

        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let borderStyle = 'border-[#2A3854] bg-[#0B0F17] hover:bg-[#141C2C]';

          if (hasSubmitted) {
            if (opt.isCorrect) {
              borderStyle = 'border-[#10B981] bg-[#064E3B]/40 text-[#A7F3D0]';
            } else if (isSelected && !opt.isCorrect) {
              borderStyle = 'border-[#EF4444] bg-[#450A0A]/40 text-[#FECACA]';
            }
          } else if (isSelected) {
            borderStyle = 'border-[#06B6D4] bg-[#164E63]/30 text-[#F8FAFC] ring-1 ring-[#06B6D4]';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={hasSubmitted}
              role="radio"
              aria-checked={isSelected}
              className={`flex items-start text-left p-3.5 rounded-lg border transition text-sm focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${borderStyle}`}
            >
              <span className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 mr-3 flex items-center justify-center ${
                isSelected ? 'border-[#06B6D4] bg-[#06B6D4]' : 'border-[#475569]'
              }`}>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0B0F17]" />}
              </span>
              <div className="flex flex-col">
                <span className="font-medium">{opt.label}</span>
                {hasSubmitted && (
                  <span className={`text-xs mt-1.5 leading-relaxed ${opt.isCorrect ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                    {opt.explanation}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint and Submission Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2A3854]/60">
        <div>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-[#38BDF8] hover:underline"
            >
              Need a hint?
            </button>
          ) : (
            <p className="text-xs text-[#94A3B8] italic bg-[#0B0F17] p-2 rounded border border-[#2A3854]">
              Hint: {currentQ.hint}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOptionId}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
                selectedOptionId
                  ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17]'
                  : 'bg-[#1C263B] text-[#64748B] cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#10B981] hover:bg-[#059669] text-white transition focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
            >
              {isLastQuestion ? 'Restart Ear-Training Quiz' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
