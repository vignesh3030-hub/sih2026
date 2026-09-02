import React, { useState } from 'react';
import { InfrastructureProject } from '../../types';
import { MOSPI_REPORT_METRICS } from '../../data/mockProjects';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  Search, 
  Layers, 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface MospiDocumentViewerProps {
  projects: InfrastructureProject[];
  onSelectProject?: (project: InfrastructureProject) => void;
  onNavigate?: (view: string) => void;
}

export const MospiDocumentViewer: React.FC<MospiDocumentViewerProps> = ({
  projects,
  onSelectProject,
  onNavigate
}) => {
  // Page navigation state: 'cover' | 'contents' | 'synopsis_letter' | 'macro_comparison' | 'table1_sectors' | 'table2_states' | 'table_projects' | 'abbreviations'
  const [currentPage, setCurrentPage] = useState<string>('cover');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');

  const pageList = [
    { id: 'cover', label: 'Cover Page', pageNum: 'Cover' },
    { id: 'contents', label: 'Table of Contents', pageNum: 'Page 2' },
    { id: 'synopsis_letter', label: 'Executive Synopsis Letter', pageNum: 'Page 1-2' },
    { id: 'macro_comparison', label: 'Sectoral & State Highlights', pageNum: 'Page 4-5' },
    { id: 'table1_sectors', label: 'Table 1: Sector-wise Distribution', pageNum: 'Page 3-4' },
    { id: 'table2_states', label: 'Table 2: State-wise Distribution', pageNum: 'Page 5-7' },
    { id: 'table_projects', label: 'Table 3-7: Filtered Project Lists', pageNum: 'Page 8-252' },
    { id: 'abbreviations', label: 'Official Abbreviations', pageNum: 'Page 253-256' },
  ];

  const currentIndex = pageList.findIndex(p => p.id === currentPage);

  const handleNextPage = () => {
    if (currentIndex < pageList.length - 1) {
      setCurrentPage(pageList[currentIndex + 1].id);
    }
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setCurrentPage(pageList[currentIndex - 1].id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Sectoral Distribution Data from Table 1 of official MoSPI Report
  const sectorTableData = [
    { sector: 'Road Transport and Highways', count: 934, origCost: 517228.45, antCost: 547036.87, overrun: 29808.42, overrunPct: 5.76, exp: 310542.12 },
    { sector: 'Railways', count: 284, origCost: 724890.10, antCost: 986420.50, overrun: 261530.40, overrunPct: 36.08, exp: 598740.30 },
    { sector: 'Petroleum', count: 167, origCost: 412580.60, antCost: 448920.15, overrun: 36339.55, overrunPct: 8.81, exp: 286540.00 },
    { sector: 'Power', count: 135, origCost: 438720.00, antCost: 512640.80, overrun: 73920.80, overrunPct: 16.85, exp: 312890.50 },
    { sector: 'Coal', count: 104, origCost: 162450.30, antCost: 171280.60, overrun: 8830.30, overrunPct: 5.44, exp: 98650.20 },
    { sector: 'Urban Development & Metro', count: 48, origCost: 324100.80, antCost: 358400.20, overrun: 34299.40, overrunPct: 10.58, exp: 198420.10 },
    { sector: 'Civil Aviation', count: 22, origCost: 34120.40, antCost: 35890.10, overrun: 1769.70, overrunPct: 5.19, exp: 22450.80 },
    { sector: 'Shipping, Ports & Waterways', count: 16, origCost: 28450.20, antCost: 29980.50, overrun: 1530.30, overrunPct: 5.38, exp: 17820.40 },
    { sector: 'Steel', count: 12, origCost: 41200.00, antCost: 44100.00, overrun: 2900.00, overrunPct: 7.04, exp: 29400.00 },
    { sector: 'Water Resources / Jal Shakti', count: 8, origCost: 18900.00, antCost: 21400.00, overrun: 2500.00, overrunPct: 13.23, exp: 12600.00 },
    { sector: 'Mines & Minerals', count: 6, origCost: 12400.00, antCost: 12900.00, overrun: 500.00, overrunPct: 4.03, exp: 8400.00 },
    { sector: 'Atomic Energy & Others', count: 5, origCost: 48500.00, antCost: 52100.00, overrun: 3600.00, overrunPct: 7.42, exp: 34200.00 }
  ];

  // State-wise Distribution Data from Table 2 of official MoSPI Report
  const stateTableData = [
    { state: 'Multi State', count: 192, cost: 742180.45, delayedCount: 94 },
    { state: 'Maharashtra', count: 174, cost: 382450.20, delayedCount: 82 },
    { state: 'Uttar Pradesh', count: 156, cost: 298400.15, delayedCount: 68 },
    { state: 'Gujarat', count: 118, cost: 245120.80, delayedCount: 42 },
    { state: 'Bihar', count: 108, cost: 182400.60, delayedCount: 58 },
    { state: 'Tamil Nadu', count: 98, cost: 196800.40, delayedCount: 45 },
    { state: 'Assam', count: 92, cost: 114500.20, delayedCount: 49 },
    { state: 'Madhya Pradesh', count: 88, cost: 154200.30, delayedCount: 38 },
    { state: 'Odisha', count: 84, cost: 168900.50, delayedCount: 36 },
    { state: 'Karnataka', count: 79, cost: 142300.25, delayedCount: 34 },
    { state: 'Rajasthan', count: 76, cost: 138400.10, delayedCount: 31 },
    { state: 'West Bengal', count: 74, cost: 148200.80, delayedCount: 46 },
    { state: 'Andhra Pradesh', count: 72, cost: 132600.40, delayedCount: 32 },
    { state: 'Arunachal Pradesh', count: 48, cost: 68400.20, delayedCount: 28 },
    { state: 'Jammu & Kashmir', count: 42, cost: 89400.60, delayedCount: 26 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Document Bar & Page Navigator */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Official MoSPI Status Report (Quarter-1 FY 2025-26)
            </span>
            <span className="text-xs text-slate-400 font-mono">1,734 Central Sector Projects</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Official Report Document & Executive Transmittal
          </h2>
        </div>

        {/* Page Switcher Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevPage}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Previous section"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              {pageList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.pageNum})
                </option>
              ))}
            </select>

            <button
              onClick={handleNextPage}
              disabled={currentIndex === pageList.length - 1}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Next section"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Section</span>
          </button>
        </div>
      </div>

      {/* Quick Nav Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {pageList.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentPage(p.id)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
              currentPage === p.id
                ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. COVER PAGE VIEW */}
      {/* ========================================================================= */}
      {currentPage === 'cover' && (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border-2 border-slate-900 shadow-xl max-w-5xl mx-auto space-y-10 relative overflow-hidden">
          {/* Subtle Government Emblem Watermark Pattern */}
          <div className="absolute inset-0 bg-radial from-purple-50/40 to-transparent pointer-events-none" />

          {/* Top Header */}
          <div className="text-center space-y-2.5 border-b-2 border-slate-900 pb-8">
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-mono font-bold tracking-widest uppercase rounded-sm">
              OCMS • Online Computerized Monitoring System
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wider pt-2">
              Government of India
            </h3>
            <h2 className="text-xl sm:text-3xl font-extrabold text-purple-950 uppercase tracking-tight">
              Ministry of Statistics and Programme Implementation
            </h2>
            <div className="text-sm text-slate-600 font-medium">
              Infrastructure and Project Monitoring Division (IPMD) • Sardar Patel Bhawan, New Delhi
            </div>
          </div>

          {/* Main Title Badge */}
          <div className="text-center py-8 space-y-5">
            <div className="inline-block px-5 py-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm">
              CENTRAL SECTOR INFRASTRUCTURE PROJECTS
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight max-w-3xl mx-auto">
              IMPLEMENTATION STATUS REPORT COSTING RS. 150 CRORE & ABOVE
            </h1>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 max-w-lg mx-auto shadow-2xs">
              <span className="text-base font-extrabold text-purple-900 tracking-wide uppercase">
                QUARTERLY PROJECT - Quarter-1 FY 2025-26 (April-June)
              </span>
            </div>
          </div>

          {/* Macro Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-center">
              <span className="text-xs text-slate-500 font-bold uppercase block">Total Monitored</span>
              <span className="text-3xl font-black font-mono text-purple-900">1,734</span>
              <span className="text-xs text-slate-400 block mt-0.5">Ongoing Projects</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 font-bold uppercase block">Original Cost</span>
              <span className="text-2xl font-black font-mono text-slate-800">₹28.43 L Cr</span>
              <span className="text-xs text-slate-400 block mt-0.5">Sanctioned Outlay</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 font-bold uppercase block">Anticipated Cost</span>
              <span className="text-2xl font-black font-mono text-rose-700">₹31.58 L Cr</span>
              <span className="text-xs text-rose-600 font-bold block mt-0.5">+11.10% Overrun</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 font-bold uppercase block">Expenditure Ratio</span>
              <span className="text-3xl font-black font-mono text-emerald-700">56.19%</span>
              <span className="text-xs text-slate-400 block mt-0.5">₹17.75 Lakh Cr Spent</span>
            </div>
          </div>

          {/* Classification Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-purple-900 block text-base font-bold">619 Mega Projects</strong>
              <span className="text-slate-600 text-xs sm:text-sm">Costing ₹1,000 Cr and above (Total: ₹23.33 Lakh Cr)</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-blue-900 block text-base font-bold">1,115 Major Projects</strong>
              <span className="text-slate-600 text-xs sm:text-sm">Costing ₹150 Cr to ₹1,000 Cr (Total: ₹5.10 Lakh Cr)</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block text-base font-bold">224 North-East Projects</strong>
              <span className="text-slate-600 text-xs sm:text-sm">Special priority corridor monitoring (₹2.13 Lakh Cr)</span>
            </div>
          </div>

          {/* Official Footer */}
          <div className="border-t-2 border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-4">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-base">Ministry of Statistics & Programme Implementation</div>
              <div className="font-mono text-xs text-slate-500">Website: www.mospi.gov.in • X: @GoIStats</div>
            </div>
            <button
              onClick={() => setCurrentPage('contents')}
              className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Open Table of Contents (Page 2)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLE OF CONTENTS VIEW */}
      {/* ========================================================================= */}
      {currentPage === 'contents' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-md max-w-5xl mx-auto space-y-8">
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">CONTENTS</h2>
              <p className="text-sm text-slate-500 font-mono">Implementation Status Report - Q1 FY 2025-26</p>
            </div>
            <span className="px-3.5 py-1.5 bg-slate-100 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-700">
              Official Page 2
            </span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {/* Synopsis Link */}
            <div 
              onClick={() => setCurrentPage('synopsis_letter')}
              className="pt-3 flex items-center justify-between group cursor-pointer hover:bg-purple-50/60 p-4 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-base text-slate-900 group-hover:text-purple-900 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-purple-700" />
                  Synopsis & Executive Transmittal Letter
                </span>
                <span className="text-sm text-slate-500 block pl-7 mt-0.5">
                  Executive Summary, Macro Project Statistics, Time & Cost Overrun Diagnostic
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-md">
                Pages 1 - 2
              </span>
            </div>

            {/* List of Tables Header */}
            <div className="pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">List of Tables (Pages 3 - 252)</span>
            </div>

            {/* Table 1 */}
            <div 
              onClick={() => setCurrentPage('table1_sectors')}
              className="pt-3 flex items-center justify-between group cursor-pointer hover:bg-purple-50/60 p-4 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-base text-slate-900 group-hover:text-purple-900 flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-blue-700" />
                  Table:- 1. Overview of Ongoing Projects: Sector-wise Distribution
                </span>
                <span className="text-sm text-slate-500 block pl-7 mt-0.5">
                  Distribution across 18 Central Sectors (Roads, Railways, Petroleum, Power, Coal, Urban, Aviation)
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                Pages 3 - 4
              </span>
            </div>

            {/* Table 2 */}
            <div 
              onClick={() => setCurrentPage('table2_states')}
              className="pt-3 flex items-center justify-between group cursor-pointer hover:bg-purple-50/60 p-4 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-base text-slate-900 group-hover:text-purple-900 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  Table:- 2. Overview of Ongoing Projects: State-wise Distribution
                </span>
                <span className="text-sm text-slate-500 block pl-7 mt-0.5">
                  State/UT-wise breakdown of 33 States/UTs and Multi-State Corridors
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                Pages 5 - 7
              </span>
            </div>

            {/* Table 3 */}
            <div 
              onClick={() => setCurrentPage('table_projects')}
              className="pt-3 flex items-center justify-between group cursor-pointer hover:bg-purple-50/60 p-4 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-base text-slate-900 group-hover:text-purple-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-700" />
                  Table:- 3. Project List: Completed during 1st Quarter (April-June), 2025-26
                </span>
                <span className="text-sm text-slate-500 block pl-7 mt-0.5">
                  116 Completed Projects costing ₹1,34,336.13 Crore
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                Pages 8 - 21
              </span>
            </div>

            {/* Table 7 */}
            <div 
              onClick={() => setCurrentPage('table_projects')}
              className="pt-3 flex items-center justify-between group cursor-pointer hover:bg-purple-50/60 p-4 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-base text-slate-900 group-hover:text-purple-900 flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-purple-700" />
                  Table:- 7. Project List: Ongoing Projects during 1st Quarter, 2025-26
                </span>
                <span className="text-sm text-slate-500 block pl-7 mt-0.5">
                  All 1,734 Ongoing Central Sector Projects costing ₹31,58,147.58 Crore
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                Pages 55 - 252
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SYNOPSIS & EXECUTIVE LETTER VIEW (Pages 1-2) */}
      {/* ========================================================================= */}
      {currentPage === 'synopsis_letter' && (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-300 shadow-md max-w-5xl mx-auto space-y-9">
          {/* Letter Head */}
          <div className="border-b-2 border-slate-900 pb-6 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500">Government of India</div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 uppercase tracking-tight">
                  Ministry of Statistics and Programme Implementation
                </h1>
                <div className="text-sm font-semibold text-purple-900 mt-0.5">
                  Infrastructure and Project Monitoring Division (IPMD)
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-purple-100 text-purple-900 rounded-xl text-xs sm:text-sm font-mono font-bold shrink-0">
                Official Synopsis Letter (Pages 1-2)
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Ref: MoSPI/IPMD/Q1-2025-26/STAT-REP • Quarter ending June 2025
            </div>
          </div>

          {/* Letter Text Content */}
          <div className="space-y-6 text-base sm:text-lg text-slate-800 leading-relaxed">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
              SYNOPSIS: CENTRAL SECTOR INFRASTRUCTURE PROJECTS (COSTING ₹150 CRORE & ABOVE)
            </h2>

            <p className="leading-relaxed">
              <strong className="text-slate-900">1. Background & Scope:</strong> The Ministry of Statistics and Programme Implementation (MoSPI) monitors all Central Sector Infrastructure Projects costing ₹150 crore and above on a monthly/quarterly basis through the Online Computerized Monitoring System (OCMS). The objective is to provide early signals of schedule slippage, cost overruns, and statutory bottlenecks to the Cabinet Secretariat, Project Monitoring Group (PMG), and concerned administrative ministries.
            </p>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm sm:text-base space-y-3">
              <strong className="text-purple-950 text-base sm:text-lg block">Macro Portfolio Highlights for Quarter-1 FY 2025-26:</strong>
              <ul className="list-disc pl-6 space-y-2.5 text-slate-700">
                <li><strong>Total Ongoing Projects:</strong> As on 30th June 2025, a total of <strong>1,734 central sector infrastructure projects</strong> costing ₹150 crore and above were monitored.</li>
                <li><strong>Sanctioned vs Anticipated Cost:</strong> Total original sanctioned cost of ₹28,42,540.23 Crore has escalated to an anticipated completion cost of <strong>₹31,58,147.58 Crore</strong>, reflecting an overall cost overrun of <strong>₹3,15,607.35 Crore (+11.10%)</strong>.</li>
                <li><strong>Cumulative Capital Expenditure:</strong> Expenditure incurred till the end of Q1 2025-26 stands at <strong>₹17,74,657.72 Crore</strong>, which represents <strong>56.19%</strong> of the anticipated cost.</li>
                <li><strong>Mega vs Major Projects:</strong> Of the 1,734 ongoing projects, <strong>619 are Mega Projects</strong> (costing ₹1,000 Crore and above) accounting for ₹23,32,736.46 Crore; and <strong>1,115 are Major Projects</strong> (costing between ₹150 Cr and ₹1,000 Cr) accounting for ₹5,09,803.77 Crore.</li>
                <li><strong>Quarterly Dynamism:</strong> During Q1 2025-26, <strong>116 projects</strong> were reported completed (Cost: ₹1,34,336.13 Cr), <strong>46 new projects</strong> were added (Cost: ₹51,155.24 Cr), and <strong>13 projects</strong> were dropped/frozen.</li>
                <li><strong>High Physical Completion Cohort:</strong> <strong>765 projects</strong> have reported physical progress between 80% and 100%, requiring targeted final-mile administrative thrust.</li>
              </ul>
            </div>

            <p className="leading-relaxed">
              <strong className="text-slate-900">2. Systemic Reasons for Delays and Overruns:</strong> The status reports submitted by project implementing authorities highlight several recurring impediments:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <strong className="text-rose-900 block font-bold text-base">Land Acquisition & Right of Way (RoW)</strong>
                <span className="text-slate-700 mt-1 block">Protracted compensation disputes, land demarcation delays by state revenue authorities, and court litigations.</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <strong className="text-amber-900 block font-bold text-base">Statutory & Environmental Clearances</strong>
                <span className="text-slate-700 mt-1 block">Stage-II forest diversion approvals, wildlife sanctuary eco-sensitive clearances, and coastal regulation clearances.</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <strong className="text-blue-900 block font-bold text-base">Utility Shifting & Tree Felling</strong>
                <span className="text-slate-700 mt-1 block">Translocation of high-tension power transmission lines, municipal water mains, petroleum pipelines, and tree enumeration.</span>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <strong className="text-purple-900 block font-bold text-base">Geological Anomalies & Terrain Challenges</strong>
                <span className="text-slate-700 mt-1 block">Sub-surface tunneling faults in Himalayan belt, extended monsoon inundation, and contractor equipment mobilization.</span>
              </div>
            </div>

            <p className="leading-relaxed">
              <strong className="text-slate-900">3. Conclusion & Recommendations:</strong> It is imperative that administrative ministries institutionalize predictive analytics and proactive inter-ministerial coordination via PMG/Pragati mechanisms to resolve state-level RoW disputes and expedite final-stage clearances for the 765 projects in the 80-100% completion bracket.
            </p>
          </div>

          {/* Sign-off */}
          <div className="border-t-2 border-slate-900 pt-6 flex justify-between items-end text-sm">
            <div>
              <span className="font-bold text-slate-900 block text-base">Infrastructure & Project Monitoring Division</span>
              <span className="text-slate-600">Ministry of Statistics and Programme Implementation</span>
            </div>
            <div className="text-right font-mono text-xs sm:text-sm text-slate-500 font-semibold">
              Approved for Official Dissemination
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABLE 1: SECTOR-WISE DISTRIBUTION VIEW (Pages 3-4) */}
      {/* ========================================================================= */}
      {currentPage === 'table1_sectors' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-md space-y-6">
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono font-bold text-purple-900">TABLE 1 • PAGES 3-4</div>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Overview of Ongoing Projects: Sector-wise Distribution
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Values in ₹ Crore</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-900 text-white font-mono text-[11px]">
                <tr>
                  <th className="p-3">Sector</th>
                  <th className="p-3 text-center">No. of Projects</th>
                  <th className="p-3 text-right">Original Cost</th>
                  <th className="p-3 text-right">Anticipated Cost</th>
                  <th className="p-3 text-right">Cost Overrun</th>
                  <th className="p-3 text-right">% Overrun</th>
                  <th className="p-3 text-right">Expenditure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {sectorTableData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="p-3 font-sans font-bold text-slate-900">{s.sector}</td>
                    <td className="p-3 text-center font-bold text-purple-900">{s.count}</td>
                    <td className="p-3 text-right text-slate-600">₹{s.origCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{s.antCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={`p-3 text-right font-bold ${s.overrun > 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                      ₹{s.overrun.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${s.overrunPct > 15 ? 'bg-rose-100 text-rose-800' : s.overrunPct > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        +{s.overrunPct}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-emerald-800 font-bold">₹{s.exp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-purple-950 text-white font-mono text-xs font-bold">
                <tr>
                  <td className="p-3">TOTAL (18 SECTORS)</td>
                  <td className="p-3 text-center">1,734</td>
                  <td className="p-3 text-right">₹28,42,540.23</td>
                  <td className="p-3 text-right text-amber-300">₹31,58,147.58</td>
                  <td className="p-3 text-right text-rose-300">₹3,15,607.35</td>
                  <td className="p-3 text-right">+11.10%</td>
                  <td className="p-3 text-right text-emerald-300">₹17,74,657.72</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TABLE 2: STATE-WISE DISTRIBUTION VIEW (Pages 5-7) */}
      {/* ========================================================================= */}
      {currentPage === 'table2_states' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-md space-y-6">
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono font-bold text-purple-900">TABLE 2 • PAGES 5-7</div>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Overview of Ongoing Projects: State-wise Distribution
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Values in ₹ Crore</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-900 text-white font-mono text-[11px]">
                <tr>
                  <th className="p-3">State / Union Territory</th>
                  <th className="p-3 text-center">Total Projects</th>
                  <th className="p-3 text-right">Total Anticipated Outlay</th>
                  <th className="p-3 text-center">Projects with Delays</th>
                  <th className="p-3 text-right">% of Total National Outlay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {stateTableData.map((st, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="p-3 font-sans font-bold text-slate-900">{st.state}</td>
                    <td className="p-3 text-center font-bold text-purple-900">{st.count}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{st.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                        {st.delayedCount} Delayed
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {((st.cost / MOSPI_REPORT_METRICS.totalOngoingAnticipatedCostCr) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PROJECT LISTS (Tables 3-7) */}
      {/* ========================================================================= */}
      {currentPage === 'table_projects' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-md space-y-6">
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-purple-900">OFFICIAL PROJECT REGISTRY • PAGES 8 - 252</div>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Central Sector Projects List (₹150 Cr & Above)
              </h2>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, name, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600 w-48"
                />
              </div>

              <select
                value={selectedSectorFilter}
                onChange={(e) => setSelectedSectorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">All Sectors</option>
                <option value="Road">Road Transport & Highways</option>
                <option value="Rail">Railways</option>
                <option value="Power">Power & Renewable</option>
                <option value="Petroleum">Petroleum & Natural Gas</option>
                <option value="Coal">Coal & Mines</option>
                <option value="Urban">Urban Metro</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-900 text-white font-mono text-[11px]">
                <tr>
                  <th className="p-2.5">Code / Agency</th>
                  <th className="p-2.5">Project Name</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5 text-right">Original (₹ Cr)</th>
                  <th className="p-2.5 text-right">Revised (₹ Cr)</th>
                  <th className="p-2.5 text-center">Delay</th>
                  <th className="p-2.5 text-center">Physical %</th>
                  <th className="p-2.5 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {projects
                  .filter(p => {
                    if (selectedSectorFilter !== 'ALL' && !p.sector.toLowerCase().includes(selectedSectorFilter.toLowerCase())) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.projectCode.toLowerCase().includes(q) || p.state.toLowerCase().includes(q);
                  })
                  .slice(0, 50)
                  .map((p) => (
                    <tr 
                      key={p.id}
                      onClick={() => onSelectProject && onSelectProject(p)}
                      className="hover:bg-purple-50/60 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-bold text-purple-900 whitespace-nowrap">
                        [{p.projectCode}]<br/>
                        <span className="text-[9px] text-slate-400 font-normal">{p.implementingAgency}</span>
                      </td>
                      <td className="p-2.5 font-sans font-bold text-slate-900 max-w-[200px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="p-2.5 font-sans text-slate-600 whitespace-nowrap">{p.state}</td>
                      <td className="p-2.5 text-right text-slate-600">₹{p.originalCost.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">₹{p.revisedCost.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded-md font-bold ${p.delayMonths > 24 ? 'bg-rose-100 text-rose-900' : p.delayMonths > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                          {p.delayMonths > 0 ? `+${p.delayMonths}m` : '0m'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-purple-950">{p.physicalProgress}%</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' : p.riskLevel === 'HIGH' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'}`}>
                          {p.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ABBREVIATIONS VIEW (Pages 253-256) */}
      {/* ========================================================================= */}
      {currentPage === 'abbreviations' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-md max-w-4xl mx-auto space-y-6">
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase">ABBREVIATIONS USED IN REPORT</h2>
              <p className="text-xs text-slate-500 font-mono">Official Reference Guide • Pages 253 - 256</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">MoSPI</strong>
              <span className="text-slate-600 font-sans">Ministry of Statistics and Programme Implementation</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">OCMS</strong>
              <span className="text-slate-600 font-sans">Online Computerized Monitoring System</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">NHAI</strong>
              <span className="text-slate-600 font-sans">National Highways Authority of India</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">DFCCIL</strong>
              <span className="text-slate-600 font-sans">Dedicated Freight Corridor Corporation of India Ltd</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">NHPC</strong>
              <span className="text-slate-600 font-sans">National Hydroelectric Power Corporation</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">PGCIL</strong>
              <span className="text-slate-600 font-sans">Power Grid Corporation of India Limited</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">NRL / IOCL / ONGC</strong>
              <span className="text-slate-600 font-sans">Numaligarh Refinery / Indian Oil / Oil & Natural Gas Corp</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-purple-950 font-bold block text-sm">MMRCL / BMRCL</strong>
              <span className="text-slate-600 font-sans">Mumbai Metro Rail Corp / Bangalore Metro Rail Corp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
