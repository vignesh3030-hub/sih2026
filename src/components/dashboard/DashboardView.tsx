import React, { useState, useMemo } from 'react';
import { InfrastructureProject, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Layers, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { IndiaMap } from './IndiaMap';

interface DashboardViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Filter projects by state if selected
  const activeProjects = useMemo(() => {
    if (!selectedState) return projects;
    return projects.filter(p => {
      if (p.state === selectedState) return true;
      if (selectedState === 'Andaman and Nicobar Islands' && p.state.includes('Andaman')) return true;
      if (selectedState === 'Delhi' && p.state.includes('Delhi')) return true;
      return false;
    });
  }, [projects, selectedState]);

  // KPIs
  const projectCount = activeProjects.length;
  
  const originalCost = activeProjects.reduce((sum, p) => sum + p.originalCost, 0);
  const revisedCost = activeProjects.reduce((sum, p) => sum + p.revisedCost, 0);
  const expenditure = activeProjects.reduce((sum, p) => sum + p.expenditure, 0);
  
  const completedDuringMonth = activeProjects.filter(p => p.status === 'Near Completion' && p.physicalProgress >= 98).length;
  const newlyAdded = activeProjects.filter(p => p.physicalProgress < 10).length;

  // AI Risk Averages
  const avgCostRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.costRiskScore, 0) / projectCount) : 0;
  const avgScheduleRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.scheduleRiskScore, 0) / projectCount) : 0;
  const avgProgressRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.progressRiskScore, 0) / projectCount) : 0;
  const avgOverallRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.overallRiskScore, 0) / projectCount) : 0;

  const getRiskSeverityColor = (score: number) => {
    if (score >= 80) return 'text-rose-500 bg-rose-50 border-rose-200 stroke-rose-500';
    if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-200 stroke-amber-500';
    if (score >= 40) return 'text-yellow-500 bg-yellow-50 border-yellow-200 stroke-yellow-500';
    return 'text-emerald-500 bg-emerald-50 border-emerald-200 stroke-emerald-500';
  };

  const getOverallRiskLabel = (score: number) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score > 0) return 'LOW';
    return 'N/A';
  };

  const CircularProgress = ({ value, label, subtitle }: { value: number, label: string, subtitle: string }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const colorClasses = getRiskSeverityColor(value);

    return (
      <div className="flex flex-col items-center justify-center p-3">
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            <circle
              className="stroke-slate-100"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            <circle
              className={`${colorClasses.split(' ')[3]} transition-all duration-1000 ease-out`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-[13px] ${colorClasses.split(' ')[0]}`}>
            {value}%
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider">{label}</span>
        <span className="text-[9px] text-slate-400 text-center">{subtitle}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Bar */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">State-wise Infrastructure Projects</h1>
          <p className="text-sm text-slate-500 mt-1">As of July 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI-Powered Predictive Monitoring
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Prototype / Demo Data
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Statistics Card (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            
            <div className="bg-slate-900 px-6 py-5 flex flex-col justify-center border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Selected Region</span>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-6 h-6 text-blue-400" />
                <h2 className="text-3xl font-bold tracking-tight">{selectedState || 'All India'}</h2>
              </div>
            </div>

            <div className="p-6">
              {/* 2x3 KPI Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* KPI 1: Project Count */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Layers className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Project Count</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{projectCount}</div>
                </div>

                {/* KPI 2: Completed During Month */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{completedDuringMonth}</div>
                </div>

                {/* KPI 3: Original Cost */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Original Cost</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{originalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 4: Latest Revised Cost */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Revised Cost</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{revisedCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 5: Cumulative Expenditure */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Expenditure</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{expenditure.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 6: Newly Added */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Newly Added</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{newlyAdded}</div>
                </div>
                
              </div>
            </div>

            {/* AI Risk Overview (4 Progress Rings) */}
            <div className="border-t border-slate-200 bg-slate-50/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  AI Risk Overview
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskSeverityColor(avgOverallRisk)}`}>
                  Risk: {getOverallRiskLabel(avgOverallRisk)}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <CircularProgress value={avgCostRisk} label="Cost Overrun" subtitle="Risk Score" />
                <CircularProgress value={avgScheduleRisk} label="Schedule Delay" subtitle="Risk Score" />
                <CircularProgress value={avgProgressRisk} label="Implementation" subtitle="Risk Score" />
                <CircularProgress value={avgOverallRisk} label="Overall Risk" subtitle="Aggregated" />
              </div>
            </div>

          </div>
          
          {/* Action Button to drop down to Priority Project table */}
          {selectedState && (
            <button 
              onClick={() => onNavigate('projects')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 px-4 font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              View {projectCount} Priority Projects in {selectedState}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* RIGHT: Interactive India Map (7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <IndiaMap 
            projects={projects} 
            selectedState={selectedState} 
            onStateSelect={setSelectedState} 
          />
        </div>

      </div>
    </div>
  );
};
