import { InfrastructureProject, BenchmarkComparison, ScenarioInput, ScenarioOutput } from '../types';

export class MLEngine {
  /**
   * Predict Cost Overrun given project attributes
   */
  static predictCostOverrun(project: Partial<InfrastructureProject> & { originalCost: number; physicalProgress: number; financialProgress: number; sector: string; delayMonths?: number }) {
    const origCost = project.originalCost || 1000;
    const phys = project.physicalProgress || 50;
    const fin = project.financialProgress || 50;
    const delay = project.delayMonths || 0;
    
    // Feature weighting mimicking trained gradient boosting trees
    const progressDivergence = Math.max(0, fin - phys);
    const delayFactor = Math.min(1.5, delay / 24);
    
    // Sector base cost inflation elasticity
    let sectorRiskWeight = 1.0;
    if (project.sector?.includes('Railways') || project.sector?.includes('Highways')) sectorRiskWeight = 1.18;
    else if (project.sector?.includes('Nuclear') || project.sector?.includes('Renewables')) sectorRiskWeight = 1.12;
    else if (project.sector?.includes('Social')) sectorRiskWeight = 1.15;
    else if (project.sector?.includes('Coal') || project.sector?.includes('Mining')) sectorRiskWeight = 1.10;

    // Overrun probability calculation
    const baseProb = 20 + (progressDivergence * 2.2) + (delayFactor * 35) * sectorRiskWeight;
    const probability = Math.min(98, Math.max(10, Math.round(baseProb)));
    
    // Expected overrun percentage
    const expectedOverrunPercent = Number(((progressDivergence * 0.9) + (delayFactor * 18) * sectorRiskWeight).toFixed(2));
    const expectedCostOverrunAmount = Math.round(origCost * (expectedOverrunPercent / 100));
    const expectedRevisedCost = origCost + expectedCostOverrunAmount;

    // Escalation drivers
    const drivers = [
      `Progress-Expenditure Delta (+${progressDivergence.toFixed(1)}% burn gap)`,
      `Cumulative Schedule Slippage (${delay} months)`,
      `Sector Base Escalation Index (${project.sector})`,
      `Raw Material & Construction Price Inflation`,
      `Contract Variation Claims & Land Compensation Adjustments`
    ];

    return {
      probability,
      expectedOverrunPercent,
      expectedCostOverrunAmount,
      expectedRevisedCost,
      drivers
    };
  }

  /**
   * Predict Time Overrun (Schedule Delay)
   */
  static predictDelayOverrun(project: Partial<InfrastructureProject> & { originalCompletionDate?: string; physicalProgress: number; plannedPhysicalProgress?: number; landAcquiredPercent?: number; forestClearance?: string }) {
    const phys = project.physicalProgress || 50;
    const planned = project.plannedPhysicalProgress || 80;
    const land = project.landAcquiredPercent || 90;
    const forest = project.forestClearance || 'Approved';

    const gap = Math.max(0, planned - phys);
    const landDeficit = Math.max(0, 100 - land);
    const regulatoryFriction = forest.includes('Pending') ? 18 : forest.includes('Stage-1') ? 8 : 0;

    const delayProb = Math.min(99, Math.max(12, Math.round(15 + (gap * 1.5) + (landDeficit * 0.6) + regulatoryFriction)));
    const expectedDelayMonths = Math.max(0, Math.round((gap * 0.7) + (landDeficit * 0.25) + (regulatoryFriction * 0.5)));

    // Calculate projected completion date
    let expectedDate = project.originalCompletionDate || '2026-12-31';
    try {
      const orig = new Date(expectedDate);
      orig.setMonth(orig.getMonth() + expectedDelayMonths);
      expectedDate = orig.toISOString().split('T')[0];
    } catch {
      expectedDate = '2027-06-30';
    }

    const drivers = [
      `Physical Progress Deficit vs Target (-${gap.toFixed(1)}%)`,
      `Right-of-Way / Land Possession Incomplete (${land}% acquired)`,
      forest.includes('Pending') ? 'Forest / MoEFCC Clearance Awaiting Approval' : 'Environmental Compliance Monitoring',
      `Contractor Site Mobilization & Labor Capacity Constraints`,
      `Seasonal Monsoon & Weather Stoppage Windows`
    ];

    return {
      delayProbability: delayProb,
      expectedDelayMonths,
      expectedCompletionDate: expectedDate,
      drivers
    };
  }

