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
  BookOpen
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
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, badge: null },
    { id: 'projects', label: 'Projects Registry', icon: Server, badge: '110' },
    { id: 'risk-monitor', label: 'Risk Monitor', icon: Users, badge: `${criticalCount}`, badgeColor: 'bg-rose-500 text-white' },
    { id: 'early-warnings', label: 'Early Warnings', icon: Package, badge: `${criticalCount + highRiskCount}`, badgeColor: 'bg-amber-400 text-slate-950 font-bold' },
    { id: 'predictive', label: 'Predictive Analytics', icon: Gauge, badge: 'ML' },
    { id: 'benchmarking', label: 'Benchmarking', icon: Database, badge: null },
    { id: 'scenario', label: 'Scenario What-If', icon: Folder, badge: 'Sim' },
    { id: 'interventions', label: 'Interventions (PMG)', icon: Shield, badge: null },
    { id: 'assistant', label: 'AI Assistant (LLM)', icon: LayoutGrid, badge: 'AI', badgeColor: 'bg-fuchsia-500 text-white' },
    { id: 'reports', label: 'MoSPI Report (Cover & Pages)', icon: BookOpen, badge: 'PDF', badgeColor: 'bg-purple-300 text-purple-950 font-bold' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-[#3e104f] text-white flex flex-col shrink-0 z-20 min-h-[calc(100vh-65px)] ${
        isExpanded ? 'w-60' : 'w-18'
      }`}
      style={{ backgroundColor: '#451254' }}
    >
      {/* Top Toggle Button */}
      <div className="p-3.5 flex items-center justify-between border-b border-purple-900/40">
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-purple-200 hover:text-white transition-all mx-auto focus:outline-hidden"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Icons List */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full group relative flex items-center ${
                isExpanded ? 'px-3.5 justify-between' : 'justify-center px-0'
              } py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600/80 text-white shadow-md shadow-purple-950/40'
                  : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                {isExpanded && <span className="truncate text-xs font-medium">{item.label}</span>}
              </div>

              {item.badge && isExpanded && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
      <div className="p-3 border-t border-purple-900/40 text-center">
        {isExpanded ? (
          <div className="bg-purple-950/50 rounded-xl p-2.5 text-left border border-purple-900/40">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>MoSPI InfraPredict</span>
            </div>
            <p className="text-[10px] text-purple-300/80 mt-0.5">
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
