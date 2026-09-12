import { InfrastructureProject, RiskLevel } from '../types';

export type QueryIntent =
  | 'RISK_REASON'
  | 'START_DATE_TIMELINE'
  | 'COST_BUDGET'
  | 'PROGRESS_STATUS'
  | 'CLEARANCES_REGULATORY'
  | 'INTERVENTIONS'
  | 'PORTFOLIO_QUERY'
  | 'FULL_PROFILE';

export interface ProjectMatchResult {
  bestMatch: InfrastructureProject | null;
  allMatches: InfrastructureProject[];
  confidence: number;
}

/**
 * Normalizes strings for flexible fuzzy and substring comparison
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common stop words to exclude when extracting project search keywords
 */
const STOP_WORDS = new Set([
  'what', 'when', 'why', 'how', 'who', 'where', 'which', 'is', 'are', 'was', 'were',
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'by', 'with', 'from',
  'project', 'projects', 'tell', 'me', 'about', 'give', 'show', 'detail', 'details',
  'information', 'info', 'status', 'start', 'started', 'starting', 'commence',
  'risk', 'risks', 'at', 'critical', 'high', 'low', 'cost', 'costs', 'delay', 'delays',
  'schedule', 'budget', 'please', 'explain', 'analysis', 'overview', 'code', 'id', 'name'
]);

/**
 * Inverted Index Structure for O(1) Token-based Project Lookups
 */
export class InvertedProjectIndex {
  private codeMap = new Map<string, InfrastructureProject>();
  private idMap = new Map<string, InfrastructureProject>();
  private tokenMap = new Map<string, Set<InfrastructureProject>>();
  private allProjects: InfrastructureProject[] = [];

  constructor(projects: InfrastructureProject[] = []) {
    if (projects.length > 0) {
      this.buildIndex(projects);
    }
  }

  public buildIndex(projects: InfrastructureProject[]) {
    this.allProjects = projects;
    this.codeMap.clear();
    this.idMap.clear();
    this.tokenMap.clear();

    for (const p of projects) {
      if (p.projectCode) {
        this.codeMap.set(normalizeText(p.projectCode), p);
      }
      if (p.id) {
        this.idMap.set(normalizeText(p.id), p);
      }

      // Index tokens from name, agency, sector, state
      const textToTokenize = `${p.name} ${p.implementingAgency} ${p.sector} ${p.state} ${p.district}`;
      const tokens = normalizeText(textToTokenize).split(' ');

      for (const token of tokens) {
        if (token.length >= 2 && !STOP_WORDS.has(token)) {
          let set = this.tokenMap.get(token);
          if (!set) {
            set = new Set<InfrastructureProject>();
            this.tokenMap.set(token, set);
          }
          set.add(p);
        }
      }
    }
  }

