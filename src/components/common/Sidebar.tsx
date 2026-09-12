import React, { useState } from 'react';
import {
  BarChart2,
  Server,
  Users,
  Package,
  Gauge,
  Database,
  Folder,
  Shield,
  LayoutGrid,
  Calendar,
  Settings,
  Zap,
  Menu,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sliders,
  ShieldCheck,
  Bot,
  FileBarChart,
  Activity,
  BookOpen,
  FileSpreadsheet,
  Pin,
  Lock,
  Unlock
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  criticalCount: number;
  highRiskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  criticalCount,
  highRiskCount,
}) => {
  // Lock sidebar expanded by default for all dashboards
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paimana_sidebar_locked');
      if (saved !== null) return saved === 'true';
    }
    // Default to locked true for all dashboards
    if (typeof window !== 'undefined') {
      localStorage.setItem('paimana_sidebar_locked', 'true');
      localStorage.setItem('paimana_sidebar_expanded', 'true');
    }
    return true;
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedLocked = localStorage.getItem('paimana_sidebar_locked');
      if (savedLocked === 'false') {
        const savedExpanded = localStorage.getItem('paimana_sidebar_expanded');
        return savedExpanded === 'true';
      }
    }
    return true;
  });

  const toggleLock = (locked: boolean) => {
    setIsLocked(locked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paimana_sidebar_locked', String(locked));
    }
    if (locked) {
      setIsExpanded(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('paimana_sidebar_expanded', 'true');
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, badge: null },
    { id: 'projects', label: 'Projects', icon: Folder, badge: null },
    { id: 'milestones', label: 'Milestones', icon: Calendar, badge: null },
    { id: 'issues', label: 'Issues & Bottlenecks', icon: AlertTriangle, badge: null },
    { id: 'data-quality', label: 'Data Quality', icon: Database, badge: null },
    { id: 'users', label: 'User Management', icon: ShieldCheck, badge: null },
    { id: 'data-import', label: 'Data Import (CSV)', icon: FileSpreadsheet, badge: 'NEW', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'risk-monitor', label: 'Risk Monitor', icon: Users, badge: `${criticalCount}`, badgeColor: 'bg-rose-500 text-white' },
    { id: 'early-warnings', label: 'AI Early Warning & Risk Intelligence', icon: Package, badge: `${criticalCount + highRiskCount}`, badgeColor: 'bg-amber-400 text-slate-950 font-bold' },
    { id: 'predictive', label: 'Predictive Analytics', icon: Gauge, badge: 'ML' },
    { id: 'drivers', label: 'Driver Analysis', icon: TrendingUp, badge: 'CUF' },
    { id: 'benchmarking', label: 'Benchmarking', icon: Database, badge: null },
    { id: 'scenario', label: 'Scenario What-If', icon: Folder, badge: 'Sim' },
    { id: 'interventions', label: 'Interventions (PMG)', icon: Shield, badge: null },
    { id: 'assistant', label: 'AI Assistant (LLM)', icon: LayoutGrid, badge: 'AI', badgeColor: 'bg-fuchsia-500 text-white' },
    { id: 'reports', label: 'MoSPI Report (Cover & Pages)', icon: BookOpen, badge: 'PDF', badgeColor: 'bg-purple-300 text-purple-950 font-bold' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside
      onMouseEnter={() => {
        if (!isLocked) setIsExpanded(true);
      }}
      onMouseLeave={() => {
        if (!isLocked) setIsExpanded(false);
      }}
      className={`transition-all duration-300 ease-in-out text-white flex flex-col shrink-0 z-20 h-full border-r border-purple-900/40 select-none ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      style={{ backgroundColor: '#451254' }}
    >
      {/* Top Toggle & Lock Status Header */}
      <div className="p-3 flex items-center justify-between border-b border-purple-900/50 bg-purple-950/40">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[11px] text-purple-100 tracking-wider uppercase">Navigation</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleLock(!isLocked)}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                  isLocked 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold shadow-2xs' 
                    : 'text-purple-300 hover:bg-white/10 hover:text-white'
                }`}
                title={isLocked ? 'Sidebar is locked open for all dashboards. Click to unlock.' : 'Lock sidebar expanded'}
              >
                <Pin className={`w-3.5 h-3.5 transition-transform ${isLocked ? 'rotate-45 text-amber-400 fill-amber-400' : ''}`} />
                <span className="text-[10px] font-bold">{isLocked ? 'Locked' : 'Lock'}</span>
              </button>

              <button
                onClick={() => {
                  if (isLocked) {
                    toggleLock(false);
                    setIsExpanded(false);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('paimana_sidebar_expanded', 'false');
                    }
                  } else {
                    const nextExpanded = !isExpanded;
                    setIsExpanded(nextExpanded);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('paimana_sidebar_expanded', String(nextExpanded));
                    }
                  }
                }}
                className="p-1.5 rounded-lg text-purple-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full py-1">
            <button
              onClick={() => toggleLock(true)}
              className="w-9 h-9 rounded-xl bg-purple-900/60 hover:bg-amber-400/20 text-amber-400 flex items-center justify-center transition-all cursor-pointer border border-purple-700/50"
              title="Lock Sidebar Expanded in All Views"
            >
              <Pin className="w-4 h-4 fill-amber-400 rotate-45" />
            </button>
          </div>
        )}
      </div>

      {/* Nav Icons & Labels List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full group relative flex items-center ${
                isExpanded ? 'px-3 justify-between' : 'justify-center px-0'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60 font-bold border border-purple-400/30'
                  : 'text-purple-100/90 hover:bg-white/15 hover:text-white'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                {isExpanded && <span className="truncate text-xs font-medium tracking-tight">{item.label}</span>}
              </div>

              {item.badge && isExpanded && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.badgeColor || (isActive ? 'bg-purple-900 text-purple-100' : 'bg-purple-950/80 text-purple-200 border border-purple-800/60')
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-lg z-50">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-amber-300 font-bold">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Mini Brand info */}
      <div className="p-3 border-t border-purple-900/40 text-center bg-purple-950/30">
        {isExpanded ? (
          <div className="bg-purple-950/60 rounded-xl p-2.5 text-left border border-purple-900/50">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>MoSPI InfraPredict</span>
            </div>
            <p className="text-[10px] text-purple-300/90 mt-0.5 font-medium">
              SIH 2026 AI Decision-Support Platform
            </p>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/40 mx-auto flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
