import React, { useState } from 'react';
import { InfrastructureProject } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { MospiDocumentViewer } from './MospiDocumentViewer';
import { 
  FileBarChart, 
  Download, 
  Printer, 
  Building2, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Layers,
  Calendar,
  CheckCircle2,
  BookOpen,
  FileText
} from 'lucide-react';

interface ReportsViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'MOSPI_DOCUMENT' | 'EXECUTIVE_DOSSIER'>('MOSPI_DOCUMENT');

  const totalOriginalCost = projects.reduce((acc, p) => acc + p.originalCost, 0);
  const totalRevisedCost = projects.reduce((acc, p) => acc + p.revisedCost, 0);
  const totalExpenditure = projects.reduce((acc, p) => acc + p.expenditure, 0);
  const criticalProjects = projects.filter(p => p.riskLevel === 'CRITICAL');
  const highRiskProjects = projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportContent = `=============================================================================
GOVERNMENT OF INDIA
MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)
PAIMANA INFRASTRUCTURE PROJECT PREDICTIVE MONITORING & EARLY WARNING REPORT
Generated Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
=============================================================================

1. PORTFOLIO EXECUTIVE SUMMARY
-------------------------------
Total Monitored Projects  : ${projects.length}
Critical Risk Projects    : ${criticalProjects.length} (Overall Score >= 80/100)
High Risk Projects        : ${highRiskProjects.length - criticalProjects.length}
Total Sanctioned Cost     : ₹${totalOriginalCost.toLocaleString()} Crore
Total Revised Cost        : ₹${totalRevisedCost.toLocaleString()} Crore
Cumulative Escalation     : ₹${(totalRevisedCost - totalOriginalCost).toLocaleString()} Crore (+${((totalRevisedCost - totalOriginalCost) / totalOriginalCost * 100).toFixed(1)}%)
Total Capital Expenditure : ₹${totalExpenditure.toLocaleString()} Crore

2. TOP CRITICAL BOTTLENECK PROJECTS REQUIRING IMMEDIATE PMG ESCALATION
----------------------------------------------------------------------
${criticalProjects.map((p, idx) => `
${idx + 1}. [${p.projectCode}] ${p.name}
   - Ministry: ${p.ministry} | Sector: ${p.sector} | State: ${p.state}
   - Revised Cost: ₹${p.revisedCost.toLocaleString()} Cr (+${p.costOverrunPercent}% overrun)
   - Schedule Slippage: +${p.delayMonths} Months (Exp: ${p.expectedCompletionDate})
   - Execution vs Burn: Physical ${p.physicalProgress}% | Financial ${p.financialProgress}%
   - Detected Issue: ${p.detectedIssue}
   - Prescribed Directive: ${p.recommendedIntervention}
   - Authority: ${p.interventionAuthority}
`).join('\n')}

3. SYSTEMIC RECOMMENDATIONS FOR PROJECT MONITORING DIVISION (MoSPI)
-------------------------------------------------------------------
- Enforce mandatory Stage-2 Forest clearance synchronization before financial closure.
- Implement milestone-linked escrow accounts based on verified drone/GIS physical survey.
- Empower State Level Empowered Committees (SLEC) for 14-day ROW dispute resolution.

=============================================================================
CONFIDENTIAL & OFFICIAL - PREPARED BY PAIMANA PREDICTIVE DECISION SYSTEM
=============================================================================`;

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `MoSPI_Infrastructure_Risk_Executive_Brief_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Mode Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              MoSPI Official Reports & Decision Dossiers
            </h2>
            <p className="text-xs text-slate-500">
              Quarter-1 FY 2025-26 Central Sector Infrastructure Projects (Costing ₹150 Cr & Above)
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('MOSPI_DOCUMENT')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MOSPI_DOCUMENT'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Report Document (Cover, Letters & Pages)</span>
          </button>

          <button
            onClick={() => setActiveTab('EXECUTIVE_DOSSIER')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'EXECUTIVE_DOSSIER'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cabinet & PMG Action Dossier</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Authentic MoSPI Document Viewer */}
      {activeTab === 'MOSPI_DOCUMENT' && (
        <MospiDocumentViewer
          projects={projects}
          onSelectProject={onSelectProject}
          onNavigate={onNavigate}
        />
      )}

      {/* Mode 2: Executive Decision Dossier */}
      {activeTab === 'EXECUTIVE_DOSSIER' && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Dossier (.txt)</span>
            </button>
          </div>

          {/* Report Document Sheet (Government Style) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-300 shadow-md space-y-8 max-w-4xl mx-auto">
            {/* Document Official Header */}
            <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Government of India</div>
              <h1 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">
                Ministry of Statistics and Programme Implementation (MoSPI)
              </h1>
              <div className="text-xs font-semibold text-slate-600">
                Project Monitoring Division (PAIMANA Infrastructure Decision-Support Engine)
              </div>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Official Executive Infrastructure Risk Dossier • Ref: MoSPI/PMD/DIR/2026/08
              </div>
            </div>

            {/* Section 1: Portfolio High-Level Snapshot */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                1. Portfolio Financial & Schedule Health Snapshot
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Projects</span>
                  <span className="text-xl font-bold font-mono text-slate-900">{projects.length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Critical Risk Projects</span>
                  <span className="text-xl font-bold font-mono text-rose-700">{criticalProjects.length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Sanctioned Budget</span>
                  <span className="text-xl font-bold font-mono text-slate-900">₹{(totalOriginalCost / 1000).toFixed(1)}k Cr</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Revised Forecast</span>
                  <span className="text-xl font-bold font-mono text-rose-700">₹{(totalRevisedCost / 1000).toFixed(1)}k Cr</span>
                </div>
              </div>
            </div>

            {/* Section 2: Critical Interventions Register */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>2. Priority Projects Requiring Cabinet / PMG Interventions</span>
                <span className="text-xs font-mono font-normal text-slate-500">{criticalProjects.length} Flagged</span>
              </h3>

              <div className="space-y-4">
                {criticalProjects.slice(0, 8).map((p, idx) => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-900">{p.projectCode}</span>
                        <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                      </div>
                      <RiskBadge level={p.riskLevel} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                      <div>Ministry: <strong className="text-slate-900">{p.ministry.replace('Ministry of ', '')}</strong></div>
                      <div>Cost: <strong className="text-slate-900">₹{p.revisedCost.toLocaleString('en-IN')} Cr (+{p.costOverrunPercent}%)</strong></div>
                      <div>Delay: <strong className="text-rose-700">+{p.delayMonths} mos</strong></div>
                      <div>Progress: <strong className="text-emerald-700">{p.physicalProgress}% Phys</strong> / <strong className="text-slate-800">{p.financialProgress}% Fin</strong></div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-rose-900 font-semibold">
                        <span className="text-rose-600">Detected Bottleneck: </span>
                        {p.detectedIssue}
                      </div>
                      <div className="text-slate-800 font-medium">
                        <span className="text-purple-900 font-bold">Action Directive: </span>
                        {p.recommendedIntervention}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-6 border-t-2 border-slate-900 flex justify-between text-xs text-slate-500 font-mono">
              <span>PAIMANA Decision Engine • Confidential</span>
              <span>Approved for MoSPI Infrastructure Oversight</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
