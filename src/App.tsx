import React, { useState, useMemo } from 'react';
import { InfrastructureProject, EarlyWarningAlert } from './types';
import { MOCK_PROJECTS, generateEarlyWarnings } from './data/mockProjects';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { FloatingChatbot } from './components/common/FloatingChatbot';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsTableView } from './components/projects/ProjectsTableView';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { EarlyWarningsView } from './components/early-warnings/EarlyWarningsView';
import { PredictiveAnalyticsView } from './components/predictive/PredictiveAnalyticsView';
import { BenchmarkingView } from './components/benchmarking/BenchmarkingView';
import { ScenarioAnalysisView } from './components/scenario/ScenarioAnalysisView';
import { InterventionsView } from './components/interventions/InterventionsView';
import { EscalationDriversView } from './components/drivers/EscalationDriversView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView, UserSession } from './components/auth/LoginView';
import { DataImportView } from './components/import/DataImportView';
import { MilestonesView } from './components/milestones/MilestonesView';
import { IssuesView } from './components/issues/IssuesView';
import { DataQualityView } from './components/quality/DataQualityView';
import { UserManagementView } from './components/users/UserManagementView';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Application Data State
  const [projects, setProjects] = useState<InfrastructureProject[]>(MOCK_PROJECTS);
  
  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<InfrastructureProject | null>(null);
  const [targetModuleProjectId, setTargetModuleProjectId] = useState<string>(MOCK_PROJECTS[0]?.id || '');

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

  const handleResetData = () => {
    setProjects(MOCK_PROJECTS);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginView onLogin={(user) => { setCurrentUser(user); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="h-screen w-screen bg-[#f3f4f8] text-slate-900 flex flex-col overflow-hidden font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Sleek Top Navigation Header - Fixed at Top */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSearch={() => handleNavigate('projects')}
        criticalCount={criticalCount}
        warningCount={highRiskCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        projects={projects}
        onSelectProject={handleSelectProject}
      />

      {/* Main Body Layout Area - Full height remaining */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Left Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          criticalCount={criticalCount}
          highRiskCount={highRiskCount}
        />

        {/* Content Container - Independently Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full h-full">
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

          {activeView === 'milestones' && (
            <MilestonesView
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeView === 'issues' && (
            <IssuesView
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeView === 'data-quality' && (
            <DataQualityView
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeView === 'users' && (
            <UserManagementView currentUser={currentUser || undefined} />
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

          {activeView === 'drivers' && (
            <EscalationDriversView
              projects={projects}
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

          {activeView === 'data-import' && (
            <DataImportView 
              onImportSuccess={(newProjects) => setProjects(newProjects)} 
              onNavigate={handleNavigate} 
            />
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

      {/* Global AI Floating Chatbot Bubble */}
      <FloatingChatbot projects={projects} activeProject={selectedProjectForDetail} />
    </div>
  );
}
