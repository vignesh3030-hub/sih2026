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

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border ${cardBorder} shadow-xs transition-all hover:shadow-md space-y-4`}
            >
              {/* Alert Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeBg}`}>
                    {alert.riskLevel} PRIORITY
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {alert.riskType}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Alert ID: {alert.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Date: {alert.alertDate}
                  </span>
                  <span>•</span>
                  <span>AI Score: <strong className="text-slate-900">{alert.riskScore}/100</strong></span>
                </div>
              </div>

              {/* Project & Reason Description */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {alert.projectName}
                    </h3>
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {associatedProject?.projectCode || alert.projectId}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
                    <strong className="text-slate-900 font-semibold block mb-1">Trigger Reason & Signal:</strong>
                    {alert.reason}
                  </div>
                </div>

                {/* Evidence Metric Pill */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Key Anomaly Indicator
                    </span>
                    <div className="text-sm font-semibold text-slate-100 mt-1 font-mono">
                      {alert.evidenceMetric}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Deadline: <strong className="text-amber-300 font-mono">{alert.actionDeadline}</strong>
                  </div>
                </div>
              </div>

              {/* Recommended Action & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-700 max-w-2xl">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-900 font-bold">Prescriptive Protocol: </strong>
                    <span>{alert.recommendedAction}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isAck ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  )}

                  {associatedProject && (
                    <button
                      onClick={() => onSelectProject(associatedProject)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <span>Diagnose Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
