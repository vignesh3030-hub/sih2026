import React, { useMemo, useState } from 'react';
import { InfrastructureProject, Milestone } from '../../types';
import { Calendar, Search, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface MilestonesViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
}

interface ProjectMilestone extends Milestone {
  projectId: string;
  projectName: string;
  projectCode: string;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Flatten all milestones from all projects
  const allMilestones = useMemo(() => {
    const flattened: ProjectMilestone[] = [];
    projects.forEach(project => {
      project.milestones?.forEach(milestone => {
        flattened.push({
          ...milestone,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode
        });
      });
    });
    
    // Sort by planned date (closest first)
    return flattened.sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  }, [projects]);

  const filteredMilestones = useMemo(() => {
    return allMilestones.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allMilestones, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Delayed': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Delayed': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Milestones Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor upcoming, completed, and delayed project milestones</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search milestones or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Milestones Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Milestone Name</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold">Planned Date</th>
                <th className="px-6 py-4 font-semibold">Actual Date</th>
                <th className="px-6 py-4 font-semibold text-center">Weight</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMilestones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No milestones found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMilestones.map((milestone) => (
                  <tr key={`${milestone.projectId}-${milestone.id}`} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {milestone.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span 
                          className="font-medium text-purple-600 hover:text-purple-700 cursor-pointer"
                          onClick={() => {
                            const p = projects.find(proj => proj.id === milestone.projectId);
                            if (p) onSelectProject(p);
                          }}
                        >
                          {milestone.projectName}
                        </span>
                        <span className="text-xs text-slate-500">{milestone.projectCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(milestone.plannedDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {milestone.actualDate ? (
                        <span className={milestone.status === 'Delayed' ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                          {new Date(milestone.actualDate).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {milestone.weight}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(milestone.status)}`}>
                        {getStatusIcon(milestone.status)}
                        {milestone.status}
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
