import React, { useState } from 'react';
import { InfrastructureProject } from '../../types';
import { MLEngine } from '../../utils/mlEngine';
import { RiskBadge } from '../common/RiskBadge';
import { RiskGauge } from '../common/RiskGauge';
import { 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Sparkles,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PredictiveAnalyticsViewProps {
  projects: InfrastructureProject[];
  selectedProjectId?: string;
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const PredictiveAnalyticsView: React.FC<PredictiveAnalyticsViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || 'PRJ-TRN-001'
  );

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Run ML Predictions
  const costPrediction = MLEngine.predictCostOverrun(selectedProject);
  const delayPrediction = MLEngine.predictDelayOverrun(selectedProject);

  // Generate S-Curve Data for Forecasting
  const sCurveData = (selectedProject.monthlyProgressHistory || []).map(h => ({
    month: h.month,
    'Planned Physical (%)': h.plannedPhysical,
    'Actual Physical (%)': h.actualPhysical,
    'Financial Burn (%)': h.actualFinancial,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* View Header & Project Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Predictive ML Core Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Gradient Boosted Regressors + S-Curve Extrapolation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Predictive Analytics & Cost/Schedule Overrun Lab
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Statistical regression models analyzing physical progress deficits, financial burn divergence, and regulatory latency.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 max-w-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.projectCode}] {p.name.length > 36 ? p.name.substring(0, 36) + '...' : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Project Highlight Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded">
              {selectedProject.projectCode}
            </span>
            <RiskBadge level={selectedProject.riskLevel} size="sm" />
            <span className="text-xs text-slate-400">{selectedProject.sector}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-100">{selectedProject.name}</h3>
          <p className="text-xs text-slate-400">
            Nodal Ministry: {selectedProject.ministry} • Executing Agency: {selectedProject.implementingAgency}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Overall AI Risk Index</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {selectedProject.overallRiskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </span>
          </div>
          <button
            onClick={() => onSelectProject(selectedProject)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Full Diagnosis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Predictive Models Grid: 1. Cost Overrun Model, 2. Schedule Delay Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MODEL 1: Cost Overrun Prediction Model */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cost Overrun Forecast Model</h3>
                <span className="text-[11px] text-slate-500 font-mono">Algorithm: Gradient Boosted Cost Elasticity</span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
              Confidence: 94.2%
            </span>
          </div>

          {/* Model Numerical Output Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Cost Overrun Probability</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className={`text-2xl font-bold ${costPrediction.probability > 70 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {costPrediction.probability}%
                </span>
                <span className="text-xs text-slate-400">risk probability</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Expected Cost Overrun</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-2xl font-bold text-rose-700">
                  +{costPrediction.expectedOverrunPercent}%
                </span>
                <span className="text-xs text-slate-400">(+₹{costPrediction.expectedCostOverrunAmount} Cr)</span>
              </div>
            </div>
          </div>

          {/* Projected Final Cost Comparison */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Sanctioned Original Cost</span>
              <span className="text-base font-bold text-slate-200">₹{selectedProject.originalCost.toLocaleString()} Cr</span>
            </div>
            <span className="text-slate-600 text-lg">→</span>
            <div>
              <span className="text-amber-400 block text-[11px]">ML Predicted Revised Cost</span>
              <span className="text-base font-bold text-amber-300">₹{costPrediction.expectedRevisedCost.toLocaleString()} Cr</span>
            </div>
          </div>

          {/* Model Feature Explanations / Drivers */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Key Cost Inflation Drivers (SHAP Importance):</span>
            </span>
            <div className="space-y-1.5">
              {costPrediction.drivers.map((driver, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODEL 2: Schedule Delay Overrun Model */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Time / Schedule Slippage Forecast</h3>
                <span className="text-[11px] text-slate-500 font-mono">Algorithm: S-Curve Velocity Decay Regressor</span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
              Confidence: 91.8%
            </span>
          </div>

          {/* Numerical Delay Outputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Delay Overrun Probability</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className={`text-2xl font-bold ${delayPrediction.delayProbability > 70 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {delayPrediction.delayProbability}%
                </span>
                <span className="text-xs text-slate-400">probability</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Predicted Delay Duration</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-2xl font-bold text-amber-600">
                  +{delayPrediction.expectedDelayMonths}
                </span>
                <span className="text-xs text-slate-400">months</span>
              </div>
            </div>
          </div>

          {/* Date Trajectory Pill */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Original Sanctioned Date</span>
              <span className="text-base font-bold text-slate-200">{selectedProject.originalCompletionDate}</span>
            </div>
            <span className="text-slate-600 text-lg">→</span>
            <div>
              <span className="text-amber-400 block text-[11px]">Predicted Completion Date</span>
              <span className="text-base font-bold text-amber-300">{delayPrediction.expectedCompletionDate}</span>
            </div>
          </div>

          {/* Delay Drivers */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Primary Schedule Bottleneck Factors:</span>
            </span>
            <div className="space-y-1.5">
              {delayPrediction.drivers.map((driver, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* S-Curve Progress vs Burn Trajectory Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Project S-Curve: Physical Target vs Actual vs Financial Burn
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing trajectory deviation between planned schedule, actual physical execution, and capital expenditure
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Planned Target
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Actual Physical
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-bold">
              <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Financial Burn
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFinancial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Area type="monotone" dataKey="Planned Physical (%)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" />
              <Area type="monotone" dataKey="Actual Physical (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="Financial Burn (%)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorFinancial)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