  public findFast(query: string, activeProject?: InfrastructureProject | null): ProjectMatchResult {
    const normQuery = normalizeText(query);
    if (!normQuery) {
      return activeProject
        ? { bestMatch: activeProject, allMatches: [activeProject], confidence: 100 }
        : { bestMatch: null, allMatches: [], confidence: 0 };
    }

    // Contextual references to "this project"
    if (
      activeProject &&
      (normQuery.includes('this project') ||
        normQuery.includes('the project') ||
        normQuery.includes('current project') ||
        normQuery.includes('it at risk') ||
        normQuery.includes('it start') ||
        normQuery === 'why' ||
        normQuery.startsWith('why is it') ||
        normQuery.startsWith('why is this') ||
        normQuery.startsWith('when did it') ||
        normQuery.startsWith('what is the cost') ||
        normQuery === 'status' ||
        normQuery === 'cost' ||
        normQuery === 'timeline')
    ) {
      return { bestMatch: activeProject, allMatches: [activeProject], confidence: 100 };
    }

    // Direct O(1) Exact Code or ID Lookup
    const codeMatch = this.codeMap.get(normQuery);
    if (codeMatch) {
      return { bestMatch: codeMatch, allMatches: [codeMatch], confidence: 100 };
    }

    const idMatch = this.idMap.get(normQuery);
    if (idMatch) {
      return { bestMatch: idMatch, allMatches: [idMatch], confidence: 100 };
    }

    // Check code substrings
    for (const [code, p] of this.codeMap.entries()) {
      if (code.length >= 4 && normQuery.includes(code)) {
        return { bestMatch: p, allMatches: [p], confidence: 100 };
      }
    }

    // Token intersection scoring over inverted index
    const queryTokens = normQuery.split(' ').filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
    const candidateScores = new Map<InfrastructureProject, number>();

    for (const token of queryTokens) {
      const matches = this.tokenMap.get(token);
      if (matches) {
        for (const proj of matches) {
          const current = candidateScores.get(proj) || 0;
          candidateScores.set(proj, current + 25);
        }
      }
    }

    if (candidateScores.size > 0) {
      const sorted: { project: InfrastructureProject; score: number }[] = [];

      for (const [proj, score] of candidateScores.entries()) {
        sorted.push({ project: proj, score });
      }

      sorted.sort((a, b) => b.score - a.score);

      return {
        bestMatch: sorted[0].project,
        allMatches: sorted.slice(0, 5).map((s) => s.project),
        confidence: Math.min(100, sorted[0].score),
      };
    }

    if (activeProject && !normQuery.includes('all projects') && !normQuery.includes('which projects') && !normQuery.includes('top projects')) {
      return { bestMatch: activeProject, allMatches: [activeProject], confidence: 80 };
    }

    return { bestMatch: null, allMatches: [], confidence: 0 };
  }
}

/**
 * Sub-millisecond LRU Response Cache
 */
export class QueryResponseCache {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private ttlMs: number;
  private maxSize: number;

  constructor(ttlMs = 300000, maxSize = 2000) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  public set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  public clear() {
    this.cache.clear();
  }
}

// Global Singleton Instance for High Performance Inverted Search Index & Cache
export const globalProjectIndex = new InvertedProjectIndex();
export const globalResponseCache = new QueryResponseCache();

/**
 * High-performance project finder utilizing Inverted Index & Cache
 */
export function findMatchingProjects(
  query: string,
  projects: InfrastructureProject[],
  activeProject?: InfrastructureProject | null
): ProjectMatchResult {
  const cacheKey = `match:${query}:${activeProject?.id || 'none'}:${projects.length}`;
  const cached = globalResponseCache.get(cacheKey);
  if (cached) return cached;

  // Build index if not built or size changed
  globalProjectIndex.buildIndex(projects);

  const result = globalProjectIndex.findFast(query, activeProject);
  globalResponseCache.set(cacheKey, result);
  return result;
}

/**
 * Detects the specific question intent from the user query
 */
