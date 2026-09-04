import React, { useMemo, useState } from 'react';
import { InfrastructureProject } from '../../types';
import { AlertTriangle, Search, Filter, AlertOctagon, ShieldAlert, FileWarning } from 'lucide-react';

interface IssuesViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
}

interface ProjectIssue {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  type: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Unresolved' | 'Pending Intervention' | 'In Progress';
}

export const IssuesView: React.FC<IssuesViewProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // Synthesize issues from project data (delay drivers, cost drivers, clearance issues)
  const allIssues = useMemo(() => {
    const issues: ProjectIssue[] = [];
    
    projects.forEach(project => {
      let issueIdCounter = 1;
      
      // Delay Drivers as Issues
      project.majorDelayDrivers?.forEach(driver => {
        issues.push({
          id: `${project.id}-delay-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Schedule Bottleneck',
          description: driver,
          severity: project.riskLevel === 'CRITICAL' ? 'Critical' : 'High',
          status: 'Unresolved'
        });
      });

      // Cost Drivers as Issues
      project.majorCostEscalationDrivers?.forEach(driver => {
        issues.push({
          id: `${project.id}-cost-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Cost Escalation',
          description: driver,
          severity: project.costRiskScore > 80 ? 'Critical' : 'High',
          status: 'Unresolved'
        });
      });

      // Clearance Issues
      if (project.forestClearance === 'Pending' || project.forestClearance === 'Stage-2 Pending') {
        issues.push({
          id: `${project.id}-forest-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Regulatory',
          description: `Forest Clearance Status: ${project.forestClearance}`,
          severity: 'Critical',
          status: 'Pending Intervention'
        });
      }

      if (project.environmentalClearance === 'Pending') {
        issues.push({
          id: `${project.id}-env-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Regulatory',
          description: 'Environmental Clearance is pending',
          severity: 'High',
          status: 'Pending Intervention'
        });
      }
      
      // Contractor Risk
      if (project.contractorRiskRating === 'High Default Risk') {
        issues.push({
          id: `${project.id}-contractor-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Execution',
          description: `Contractor (${project.contractorName}) has a high default risk rating`,
          severity: 'Critical',
          status: 'Pending Intervention'
        });
      }
    });
    
    return issues;
  }, [projects]);

  const filteredIssues = useMemo(() => {
    return allIssues.filter(issue => {
      const matchesSearch = 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        issue.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.type.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesSeverity = severityFilter === 'All' || issue.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [allIssues, searchTerm, severityFilter]);

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'Critical': return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      case 'High': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default: return <FileWarning className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            Issues & Bottlenecks
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track unresolved project issues, regulatory bottlenecks, and delay drivers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search issues, projects, or bottleneck types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Issue Type</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold text-center">Severity</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No issues found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {issue.type}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {issue.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span 
                          className="font-medium text-purple-600 hover:text-purple-700 cursor-pointer"
                          onClick={() => {
                            const p = projects.find(proj => proj.id === issue.projectId);
                            if (p) onSelectProject(p);
                          }}
                        >
                          {issue.projectName}
                        </span>
                        <span className="text-xs text-slate-500">{issue.projectCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getSeverityBadge(issue.severity)}`}>
                        {getSeverityIcon(issue.severity)}
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full border border-slate-200">
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
