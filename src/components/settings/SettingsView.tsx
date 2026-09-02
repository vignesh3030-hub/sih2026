import React, { useState } from 'react';
import { Settings, ShieldCheck, Sliders, Database, Server, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [highThreshold, setHighThreshold] = useState(60);
  const [mediumThreshold, setMediumThreshold] = useState(35);
  const [divergenceTolerance, setDivergenceTolerance] = useState(10);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            System Administration
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Configuration & Calibration
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Tune early-warning risk threshold sensitivities, ML model endpoints, and dataset parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform risk calibration and model settings saved successfully.</span>
        </div>
      )}

      {/* 1. Risk Threshold Calibration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Early Warning Trigger Thresholds</h3>
            <p className="text-xs text-slate-500">Numerical indices for automated alert classification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-rose-700">Critical Risk Trigger Score (🔴)</label>
              <span className="font-mono font-bold text-slate-900">≥ {criticalThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-amber-700">High Risk Trigger Score (🟠)</label>
              <span className="font-mono font-bold text-slate-900">≥ {highThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="75"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-yellow-700">Medium Risk Trigger Score (🟡)</label>
              <span className="font-mono font-bold text-slate-900">≥ {mediumThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="20"
              max="45"
              value={mediumThreshold}
              onChange={(e) => setMediumThreshold(Number(e.target.value))}
              className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Progress-Burn Divergence Tolerance</label>
              <span className="font-mono font-bold text-slate-900">&gt; {divergenceTolerance}% gap</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={divergenceTolerance}
              onChange={(e) => setDivergenceTolerance(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 2. AI Model Selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Server className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Intelligence Core Engine</h3>
            <p className="text-xs text-slate-500">Google Gemini LLM configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['gemini-3.7-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'].map((m) => (
            <label
              key={m}
              className={`p-3.5 rounded-xl border cursor-pointer text-xs font-semibold flex flex-col justify-between ${
                selectedModel === m
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold">{m}</span>
                <input
                  type="radio"
                  name="model"
                  value={m}
                  checked={selectedModel === m}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-indigo-600"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-2">
                {m === 'gemini-3.7-flash' ? 'Recommended (Ultra-fast inference)' : 'Deep reasoning model'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Synthetic Project Dataset</span>
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};
