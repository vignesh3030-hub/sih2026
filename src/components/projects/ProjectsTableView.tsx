import React, { useState, useMemo } from 'react';
import { InfrastructureProject, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Eye, 
  AlertTriangle,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ProjectsTableViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const ProjectsTableView: React.FC<ProjectsTableViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('ALL');
  const [selectedCostRisk, setSelectedCostRisk] = useState('ALL');
  const [selectedDelayRisk, setSelectedDelayRisk] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<keyof InfrastructureProject>('overallRiskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract unique filter dropdown values
  const ministries = useMemo(() => Array.from(new Set(projects.map(p => p.ministry))), [projects]);
  const sectors = useMemo(() => Array.from(new Set(projects.map(p => p.sector))), [projects]);
  const states = useMemo(() => Array.from(new Set(projects.map(p => p.state))), [projects]);

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.projectCode.toLowerCase().includes(q);
        const matchesAgency = p.implementingAgency.toLowerCase().includes(q);
        const matchesContractor = p.contractorName.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesAgency && !matchesContractor) return false;
      }

      // Dropdown filters
      if (selectedMinistry !== 'ALL' && p.ministry !== selectedMinistry) return false;
      if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;
      if (selectedState !== 'ALL' && p.state !== selectedState) return false;
      if (selectedRiskLevel !== 'ALL' && p.riskLevel !== selectedRiskLevel) return false;
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;

      // Cost Risk filter
      if (selectedCostRisk === 'HIGH' && p.costOverrunProbability < 70) return false;
      if (selectedCostRisk === 'MEDIUM' && (p.costOverrunProbability < 40 || p.costOverrunProbability >= 70)) return false;
      if (selectedCostRisk === 'LOW' && p.costOverrunProbability >= 40) return false;

      // Delay Risk filter
      if (selectedDelayRisk === 'HIGH' && p.delayProbability < 70) return false;
      if (selectedDelayRisk === 'MEDIUM' && (p.delayProbability < 40 || p.delayProbability >= 70)) return false;
      if (selectedDelayRisk === 'LOW' && p.delayProbability >= 40) return false;

      return true;
    });
  }, [
    projects,
    searchQuery,
    selectedMinistry,
    selectedSector,
    selectedState,
    selectedRiskLevel,
    selectedCostRisk,
    selectedDelayRisk,
    selectedStatus,
  ]);

  // Sort logic
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      return sortDirection === 'asc' 
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  }, [filteredProjects, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage) || 1;
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof InfrastructureProject) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMinistry('ALL');
    setSelectedSector('ALL');
    setSelectedState('ALL');
    setSelectedRiskLevel('ALL');
    setSelectedCostRisk('ALL');
    setSelectedDelayRisk('ALL');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      'Project Code',
      'Project Name',
      'Ministry',
      'Sector',
      'State',
      'Original Cost (Cr)',
      'Revised Cost (Cr)',
      'Expenditure (Cr)',
      'Physical Progress (%)',
      'Financial Progress (%)',
      'Expected Completion',
      'Cost Risk (%)',
      'Delay Risk (%)',
      'Overall Risk Score',
      'Risk Level',
      'Status'
    ];

    const rows = sortedProjects.map(p => [
      `"${p.projectCode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.ministry}"`,
      `"${p.sector}"`,
      `"${p.state}"`,
      p.originalCost,
      p.revisedCost,
      p.expenditure,
      p.physicalProgress,
      p.financialProgress,
      p.expectedCompletionDate,
      p.costOverrunProbability,
      p.delayProbability,
      p.overallRiskScore,
      p.riskLevel,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoSPI_Infrastructure_Projects_Risk_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Controls Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              National Infrastructure Monitoring Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Showing {sortedProjects.length} of {projects.length} Projects
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Risk Table & Registry
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter, and inspect predictive risk scores, expenditure pacing, and schedule slippage across all active projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300/80 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filter Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project name, code (e.g. NHAI-NH44), implementing agency, or contractor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Ministry */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ministry</label>
            <select
              value={selectedMinistry}
              onChange={(e) => { setSelectedMinistry(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Ministries</option>
              {ministries.map(m => (
                <option key={m} value={m}>{m.replace('Ministry of ', '')}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => { setSelectedSector(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All States</option>
              {states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Risk Level</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => { setSelectedRiskLevel(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Levels</option>
              <option value="CRITICAL">Critical 🔴</option>
              <option value="HIGH">High 🟠</option>
              <option value="MEDIUM">Medium 🟡</option>
              <option value="LOW">Low 🟢</option>
            </select>
          </div>

          {/* Cost Risk */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cost Risk</label>
            <select
              value={selectedCostRisk}
              onChange={(e) => { setSelectedCostRisk(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Cost Risks</option>
              <option value="HIGH">High (≥70%)</option>
              <option value="MEDIUM">Med (40-69%)</option>
              <option value="LOW">Low (&lt;40%)</option>
            </select>
          </div>

          {/* Delay Risk */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Delay Risk</label>
            <select
              value={selectedDelayRisk}
              onChange={(e) => { setSelectedDelayRisk(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Delay Risks</option>
              <option value="HIGH">High (≥70%)</option>
              <option value="MEDIUM">Med (40-69%)</option>
              <option value="LOW">Low (&lt;40%)</option>
            </select>
          </div>

          {/* Project Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Critical Delayed">Critical Delayed</option>
              <option value="At Risk">At Risk</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Near Completion">Near Completion</option>
              <option value="On Schedule">On Schedule</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-800" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Project Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-800" onClick={() => handleSort('ministry')}>
                  <div className="flex items-center gap-1.5">
                    <span>Ministry / Sector</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800" onClick={() => handleSort('originalCost')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Orig Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800" onClick={() => handleSort('revisedCost')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Rev Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800" onClick={() => handleSort('expenditure')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Expenditure</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800" onClick={() => handleSort('physicalProgress')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Physical</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800" onClick={() => handleSort('financialProgress')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Financial</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Exp Completion</th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800" onClick={() => handleSort('costOverrunProbability')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Cost Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800" onClick={() => handleSort('delayProbability')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Delay Risk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800" onClick={() => handleSort('overallRiskScore')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Overall</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    No infrastructure projects found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  const isDivergent = p.financialProgress - p.physicalProgress > 10;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => onSelectProject(p)}
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-mono text-[10px] text-blue-600 font-semibold">{p.projectCode}</div>
                        <div className="font-semibold text-slate-900 truncate" title={p.name}>{p.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{p.implementingAgency}</div>
                      </td>

                      {/* Ministry & Sector */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{p.ministry.replace('Ministry of ', '')}</div>
                        <div className="text-[11px] text-slate-500 truncate">{p.sector}</div>
                      </td>

                      {/* State */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {p.state}
                      </td>

                      {/* Original Cost */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        ₹{p.originalCost.toLocaleString()} Cr
                      </td>

                      {/* Revised Cost */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{p.revisedCost.toLocaleString()} Cr
                        {p.costOverrunPercent > 0 && (
                          <div className="text-[10px] text-rose-600 font-semibold">
                            +{p.costOverrunPercent}%
                          </div>
                        )}
                      </td>

                      {/* Expenditure */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        ₹{p.expenditure.toLocaleString()} Cr
                      </td>

                      {/* Physical Progress */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-emerald-700">{p.physicalProgress}%</span>
                        <div className="w-16 mx-auto bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, p.physicalProgress)}%` }} />
                        </div>
                      </td>

                      {/* Financial Progress */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono font-bold ${isDivergent ? 'text-rose-700' : 'text-slate-700'}`}>
                          {p.financialProgress}%
                        </span>
                        {isDivergent && (
                          <span className="block text-[9px] font-bold text-rose-600 uppercase">Divergent</span>
                        )}
                      </td>

                      {/* Expected Completion */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] whitespace-nowrap">
                        <div>{p.expectedCompletionDate}</div>
                        {p.delayMonths > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600">+{p.delayMonths} mos</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600">On Time</span>
                        )}
                      </td>

                      {/* Cost Risk Probability */}
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        <span className={p.costOverrunProbability >= 70 ? 'text-rose-600' : p.costOverrunProbability >= 40 ? 'text-amber-600' : 'text-emerald-600'}>
                          {p.costOverrunProbability}%
                        </span>
                      </td>

                      {/* Delay Risk Probability */}
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        <span className={p.delayProbability >= 70 ? 'text-rose-600' : p.delayProbability >= 40 ? 'text-amber-600' : 'text-emerald-600'}>
                          {p.delayProbability}%
                        </span>
                      </td>

                      {/* Overall Risk Score */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {p.overallRiskScore}
                        </span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <RiskBadge level={p.riskLevel} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-[11px] transition-all"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, sortedProjects.length)}</span> of{' '}
            <span className="font-bold text-slate-900">{sortedProjects.length}</span> projects
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <div className="px-3 font-mono font-semibold">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
