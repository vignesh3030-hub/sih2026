import React, { useMemo } from 'react';
import { InfrastructureProject } from '../../types';
import { Database, ShieldAlert, CheckCircle, Clock, AlertTriangle, FileWarning, Search } from 'lucide-react';

interface DataQualityViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ projects, onSelectProject }) => {
  // Analyze Data Quality
  const { staleProjects, missingDataProjects, highRiskAnomalies, duplicateCandidates } = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const stale: InfrastructureProject[] = [];
    const missing: { project: InfrastructureProject; fields: string[] }[] = [];
    const anomalies: InfrastructureProject[] = [];
    const duplicates: { p1: InfrastructureProject; p2: InfrastructureProject }[] = [];

    const nameMap = new Map<string, InfrastructureProject>();

    projects.forEach(project => {
      // Check Stale (lastReviewDate older than 3 months)
      if (new Date(project.lastReviewDate) < threeMonthsAgo) {
        stale.push(project);
      }

      // Check Missing Data
      const missingFields = [];
      if (!project.contractorName) missingFields.push('Contractor Name');
      if (project.expenditure === undefined || project.expenditure === null) missingFields.push('Expenditure');
      if (project.physicalProgress === undefined) missingFields.push('Physical Progress');
      if (missingFields.length > 0) {
        missing.push({ project, fields: missingFields });
      }

      // Check Anomalies (e.g. expenditure > revisedCost but physical < 100%)
      if (project.expenditure > project.revisedCost && project.physicalProgress < 90) {
        anomalies.push(project);
      }

      // Check Duplicates (by name similarity or exact name, simulating duplicate check)
      if (nameMap.has(project.name) && nameMap.get(project.name)?.id !== project.id) {
        duplicates.push({ p1: project, p2: nameMap.get(project.name)! });
      } else {
        nameMap.set(project.name, project);
      }
    });

    return { staleProjects: stale, missingDataProjects: missing, highRiskAnomalies: anomalies, duplicateCandidates: duplicates };
  }, [projects]);

  const totalIssues = staleProjects.length + missingDataProjects.length + highRiskAnomalies.length + duplicateCandidates.length;
  const healthScore = Math.max(0, 100 - (totalIssues / projects.length) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            Data Quality & Hygiene
          </h1>
          <p className="text-sm text-slate-500 mt-1">Identify missing values, duplicates, stale records, and anomalies</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-semibold text-slate-500">Health Score:</div>
          <div className={`text-xl font-bold ${Number(healthScore) > 90 ? 'text-emerald-500' : Number(healthScore) > 70 ? 'text-amber-500' : 'text-rose-500'}`}>
            {healthScore}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{missingDataProjects.length}</div>
            <div className="text-xs text-slate-500 font-medium">Missing Values</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{staleProjects.length}</div>
            <div className="text-xs text-slate-500 font-medium">Stale Projects ({'>'}3 months)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{highRiskAnomalies.length}</div>
            <div className="text-xs text-slate-500 font-medium">Data Anomalies</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{duplicateCandidates.length}</div>
            <div className="text-xs text-slate-500 font-medium">Potential Duplicates</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Data Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Missing Data Attributes</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Missing Fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missingDataProjects.length === 0 ? (
                  <tr><td colSpan={2} className="p-4 text-center text-slate-500">No missing data found.</td></tr>
                ) : (
                  missingDataProjects.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <span className="font-medium text-purple-600 cursor-pointer" onClick={() => onSelectProject(item.project)}>
                          {item.project.projectCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.fields.map(f => (
                            <span key={f} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stale Records Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Stale Update Records</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Last Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staleProjects.length === 0 ? (
                  <tr><td colSpan={2} className="p-4 text-center text-slate-500">All records are up to date.</td></tr>
                ) : (
                  staleProjects.map((project, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <span className="font-medium text-purple-600 cursor-pointer" onClick={() => onSelectProject(project)}>
                          {project.projectCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-600 font-medium">
                        {new Date(project.lastReviewDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