  /**
   * Benchmarking vs Historical Sector Cohorts
   */
  static benchmarkProject(project: InfrastructureProject, allProjects: InfrastructureProject[]): BenchmarkComparison[] {
    const cohort = allProjects.filter(p => p.sector === project.sector && p.id !== project.id);
    const validCohort = cohort.length > 0 ? cohort : allProjects;

    const avgCostOverrun = validCohort.reduce((acc, p) => acc + p.costOverrunPercent, 0) / validCohort.length;
    const avgDelayMonths = validCohort.reduce((acc, p) => acc + p.delayMonths, 0) / validCohort.length;
    const avgRiskScore = validCohort.reduce((acc, p) => acc + p.overallRiskScore, 0) / validCohort.length;
    const avgProgressPace = validCohort.reduce((acc, p) => acc + (p.physicalProgress / Math.max(1, p.delayMonths + 24)), 0) / validCohort.length;
    const projectPace = project.physicalProgress / Math.max(1, project.delayMonths + 24);

    const costStatus: 'Better' | 'Near' | 'Worse' = project.costOverrunPercent < avgCostOverrun - 5 ? 'Better' : project.costOverrunPercent > avgCostOverrun + 5 ? 'Worse' : 'Near';
    const delayStatus: 'Better' | 'Near' | 'Worse' = project.delayMonths < avgDelayMonths - 3 ? 'Better' : project.delayMonths > avgDelayMonths + 3 ? 'Worse' : 'Near';
    const riskStatus: 'Better' | 'Near' | 'Worse' = project.overallRiskScore < avgRiskScore - 8 ? 'Better' : project.overallRiskScore > avgRiskScore + 8 ? 'Worse' : 'Near';
    const paceStatus: 'Better' | 'Near' | 'Worse' = projectPace > avgProgressPace * 1.15 ? 'Better' : projectPace < avgProgressPace * 0.85 ? 'Worse' : 'Near';

    return [
      {
        metric: 'Cost Overrun Percentage',
        projectValue: `${project.costOverrunPercent}%`,
        benchmarkAverage: `${avgCostOverrun.toFixed(1)}%`,
        unit: '%',
        status: costStatus,
        differenceText: project.costOverrunPercent > avgCostOverrun ? `+${(project.costOverrunPercent - avgCostOverrun).toFixed(1)}% above average` : `${(avgCostOverrun - project.costOverrunPercent).toFixed(1)}% below average`
      },
      {
        metric: 'Schedule Delay Duration',
        projectValue: `${project.delayMonths} mos`,
        benchmarkAverage: `${avgDelayMonths.toFixed(1)} mos`,
        unit: 'months',
        status: delayStatus,
        differenceText: project.delayMonths > avgDelayMonths ? `+${(project.delayMonths - avgDelayMonths).toFixed(1)} mos longer than sector` : `${(avgDelayMonths - project.delayMonths).toFixed(1)} mos ahead of sector`
      },
      {
        metric: 'Overall AI Risk Score',
        projectValue: `${project.overallRiskScore}/100`,
        benchmarkAverage: `${avgRiskScore.toFixed(0)}/100`,
        unit: 'score',
        status: riskStatus,
        differenceText: project.overallRiskScore > avgRiskScore ? `+${(project.overallRiskScore - avgRiskScore).toFixed(0)} pts higher risk` : `${(avgRiskScore - project.overallRiskScore).toFixed(0)} pts lower risk`
      },
      {
        metric: 'Execution Pace (%/month)',
        projectValue: `${projectPace.toFixed(2)}%`,
        benchmarkAverage: `${avgProgressPace.toFixed(2)}%`,
        unit: '%/mo',
        status: paceStatus,
        differenceText: projectPace >= avgProgressPace ? `Above sector velocity` : `Below sector velocity`
      }
    ];
  }

