import React, { useMemo, useState } from 'react';
import { InfrastructureProject } from '../../types';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  AlertOctagon, 
  ShieldAlert, 
  FileWarning, 
  ChevronLeft, 
  ChevronRight,
  Layers
} from 'lucide-react';

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

  // Pagination State (Default 6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
          type: 'Regulatory Clearance',
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
          type: 'Regulatory Clearance',
          description: 'Environmental Clearance is pending approval',
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
          type: 'Contractor Risk',
          description: `Contractor (${project.contractorName}) flagged with high default risk rating`,
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
        issue.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.type.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesSeverity = severityFilter === 'All' || issue.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [allIssues, searchTerm, severityFilter]);

  // Page-wise Pagination calculations
  const totalItems = filteredIssues.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedIssues = useMemo(() => {
    return filteredIssues.slice(startIndex, endIndex);
  }, [filteredIssues, startIndex, endIndex]);

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'Critical': return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'High': return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      default: return <FileWarning className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Unresolved': return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'Pending Intervention': return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      default: return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              National Infrastructure Bottleneck Tracking
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Active Issues: {allIssues.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            Issues & Bottlenecks Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track unresolved project issues, regulatory bottlenecks, contractor risks, and schedule delay drivers across all projects.
          </p>
        </div>

        {/* Total Summary Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            🔴 {allIssues.filter(i => i.severity === 'Critical').length} Critical
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            🟠 {allIssues.filter(i => i.severity === 'High').length} High
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by issue description, category, project name, or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Severity 🔴</option>
              <option value="High">High Severity 🟠</option>
              <option value="Medium">Medium Severity 🟡</option>
            </select>
          </div>

          {/* Page Size Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value={5}>5 per page</option>
              <option value={6}>6 per page</option>
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paginated Issues Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] w-1/5">Category</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] w-2/5">Description / Details</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] w-1/5">Project Name & Code</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-1/8">Severity Level</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-1/8">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No bottleneck issues found matching your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-purple-50/40 transition-colors group">
                    {/* Category */}
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        <span>{issue.type}</span>
                      </div>
                    </td>

                    {/* Description / Details */}
                    <td className="px-5 py-4 text-slate-700 leading-relaxed font-medium">
                      {issue.description}
                    </td>

                    {/* Project Name & Code */}
                    <td className="px-5 py-4">
                      <div 
                        className="flex flex-col cursor-pointer group/link"
                        onClick={() => {
                          const p = projects.find(proj => proj.id === issue.projectId);
                          if (p) onSelectProject(p);
                        }}
                      >
                        <span className="font-bold text-purple-700 group-hover/link:underline truncate" title={issue.projectName}>
                          {issue.projectName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">
                          {issue.projectCode}
                        </span>
                      </div>
                    </td>

                    {/* Severity Level Badge */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${getSeverityBadge(issue.severity)}`}>
                        {getSeverityIcon(issue.severity)}
                        {issue.severity}
                      </span>
                    </td>

                    {/* Resolution Status Badge */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs border shadow-2xs ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Page-wise Pagination Footer Controls */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          {/* Total Counter */}
          <div className="font-medium text-slate-700">
            Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
            <span className="font-bold text-slate-900">{totalItems}</span> issues
          </div>

          {/* Pagination Controls (Prev, Page Numbers, Next) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="px-3 py-1 bg-white border border-slate-200 rounded-xl font-mono font-bold text-purple-900 shadow-2xs">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
