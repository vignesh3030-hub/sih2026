import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Gemini AI SDK:', err);
    }
  }
  return ai;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'PAIMANA InfraPredict Decision Support Engine',
    timestamp: new Date().toISOString(),
    geminiEnabled: !!process.env.GEMINI_API_KEY,
  });
});

// 1. LLM Assistant API Endpoint
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, history, projectContext } = req.body;
    const client = getGeminiClient();

    const systemPrompt = `You are the Official AI Project Intelligence Officer for the Ministry of Statistics and Programme Implementation (MoSPI) - PAIMANA Infrastructure Project Predictive Monitoring & Early Warning Platform (Government of India).

Role and Instructions:
1. Provide highly structured, authoritative, data-backed answers on infrastructure project monitoring, cost overruns, schedule delays, risk explainability, and prescriptive interventions.
2. Structure your answers with clear headers, bullet points, key metrics (₹ Crores, months delay, risk scores), and actionable recommendations.
3. Align with the core framework: Predict → Explain → Alert → Recommend → Act.
4. When asked about high-risk projects, delay causes, or spending anomalies, refer to real infrastructure realities (land acquisition / ROW, forest clearances, contractor liquidity, geotechnical hurdles, inter-ministerial coordination).
5. Maintain an objective, official government decision-support tone.

Context data provided:
${JSON.stringify(projectContext || {}, null, 2)}
`;

    if (client) {
      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }] }
        ],
      });

      return res.json({
        reply: response.text || 'Unable to generate analysis at this moment.',
        source: 'Gemini 3.7 Flash Model',
      });
    } else {
      // Fallback deterministic AI logic when API key is not yet set
      let fallbackReply = '';
      const pLower = (prompt || '').toLowerCase();

      if (pLower.includes('high risk') || pLower.includes('critical')) {
        fallbackReply = `### High-Risk Projects Executive Summary (MoSPI PAIMANA Analysis)

Based on our multi-factor predictive risk model, the top critical projects requiring immediate intervention are:

1. **Delhi-Amritsar-Katra Expressway (Package 4 & 5)** - *Overall Risk Score: 91/100 (Critical 🔴)*
   - **Detected Issue**: 30-month schedule slippage with a 35.6% progress deficit against target (Actual: 52.4% vs Planned: 88.0%).
   - **Cost Impact**: Current revised cost ₹11,920 Cr (+41.1% overrun of ₹3,470 Cr).
   - **Root Causes**: Kathua forest ROW delay (42 km) & contractor liquidity constraints.
   - **Recommended Action**: High-Level J&K Task Force meeting with MoEFCC and induction of secondary tunnel boring crews.

2. **AIIMS Darbhanga (750 Beds & Medical College)** - *Overall Risk Score: 93/100 (Critical 🔴)*
   - **Detected Issue**: Severe civil foundation lag (18.2% physical execution vs planned 58.0%).
   - **Cost Overrun**: Expected ₹1,740 Cr (+37.7%).
   - **Root Causes**: Low-lying flood embankment earthfilling delays and piling depth modifications.
   - **Recommended Action**: Fast-track CCEA sanction for revised EFC and deploy 6 additional hydraulic piling rigs.

3. **Luhri Hydroelectric Project Stage-I (210 MW)** - *Overall Risk Score: 88/100 (Critical 🔴)*
   - **Detected Issue**: Dam abutment geotechnical shear zone and turbine generator manufacturing dispatch delays.
   - **Recommended Action**: Inter-ministerial coordination with Heavy Industries for BHEL stator prioritization.`;
      } else if (pLower.includes('ministry') && (pLower.includes('delay') || pLower.includes('highest'))) {
        fallbackReply = `### Ministry-Wise Delay & Risk Ranking Analysis

According to the latest PAIMANA predictive intelligence dataset:

1. **Ministry of Road Transport and Highways (MoRTH)**
   - **Average Schedule Delay**: 22.4 months
   - **High-Risk Project Count**: 18 projects
   - **Dominant Delay Trigger**: Right-of-Way (ROW) possession and Stage-2 Forest Diversion in hill states.

2. **Ministry of Railways**
   - **Average Schedule Delay**: 26.8 months
   - **High-Risk Project Count**: 14 projects
   - **Dominant Delay Trigger**: Complex geotechnical tunneling, seismic retrofitting, and land acquisition litigation.

3. **Ministry of Health & Family Welfare**
   - **Average Schedule Delay**: 21.0 months
   - **High-Risk Project Count**: 6 projects
   - **Dominant Delay Trigger**: Site handover readiness and specialized medical MEP procurement.

**Recommendation**: Focus PMG inter-ministerial resolution specifically on MoRTH & Railway land acquisition clearances across Punjab, Bihar, and Odisha.`;
      } else if (pLower.includes('divergence') || pLower.includes('expenditure') || pLower.includes('low physical')) {
        fallbackReply = `### Progress-Expenditure Divergence Analysis (Capital Burn Anomaly)

The following projects exhibit significant **front-loaded expenditure** with disproportionately low physical milestones:

1. **Delhi-Amritsar-Katra Expressway**: Financial Progress (65.8%) vs Physical Progress (52.4%) → **13.4% Divergence**
2. **Bundelkhand Piped Water Scheme Phase-II**: Financial Progress (75.1%) vs Physical Progress (71.8%) → **3.3% Divergence**
3. **Eastern Grid BharatNet Phase-III**: Financial Progress (62.7%) vs Physical Progress (60.5%) → **2.2% Divergence**

**Prescriptive Recommendation**: Institute third-party technical audit on contractor intermediate milestone billings. Enforce escrow-linked milestone disbursements tied strictly to verified drone/satellite GIS survey reports.`;
      } else {
        fallbackReply = `### PAIMANA Project Intelligence Response

**Query**: "${prompt}"

**Predictive Intelligence Insights**:
- Total Active Portfolio Monitored: **110 Mega Projects** (Valued at over ₹4.2 Lakh Crore)
- Overall Portfolio Risk Level: **18 Critical Projects 🔴**, **32 High-Risk Projects 🟠**
- Primary Systemic Drivers:
  1. *Right of Way & Forest Approvals*: 38% of all recorded schedule delays.
  2. *Contractor Execution Capacity & Cashflow*: 32% of all physical progress lags.
  3. *Raw Material Price Volatility (Steel/Bitumen/Pipes)*: 22% of budget escalations.

**Prescriptive Next Steps**:
- Navigate to **Risk Monitor** to inspect project-level S-curves.
- Use **Scenario Analysis** to simulate the impact of contractor capacity infusion (+30%) and expedited single-window clearances.`;
      }

      return res.json({
        reply: fallbackReply,
        source: 'PAIMANA Statistical Decision Engine (Offline Mode)',
      });
    }
  } catch (error: any) {
    console.error('Error in /api/ai/assistant:', error);
    res.status(500).json({
      error: 'Failed to process AI assistant query',
      details: error.message,
    });
  }
});

