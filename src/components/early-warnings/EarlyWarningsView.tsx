import React, { useState } from 'react';
import { EarlyWarningAlert, InfrastructureProject } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  AlertTriangle, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Send, 
  Building2, 
  Layers, 
  ArrowRight,
  Sparkles,
  CheckCheck
} from 'lucide-react';

interface EarlyWarningsViewProps {
  alerts: EarlyWarningAlert[];
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const EarlyWarningsView: React.FC<EarlyWarningsViewProps> = ({
  alerts,
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (activeTab !== 'ALL' && a.riskLevel !== activeTab) return false;
    if (selectedCategory !== 'ALL' && a.riskType !== selectedCategory) return false;
    return true;
  });

  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.riskLevel === 'HIGH').length;
  const mediumCount = alerts.filter(a => a.riskLevel === 'MEDIUM').length;

  const handleAcknowledge = (id: string) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              Real-Time AI Anomaly Detection
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Active Warnings: {alerts.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Early Warning System
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated predictive warning triggers identifying cost surges, critical schedule slippages, and clearance impasses before crisis escalation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-hidden"
          >
            <option value="ALL">All Warning Types</option>
            <option value="Cost Escalation Alert">Cost Escalation</option>
            <option value="Schedule Delay Alert">Schedule Delay</option>
            <option value="Progress-Expenditure Divergence">Progress-Expenditure Divergence</option>
            <option value="Regulatory Stagnation">Regulatory Stagnation</option>
          </select>
        </div>
      </div>

      {/* Warning Severity Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ALL */}
        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">All Active Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'ALL' ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{alerts.length}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Comprehensive trigger log
          </p>
        </button>

        {/* CRITICAL */}
        <button
          onClick={() => setActiveTab('CRITICAL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'CRITICAL'
              ? 'bg-rose-900 text-white border-rose-900 shadow-md'
              : 'bg-rose-50/50 text-rose-900 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Alerts 🔴</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-2">{criticalCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'CRITICAL' ? 'text-rose-200' : 'text-rose-700'}`}>
            Requires immediate PMG escalation
          </p>
        </button>

        {/* HIGH */}
        <button
          onClick={() => setActiveTab('HIGH')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'HIGH'
              ? 'bg-amber-900 text-white border-amber-900 shadow-md'
              : 'bg-amber-50/50 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">High Alerts 🟠</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-2">{highCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'HIGH' ? 'text-amber-200' : 'text-amber-700'}`}>
            Inter-ministerial review needed
          </p>
        </button>

        {/* MEDIUM */}
        <button
          onClick={() => setActiveTab('MEDIUM')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'MEDIUM'
              ? 'bg-yellow-900 text-white border-yellow-900 shadow-md'
              : 'bg-yellow-50/50 text-yellow-900 border-yellow-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Alerts 🟡</span>
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-700 mt-2">{mediumCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'MEDIUM' ? 'text-yellow-200' : 'text-yellow-700'}`}>
            Quarterly milestone monitoring
          </p>
        </button>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const associatedProject = projects.find(p => p.id === alert.projectId);
          const isAck = acknowledgedAlerts[alert.id] || alert.status === 'Acknowledged' || alert.status === 'Action Initiated';

          const isCritical = alert.riskLevel === 'CRITICAL';
          const isHigh = alert.riskLevel === 'HIGH';

          const cardBorder = isCritical ? 'border-rose-300' : isHigh ? 'border-amber-300' : 'border-slate-200';
          const badgeBg = isCritical ? 'bg-rose-100 text-rose-800' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800';

          // Generate AI predictive text
          const predictiveText = `This project has an ${alert.riskScore}% predicted risk of schedule delay because its physical progress (${associatedProject?.physicalProgress}%) is below expected progress (${associatedProject?.plannedPhysicalProgress}%) and its completion deadline is approaching.`;

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border-2 ${cardBorder} shadow-lg overflow-hidden transition-all hover:shadow-xl space-y-0`}
            >
              {/* Header */}
              <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-bold tracking-widest text-sm uppercase">AI Early Warning</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  ID: {alert.id}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Project Info & Overall Risk */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="text-sm text-slate-500 font-semibold mb-1">Project: <span className="font-mono text-blue-600">{associatedProject?.projectCode || alert.projectId}</span></div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {alert.projectName}
                    </h3>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                    <div className="text-sm font-semibold text-slate-600">Overall Risk: <span className={`font-bold ${isCritical ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-yellow-600'}`}>{isCritical ? '🔴 CRITICAL' : isHigh ? '🟠 HIGH' : '🟡 MEDIUM'}</span></div>
                    <div className="text-sm font-semibold text-slate-600">Risk Score: <span className="font-bold text-slate-900 font-mono text-lg">{alert.riskScore} / 100</span></div>
                  </div>
                </div>

                {/* The Predictive Statement */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                      {predictiveText}
                    </p>
                  </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Risk Scores */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Risk Factor Breakdown</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Schedule Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{associatedProject?.scheduleRiskScore || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Cost Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{associatedProject?.costRiskScore || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Progress Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{associatedProject?.progressRiskScore || 0}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">Expected Delay:</span>
                        <span className="text-sm font-bold text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded">
                          {associatedProject?.delayMonths ? `${Math.max(1, associatedProject.delayMonths - 2)}–${associatedProject.delayMonths + 2} months` : 'On Schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Factors & Actions */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Main Warning Factors</h4>
                      <ul className="space-y-2 mt-3">
                        {associatedProject?.topContributingFactors?.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>{f.factor}</span>
                          </li>
                        )) || (
                          <>
                            <li className="flex items-start gap-2 text-sm text-slate-700"><span className="text-rose-500 mt-0.5">•</span><span>Completion date approaching</span></li>
                            <li className="flex items-start gap-2 text-sm text-slate-700"><span className="text-rose-500 mt-0.5">•</span><span>Physical progress is lower than expected</span></li>
                            <li className="flex items-start gap-2 text-sm text-slate-700"><span className="text-rose-500 mt-0.5">•</span><span>Progress velocity has plateaued</span></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Prescriptive Recommendation
                  </h4>
                  <ul className="space-y-2">
                    {alert.recommendedAction.split('. ').filter(Boolean).map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-800 font-medium">
                        <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{action.trim().endsWith('.') ? action.trim() : action.trim() + '.'}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center gap-3 pt-2">
                  {!isAck ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-1 border border-emerald-200">
                      <CheckCheck className="w-4 h-4" />
                      Acknowledged
                    </span>
                  )}

                  {associatedProject && (
                    <button
                      onClick={() => onSelectProject(associatedProject)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <span>Diagnose Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
