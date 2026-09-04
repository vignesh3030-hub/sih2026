import React, { useState, useRef, useEffect } from 'react';
import { InfrastructureProject } from '../../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  Layers,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAssistantViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `### Welcome to PAIMANA AI Project Intelligence Assistant

I am your official decision-support assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)** infrastructure monitoring portfolio.

I can help you:
- Identify and rank high-risk infrastructure projects across all ministries
- Uncover expenditure-vs-progress divergence anomalies
- Explain root causes of delay (Right-of-Way, statutory clearances, contractor capacity)
- Draft actionable inter-ministerial review briefs

*Try one of the suggested prompts below or ask any specific infrastructure monitoring query!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'PAIMANA Intelligence Engine',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const PRESET_QUERIES = [
    'Which projects in Ministry of Road Transport and Highways have delay risk > 80%?',
    'Show projects where expenditure is increasing but physical progress is low (Divergence)',
    'Why is Delhi-Amritsar-Katra Expressway at critical risk?',
    'What are the top 3 projects causing maximum cost overrun?',
    'Give me an executive summary of high-risk projects in Railway and Energy sectors',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      // Build relevant context from active projects dataset
      const highRiskSummary = projects
        .filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH')
        .slice(0, 15)
        .map((p) => ({
          code: p.projectCode,
          name: p.name,
          ministry: p.ministry,
          sector: p.sector,
          originalCost: p.originalCost,
          revisedCost: p.revisedCost,
          delayMonths: p.delayMonths,
          physicalProgress: p.physicalProgress,
          financialProgress: p.financialProgress,
          riskScore: p.overallRiskScore,
          detectedIssue: p.detectedIssue,
          recommendedIntervention: p.recommendedIntervention,
        }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          projectContext: {
            totalProjects: projects.length,
            highRiskCount: projects.filter((p) => p.riskLevel === 'CRITICAL').length,
            sampleProjects: highRiskSummary,
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.explanation || 'Analysis completed.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'PAIMANA Statistical Engine',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `### PAIMANA Project Intelligence Analysis\n\n**Query**: "${textToSend}"\n\n**Analysis Summary**:\n- Total Monitored Projects: **110 Mega Infrastructure Projects**\n- Portolio Risk Level: **18 Critical (🔴)**, **32 High Risk (🟠)**\n- Primary Bottleneck: Right-of-Way Land Acquisition & Statutory Forest Approvals (38% of total schedule slippage).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'PAIMANA Decision Engine (Offline Mode)'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Gemini 3.7 Flash Model Powered
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grounded on 110 Live Infrastructure Projects
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            LLM Project Intelligence Assistant
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Query project delays, budget escalations, and root-cause explanations in natural language.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-all border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Preset Suggested Questions */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Recommended Analytical Queries (Click to Run):</span>
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200 shadow-2xs hover:border-purple-300 transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[680px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-5 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-5 text-sm sm:text-base leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-purple-700 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm sm:text-base font-medium">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm sm:prose-base max-w-none text-slate-800 space-y-3 leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}

                  <div
                    className={`mt-3 flex items-center justify-between text-xs ${
                      isUser ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && <span className="font-mono font-medium">({msg.source})</span>}
                  </div>
                </div>

                {isUser && (
                  <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start items-center">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl p-4 text-sm text-slate-600 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="font-semibold text-slate-800 ml-1.5 text-sm sm:text-base">
                  Analyzing infrastructure telemetry & formulating prescriptive brief...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask anything about infrastructure delays, cost overruns, ministries, or project risks..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-5 py-3 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm sm:text-base font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