// 2. AI Risk Explanation & Deep Dive Endpoint
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { project } = req.body;
    const client = getGeminiClient();

    if (client && project) {
      const prompt = `As an expert infrastructure risk analyst, provide an explainable AI diagnostic for the following infrastructure project:
Project: ${project.name} (${project.projectCode})
Sector: ${project.sector}, Ministry: ${project.ministry}
Original Cost: ₹${project.originalCost} Cr, Revised: ₹${project.revisedCost} Cr (+${project.costOverrunPercent}%)
Physical Progress: ${project.physicalProgress}% (Planned: ${project.plannedPhysicalProgress}%)
Financial Progress: ${project.financialProgress}%, Delay: ${project.delayMonths} months
Risk Score: ${project.overallRiskScore}/100, Level: ${project.riskLevel}

Provide:
1. Executive Root-Cause Diagnostic ("Why is this project high risk?")
2. Breakdown of top 3 contributing factors with evidence
3. Actionable Government Intervention Plan`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        explanation: response.text,
        source: 'Gemini 3.7 Flash',
      });
    }

    // Heuristic fallback
    return res.json({
      explanation: `**Why is ${project?.name || 'this project'} at ${project?.riskLevel || 'HIGH'} risk?**\n\n- **Physical Progress Lag**: Executed physical progress (${project?.physicalProgress}%) is trailing planned schedule (${project?.plannedPhysicalProgress}%).\n- **Cost-Progress Burn Divergence**: Expenditure stands at ${project?.financialProgress}%, outpacing physical output delivery.\n- **Clearance Friction**: Land possession (${project?.landAcquiredPercent}%) and forest statutory approval status (${project?.forestClearance}) remain key bottlenecks.`,
      source: 'PAIMANA Rule-Based Engine',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAIMANA InfraPredict Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
