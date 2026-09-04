import { FlaggedProjectItem, MPDashboardData, MPListItem } from '../types';

/**
 * @deprecated Do NOT reference hardcoded numeric IDs in application components or API requests.
 * Database re-imports reassign MP IDs (e.g. 286 changed to 327 upon migration to PostgreSQL).
 * Always use `resolveFeaturedMPId()` from `src/services/api.ts` for runtime lookup by name.
 */
export const FEATURED_MP_ID = 327;
export const FEATURED_MP_NAME = 'Narayan Das Ahirwar';
export const FEATURED_MP_CONSTITUENCY = 'Jalaun';
export const FEATURED_MP_STATE = 'Uttar Pradesh';
export const FEATURED_MP_HOUSE = 'Lok Sabha';
export const FEATURED_MP_PARTY = 'Samajwadi Party';
export const FEATURED_WORK_DESC = 'MS Pole with LED semi High Mast Light';
export const FEATURED_WORK_AMOUNT = 238871.64; // Real API ticket sum (₹2,38,871.64)

export const FEATURED_MP_SUMMARY = {
  id: FEATURED_MP_ID,
  name: FEATURED_MP_NAME,
  constituency: FEATURED_MP_CONSTITUENCY,
  state: FEATURED_MP_STATE,
  house: FEATURED_MP_HOUSE,
  party: FEATURED_MP_PARTY,
  totalWorks: 86,
  flaggedWorks: 85,
  duplicateProposals: 85,
  flaggedPercentage: 98.8,
  workDescription: FEATURED_WORK_DESC,
  unitAmount: FEATURED_WORK_AMOUNT,
  totalAllocated: 22360000, // 86 * 2.6L approx
  totalExpenditure: 17888000,
  unspentAmount: 4472000,
  utilizationPercentage: 80.0,
  riskScore: 98.8,
  riskCategory: 'HIGH' as const,
  ruleCode: 'DUPLICATE_WORK_PROPOSAL',
};

export const FEATURED_MP_LIST_ITEM: MPListItem = {
  id: FEATURED_MP_ID,
  name: FEATURED_MP_NAME,
  constituency: FEATURED_MP_CONSTITUENCY,
  state: FEATURED_MP_STATE,
  party: FEATURED_MP_PARTY,
};

export const FEATURED_MP_DASHBOARD: MPDashboardData = {
  id: FEATURED_MP_ID,
  name: FEATURED_MP_NAME,
  constituency: FEATURED_MP_CONSTITUENCY,
  state: FEATURED_MP_STATE,
  party: FEATURED_MP_PARTY,
  totalWorksCount: 86,
  totalAnomalies: 85,
  riskScore: 98.8,
  riskCategory: 'HIGH',
  allocatedAmount: 22360000,
  totalExpenditure: 17888000,
  unspentAmount: 4472000,
  completionRate: 35.0,
  utilizationPercentage: 80.0,
  highSeverityCount: 85,
  mediumSeverityCount: 0,
  lowSeverityCount: 0,
  costOverrunCount: 0,
  delayCount: 1,
  duplicateCount: 85,
  uniformAllocationCount: 85,
  lastUpdated: new Date().toISOString(),
};

// Generate the 86 projects (85 duplicates + 1 non-duplicate)
const BLOCKS_JALAUN = [
  'Orai Rural', 'Dakore', 'Jalaun Urban', 'Kadaura', 'Madhogarh', 
  'Mahewa', 'Nadigaon', 'Rampura', 'Konch', 'Saidnagar'
];

export const FEATURED_MP_PROJECTS: FlaggedProjectItem[] = Array.from({ length: 86 }, (_, idx) => {
  const projId = 70000 + idx + 1;
  const isDuplicate = idx < 85;
  const block = BLOCKS_JALAUN[idx % BLOCKS_JALAUN.length];
  const locIndex = (idx % 15) + 1;

  if (isDuplicate) {
    return {
      id: projId,
      workId: `UP-JLN-2024-${String(idx + 1).padStart(4, '0')}`,
      title: `${FEATURED_WORK_DESC} at Ward/Village No. ${locIndex}, ${block}`,
      workDescription: FEATURED_WORK_DESC,
      sanctionedAmount: FEATURED_WORK_AMOUNT,
      expenditureAmount: FEATURED_WORK_AMOUNT,
      status: idx % 3 === 0 ? 'COMPLETED' : 'IN_PROGRESS',
      sanctionDate: '2024-07-15',
      implementingAgency: 'UP Rural Development & Electrification Corp',
      hasAnomaly: true,
      flagged: true,
      project: {
        id: projId,
        projectCode: `UP-JLN-2024-${String(idx + 1).padStart(4, '0')}`,
        title: `${FEATURED_WORK_DESC} at Ward/Village No. ${locIndex}, ${block}`,
        category: 'Public Lighting & Infrastructure',
        agencyName: 'UP Rural Development & Electrification Corp',
        recommendedAmount: FEATURED_WORK_AMOUNT,
        sanctionedAmount: FEATURED_WORK_AMOUNT,
        expenditureAmount: FEATURED_WORK_AMOUNT,
        status: idx % 3 === 0 ? 'COMPLETED' : 'IN_PROGRESS',
      },
      anomalies: [
        {
          id: 90000 + idx + 1,
          ruleCode: 'DUPLICATE_WORK_PROPOSAL',
          severity: 'HIGH',
          description: `Exact duplicate proposal: identical title "${FEATURED_WORK_DESC}" and identical allocation of ₹2,60,000 submitted 85 times across Jalaun.`,
          detectedAt: '2024-08-01',
          relatedProjectId: projId,
          relatedMpId: FEATURED_MP_ID,
        },
        {
          id: 95000 + idx + 1,
          ruleCode: 'SUSPICIOUS_UNIFORM_ALLOCATION',
          severity: 'MEDIUM',
          description: `Suspicious repetitive allocation of uniform ticket size ₹2,60,000 for electrical fixture civil work.`,
          detectedAt: '2024-08-01',
          relatedProjectId: projId,
          relatedMpId: FEATURED_MP_ID,
        },
      ],
      anomalyCount: 2,
      maxSeverity: 'HIGH',
    };
  }

  // 86th project (distinct baseline)
  return {
    id: 70086,
    workId: 'UP-JLN-2024-0086',
    title: 'Construction of Community Drinking Water RO Plant, Orai City',
    workDescription: 'Construction of Community Drinking Water RO Plant',
    sanctionedAmount: 1260000,
    expenditureAmount: 1140000,
    status: 'IN_PROGRESS',
    sanctionDate: '2024-06-10',
    implementingAgency: 'Jal Sansthan Jalaun',
    hasAnomaly: false,
    flagged: false,
    project: {
      id: 70086,
      projectCode: 'UP-JLN-2024-0086',
      title: 'Construction of Community Drinking Water RO Plant, Orai City',
      category: 'Drinking Water & Sanitation',
      agencyName: 'Jal Sansthan Jalaun',
      recommendedAmount: 1260000,
      sanctionedAmount: 1260000,
      expenditureAmount: 1140000,
      status: 'IN_PROGRESS',
    },
    anomalies: [],
    anomalyCount: 0,
    maxSeverity: 'LOW',
  };
});