  /**
   * What-If Scenario Simulation
   */
  static runScenarioSimulation(project: InfrastructureProject, input: ScenarioInput): ScenarioOutput {
    // Current base numbers
    const baseCostRisk = project.costOverrunProbability;
    const baseDelayRisk = project.delayProbability;
    const baseOverallRisk = project.overallRiskScore;
    const baseRevisedCost = project.revisedCost;
    const baseDelayMonths = project.delayMonths;

    // Simulation modifiers
    const spendModifier = input.monthlyExpenditureDeltaPercent * 0.35; // increased spend might reduce delay if matched with resources
    const progressModifier = input.physicalProgressPaceDeltaPercent * 0.45; // faster progress directly cures delay risk
    const resourceModifier = (input.resourceAvailabilityPercent - 100) * 0.3;
    const clearanceBonus = input.fastTrackClearance ? 18 : 0;
    const contractorBonus = input.contractorReallocation ? 12 : 0;
    const timeExtensionCredit = input.completionExtensionMonths * 1.8;

    // Simulated risks
    let simulatedDelayRisk = Math.max(5, Math.min(99, Math.round(baseDelayRisk - progressModifier - resourceModifier - clearanceBonus - contractorBonus - (timeExtensionCredit * 0.5))));
    let simulatedCostRisk = Math.max(5, Math.min(99, Math.round(baseCostRisk + (spendModifier * 0.6) - (progressModifier * 0.2) + (input.completionExtensionMonths * 0.8))));
    let simulatedOverallRisk = Math.max(5, Math.min(99, Math.round((simulatedCostRisk * 0.4) + (simulatedDelayRisk * 0.45) + (baseOverallRisk * 0.15))));

    // Calculate simulated delay months
    const delayDelta = Math.round((simulatedDelayRisk - baseDelayRisk) * 0.25);
    const simulatedDelayMonths = Math.max(0, baseDelayMonths + delayDelta - input.completionExtensionMonths);

    // Calculate simulated cost delta
    const costInflationRate = (input.monthlyExpenditureDeltaPercent * 0.25) + (input.completionExtensionMonths * 0.8) - (clearanceBonus * 0.3);
    const costDeltaAmount = Math.round(baseRevisedCost * (costInflationRate / 100));
    const simulatedRevisedCost = Math.max(project.originalCost, baseRevisedCost + costDeltaAmount);

    // Simulated completion date calculation
    let simulatedDate = project.expectedCompletionDate;
    try {
      const orig = new Date(project.originalCompletionDate);
      orig.setMonth(orig.getMonth() + simulatedDelayMonths);
      simulatedDate = orig.toISOString().split('T')[0];
    } catch {
      simulatedDate = '2027-03-31';
    }

    const netRiskReduction = baseOverallRisk - simulatedOverallRisk;
    let riskSummary = '';
    if (netRiskReduction > 15) {
      riskSummary = `Outstanding optimization: Overall risk reduced by ${netRiskReduction} points with projected schedule compression of ${Math.abs(delayDelta)} months.`;
    } else if (netRiskReduction > 0) {
      riskSummary = `Moderate positive impact: Risk index lowered by ${netRiskReduction} points. Balancing resource deployment maintains cost stability.`;
    } else {
      riskSummary = `Warning: Scenario introduces increased cost exposure (+₹${costDeltaAmount} Cr) with minimal schedule benefit.`;
    }

    return {
      simulatedCostRisk,
      simulatedDelayRisk,
      simulatedOverallRisk,
      simulatedRevisedCost,
      simulatedCompletionDate: simulatedDate,
      simulatedDelayMonths,
      costDeltaAmount,
      timeDeltaMonths: delayDelta,
      riskReductionSummary: riskSummary
    };
  }
}
