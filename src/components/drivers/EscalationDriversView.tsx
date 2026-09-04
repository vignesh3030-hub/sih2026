import React, { useState } from 'react';
import { InfrastructureProject } from '../../types';
import {
  BrainCircuit,
  Database,
  TrendingUp,
  AlertTriangle,
  Building2,
  FileText,
  Workflow,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { RiskBadge } from '../common/RiskBadge';

interface EscalationDriversViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const EscalationDriversView: React.FC<EscalationDriversViewProps> = ({
  projects,
  onSelectProject,
  onNavigate
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    projects[0]?.id || 'PRJ-TRN-001'
  );

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Mock Feature Importance Data representing the ML model's SHAP values
  // Highlighting CUF (Common Upload Form) vs Non-CUF (External) variables
  const featureData = [
    { name: 'Physical Progress Deficit', importance: 0.28, type: 'CUF Field', color: '#3B82F6' },
    { name: 'Land Acquired (%)', importance: 0.18, type: 'CUF Field', color: '#3B82F6' },
    { name: 'Material Price Index (Steel/Cement)', importance: 0.15, type: 'Non-CUF Variable', color: '#8B5CF6' },
    { name: 'Forest/Environment Clearance Status', importance: 0.12, type: 'CUF Field', color: '#3B82F6' },
    { name: 'Contractor Liquidity Risk Score', importance: 0.11, type: 'Non-CUF Variable', color: '#8B5CF6' },
    { name: 'Financial Burn Rate Divergence', importance: 0.08, type: 'CUF Field', color: '#3B82F6' },
    { name: 'Weather Anomalies / Monsoon Intensity', importance: 0.05, type: 'Non-CUF Variable', color: '#8B5CF6' },
    { name: 'Geo-Political / State Election Proximity', importance: 0.03, type: 'Non-CUF Variable', color: '#8B5CF6' },
  ].map(f => ({ ...f, displayImportance: Math.round(f.importance * 100) }));

  const cufImportance = featureData.filter(f => f.type === 'CUF Field').reduce((sum, f) => sum + f.displayImportance, 0);
  const nonCufImportance = featureData.filter(f => f.type === 'Non-CUF Variable').reduce((sum, f) => sum + f.displayImportance, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header & Project Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              CUF Feature Attribution Analysis
            </span>
            <span className="text-xs text-slate-400 font-mono">SIH 2026 Problem Statement C</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Cost Escalation Drivers & Variables
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
            Assessment of predictive performance attributable to existing MoSPI Common Upload Form (CUF) fields vis-à-vis additional AI-sourced external variables.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 max-w-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.projectCode}] {p.name.length > 36 ? p.name.substring(0, 36) + '...' : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metrics & Accuracy Comparison */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Model Performance Gains
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Accuracy using ONLY CUF fields</span>
                  <span>78.4%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Accuracy with AI Non-CUF Variables</span>
                  <span className="text-emerald-400 font-bold">94.2%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
                <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.8% Absolute Gain in Predictive Accuracy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Weight Distribution
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">CUF Importance</span>
                <span className="text-2xl font-bold font-mono text-blue-800">{cufImportance}%</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-600 block mb-1">Non-CUF Importance</span>
                <span className="text-2xl font-bold font-mono text-purple-800">{nonCufImportance}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              Traditional CUF metrics (cost, time, physical progress) account for ~{cufImportance}% of the predictive signal. Introducing external parameters (contractor health, price indices) explains the remaining ~{nonCufImportance}% of hidden execution risk.
            </p>
          </div>
        </div>

        {/* Right Column: Driver Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-amber-500" />
                SHAP Feature Importance Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Drivers actively causing cost & schedule variance on <span className="font-bold text-slate-700">{selectedProject.projectCode}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> CUF Field
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> External (Non-CUF)
              </span>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={false} />
                <XAxis type="number" unit="%" domain={[0, 40]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={180} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
                          <div className="font-bold mb-1">{data.name}</div>
                          <div className="text-slate-300 font-mono mb-2">Impact Weight: {data.displayImportance}%</div>
                          <div className={`px-2 py-1 inline-block rounded font-bold text-[10px] ${
                            data.type === 'CUF Field' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                          }`}>
                            {data.type}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="displayImportance" radius={[0, 4, 4, 0]} barSize={24}>
                  {featureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategic Insight Bottom Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-white tracking-tight">Prescriptive Data Strategy</h4>
            <p className="text-sm text-indigo-200 mt-1 max-w-3xl leading-relaxed">
              To fully transition PAIMANA from descriptive to prescriptive intelligence, MoSPI must augment standard CUF reporting with integrated APIs for contractor financial health (MCA), supply chain price indices, and real-time geospatial environmental data.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => onNavigate('predictive')}
          className="shrink-0 bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-xs flex items-center gap-2"
        >
          View Overrun Forecasts
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
