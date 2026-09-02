import { InfrastructureProject, EarlyWarningAlert } from '../types';
import { getAllMospiProjects } from './projectParser';

// Official MoSPI Q1 2025-26 Central Sector Infrastructure Projects (Costing Rs. 150 Crore & above)
export const mockProjects: InfrastructureProject[] = getAllMospiProjects();

export const MOCK_PROJECTS = mockProjects;

// Official Macro-level MoSPI Report Statistics (From Page 4 & 5 of MoSPI Status Report)
export const MOSPI_REPORT_METRICS = {
  reportQuarter: 'Quarter-1 FY 2025-26 (April-June)',
  totalOngoingProjectsCount: 1734,
  totalOngoingOriginalCostCr: 2842540.23,
  totalOngoingRevisedCostCr: 2965542.48,
  totalOngoingAnticipatedCostCr: 3158147.58,
  cumulativeExpenditureCr: 1774657.72,
  expenditureRatioPercent: 56.19,
  megaProjectsCount: 619,
  megaProjectsCostCr: 2332736.46,
  majorProjectsCount: 1115,
  majorProjectsCostCr: 509803.77,
  completedProjectsCount: 116,
  completedProjectsCostCr: 134336.13,
  newlyAddedProjectsCount: 46,
  newlyAddedProjectsCostCr: 51155.24,
  droppedFrozenProjectsCount: 13,
  droppedFrozenProjectsCostCr: 8603.54,
  northEastProjectsCount: 224,
  northEastProjectsCostCr: 212797.85,
  projectsWithProgress80to100Count: 765,
};

// Generate active Early Warnings based on official high-risk projects from the MoSPI report
export function generateEarlyWarnings(projectsList: InfrastructureProject[] = mockProjects): EarlyWarningAlert[] {
  return projectsList
    .filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH' || p.delayMonths > 12)
    .slice(0, 30)
    .map((p, idx) => {
      let riskType: EarlyWarningAlert['riskType'] = 'Schedule Delay Alert';
      let reason = '';
      let metric = '';
      let action = '';
      
      if (idx % 4 === 0) {
        riskType = 'Schedule Delay Alert';
        reason = `Official MoSPI schedule delay of ${p.delayMonths} months. Physical progress (${p.physicalProgress}%) lagging target (${p.plannedPhysicalProgress}%).`;
        metric = `Delay: +${p.delayMonths} mos | Expected COD: ${p.expectedCompletionDate}`;
        action = p.recommendedIntervention || `Convene Project Monitoring Group (PMG) inter-departmental review with ${p.implementingAgency} and State authorities.`;
      } else if (idx % 4 === 1) {
        riskType = 'Progress-Expenditure Divergence';
        reason = `Project shows financial expenditure (${p.financialProgress}%) outstripping physical progress (${p.physicalProgress}%). Capital burn divergence flagged.`;
        metric = `Financial: ₹${p.expenditure.toLocaleString('en-IN')} Cr (${p.financialProgress}%) vs Physical: ${p.physicalProgress}%`;
        action = `Audit contractor billing milestones and mandate physical site verification before releasing next tranche.`;
      } else if (idx % 4 === 2) {
        riskType = 'Cost Escalation Alert';
        reason = `Cost overrun of ₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%) over original approved cost of ₹${p.originalCost.toLocaleString('en-IN')} Cr.`;
        metric = `Original: ₹${p.originalCost.toLocaleString('en-IN')} Cr → Anticipated: ₹${p.revisedCost.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent}%)`;
        action = `Submit Revised Cost Estimate (RCE) to Cabinet Committee on Economic Affairs (CCEA) / Revised Cost Committee.`;
      } else {
        riskType = 'Regulatory Stagnation';
        reason = `Key statutory clearances and Right of Way (RoW) approvals delayed in ${p.state}.`;
        metric = `Land Acquired: ${p.landAcquiredPercent}% | Forest: ${p.forestClearance}`;
        action = `Escalate to State Chief Secretary Apex Infrastructure Committee for expedited statutory RoW handover.`;
      }

      return {
        id: `WARN-${p.projectCode}-${idx + 1}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: p.riskLevel,
        riskType,
        riskScore: p.overallRiskScore,
        reason,
        evidenceMetric: metric,
        recommendedAction: action,
        alertDate: `2026-06-30`,
        status: (idx % 3 === 0) ? 'Action Initiated' : (idx % 2 === 0) ? 'Acknowledged' : 'Active',
        actionDeadline: `2026-09-${String((idx % 20) + 10).padStart(2, '0')}`
      };
    });
}
