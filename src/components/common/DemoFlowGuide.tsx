import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Play, RotateCcw } from 'lucide-react';

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  targetView: string;
  targetProjectId?: string;
  actionHint: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: '1. Executive Dashboard',
    description: 'Monitor overall portfolio health, total expenditure (₹ Cr), cost overruns, and sector/ministry distributions.',
    targetView: 'dashboard',
    actionHint: 'Review key portfolio KPIs and high-risk indicators across sectors.',
  },
  {
    stepNumber: 2,
    title: '2. High-Risk Projects Identification',
    description: 'AI model flags critical delayed projects with acute expenditure-progress divergence.',
    targetView: 'dashboard',
    actionHint: 'Notice the 18 Critical Projects flagged with red badges and alert cards.',
  },
  {
    stepNumber: 3,
    title: '3. Project Risk Table (Risk Monitor)',
    description: 'Explore the searchable multi-criteria filterable table with real-time risk scores.',
    targetView: 'projects',
    actionHint: 'Filter by Ministry, Sector, State, and Risk Level.',
  },
  {
    stepNumber: 4,
    title: '4. Critical Project Deep-Dive',
    description: 'Select a critical project from the official MoSPI database for detailed diagnosis.',
    targetView: 'projects',
    targetProjectId: 'proj-180100221-1',
    actionHint: 'Click on Subansiri Lower HEP (or another critical project) to open project analytics.',
  },
  {
    stepNumber: 5,
    title: '5. Cost & Delay Predictions',
    description: 'ML algorithms compute Overrun Probability, Delay Slippage, and Revised Cost based on MoSPI benchmarks.',
    targetView: 'predictive',
    targetProjectId: 'proj-180100221-1',
    actionHint: 'Inspect the Cost and Delay ML prediction engines and major escalation drivers.',
  },
  {
    stepNumber: 6,
    title: '6. AI Risk Explainability (XAI)',
    description: 'Explainable AI details exact SHAP feature importance: progress deficit, forest ROW, and financial burn.',
    targetView: 'projects',
    targetProjectId: 'proj-180100221-1',
    actionHint: 'View the horizontal contributing factors chart and root-cause breakdown.',
  },
  {
    stepNumber: 7,
    title: '7. AI Early Warning System',
    description: 'Real-time alert engine generates automated multi-tier warnings with trigger metrics and deadlines.',
    targetView: 'early-warnings',
    actionHint: 'Examine Critical alerts, root causes, and acknowledge active warnings.',
  },
  {
    stepNumber: 8,
    title: '8. Prescriptive Interventions',
    description: 'System synthesizes Issue → Evidence → Recommended Action for high-level decision makers.',
    targetView: 'interventions',
    targetProjectId: 'proj-180100221-1',
    actionHint: 'Review the actionable MoSPI/Cabinet Committee directive for the project.',
  },
  {
    stepNumber: 9,
    title: '9. What-If Scenario Simulation',
    description: 'Simulate policy adjustments (resource availability, expenditure pacing, fast-track clearances).',
    targetView: 'scenario',
    targetProjectId: 'proj-180100221-1',
    actionHint: 'Adjust sliders to observe immediate Before-vs-After risk score recalculations.',
  },
  {
    stepNumber: 10,
    title: '10. LLM Project Intelligence Assistant',
    description: 'Query the official AI Assistant in natural language grounded on the live project database.',
    targetView: 'assistant',
    actionHint: 'Click a preset prompt or ask "Which projects have increasing expenditure but low progress?".',
  },
  {
    stepNumber: 11,
    title: '11. Executive Decision Brief & Export',
    description: 'Generate comprehensive MoSPI-ready infrastructure risk assessment reports.',
    targetView: 'reports',
    actionHint: 'Review and export the official printable decision-support brief.',
  },
];

interface DemoFlowGuideProps {
  currentStep: number;
  onSelectStep: (step: DemoStep) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const DemoFlowGuide: React.FC<DemoFlowGuideProps> = ({
  currentStep,
  onSelectStep,
  isOpen,
  onToggle,
}) => {
  const activeStep = DEMO_STEPS.find((s) => s.stepNumber === currentStep) || DEMO_STEPS[0];

  const handleNext = () => {
    const nextStep = DEMO_STEPS.find((s) => s.stepNumber === currentStep + 1);
    if (nextStep) {
      onSelectStep(nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = DEMO_STEPS.find((s) => s.stepNumber === currentStep - 1);
    if (prevStep) {
      onSelectStep(prevStep);
    }
  };

  const handleRestart = () => {
    onSelectStep(DEMO_STEPS[0]);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-open-demo-flow"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-amber-300 hover:bg-slate-800 shadow-xl border border-amber-400/40 text-xs font-semibold tracking-wide transition-all transform hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>SIH 2026 Demo Flow ({currentStep}/11)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 md:right-8 z-40 w-full max-w-lg bg-[#3b0a45] text-white rounded-2xl shadow-2xl border border-purple-900/80 p-4 transition-all animate-in fade-in slide-in-from-bottom-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400/30">
            {activeStep.stepNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">SIH 2026 Interactive Demo Flow</span>
              <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-200 font-mono">Step {activeStep.stepNumber} of 11</span>
            </div>
            <h4 className="text-sm font-semibold text-purple-50">{activeStep.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRestart}
            title="Restart Demo"
            className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggle}
            className="text-purple-300 hover:text-white text-xs px-2 py-1 hover:bg-white/10 rounded-lg"
          >
            Minimize
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="py-3">
        <p className="text-xs text-purple-100/90 leading-relaxed">{activeStep.description}</p>
        <div className="mt-2.5 flex items-start gap-2 bg-purple-950/80 border border-purple-800/60 rounded-xl p-2.5 text-xs text-amber-200/90">
          <Play className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-white">Suggested Action: </span>
            {activeStep.actionHint}
          </div>
        </div>
      </div>

      {/* Step Pills Navigator */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 border-t border-purple-900/60 mb-3 scrollbar-none">
        {DEMO_STEPS.map((s) => (
          <button
            key={s.stepNumber}
            onClick={() => onSelectStep(s)}
            className={`w-6 h-6 shrink-0 rounded-full text-[11px] font-bold transition-all ${
              s.stepNumber === currentStep
                ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-300/40'
                : s.stepNumber < currentStep
                ? 'bg-emerald-500 text-white'
                : 'bg-purple-950 text-purple-300 hover:bg-purple-900'
            }`}
          >
            {s.stepNumber < currentStep ? '✓' : s.stepNumber}
          </button>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-purple-900/60">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 text-purple-200 hover:bg-purple-900 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] text-purple-300/80 hidden sm:inline">
          Predict → Explain → Alert → Recommend → Act
        </span>

        <button
          onClick={handleNext}
          disabled={currentStep === 11}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold text-xs transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none"
        >
          <span>Next Step</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