export function detectQueryIntent(query: string): QueryIntent {
  const q = normalizeText(query);

  // 1. Risk Reason Intent: "why is it at risk", "why critical", "bottlenecks", "causes"
  if (
    q.includes('why') ||
    q.includes('risk') ||
    q.includes('critical') ||
    q.includes('bottleneck') ||
    q.includes('cause') ||
    q.includes('causes') ||
    q.includes('reason') ||
    q.includes('reasons') ||
    q.includes('issue') ||
    q.includes('danger') ||
    q.includes('problem')
  ) {
    return 'RISK_REASON';
  }

  // 2. Timeline & Start Date Intent: "when started", "start date", "target date", "completion"
  if (
    q.includes('when') ||
    q.includes('start') ||
    q.includes('started') ||
    q.includes('commence') ||
    q.includes('commission') ||
    q.includes('approval date') ||
    q.includes('completion date') ||
    q.includes('timeline') ||
    q.includes('finish') ||
    q.includes('how long') ||
    q.includes('duration') ||
    q.includes('delay month')
  ) {
    return 'START_DATE_TIMELINE';
  }

  // 3. Cost & Budget Intent: "cost overrun", "budget", "expenditure", "sanctioned"
  if (
    q.includes('cost') ||
    q.includes('budget') ||
    q.includes('expenditure') ||
    q.includes('overrun') ||
    q.includes('crore') ||
    q.includes('financial') ||
    q.includes('money') ||
    q.includes('spent') ||
    q.includes('funding') ||
    q.includes('sanction')
  ) {
    return 'COST_BUDGET';
  }

  // 4. Progress & Status Intent: "progress", "physical", "status", "how much completed"
  if (
    q.includes('progress') ||
    q.includes('physical') ||
    q.includes('status') ||
    q.includes('completed') ||
    q.includes('percent') ||
    q.includes('efficiency') ||
    q.includes('execution')
  ) {
    return 'PROGRESS_STATUS';
  }

  // 5. Clearances & Land Intent: "clearances", "forest", "land", "wildlife", "row"
  if (
    q.includes('clearance') ||
    q.includes('land') ||
    q.includes('forest') ||
    q.includes('wildlife') ||
    q.includes('row') ||
    q.includes('right of way') ||
    q.includes('acquisition') ||
    q.includes('court') ||
    q.includes('litigation')
  ) {
    return 'CLEARANCES_REGULATORY';
  }

  // 6. Interventions & Recommendations: "recommendation", "how to solve", "action", "who"
  if (
    q.includes('action') ||
    q.includes('recommend') ||
    q.includes('recommendation') ||
    q.includes('solution') ||
    q.includes('solve') ||
    q.includes('mitigate') ||
    q.includes('mitigation') ||
    q.includes('authority') ||
    q.includes('who is responsible') ||
    q.includes('intervention')
  ) {
    return 'INTERVENTIONS';
  }

  // 7. Portfolio Queries: "which projects", "top delayed", "railway projects", etc.
  if (
    q.includes('which projects') ||
    q.includes('top projects') ||
    q.includes('highest delay') ||
    q.includes('list projects') ||
    q.includes('all projects') ||
    q.includes('divergence')
  ) {
    return 'PORTFOLIO_QUERY';
  }

  // Default for a single project query: Full Comprehensive Profile
  return 'FULL_PROFILE';
}

function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL': return '🔴';
    case 'HIGH': return '🟠';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}

/**
 * Builds rich, data-backed markdown responses for specific project questions
 */
