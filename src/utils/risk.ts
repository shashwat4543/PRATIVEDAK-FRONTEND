import { MPDashboardData } from '../types';

export interface RiskBreakdown {
  score: number;
  category: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' | 'High Risk';
  badgeColor: string;
  gaugeColor: string;
  factors: {
    name: string;
    description: string;
    points: number;
    maxPoints: number;
    valueText: string;
  }[];
  explanation: string;
}

/**
 * Exact Risk Score Formula as specified in PRD Section 8.4:
 * riskScore = clamp(0, 100,
 *   (totalAnomalies / totalWorksCount) * 40   // anomaly density, capped contribution
 *   + (highSeverityCount * 8)                 // weight high severity heavily
 *   + (mediumSeverityCount * 3)
 *   + (utilizationPercentage < 50 ? 15 : 0)   // low fund utilization is itself a flag
 * )
 */
export function calculateRiskScore(data: {
  totalWorksCount?: number;
  totalAnomalies?: number;
  highSeverityCount?: number;
  mediumSeverityCount?: number;
  utilizationPercentage?: number;
}): number {
  const totalWorks = data.totalWorksCount || 0;
  const totalAnomalies = data.totalAnomalies || 0;
  const highSev = data.highSeverityCount || 0;
  const medSev = data.mediumSeverityCount || 0;
  const util = data.utilizationPercentage ?? 0;

  if (totalWorks <= 0) return 0;

  const anomalyDensityPoints = Math.min(40, (totalAnomalies / totalWorks) * 40);
  const highSevPoints = highSev * 8;
  const medSevPoints = medSev * 3;
  const lowUtilPoints = util < 50 ? 15 : 0;

  const rawTotal = anomalyDensityPoints + highSevPoints + medSevPoints + lowUtilPoints;
  const clamped = Math.min(100, Math.max(0, Math.round(rawTotal * 10) / 10));

  return clamped;
}

export function getRiskDetails(dashboard: MPDashboardData | Partial<MPDashboardData>): RiskBreakdown {
  const totalWorks = dashboard.totalWorksCount || 0;
  const totalAnomalies = dashboard.totalAnomalies || 0;
  const highSev = dashboard.highSeverityCount || 0;
  const medSev = dashboard.mediumSeverityCount || 0;
  const util = dashboard.utilizationPercentage ?? 0;

  const anomalyDensityPoints = totalWorks > 0 ? Math.min(40, (totalAnomalies / totalWorks) * 40) : 0;
  const highSevPoints = highSev * 8;
  const medSevPoints = medSev * 3;
  const lowUtilPoints = util < 50 ? 15 : 0;

  const score = calculateRiskScore(dashboard);

  let category: RiskBreakdown['category'] = 'Low Risk';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let gaugeColor = '#10B981';

  if (score >= 60) {
    category = 'High Risk';
    badgeColor = 'bg-red-50 text-red-700 border-red-200';
    gaugeColor = '#EF4444';
  } else if (score >= 35) {
    category = 'Elevated Risk';
    badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
    gaugeColor = '#F97316';
  } else if (score >= 15) {
    category = 'Moderate Risk';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    gaugeColor = '#F59E0B';
  }

  const factors = [
    {
      name: 'Anomaly Density',
      description: 'Proportion of flagged works out of total recommended works (capped at 40 pts)',
      points: Math.round(anomalyDensityPoints * 10) / 10,
      maxPoints: 40,
      valueText: totalWorks > 0 ? `${totalAnomalies} of ${totalWorks} works (${((totalAnomalies / totalWorks) * 100).toFixed(1)}%)` : '0 works',
    },
    {
      name: 'High-Severity Anomalies',
      description: '8 points per high-severity rule violation (e.g. duplicates)',
      points: highSevPoints,
      maxPoints: 40,
      valueText: `${highSev} detected (${highSev * 8} pts)`,
    },
    {
      name: 'Medium-Severity Anomalies',
      description: '3 points per medium-severity violation (e.g. chronic delays, uniform sums)',
      points: medSevPoints,
      maxPoints: 30,
      valueText: `${medSev} detected (${medSev * 3} pts)`,
    },
    {
      name: 'Low Fund Utilization Penalty',
      description: '+15 points if overall fund utilization is below 50%',
      points: lowUtilPoints,
      maxPoints: 15,
      valueText: `${util.toFixed(1)}% utilization (${util < 50 ? '+15 pts flag' : '0 pts penalty'})`,
    },
  ];

  return {
    score,
    category,
    badgeColor,
    gaugeColor,
    factors,
    explanation: 'Transparent weighted metric combining anomaly frequency, severity weights, and low disbursement risk.',
  };
}
