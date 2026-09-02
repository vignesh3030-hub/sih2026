import React, { useState, useMemo } from 'react';
import { InfrastructureProject, EarlyWarningAlert } from './types';
import { MOCK_PROJECTS, generateEarlyWarnings } from './data/mockProjects';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoFlowGuide, DemoStep, DEMO_STEPS } from './components/common/DemoFlowGuide';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsTableView } from './components/projects/ProjectsTableView';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { EarlyWarningsView } from './components/early-warnings/EarlyWarningsView';
import { PredictiveAnalyticsView } from './components/predictive/PredictiveAnalyticsView';
import { BenchmarkingView } from './components/benchmarking/BenchmarkingView';
import { ScenarioAnalysisView } from './components/scenario/ScenarioAnalysisView';
import { InterventionsView } from './components/interventions/InterventionsView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Application Data State
  const [projects, setProjects] = useState<InfrastructureProject[]>(MOCK_PROJECTS);
  
  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<InfrastructureProject | null>(null);
  const [targetModuleProjectId, setTargetModuleProjectId] = useState<string>(MOCK_PROJECTS[0]?.id || '');

  // SIH 2026 Interactive Demo Flow State
  const [demoGuideOpen, setDemoGuideOpen] = useState<boolean>(true);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);

  // Derived Alerts
  const alerts = useMemo(() => generateEarlyWarnings(projects), [projects]);
  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highRiskCount = alerts.filter(a => a.riskLevel === 'HIGH').length;

  // Handle Navigation
  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Project Selection for Detail Inspection Modal
  const handleSelectProject = (project: InfrastructureProject) => {
    setSelectedProjectForDetail(project);
    setTargetModuleProjectId(project.id);
  };

  // Handle Direct Navigation to Specific Analytical Module for a Project
  const handleNavigateToModule = (view: string, projectId: string) => {
    setSelectedProjectForDetail(null);
    setTargetModuleProjectId(projectId);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Demo Flow Step Click
  const handleSelectDemoStep = (step: DemoStep) => {
    setCurrentDemoStep(step.stepNumber);
    setActiveView(step.targetView);

    if (step.targetProjectId) {
      const proj = projects.find(p => p.id === step.targetProjectId);
      if (proj) {
        setTargetModuleProjectId(proj.id);
        // If step 4 or step 6, pop open the project details / XAI modal
        if (step.stepNumber === 4 || step.stepNumber === 6) {
          setSelectedProjectForDetail(proj);
        } else {
          setSelectedProjectForDetail(null);
        }
      }
    } else {
      setSelectedProjectForDetail(null);
    }
  };

  const handleResetData = () => {
    setProjects(MOCK_PROJECTS);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Sleek Top Navigation Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSearch={() => handleNavigate('projects')}
        onToggleDemoGuide={() => setDemoGuideOpen(prev => !prev)}
        demoGuideOpen={demoGuideOpen}
        demoStep={currentDemoStep}
        criticalCount={criticalCount}
        warningCount={highRiskCount}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sleek Purple Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          criticalCount={criticalCount}
          highRiskCount={highRiskCount}
        />

        {/* Content Container - Equal side margins covering full width */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          {activeView === 'dashboard' && (
            <DashboardView
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {(activeView === 'projects' || activeView === 'risk-monitor') && (
            <ProjectsTableView
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'early-warnings' && (
            <EarlyWarningsView
              alerts={alerts}
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'predictive' && (
            <PredictiveAnalyticsView
              projects={projects}
              selectedProjectId={targetModuleProjectId}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'benchmarking' && (
            <BenchmarkingView
              projects={projects}
              selectedProjectId={targetModuleProjectId}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'scenario' && (
            <ScenarioAnalysisView
              projects={projects}
              selectedProjectId={targetModuleProjectId}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'interventions' && (
            <InterventionsView
              projects={projects}
              selectedProjectId={targetModuleProjectId}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'assistant' && (
            <AiAssistantView
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>
      </div>

      {/* Project Deep-Dive Modal */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          onNavigateToModule={handleNavigateToModule}
        />
      )}

      {/* Interactive SIH 2026 Demo Walkthrough Guide */}
      <DemoFlowGuide
        currentStep={currentDemoStep}
        onSelectStep={handleSelectDemoStep}
        isOpen={demoGuideOpen}
        onToggle={() => setDemoGuideOpen(prev => !prev)}
      />
    </div>
  );
}
