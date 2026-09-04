import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InfrastructureProject } from '../../types';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Sparkles, 
  Layers, 
  AlertTriangle,
  ChevronDown,
  User,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  criticalCount: number;
  warningCount: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  currentUser?: { name: string; role: string; department: string };
  onLogout: () => void;
  projects?: InfrastructureProject[];
  onSelectProject?: (project: InfrastructureProject) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onOpenSearch,
  criticalCount,
  warningCount,
  searchQuery = '',
  onSearchChange,
  currentUser = { name: 'Varshini', role: 'Admin', department: 'Data Informatics & Innovation Division' },
  onLogout,
  projects = [],
  onSelectProject
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!localSearchQuery.trim() || !projects.length) return [];
    const query = localSearchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/);
    return projects.map(p => {
      let score = 0;
      const name = p.name.toLowerCase();
      const code = p.projectCode.toLowerCase();
      const agency = p.implementingAgency.toLowerCase();
      const state = p.state.toLowerCase();
      
      if (code === query) score += 100;
      if (name === query) score += 50;
      if (code.startsWith(query)) score += 30;
      if (name.startsWith(query)) score += 20;

      terms.forEach(term => {
        if (code.includes(term)) score += 15;
        if (name.includes(term)) score += 10;
        if (agency.includes(term)) score += 5;
        if (state.includes(term)) score += 3;
      });
      return { project: p, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.project);
  }, [localSearchQuery, projects]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Portal Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#451254] via-purple-700 to-indigo-600 p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#451254] rounded-[10px] flex items-center justify-center">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">PAIMANA</span>
              <span className="font-extrabold text-purple-800 text-base tracking-tight">InfraPredict</span>
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200 hidden sm:inline-block">
                MoSPI • SIH 2026
              </span>
            </div>
          </div>
        </div>

        {/* Center Search Pill matching screenshot */}
        <div className="flex-1 max-w-md mx-4 hidden md:block" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search projects, corridors, ministries, EPC contractors..."
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-full text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-2xs"
            />
            {showSearchResults && localSearchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-[400px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div 
                      key={p.id} 
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                      onClick={() => {
                        onSelectProject && onSelectProject(p);
                        setShowSearchResults(false);
                        setLocalSearchQuery('');
                      }}
                    >
                      <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-mono text-purple-600 font-semibold">{p.projectCode}</span>
                        <span className="text-[10px] text-slate-500">{p.state}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">No projects found for "{localSearchQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Pill matching screenshot */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-full">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`p-1.5 rounded-full transition-all ${
                !isDarkMode ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`p-1.5 rounded-full transition-all ${
                isDarkMode ? 'bg-[#451254] text-white shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notification Bell with alert indicator */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all relative"
              title="Notifications & Early Warnings"
            >
              <Bell className="w-4 h-4" />
              {(criticalCount + warningCount) > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Critical Alerts</span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                    {criticalCount} Immediate
                  </span>
                </div>
                <div className="py-2 space-y-2 max-h-56 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-rose-900">NHAI-NH44-EXP Lag Detected</div>
                      <div className="text-[11px] text-rose-700">Physical progress lag +30 months in Kathua ROW.</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">DFCCIL Western Corridor</div>
                      <div className="text-[11px] text-amber-700">Financial burn (+18%) exceeds civil progress.</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('early-warnings');
                  }}
                  className="w-full mt-1 py-1.5 text-center text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                >
                  View All Early Warning Triggers →
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-100 shadow-2xs">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 max-w-[140px] truncate">{currentUser.department}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
            title="Secure Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