export function generateProjectIntelligenceResponse(
  query: string,
  projects: InfrastructureProject[],
  activeProject?: InfrastructureProject | null
): { reply: string; matchedProject?: InfrastructureProject; source: string; intent: QueryIntent } {
  const matchResult = findMatchingProjects(query, projects, activeProject);
  const intent = detectQueryIntent(query);

  // If a specific project was matched with confidence
  if (matchResult.bestMatch) {
    const p = matchResult.bestMatch;
    let reply = '';

    switch (intent) {
      case 'RISK_REASON': {
        reply = `### ${getRiskEmoji(p.riskLevel)} Risk Analysis: ${p.name}
**Project Code**: \`${p.projectCode}\` | **Agency**: ${p.implementingAgency} | **Ministry**: ${p.ministry}
**Overall Risk Score**: **${p.overallRiskScore}/100 — ${p.riskLevel}**

---

#### 🔍 Why is this project at risk?
1. **Primary Detected Issue**:
   - **${p.detectedIssue}**
2. **Schedule Slippage**:
   - The project is currently delayed by **${p.delayMonths} months** against its original completion schedule.
   - Physical progress is **${p.physicalProgress}%** against a planned target of **${p.plannedPhysicalProgress}%** (${p.plannedPhysicalProgress - p.physicalProgress}% execution deficit).
3. **Cost Escalation**:
   - Sanctioned Cost: **₹${p.originalCost.toLocaleString('en-IN')} Cr** → Revised Anticipated Cost: **₹${p.revisedCost.toLocaleString('en-IN')} Cr**
   - Cost Overrun: **+₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%)**
4. **Key Delay & Escalation Drivers**:
${p.majorDelayDrivers.map(d => `   - ⚠️ ${d}`).join('\n')}
${p.majorCostEscalationDrivers.map(d => `   - 💸 ${d}`).join('\n')}
5. **Statutory & Governance Clearances**:
   - **Land Acquired**: **${p.landAcquiredPercent}%**
   - **Environmental Clearance**: **${p.environmentalClearance}**
   - **Forest Clearance**: **${p.forestClearance}**
   - **Contractor Risk Rating**: **${p.contractorRiskRating}** (${p.contractorName})

---

#### 📊 Risk Pillars Breakdown
- **Schedule Risk Score**: **${p.scheduleRiskScore}/100** ${p.scheduleRiskScore > 70 ? '🔴' : '🟠'}
- **Cost Risk Score**: **${p.costRiskScore}/100** ${p.costRiskScore > 70 ? '🔴' : '🟡'}
- **Progress Deficit Risk**: **${p.progressRiskScore}/100** ${p.progressRiskScore > 70 ? '🔴' : '🟡'}
- **Expenditure-Progress Divergence**: **${p.expenditureProgressRiskScore}/100** ${p.expenditureProgressRiskScore > 70 ? '🔴' : '🟢'}

---

#### 🎯 Prescriptive AI Intervention
- **Prescribed Action**: ${p.recommendedIntervention}
- **Action Authority**: **${p.interventionAuthority}**
- **Expected Mitigation Impact**: *${p.expectedMitigationImpact}*`;
        break;
      }

      case 'START_DATE_TIMELINE': {
        reply = `### ⏱️ Timeline & Schedule Brief: ${p.name}
**Project Code**: \`${p.projectCode}\` | **State**: ${p.state} | **Sector**: ${p.sector}

---

#### 📅 Key Dates & Timeline
- **Project Sanction / Approval Date**: **${p.startDate}**
- **Construction Start Date**: **${p.startDate}**
- **Original Scheduled Completion Date**: **${p.originalCompletionDate}**
- **Current Anticipated Completion Date**: **${p.expectedCompletionDate}**
- **Current Schedule Delay**: **${p.delayMonths} Months** (${p.delayPercent}% duration overrun)
- **Current Status**: **${p.status}** (${getRiskEmoji(p.riskLevel)} ${p.riskLevel} Risk)

---

#### 📈 Execution Velocity & Progress
- **Physical Progress**: **${p.physicalProgress}%** (Planned Target: **${p.plannedPhysicalProgress}%**)
- **Duration**: Approved for **${p.originalDurationMonths} months**, now expected to take **${p.revisedDurationMonths} months**.

#### 📌 Major Milestones
${p.milestones.map(m => {
  const icon = m.status === 'Completed' ? '✅' : m.status === 'Delayed' ? '⚠️' : '🔄';
  return `- ${icon} **${m.name}** — Planned: \`${m.plannedDate}\` | Status: **${m.status}** (Weight: ${m.weight}%)`;
}).join('\n')}

#### ⚠️ Primary Causes of Timeline Delay
${p.majorDelayDrivers.map(d => `- ${d}`).join('\n')}`;
        break;
      }

      case 'COST_BUDGET': {
        const divergenceNote = p.progressExpenditureDivergence > 5
          ? `⚠️ **Capital Burn Divergence Detected**: Financial expenditure (${p.financialProgress}%) is outstripping physical execution (${p.physicalProgress}%) by **${p.progressExpenditureDivergence}%**. Intermediate billings require audit.`
          : `✅ Expenditure ratio is aligned with physical execution (Divergence: ${p.progressExpenditureDivergence}%).`;

        reply = `### 💰 Financial & Cost Breakdown: ${p.name}
**Project Code**: \`${p.projectCode}\` | **Implementing Agency**: ${p.implementingAgency}

---

#### 💵 Budget & Expenditure Metrics
- **Original Approved Cost**: **₹${p.originalCost.toLocaleString('en-IN')} Cr**
- **Revised / Anticipated Cost**: **₹${p.revisedCost.toLocaleString('en-IN')} Cr**
- **Cumulative Expenditure to Date**: **₹${p.expenditure.toLocaleString('en-IN')} Cr**
- **Cost Overrun**: **+₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%)**
- **Financial Progress**: **${p.financialProgress}%** of revised cost envelope
- **Physical Progress Achieved**: **${p.physicalProgress}%**

---

#### ⚡ Capital Burn & Divergence Anomaly
${divergenceNote}

#### 📉 Primary Cost Escalation Drivers
${p.majorCostEscalationDrivers.map(d => `- 💸 ${d}`).join('\n')}

---

#### 🎯 Recommended Financial Intervention
- **Action**: Submit Revised Cost Estimate (RCE) / Revised Cost Committee (RCC) note.
- **Authority**: **${p.interventionAuthority}**`;
        break;
      }

      case 'PROGRESS_STATUS': {
        reply = `### 🏗️ Execution & Progress Status: ${p.name}
**Project Code**: \`${p.projectCode}\` | **Sector**: ${p.sector} | **State**: ${p.state}

---

#### 📊 Progress Summary
- **Current MoSPI Status**: **${p.status}** (${getRiskEmoji(p.riskLevel)} **${p.riskLevel}**)
- **Physical Progress**: **${p.physicalProgress}%** (Target: **${p.plannedPhysicalProgress}%**)
- **Financial Progress**: **${p.financialProgress}%** (₹${p.expenditure.toLocaleString('en-IN')} Cr spent out of ₹${p.revisedCost.toLocaleString('en-IN')} Cr)
- **Progress Efficiency Index**: **${p.progressEfficiencyIndex}** (Physical / Financial ratio)
- **Observed Schedule Delay**: **${p.delayMonths} Months**

---

#### 🏢 Project Governance
- **Ministry**: ${p.ministry}
- **Implementing Agency**: ${p.implementingAgency}
- **Lead Contractor**: ${p.contractorName}
- **Contractor Risk Rating**: **${p.contractorRiskRating}**
- **Land Acquired**: **${p.landAcquiredPercent}%**
- **Environmental Clearance**: **${p.environmentalClearance}** | **Forest Clearance**: **${p.forestClearance}**

---

#### ⚠️ Key Issue Flagged
${p.detectedIssue}`;
        break;
      }

      case 'CLEARANCES_REGULATORY': {
        reply = `### 📑 Statutory Clearances & Land Status: ${p.name}
**Project Code**: \`${p.projectCode}\` | **State**: ${p.state} (${p.district})

---

#### 🌲 Statutory Clearances Dashboard
- **Land Handover / Acquisition**: **${p.landAcquiredPercent}%** acquired
- **Environmental Clearance Status**: **${p.environmentalClearance}**
- **Forest & Wildlife Clearance Status**: **${p.forestClearance}**
- **Contractor Default Risk**: **${p.contractorRiskRating}** (${p.contractorName})

#### ⚠️ Regulatory Delay Triggers
${p.majorDelayDrivers.map(d => `- 📌 ${d}`).join('\n')}

#### 🏛️ Escalation Pathway
- **Escalate To**: **${p.interventionAuthority}**
- **Recommended Action**: Convene joint empowered review with State Chief Secretary & Forest Department for single-window ROW clearance.`;
        break;
      }

      case 'INTERVENTIONS': {
        reply = `### 🛡️ Prescriptive Intervention Plan: ${p.name}
**Project Code**: \`${p.projectCode}\` | **Overall Risk**: ${getRiskEmoji(p.riskLevel)} **${p.overallRiskScore}/100 (${p.riskLevel})**

---

#### 🚨 Root Problem Identified
**${p.detectedIssue}**

#### 📋 Actionable Prescription
1. **Immediate Intervention**:
   - ${p.recommendedIntervention}
2. **Empowered Authority to Act**:
   - **${p.interventionAuthority}**
3. **Expected Impact & Mitigation**:
   - *${p.expectedMitigationImpact}*
4. **Schedule Recovery**:
   - Recovers critical path delay of **${Math.min(p.delayMonths, 6)} months** and unblocks contractor cashflow.`;
        break;
      }

      case 'FULL_PROFILE':
      default: {
        reply = `### ${getRiskEmoji(p.riskLevel)} Project Brief: ${p.name}
**Project Code**: \`${p.projectCode}\` | **ID**: \`${p.id}\`
**Ministry**: ${p.ministry} | **Agency**: ${p.implementingAgency}
**Sector**: ${p.sector} | **State**: ${p.state} (${p.district})

---

#### 📊 Executive Snapshot
| Metric | Value | Status |
| :--- | :--- | :--- |
| **Overall Risk Score** | **${p.overallRiskScore}/100** | ${getRiskEmoji(p.riskLevel)} **${p.riskLevel}** |
| **Start / Approval Date** | **${p.startDate}** | - |
| **Original Completion** | **${p.originalCompletionDate}** | - |
| **Anticipated Completion** | **${p.expectedCompletionDate}** | +${p.delayMonths} mos delay |
| **Original Cost** | **₹${p.originalCost.toLocaleString('en-IN')} Cr** | - |
| **Revised Cost** | **₹${p.revisedCost.toLocaleString('en-IN')} Cr** | +₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%) |
| **Cumulative Expenditure** | **₹${p.expenditure.toLocaleString('en-IN')} Cr** | ${p.financialProgress}% burned |
| **Physical Progress** | **${p.physicalProgress}%** | Planned: ${p.plannedPhysicalProgress}% |

---

#### ⚠️ Why is this project at risk?
- **Detected Bottleneck**: ${p.detectedIssue}
- **Schedule Delay**: **${p.delayMonths} Months** delay due to:
${p.majorDelayDrivers.map(d => `  - ${d}`).join('\n')}
- **Cost Escalation**:
${p.majorCostEscalationDrivers.map(d => `  - ${d}`).join('\n')}

---

#### 🎯 Recommended MoSPI Intervention
- **Prescribed Action**: ${p.recommendedIntervention}
- **Action Authority**: **${p.interventionAuthority}**
- **Expected Impact**: *${p.expectedMitigationImpact}*

*💡 Tip: You can ask specific questions like "When did this project start?", "Why is it at risk?", or "What is its cost overrun?"*`;
        break;
      }
    }

    return {
      reply,
      matchedProject: p,
      source: 'PAIMANA Project Intelligence Engine',
      intent
    };
  }

  // If no single project was matched, handle portfolio-level questions
  return generatePortfolioResponse(query, projects, intent);
}

