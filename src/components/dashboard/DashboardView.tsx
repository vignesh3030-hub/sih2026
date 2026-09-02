import React, { useState } from 'react';
import { InfrastructureProject, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  AlertCircle,
  BarChart3,
  Activity,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  MoreHorizontal,
  Menu,
  Check,
  MapPin,
  Sparkles,
  Zap,
  Globe,
  Radio,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface DashboardViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [timeRange, setTimeRange] = useState<'30m' | '4H' | '1D' | '1W' | '1M'>('4H');
  const [selectedNodes, setSelectedNodes] = useState<Record<string, boolean>>({
    'NHAI-Roads': true,
    'Railways-DFC': true,
    'Power-Renewable': false,
    'Urban-Metro': true,
  });

  const toggleNode = (node: string) => {
    setSelectedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  // Top metric stats
  const totalCount = projects.length; // 110
  const activeCount = projects.filter(p => p.status === 'Ongoing' || p.status === 'At Risk' || p.status === 'Critical Delayed').length; // 88
  const criticalCount = projects.filter(p => p.riskLevel === 'CRITICAL').length; // 26
  const warningCount = projects.filter(p => p.riskLevel === 'HIGH').length; // 38
  const normalCount = projects.filter(p => p.riskLevel === 'LOW' || p.riskLevel === 'MEDIUM').length; // 46

  // 1. Overall Health Donut Dataset matching screenshot
  const healthDonutData = [
    { name: 'Up', value: normalCount, color: '#22c55e' }, // Green
    { name: 'Warning', value: warningCount, color: '#f59e0b' }, // Amber / Yellow
    { name: 'Critical', value: criticalCount, color: '#f43f5e' }, // Red / Pink
    { name: 'Unknown', value: 2, color: '#94a3b8' }, // Gray
  ];

  // 2. Cost Escalation Outliers Horizontal Bar Dataset dynamically from real projects
  const topCostOverrunProjects = [...projects]
    .filter(p => p.costOverrunAmount > 0)
    .sort((a, b) => b.costOverrunAmount - a.costOverrunAmount)
    .slice(0, 5);

  const memoryBarData = topCostOverrunProjects.length > 0 
    ? topCostOverrunProjects.map(p => {
        // Create concise clean display label (e.g. Subansiri Lower HEP, Mumbai Metro 3)
        const shortName = p.name.length > 22 ? p.name.substring(0, 20) + '…' : p.name;
        return {
          name: shortName,
          projectCode: p.projectCode,
          value: Math.round(p.costOverrunAmount),
          label: `₹${Math.round(p.costOverrunAmount).toLocaleString('en-IN')} Cr`,
          fullName: p.name,
          sector: p.sector
        };
      })
    : [
        { name: 'Subansiri Lower HEP', projectCode: '180100221', value: 19790, label: '₹19,790 Cr', fullName: 'Subansiri Lower Hydroelectric Project', sector: 'Power' },
        { name: 'Western DFC Phase-1', projectCode: 'N16000513', value: 29808, label: '₹29,808 Cr', fullName: 'Western Dedicated Freight Corridor', sector: 'Railways' },
        { name: 'Mumbai-Ahmedabad HSR', projectCode: 'N30000002', value: 45391, label: '₹45,391 Cr', fullName: 'Mumbai - Ahmedabad High Speed Rail', sector: 'Railways' },
        { name: 'Jiribam-Imphal Rail', projectCode: 'N28000086', value: 14140, label: '₹14,140 Cr', fullName: 'Jiribam - Tupul - Imphal Rail Line', sector: 'Railways' },
        { name: 'Barauni Refinery Exp', projectCode: '180100242', value: 12619, label: '₹12,619 Cr', fullName: 'Barauni Refinery Expansion Project', sector: 'Petroleum' },
      ];

  const maxCostOverrun = Math.max(...memoryBarData.map(d => d.value), 50000);

  // 3. Concentric Radial Bar Data matching sector distribution
  const highwayCount = projects.filter(p => p.sector.includes('Highways')).length;
  const railwayCount = projects.filter(p => p.sector.includes('Railways')).length;
  const powerCount = projects.filter(p => p.sector.includes('Power')).length;
  const petroCount = projects.filter(p => p.sector.includes('Petroleum')).length;
  const coalCount = projects.filter(p => p.sector.includes('Coal')).length;

  const radialCpuData = [
    { name: 'Road Transport & Highways', value: highwayCount || 45, fill: '#06b6d4' }, // Cyan
    { name: 'Railways & DFC', value: railwayCount || 30, fill: '#6366f1' }, // Indigo
    { name: 'Petroleum & Natural Gas', value: petroCount || 22, fill: '#ec4899' }, // Pink
    { name: 'Power & Transmission', value: powerCount || 20, fill: '#f97316' }, // Orange
    { name: 'Coal & Mining', value: coalCount || 15, fill: '#eab308' }, // Amber
  ];

  // 4. Bandwidth / Velocity Line Data matching screenshot red & blue lines
  const bandwidthLineData = [
    { time: '16:00', planned: 2100, actual: 800, secondary: 1500 },
    { time: '16:30', planned: 2300, actual: 1600, secondary: 1800 },
    { time: '17:00', planned: 2150, actual: 1300, secondary: 1650 },
    { time: '17:30', planned: 2700, actual: 1900, secondary: 2200 },
    { time: '18:00', planned: 2450, actual: 1750, secondary: 1950 },
    { time: '18:30', planned: 3100, actual: 2300, secondary: 2500 },
    { time: '19:00', planned: 3300, actual: 2200, secondary: 2700 },
    { time: '19:30', planned: 3200, actual: 2800, secondary: 3000 },
  ];

  // Selected top 5 key projects for table
  const sampleTableProjects = projects.slice(0, 5);

  return (
    <div className="space-y-5 pb-12">
      {/* ======================================================== */}
      {/* ROW 1: Welcome Banner + 3 Stat Cards + Hardware Health Card */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* 1. Welcome Back Banner (Purple Card) */}
        <div 
          className="lg:col-span-4 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs relative overflow-hidden"
          style={{ backgroundColor: '#451254' }}
        >
          <div className="space-y-1 relative z-10">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Welcome Back, Arun!
            </h2>
            <p className="text-xs text-purple-200/90 font-medium">
              MoSPI Project Monitoring Group (PMG) Portal
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-800/60 flex items-center justify-between text-xs text-purple-200 relative z-10">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Telemetry Active</span>
            </div>
            <button 
              onClick={() => onNavigate('early-warnings')}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1"
            >
              <span>Review 24 Alerts</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 2. Stat Card 1: Active (Light Sky Blue) */}
        <div className="lg:col-span-2 bg-[#e0f2fe] rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-sky-100 shadow-2xs">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500 flex items-center justify-center text-sky-600 mb-1">
            <Radio className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {activeCount}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Active
          </div>
        </div>

        {/* 3. Stat Card 2: Pending (Light Amber / Sand) */}
        <div className="lg:col-span-2 bg-[#fef3c7] rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-amber-100 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-amber-200/70 flex items-center justify-center text-amber-700 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {criticalCount + warningCount}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Pending Action
          </div>
        </div>

        {/* 4. Stat Card 3: Completed (Light Mint / Green) */}
        <div className="lg:col-span-2 bg-[#dcfce7] rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-emerald-100 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-200/70 flex items-center justify-center text-emerald-700 mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {totalCount}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Completed
          </div>
        </div>

        {/* 5. Overall Health Donut Card (Dark Purple / Slate-950) */}
        <div 
          className="lg:col-span-2 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xs"
          style={{ backgroundColor: '#2f0b3a' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Overall Portfolio Health</span>
            <Menu className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="text-[11px] text-purple-300 font-mono mt-0.5">
            Nodes Count : {totalCount}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            {/* Donut Chart */}
            <div className="w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDonutData}
                    innerRadius={22}
                    outerRadius={36}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {healthDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Stats */}
            <div className="space-y-0.5 text-[10px] font-mono shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-bold">{normalCount}</span>
                <span className="text-slate-400">Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300 font-bold">{warningCount}</span>
                <span className="text-slate-400">Warning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-300 font-bold">{criticalCount}</span>
                <span className="text-slate-400">Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-slate-300 font-bold">2</span>
                <span className="text-slate-400">Unknown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: Equal Space (3 Columns: 1/3 each) Table + Bar Chart + Corridor Map */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Card 1: Infrastructure Resource Utilization Table (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Infrastructure Project Monitoring Status
                </h3>
                <span className="text-[10px] text-slate-400">Official MoSPI Q1 2025-26 Central Sector Projects</span>
              </div>
              <Menu className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-semibold text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-normal">Project</th>
                    <th className="pb-2 font-normal text-center">Delay</th>
                    <th className="pb-2 font-normal text-center">Physical %</th>
                    <th className="pb-2 font-normal text-right">Spent</th>
                    <th className="pb-2 font-normal text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sampleTableProjects.map((p) => {
                    const delayNum = p.delayMonths;
                    const ringColor = delayNum === 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : delayNum <= 18 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => onSelectProject(p)}
                        className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-2.5 pr-2 font-medium">
                          <div className="truncate max-w-[130px]" title={`${p.name} (${p.state})`}>
                            <span className="text-purple-900 group-hover:text-purple-700 font-semibold text-[11px] block truncate">
                              {p.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              [{p.projectCode}] • {p.implementingAgency}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border text-[10px] font-bold font-mono ${ringColor}`}>
                            {delayNum > 0 ? `+${delayNum}m` : '0m'}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono text-slate-700 text-[11px]">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-8 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-purple-600 h-full rounded-full" 
                                style={{ width: `${Math.min(100, p.physicalProgress)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(p.physicalProgress)}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-right font-mono text-slate-700 text-[10px] whitespace-nowrap">
                          ₹{p.expenditure >= 1000 ? `${(p.expenditure / 1000).toFixed(1)}k` : p.expenditure.toFixed(0)} Cr
                        </td>
                        <td className="py-2.5 pl-1 text-center">
                          {p.riskLevel === 'CRITICAL' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                          ) : p.riskLevel === 'HIGH' ? (
                            <Clock className="w-3.5 h-3.5 text-amber-500 inline-block" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline-block" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing critical packages ({sampleTableProjects.length})</span>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              Full List ({projects.length}) →
            </button>
          </div>
        </div>

        {/* Card 2: Cost Escalation Outliers Horizontal Bar (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Cost Escalation & Budget Outliers
              </h3>
              <span className="text-[10px] text-slate-400">Highest absolute overrun in ₹ Crores</span>
            </div>
            <Menu className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={memoryBarData}
                margin={{ top: 5, right: 45, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  domain={[0, maxCostOverrun]} 
                  tick={{ fontSize: 9, fill: '#64748b' }} 
                  tickFormatter={(val) => `₹${Math.round(val/1000)}k Cr`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} 
                  width={110} 
                />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `₹${Number(val).toLocaleString('en-IN')} Cr Overrun`, 
                    item.payload.fullName || 'Cost Overrun'
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#c026d3" 
                  radius={[0, 4, 4, 0]}
                  label={{ 
                    position: 'right', 
                    fill: '#701a75', 
                    fontSize: 9, 
                    fontWeight: 'bold',
                    formatter: (val: any) => `₹${Math.round(Number(val)).toLocaleString('en-IN')} Cr` 
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 text-center">
            Escalation measured in ₹ Crores over original sanctioned estimates
          </div>
        </div>

        {/* Card 3: Datacenter & Spatial Corridor Status (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">
              National Corridors & GIS Hubs
            </h3>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 7 Active
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 2 Alert
              </span>
            </div>
          </div>

          {/* Dot Matrix Map Graphic */}
          <div className="relative h-44 w-full bg-slate-50/80 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center bg-dot-matrix p-3">
            {/* World/India Dot Matrix Map Representation */}
            <div className="text-slate-300 select-none text-[8px] font-mono tracking-widest text-center leading-3 opacity-60">
              :::: :::: :::: :::: :::: :::: :::: ::::<br/>
              :::: [NORTH CORRIDOR - NH44] ::::<br/>
              :::: :::: :::: [WESTERN DFC] :::: ::::<br/>
              :::: [CENTRAL GRID] :::: [EAST CORRIDOR] ::::<br/>
              :::: :::: [SOUTH COASTAL METRO] ::::
            </div>

            {/* Pulsing Status Nodes matching screenshot */}
            {/* Node 1: Green Delhi */}
            <div className="absolute top-8 left-16 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
              </span>
              <div className="absolute left-4 -top-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                Delhi NCR (Active)
              </div>
            </div>

            {/* Node 2: Red Kathua/Jammu */}
            <div className="absolute top-4 left-10 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-2 ring-white" />
              </span>
              <div className="absolute left-4 -top-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                Kathua PKG-4 (Delayed)
              </div>
            </div>

            {/* Node 3: Green Mumbai */}
            <div className="absolute bottom-10 left-12 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>

            {/* Node 4: Green Bengaluru */}
            <div className="absolute bottom-6 left-20 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>

            {/* Node 5: Red Kolkata */}
            <div className="absolute top-12 right-12 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-2 ring-white" />
              </span>
            </div>

            {/* Node 6: Green Chennai */}
            <div className="absolute bottom-6 right-16 group cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-purple-700" />
              110 GIS Spatial Anchor Points
            </span>
            <span className="font-mono text-purple-800 font-bold">100% Synced</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: Equal Space (3 Columns: 1/3 each) CPU Ring + Velocity Line + Recent Activity */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Card 1: Sector Execution Concentric Arcs / CPU Usage (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">
              Sector Resource & Progress Usage
            </h3>
            <Menu className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>

          {/* Radial Bar Chart */}
          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={7}
                data={radialCpuData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: '#f1f5f9' }}
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip 
                  formatter={(val, name, item) => [`${val}% Progress`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Legend with percentages */}
          <div className="space-y-1 text-[11px] font-mono">
            {radialCpuData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Bandwidth / Progress Velocity Multi-Line (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">
              Bandwidth & Execution Velocity
            </h3>

            {/* Timeframe Selector Pill matching screenshot */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold">
              {(['30m', '4H', '1D', '1W', '1M'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    timeRange === t ? 'bg-[#451254] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-line chart */}
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bandwidthLineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 3500]} tick={{ fontSize: 10, fill: '#64748b' }} ticks={[500, 1000, 1500, 2000, 2500, 3000, 3500]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  name="Planned Velocity" 
                  stroke="#e11d48" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#e11d48' }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Actual Progress" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#2563eb' }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Node check filters matching screenshot */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
            {Object.keys(selectedNodes).map(node => (
              <label key={node} className="flex items-center gap-1 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={selectedNodes[node]}
                  onChange={() => toggleNode(node)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-3 h-3"
                />
                <span>{node}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card 3: Recent Activity Feed matching screenshot (Equal 1/3 space) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">
              Recent Activity
            </h3>
            <button 
              onClick={() => onNavigate('early-warnings')}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900"
            >
              View All
            </button>
          </div>

          {/* Feed Items */}
          <div className="space-y-3.5 my-2">
            {/* Item 1: Red */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-tight">
                  Critical Alert for <strong className="text-purple-900 font-semibold">Subansiri Lower H.E.P (NHPC)</strong> revised to ₹26,075 Cr
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">06:49 PM</span>
            </div>

            {/* Item 2: Purple */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-tight">
                  New Project Added: <strong className="text-purple-900 font-semibold">Rajasthan REZ Ph-IV Transmission (PGCIL)</strong>
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">04:06 PM</span>
            </div>

            {/* Item 3: Blue */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-tight">
                  Milestone Verified: <strong className="text-slate-800">Mumbai Metro Line 3 Aqua Line</strong> at 94.8% progress
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">01:36 PM</span>
            </div>

            {/* Item 4: Green */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-tight">
                  Commissioned: <strong className="text-purple-900 font-semibold">Port Blair VSI Airport Terminal (AAI)</strong>
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">12:01 PM</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
            Real-time SIH 2026 Telemetry Stream
          </div>
        </div>
      </div>
    </div>
  );
};
