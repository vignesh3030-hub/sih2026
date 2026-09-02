export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SectorType = 
  | 'Road Transport & Highways'
  | 'Railways'
  | 'Petroleum & Natural Gas'
  | 'Power'
  | 'Coal'
  | 'Urban Development'
  | 'Civil Aviation'
  | 'Steel'
  | 'Water Resources'
  | 'Telecommunications'
  | 'Mines'
  | 'Department of Higher Education'
  | 'Health & Family Welfare'
  | 'DPIIT'
  | 'Shipping and Ports'
  | 'Home Affairs'
  | 'Finance'
  | 'Social Justice'
  | string;

export type ProjectStatus = 'Ongoing' | 'Critical Delayed' | 'At Risk' | 'Near Completion' | 'On Schedule';

export interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: 'Completed' | 'Delayed' | 'In Progress' | 'Pending';
  weight: number; // percentage
}

export interface RiskFactor {
  name: string;
  impactScore: number; // 0 to 100
  category: 'Land & ROW' | 'Financial & Cashflow' | 'Clearances & Regulatory' | 'Contractor & Execution' | 'Geotechnical/Weather' | 'Scope Changes';
  description: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ProjectMonthlyProgress {
  month: string;
  plannedPhysical: number;
  actualPhysical: number;
  plannedFinancial: number;
  actualFinancial: number;
}

export interface InfrastructureProject {
  id: string;
  projectCode: string;
  name: string;
  ministry: string;
  implementingAgency: string;
  sector: SectorType;
  state: string;
  district: string;
  originalCost: number; // in ₹ Crores
  revisedCost: number; // in ₹ Crores
  expenditure: number; // in ₹ Crores
  startDate: string;
  originalCompletionDate: string;
  expectedCompletionDate: string;
  delayMonths: number;
  costOverrunPercent: number;
  costOverrunAmount: number; // in ₹ Crores
  physicalProgress: number; // 0 to 100%
  financialProgress: number; // 0 to 100%
  plannedPhysicalProgress: number; // 0 to 100%
  status: ProjectStatus;
  
  // AI Risk Metrics
  costOverrunProbability: number; // 0 to 100%
  delayProbability: number; // 0 to 100%
  implementationRisk: number; // 0 to 100%
  overallRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  
  // Predict & Explain Attributes
  majorCostEscalationDrivers: string[];
  majorDelayDrivers: string[];
  riskExplanationPoints: string[];
  topContributingFactors: { factor: string; contribution: number; category: string }[];
  
  // Prescription
  detectedIssue: string;
  evidence: string[];
  recommendedIntervention: string;
  interventionAuthority: string; // e.g., 'MoSPI Review Committee', 'Cabinet Committee on Investment', 'State Chief Secretary'
  expectedMitigationImpact: string;
  
  // Clearances & Governance Details
  landAcquiredPercent: number;
  environmentalClearance: 'Approved' | 'Pending' | 'Stage-1 Clear' | 'Not Applicable';
  forestClearance: 'Approved' | 'Pending' | 'Stage-1 Clear' | 'Stage-2 Pending' | 'Not Applicable';
  contractorName: string;
  contractorRiskRating: 'Low Risk' | 'Moderate' | 'High Default Risk';
  milestones: Milestone[];
  monthlyProgressHistory: ProjectMonthlyProgress[];
  lastReviewDate: string;
}

export interface EarlyWarningAlert {
  id: string;
  projectId: string;
  projectName: string;
  ministry: string;
  sector: SectorType;
  state: string;
  riskLevel: RiskLevel;
  riskType: 'Schedule Delay Alert' | 'Cost Escalation Alert' | 'Progress-Expenditure Divergence' | 'Regulatory Stagnation' | 'Contractor Anomaly';
  riskScore: number;
  reason: string;
  evidenceMetric: string;
  recommendedAction: string;
  alertDate: string;
  status: 'Active' | 'Acknowledged' | 'Action Initiated' | 'Resolved';
  actionDeadline: string;
}

export interface BenchmarkComparison {
  metric: string;
  projectValue: number | string;
  benchmarkAverage: number | string;
  unit: string;
  status: 'Better' | 'Near' | 'Worse';
  differenceText: string;
}

export interface ScenarioInput {
  monthlyExpenditureDeltaPercent: number; // -50% to +100%
  physicalProgressPaceDeltaPercent: number; // -50% to +100%
  completionExtensionMonths: number; // 0 to 36 months
  resourceAvailabilityPercent: number; // 30% to 150%
  fastTrackClearance: boolean;
  contractorReallocation: boolean;
}

export interface ScenarioOutput {
  simulatedCostRisk: number; // %
  simulatedDelayRisk: number; // %
  simulatedOverallRisk: number; // score
  simulatedRevisedCost: number; // ₹ Cr
  simulatedCompletionDate: string;
  simulatedDelayMonths: number;
  costDeltaAmount: number; // ₹ Cr
  timeDeltaMonths: number; // months
  riskReductionSummary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  referencedProjectIds?: string[];
  dataPayload?: any;
}

export interface DashboardFilter {
  ministry: string;
  sector: string;
  state: string;
  riskLevel: string;
  status: string;
  searchQuery: string;
}
