import React, { useState } from 'react';
import { InfrastructureProject } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { RiskGauge } from '../common/RiskGauge';
import { MLEngine } from '../../utils/mlEngine';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Sliders, 
  Scale, 
  ShieldAlert,
  FileText,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface ProjectDetailModalProps {
  project: InfrastructureProject | null;
  onClose: () => void;
  onNavigateToModule?: (view: string, projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'xai' | 'milestones' | 's-curve'>('overview');

  if (!project) return null;

  const costDelta = project.revisedCost - project.originalCost;
  const isDivergent = project.financialProgress - project.physicalProgress > 10;

  // Chart data for Explainable AI (Top contributing factors)
  const xaiChartData = project.topContributingFactors.map(f => ({
    name: f.factor,
    contribution: f.contribution,
    category: f.category
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {project.projectCode}
              </span>
              <RiskBadge level={project.riskLevel} size="md" />
              <span className="text-xs text-slate-400 font-mono">
                Last MoSPI Sync: {project.lastReviewDate}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {project.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {project.ministry}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">{project.sector}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.state} ({project.district})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Project Overview & Financials
          </button>

          <button
            onClick={() => setActiveTab('xai')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'xai'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Risk Explanation (XAI)</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'milestones'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Milestone Readiness ({project.milestones.length})
          </button>

          <button
            onClick={() => setActiveTab('s-curve')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 's-curve'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            S-Curve Progress Velocity
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* TAB 1: OVERVIEW & AI GAUGES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Risk Scorecards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                {/* Visual Gauge */}
                <div className="flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-4">
                  <RiskGauge score={project.overallRiskScore} size={170} label="AI Overall Risk Index" />
                </div>

                {/* Overrun Probability */}
                <div className="flex flex-col justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                  <div className="text-slate-500 text-xs font-semibold uppercase flex items-center justify-between">
                    <span>Cost Overrun Prob</span>
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-rose-700 mt-2">
                    {project.costOverrunProbability}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Expected drift: +{project.costOverrunPercent}% (+₹{costDelta} Cr)
                  </p>
                </div>

                {/* Delay Probability */}
                <div className="flex flex-col justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                  <div className="text-slate-500 text-xs font-semibold uppercase flex items-center justify-between">
                    <span>Schedule Delay Prob</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-amber-700 mt-2">
                    {project.delayProbability}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Slippage: +{project.delayMonths} months duration
                  </p>
                </div>

                {/* Implementation Risk */}
                <div className="flex flex-col justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                  <div className="text-slate-500 text-xs font-semibold uppercase flex items-center justify-between">
                    <span>Execution Bottleneck</span>
                    <Activity className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-indigo-700 mt-2">
                    {project.implementationRisk}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Contractor: {project.contractorRiskRating}
                  </p>
                </div>
              </div>

              {/* Core Project Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Financial Overview Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cost & Expenditure Details</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Approved Cost:</span>
                      <span className="font-mono font-bold text-slate-900">₹{project.originalCost.toLocaleString()} Cr</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Revised Cost:</span>
                      <span className="font-mono font-bold text-rose-700">₹{project.revisedCost.toLocaleString()} Cr</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Total Expenditure:</span>
                      <span className="font-mono font-bold text-slate-900">₹{project.expenditure.toLocaleString()} Cr</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Financial Progress:</span>
                      <span className="font-mono font-bold text-slate-900">{project.financialProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Timeline & Schedule Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Timeline & Completion</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Sanction / Start Date:</span>
                      <span className="font-mono font-medium text-slate-900">{project.startDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Original Completion:</span>
                      <span className="font-mono font-medium text-slate-900">{project.originalCompletionDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Expected Completion:</span>
                      <span className="font-mono font-bold text-rose-700">{project.expectedCompletionDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Physical Progress:</span>
                      <span className="font-mono font-bold text-emerald-700">{project.physicalProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Governance & Agency Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 md:col-span-2 lg:col-span-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Executing Entity & Status</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Implementing Agency:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[160px]">{project.implementingAgency}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Lead Contractor:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[160px]">{project.contractorName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Land Possession:</span>
                      <span className="font-mono font-semibold text-slate-900">{project.landAcquiredPercent}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Forest Clearance:</span>
                      <span className="font-semibold text-amber-700">{project.forestClearance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Action Preview Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Prescriptive Intervention Directive</span>
                  <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
                    {project.recommendedIntervention}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1.5 inline-block">
                    Recommended Authority: <strong className="text-slate-200">{project.interventionAuthority}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateToModule?.('interventions', project.id)}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs transition-all"
                  >
                    View Full Directive →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLAINABLE AI (XAI) */}
          {activeTab === 'xai' && (
            <div className="space-y-6">
              {/* Natural Language Diagnostic */}
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-bold text-rose-950">
                    Why is this project high risk?
                  </h3>
                </div>
                <ul className="space-y-2 mt-3">
                  {project.riskExplanationPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Horizontal SHAP Feature Contribution Chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Top Contributing Factors (SHAP Feature Importance)</h4>
                    <p className="text-xs text-slate-500">Exact weights assigned by the gradient boosted risk classifier</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">100% Weightage</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={xaiChartData} margin={{ top: 10, right: 30, left: 140, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" unit="%" domain={[0, 50]} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
                      <Tooltip formatter={(val: any) => [`${val}% contribution to risk score`, 'Impact Weight']} />
                      <Bar dataKey="contribution" fill="#E11D48" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Root Cause vs Mitigating Action Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">Primary Cost Drivers</h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {project.majorCostEscalationDrivers.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">Primary Schedule Drivers</h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {project.majorDelayDrivers.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Project Execution Milestones & Critical Path</h4>
                  <p className="text-xs text-slate-500">Contractual deliverables tracking</p>
                </div>
                <span className="text-xs text-slate-500 font-semibold font-mono">
                  {project.milestones.filter(m => m.status === 'Completed').length} / {project.milestones.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {project.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Planned: {m.plannedDate} {m.actualDate && `| Actual: ${m.actualDate}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{m.weight}% weight</span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                          m.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'Delayed'
                            ? 'bg-rose-100 text-rose-800'
                            : m.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: S-CURVE */}
          {activeTab === 's-curve' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Historical S-Curve Progress Velocity</h4>
                <p className="text-xs text-slate-500">
                  Planned vs Actual Physical Execution (%) vs Financial Expenditure (%)
                </p>
              </div>

              <div className="h-72 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={project.monthlyProgressHistory} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="plannedPhysical" name="Planned Physical Target" stroke="#3B82F6" strokeDasharray="4 4" strokeWidth={2} />
                    <Line type="monotone" dataKey="actualPhysical" name="Actual Physical Executed" stroke="#10B981" strokeWidth={3} />
                    <Line type="monotone" dataKey="actualFinancial" name="Financial Expenditure Burn" stroke="#E11D48" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Quick Action Bar */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">Quick Decision Tools for this Project:</span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateToModule?.('predictive', project.id)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold shadow-2xs"
            >
              Predict Overruns →
            </button>

            <button
              onClick={() => onNavigateToModule?.('benchmarking', project.id)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold shadow-2xs"
            >
              Benchmark Cohort →
            </button>

            <button
              onClick={() => onNavigateToModule?.('scenario', project.id)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold shadow-2xs"
            >
              What-If Simulation →
            </button>

            <button
              onClick={() => onNavigateToModule?.('interventions', project.id)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
            >
              Prescribe Intervention →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
