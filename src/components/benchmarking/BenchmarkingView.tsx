import React, { useState } from 'react';
import { InfrastructureProject, BenchmarkComparison } from '../../types';
import { MLEngine } from '../../utils/mlEngine';
import { RiskBadge } from '../common/RiskBadge';
import { 
  BarChart2, 
  Building2, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ArrowRight,
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface BenchmarkingViewProps {
  projects: InfrastructureProject[];
  selectedProjectId?: string;
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || 'PRJ-TRN-001'
  );

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Perform cohort benchmarking
  const benchmarkComparisons = MLEngine.benchmarkProject(selectedProject, projects);

  // Calculate sector cohort averages
  const sectorCohort = projects.filter(p => p.sector === selectedProject.sector);
  const avgCostOverrun = sectorCohort.reduce((acc, p) => acc + p.costOverrunPercent, 0) / sectorCohort.length;
  const avgDelayMonths = sectorCohort.reduce((acc, p) => acc + p.delayMonths, 0) / sectorCohort.length;
  const avgRiskScore = sectorCohort.reduce((acc, p) => acc + p.overallRiskScore, 0) / sectorCohort.length;

  // Radar comparative data
  const radarData = [
    { metric: 'Cost Overrun %', project: selectedProject.costOverrunPercent, cohortAvg: Math.round(avgCostOverrun) },
    { metric: 'Delay (Months)', project: selectedProject.delayMonths, cohortAvg: Math.round(avgDelayMonths) },
    { metric: 'Physical Progress %', project: selectedProject.physicalProgress, cohortAvg: 65 },
    { metric: 'Financial Burn %', project: selectedProject.financialProgress, cohortAvg: 60 },
    { metric: 'Risk Score / 100', project: selectedProject.overallRiskScore, cohortAvg: Math.round(avgRiskScore) },
  ];

  // Bar comparison data
  const comparisonBarData = [
    {
      name: 'Cost Overrun %',
      Project: selectedProject.costOverrunPercent,
      'Sector Average': Number(avgCostOverrun.toFixed(1)),
    },
    {
      name: 'Delay (Months)',
      Project: selectedProject.delayMonths,
      'Sector Average': Number(avgDelayMonths.toFixed(1)),
    },
    {
      name: 'Risk Score (0-100)',
      Project: selectedProject.overallRiskScore,
      'Sector Average': Number(avgRiskScore.toFixed(0)),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Project Selector Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Sector Cohort Benchmarking
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Comparing against {sectorCohort.length} projects in {selectedProject.sector}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Benchmarking & Peer Variance Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare project performance against similar projects in the same ministry and sector to isolate project-specific inefficiencies from macro trends.
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
            Ministry: {selectedProject.ministry} • Executing Agency: {selectedProject.implementingAgency}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Sector Cohort Mean Risk</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {avgRiskScore.toFixed(0)} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </span>
          </div>
          <button
            onClick={() => onSelectProject(selectedProject)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Diagnose Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Benchmarking Comparison Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benchmarkComparisons.map((item, idx) => {
          const isBetter = item.status === 'Better';
          const isWorse = item.status === 'Worse';

          return (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">{item.metric}</span>
              <div className="text-xl font-bold font-mono text-slate-900">
                {item.projectValue}
              </div>
              <div className="text-[11px] text-slate-500">
                Sector Cohort Avg: <strong className="text-slate-800">{item.benchmarkAverage}</strong>
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                isBetter
                  ? 'bg-emerald-100 text-emerald-800'
                  : isWorse
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {item.differenceText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts Grid: Radar & Grouped Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Radar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Multi-Dimensional Sector Cohort Radar</h3>
            <p className="text-xs text-slate-500">Comparing project index vs sector cohort mean</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="This Project" dataKey="project" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.4} />
                <Radar name="Sector Benchmark" dataKey="cohortAvg" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grouped Bar Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Direct Metric Comparison vs Sector Average</h3>
            <p className="text-xs text-slate-500">Side-by-side performance variance</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Project" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sector Average" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