/**
 * Handles portfolio-wide questions (ministry delays, top risk projects, divergence)
 */
function generatePortfolioResponse(
  query: string,
  projects: InfrastructureProject[],
  intent: QueryIntent
): { reply: string; source: string; intent: QueryIntent } {
  const q = normalizeText(query);

  // 1. High Risk / Critical Projects
  if (q.includes('critical') || q.includes('high risk') || q.includes('top risk')) {
    const criticalProjects = [...projects]
      .sort((a, b) => b.overallRiskScore - a.overallRiskScore)
      .slice(0, 5);

    const reply = `### 🔴 Top Critical Infrastructure Projects (MoSPI PAIMANA Monitoring)

Based on our multi-factor predictive risk model, the top critical projects requiring immediate intervention are:

${criticalProjects.map((p, i) => `
${i + 1}. **${p.name}** (\`${p.projectCode}\`)
   - **Risk Score**: ${getRiskEmoji(p.riskLevel)} **${p.overallRiskScore}/100 (${p.riskLevel})**
   - **Ministry**: ${p.ministry} | **State**: ${p.state}
   - **Delay**: **+${p.delayMonths} months** | **Cost Overrun**: **+₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%)**
   - **Issue**: ${p.detectedIssue}
   - **Action**: ${p.recommendedIntervention}
`).join('\n')}

*Ask me about any of these project codes (e.g., \`${criticalProjects[0]?.projectCode}\`) for deep root-cause analysis!*`;

    return { reply, source: 'PAIMANA Portfolio Intelligence', intent: 'PORTFOLIO_QUERY' };
  }

  // 2. Highest Delays
  if (q.includes('delay') || q.includes('schedule')) {
    const delayedProjects = [...projects]
      .sort((a, b) => b.delayMonths - a.delayMonths)
      .slice(0, 5);

    const reply = `### ⏱️ Top Schedule Delay Projects Across Central Ministries

The projects suffering from maximum schedule delay are:

${delayedProjects.map((p, i) => `
${i + 1}. **${p.name}** (\`${p.projectCode}\`)
   - **Delay**: **${p.delayMonths} Months** (Sanctioned: \`${p.startDate}\` → Target was \`${p.originalCompletionDate}\`, now \`${p.expectedCompletionDate}\`)
   - **Physical Progress**: **${p.physicalProgress}%** achieved
   - **Primary Delay Drivers**: ${p.majorDelayDrivers[0] || 'Right of Way possession & statutory forest clearance'}
`).join('\n')}

*Type any project name or code to inspect its milestone S-curve and root causes.*`;

    return { reply, source: 'PAIMANA Portfolio Intelligence', intent: 'PORTFOLIO_QUERY' };
  }

  // 3. Highest Cost Overruns
  if (q.includes('cost') || q.includes('overrun') || q.includes('escalation')) {
    const costOverrunProjects = [...projects]
      .sort((a, b) => b.costOverrunAmount - a.costOverrunAmount)
      .slice(0, 5);

    const reply = `### 💸 Top Cost Overrun Projects (Budget Escalations)

The projects with highest absolute cost overruns in the monitored portfolio are:

${costOverrunProjects.map((p, i) => `
${i + 1}. **${p.name}** (\`${p.projectCode}\`)
   - **Cost Overrun**: **+₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%)**
   - **Original Cost**: ₹${p.originalCost.toLocaleString('en-IN')} Cr → **Anticipated**: ₹${p.revisedCost.toLocaleString('en-IN')} Cr
   - **Spent to Date**: ₹${p.expenditure.toLocaleString('en-IN')} Cr (${p.financialProgress}%)
   - **Drivers**: ${p.majorCostEscalationDrivers[0] || 'Scope expansion and EPC indexation'}
`).join('\n')}

*Send any project code or name to see the complete financial audit brief!*`;

    return { reply, source: 'PAIMANA Portfolio Intelligence', intent: 'PORTFOLIO_QUERY' };
  }

  // 4. Sector / Ministry queries (e.g. Railways, Highways, Power)
  const sectorKeywords: { [key: string]: string } = {
    railway: 'Railways',
    rail: 'Railways',
    highway: 'Road Transport & Highways',
    road: 'Road Transport & Highways',
    power: 'Power',
    petroleum: 'Petroleum & Natural Gas',
    coal: 'Coal',
    aviation: 'Civil Aviation',
    airport: 'Civil Aviation',
    metro: 'Urban Development'
  };

  for (const [kw, sectorName] of Object.entries(sectorKeywords)) {
    if (q.includes(kw)) {
      const sectorProjects = projects
        .filter(p => p.sector.toLowerCase().includes(kw) || p.ministry.toLowerCase().includes(kw))
        .sort((a, b) => b.overallRiskScore - a.overallRiskScore)
        .slice(0, 5);

      if (sectorProjects.length > 0) {
        const reply = `### 🚆 High-Risk Projects in ${sectorName}

Found **${projects.filter(p => p.sector.toLowerCase().includes(kw) || p.ministry.toLowerCase().includes(kw)).length}** projects monitored in this sector. Top priority projects:

${sectorProjects.map((p, i) => `
${i + 1}. **${p.name}** (\`${p.projectCode}\`)
   - **Risk Level**: ${getRiskEmoji(p.riskLevel)} **${p.overallRiskScore}/100 (${p.riskLevel})**
   - **Delay**: **${p.delayMonths} mos** | **Cost Overrun**: **+₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr**
   - **Physical Progress**: ${p.physicalProgress}%
`).join('\n')}

*Ask me about any specific project (e.g., \`${sectorProjects[0]?.projectCode}\` or "${sectorProjects[0]?.name.substring(0, 30)}...") to get full details.*`;

        return { reply, source: 'PAIMANA Sector Intelligence', intent: 'PORTFOLIO_QUERY' };
      }
    }
  }

  // 5. Default General Intelligence Overview
  const total = projects.length;
  const critical = projects.filter(p => p.riskLevel === 'CRITICAL').length;
  const high = projects.filter(p => p.riskLevel === 'HIGH').length;
  const sample = projects.slice(0, 3);

  const reply = `### 🏛️ PAIMANA Infrastructure Project Intelligence Assistant

I am trained on the **Ministry of Statistics and Programme Implementation (MoSPI)** central sector infrastructure monitoring database (**${total} Monitored Projects**).

#### 📌 Monitored Portfolio Health:
- **Total Monitored Projects**: **${total} Projects**
- **Critical Risk (🔴)**: **${critical} Projects**
- **High Risk (🟠)**: **${high} Projects**

#### 💡 How to Query Any Project:
You can ask me questions about **any project** by sending its **Project ID**, **Project Code**, or **Name**:
- *"Why is ${sample[0]?.name.substring(0, 35)}... at risk?"*
- *"When did project \`${sample[0]?.projectCode}\` start?"*
- *"What is the cost overrun of \`${sample[1]?.projectCode}\`?"*
- *"Show execution status of ${sample[2]?.name.substring(0, 35)}..."*
- Or simply type the project code like \`${sample[0]?.projectCode}\` or \`${sample[1]?.projectCode}\`!`;

  return { reply, source: 'PAIMANA Decision Engine', intent: 'FULL_PROFILE' };
}

