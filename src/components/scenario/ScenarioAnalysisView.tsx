import React, { useState } from 'react';
import { InfrastructureProject, ScenarioInput } from '../../types';
import { MLEngine } from '../../utils/mlEngine';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Sliders, 
  Building2, 
  Sparkles, 
  RotateCcw, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ScenarioAnalysisViewProps {
  projects: InfrastructureProject[];
  selectedProjectId?: string;
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const ScenarioAnalysisView: React.FC<ScenarioAnalysisViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || 'PRJ-TRN-001'
  );

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Default scenario settings
  const defaultScenario: ScenarioInput = {
    monthlyExpenditureDeltaPercent: 0,
    physicalProgressPaceDeltaPercent: 25,
    completionExtensionMonths: 0,
    resourceAvailabilityPercent: 120,
    fastTrackClearance: true,
    contractorReallocation: false,
  };

  const [scenario, setScenario] = useState<ScenarioInput>(defaultScenario);

  const simResult = MLEngine.runScenarioSimulation(selectedProject, scenario);

  const handleReset = () => {
    setScenario({
      monthlyExpenditureDeltaPercent: 0,
      physicalProgressPaceDeltaPercent: 0,
      completionExtensionMonths: 0,
      resourceAvailabilityPercent: 100,
      fastTrackClearance: false,
      contractorReallocation: false,
    });
  };

  const comparisonData = [
    {
      metric: 'Cost Overrun Risk (%)',
      Current: selectedProject.costOverrunProbability,
      Simulated: simResult.simulatedCostRisk,
    },
    {
      metric: 'Delay Risk (%)',
      Current: selectedProject.delayProbability,
      Simulated: simResult.simulatedDelayRisk,
    },
    {
      metric: 'Overall Risk Score',
      Current: selectedProject.overallRiskScore,
      Simulated: simResult.simulatedOverallRisk,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Project Selector Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Interactive Policy Sandbox
            </span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Decision-Support Simulation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            What-If Scenario Simulation & Risk Sensitivity
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Test policy interventions, contractor capacity injections, and fast-track statutory clearances to forecast risk reduction.
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
                [{p.projectCode}] {p.name.length > 38 ? p.name.substring(0, 38) + '...' : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sandbox Grid: Sliders on Left, Live Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Simulation Sliders */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Policy Scenario Controls</h3>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: Progress Pace Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Physical Progress Pace Delta</label>
              <span className="font-mono font-bold text-blue-600">
                {scenario.physicalProgressPaceDeltaPercent > 0 ? `+${scenario.physicalProgressPaceDeltaPercent}%` : `${scenario.physicalProgressPaceDeltaPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={scenario.physicalProgressPaceDeltaPercent}
              onChange={(e) => setScenario({ ...scenario, physicalProgressPaceDeltaPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Lagging)</span>
              <span>0% (Baseline)</span>
              <span>+100% (Doubled)</span>
            </div>
          </div>

          {/* Slider 2: Monthly Expenditure Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Monthly Expenditure Delta</label>
              <span className="font-mono font-bold text-indigo-600">
                {scenario.monthlyExpenditureDeltaPercent > 0 ? `+${scenario.monthlyExpenditureDeltaPercent}%` : `${scenario.monthlyExpenditureDeltaPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={scenario.monthlyExpenditureDeltaPercent}
              onChange={(e) => setScenario({ ...scenario, monthlyExpenditureDeltaPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Constrained)</span>
              <span>0% (Baseline)</span>
              <span>+100% (Capital Surge)</span>
            </div>
          </div>

          {/* Slider 3: Resource Availability */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Machinery & Crew Capacity</label>
              <span className="font-mono font-bold text-emerald-600">
                {scenario.resourceAvailabilityPercent}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={scenario.resourceAvailabilityPercent}
              onChange={(e) => setScenario({ ...scenario, resourceAvailabilityPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50% (Shortage)</span>
              <span>100% (Standard)</span>
              <span>200% (Double Shift)</span>
            </div>
          </div>

          {/* Slider 4: Extension Months */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Schedule Extension Buffer</label>
              <span className="font-mono font-bold text-amber-600">
                +{scenario.completionExtensionMonths} months
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="2"
              value={scenario.completionExtensionMonths}
              onChange={(e) => setScenario({ ...scenario, completionExtensionMonths: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 mo</span>
              <span>12 mo</span>
              <span>24 mo</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">Single-Window Fast-Track Clearance</span>
                <span className="text-[11px] text-slate-500 block">Immediate resolution of forest & utility ROW</span>
              </div>
              <input
                type="checkbox"
                checked={scenario.fastTrackClearance}
                onChange={(e) => setScenario({ ...scenario, fastTrackClearance: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">EPC Contractor Re-allocation / Subletting</span>
                <span className="text-[11px] text-slate-500 block">Inject secondary executing agencies for lagging packages</span>
              </div>
              <input
                type="checkbox"
                checked={scenario.contractorReallocation}
                onChange={(e) => setScenario({ ...scenario, contractorReallocation: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Live Recalculated Before vs After Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Score Comparison Cards */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Simulation Output</span>
                <h3 className="text-lg font-bold text-white">Before vs After Risk Shift</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Risk Score:</span>
                <span className="font-mono text-xl font-bold text-slate-300">
                  {selectedProject.overallRiskScore}
                </span>
                <span className="text-amber-400">→</span>
                <span className={`font-mono text-2xl font-bold ${
                  simResult.simulatedOverallRisk < selectedProject.overallRiskScore 
                    ? 'text-emerald-400' 
                    : 'text-rose-400'
                }`}>
                  {simResult.simulatedOverallRisk}
                </span>
              </div>
            </div>

            {/* Before vs After Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Cost Overrun Risk */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Cost Overrun Risk</span>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-slate-400 text-sm">{selectedProject.costOverrunProbability}%</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-lg font-bold text-emerald-400">{simResult.simulatedCostRisk}%</span>
                </div>
              </div>

              {/* Delay Risk */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Delay Probability</span>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-slate-400 text-sm">{selectedProject.delayProbability}%</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-lg font-bold text-emerald-400">{simResult.simulatedDelayRisk}%</span>
                </div>
              </div>

              {/* Projected Completion */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Est Completion Date</span>
                <div className="text-xs font-mono font-bold text-amber-300 mt-1 truncate">
                  {simResult.simulatedCompletionDate}
                </div>
              </div>

              {/* Revised Budget */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Simulated Final Cost</span>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  ₹{simResult.simulatedRevisedCost.toLocaleString()} Cr
                </div>
              </div>
            </div>

            {/* Delta Highlights */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {simResult.riskReductionSummary}
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Bar Visual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Before vs After Probability Comparison</h4>
            <p className="text-xs text-slate-500 mb-4">Visualizing risk reduction impact across key predictive indices</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Current" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
