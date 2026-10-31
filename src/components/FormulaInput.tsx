import React, { useState } from 'react';
import { validateFormula } from '../math/analysis';

interface FormulaInputProps {
  currentFormula: string;
  domain: [number, number];
  onApplyFormula: (formula: string, domain: [number, number]) => void;
  onApplyCSVData: (csvText: string) => void;
}

export const FormulaInput: React.FC<FormulaInputProps> = ({
  currentFormula,
  domain,
  onApplyFormula,
  onApplyCSVData
}) => {
  const [formula, setFormula] = useState(currentFormula);
  const [xMin, setXMin] = useState(domain[0].toString());
  const [xMax, setXMax] = useState(domain[1].toString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCSVMode, setIsCSVMode] = useState(false);
  const [csvText, setCsvText] = useState(
    '# Time(s), Velocity(m/s)\n0.0, 0.0\n0.5, 4.9\n1.0, 9.8\n1.5, 14.7\n2.0, 19.6\n2.5, 24.5\n3.0, 22.1\n3.5, 17.2\n4.0, 10.5\n4.5, 2.1\n5.0, -8.4'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCSVMode) {
      if (!csvText.trim()) {
        setErrorMsg('CSV dataset cannot be empty.');
        return;
      }
      setErrorMsg(null);
      onApplyCSVData(csvText);
      return;
    }

    const valError = validateFormula(formula);
    if (valError) {
      setErrorMsg(valError);
      return;
    }

    const minNum = parseFloat(xMin);
    const maxNum = parseFloat(xMax);
    if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) {
      setErrorMsg('Invalid domain range: Minimum X must be strictly less than Maximum X.');
      return;
    }

    setErrorMsg(null);
    onApplyFormula(formula, [minNum, maxNum]);
  };

  return (
    <div className="bg-[#131B2B] rounded-lg border border-[#2A3854] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#2A3854]/60 pb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
          Equation & Data Source
        </h3>

        {/* Toggle between Formula and CSV dataset */}
        <div className="flex rounded-lg overflow-hidden border border-[#2A3854] text-xs">
          <button
            type="button"
            onClick={() => { setIsCSVMode(false); setErrorMsg(null); }}
            className={`px-3 py-1.5 font-medium transition ${
              !isCSVMode ? 'bg-[#F59E0B] text-[#0B0F17]' : 'bg-[#1C263B] text-[#94A3B8] hover:text-white'
            }`}
          >
            Math Formula f(x)
          </button>
          <button
            type="button"
            onClick={() => { setIsCSVMode(true); setErrorMsg(null); }}
            className={`px-3 py-1.5 font-medium transition ${
              isCSVMode ? 'bg-[#F59E0B] text-[#0B0F17]' : 'bg-[#1C263B] text-[#94A3B8] hover:text-white'
            }`}
          >
            Science CSV Data
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {!isCSVMode ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Equation Input */}
            <div className="md:col-span-7 flex flex-col gap-1">
              <label htmlFor="formula-field" className="text-xs text-[#94A3B8] font-medium">
                Function Expression y = f(x):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-[#F59E0B] font-bold">y =</span>
                <input
                  id="formula-field"
                  type="text"
                  value={formula}
                  onChange={(e) => {
                    setFormula(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="-0.5*x^2 + 2*x + 6"
                  className="w-full bg-[#0B0F17] text-[#F8FAFC] font-mono text-sm pl-11 pr-3 py-2 rounded border border-[#2A3854] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
                  aria-describedby={errorMsg ? 'formula-error' : undefined}
                />
              </div>
            </div>

            {/* Domain X Min */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label htmlFor="xmin-field" className="text-xs text-[#94A3B8] font-medium">
                X Min:
              </label>
              <input
                id="xmin-field"
                type="number"
                step="any"
                value={xMin}
                onChange={(e) => setXMin(e.target.value)}
                className="w-full bg-[#0B0F17] text-[#F8FAFC] font-mono text-sm px-3 py-2 rounded border border-[#2A3854] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>

            {/* Domain X Max */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label htmlFor="xmax-field" className="text-xs text-[#94A3B8] font-medium">
                X Max:
              </label>
              <input
                id="xmax-field"
                type="number"
                step="any"
                value={xMax}
                onChange={(e) => setXMax(e.target.value)}
                className="w-full bg-[#0B0F17] text-[#F8FAFC] font-mono text-sm px-3 py-2 rounded border border-[#2A3854] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full py-2 px-3 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B0F17] font-semibold text-sm rounded transition focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
                aria-label="Analyze and Sonify Formula"
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="csv-textarea" className="text-xs text-[#94A3B8] font-medium">
              Paste Two-Column Experimental Data (x, y per line):
            </label>
            <textarea
              id="csv-textarea"
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-[#0B0F17] text-[#F8FAFC] font-mono text-xs p-2.5 rounded border border-[#2A3854] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              placeholder="0.0, 10.5&#10;1.0, 15.2&#10;2.0, 8.4"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B0F17] font-semibold text-sm rounded transition focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
              >
                Parse & Sonify Dataset
              </button>
            </div>
          </div>
        )}

        {/* Error Feedback Alert */}
        {errorMsg && (
          <div
            id="formula-error"
            role="alert"
            className="flex items-center gap-2 p-2.5 rounded bg-[#450A0A] border border-[#991B1B] text-[#FECACA] text-xs font-medium"
          >
            <svg className="w-4 h-4 shrink-0 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