/**
 * Builds an authoritative ground-truth context prompt to feed Gemini LLM
 */
export function buildProjectGeminiPrompt(
  project: InfrastructureProject,
  userPrompt: string
): string {
  return `You are the PAIMANA Infrastructure Project Intelligence Assistant for the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
You must answer the officer's question using the exact, authoritative project ground truth provided below.

GROUND TRUTH DATA FOR PROJECT:
- Project Name: ${project.name}
- Project Code: ${project.projectCode} (System ID: ${project.id})
- Ministry: ${project.ministry}
- Implementing Agency: ${project.implementingAgency}
- Sector: ${project.sector}
- State / Region: ${project.state} (${project.district})
- Sanction / Approval Date: ${project.startDate}
- Start Date: ${project.startDate}
- Original Target Completion Date: ${project.originalCompletionDate}
- Revised Anticipated Completion Date: ${project.expectedCompletionDate}
- Schedule Delay: ${project.delayMonths} Months (${project.delayPercent}% duration overrun)
- Original Approved Cost: ₹${project.originalCost} Crores
- Revised Anticipated Cost: ₹${project.revisedCost} Crores
- Cost Overrun: ₹${project.costOverrunAmount} Crores (+${project.costOverrunPercent}%)
- Cumulative Financial Expenditure: ₹${project.expenditure} Crores (${project.financialProgress}% of revised budget)
- Physical Progress Achieved: ${project.physicalProgress}% (Planned: ${project.plannedPhysicalProgress}%)
- Capital Burn Divergence: ${project.progressExpenditureDivergence}%
- Overall Risk Score: ${project.overallRiskScore}/100 (${project.riskLevel})
- Schedule Risk Score: ${project.scheduleRiskScore}/100
- Cost Risk Score: ${project.costRiskScore}/100
- Progress Risk Score: ${project.progressRiskScore}/100
- Expenditure-Progress Risk: ${project.expenditureProgressRiskScore}/100
- Detected Issue: ${project.detectedIssue}
- Major Delay Drivers: ${project.majorDelayDrivers.join('; ')}
- Major Cost Escalation Drivers: ${project.majorCostEscalationDrivers.join('; ')}
- Land Acquired: ${project.landAcquiredPercent}%
- Environmental Clearance: ${project.environmentalClearance}
- Forest Clearance: ${project.forestClearance}
- Contractor Name: ${project.contractorName} (Rating: ${project.contractorRiskRating})
- Recommended MoSPI Intervention: ${project.recommendedIntervention}
- Action Authority: ${project.interventionAuthority}
- Expected Mitigation Impact: ${project.expectedMitigationImpact}

INSTRUCTIONS:
1. Answer the user's specific query directly (e.g. if they ask when it started, state the start and sanction dates; if they ask why at risk, detail the root causes, delay drivers, cost overruns, and clearances; if they ask about cost, provide the exact rupee amounts).
2. Use clear markdown headers, bold figures, and emojis (🔴 for Critical, 🟠 for High, 🟡 for Medium, 🟢 for Low).
3. Do NOT reply generally. Focus strictly on this specific project using the real data provided above.
4. Conclude with the actionable prescription and the responsible authority.`;
}
