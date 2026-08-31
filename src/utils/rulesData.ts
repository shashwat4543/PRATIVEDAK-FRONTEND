import { RuleCode, SeverityLevel } from '../types';

export interface RuleDefinition {
  code: RuleCode;
  name: string;
  severity: SeverityLevel;
  status: 'ACTIVE_IN_PRODUCTION' | 'DATA_LIMITED';
  shortDescription: string;
  fullLogic: string;
  whyItMatters: string;
  dataNote?: string;
  liveCountApprox?: string;
}

export const SYSTEM_RULES: RuleDefinition[] = [
  {
    code: 'DUPLICATE_WORK_PROPOSAL',
    name: 'Duplicate Work Proposal',
    severity: 'HIGH',
    status: 'ACTIVE_IN_PRODUCTION',
    shortDescription: 'Flags identical project titles with identical sanctioned amounts under the same MP or agency.',
    fullLogic: 'Exact string comparison of project title paired with identical rupee amount sanctioned within the same administrative jurisdiction or MP recommendation period.',
    whyItMatters: 'Prevents double-billing, duplicate sanction orders for already executed civil works, and ghost project creation.',
    liveCountApprox: '4,400+ flags in national dataset',
  },
  {
    code: 'SUSPICIOUS_UNIFORM_ALLOCATION',
    name: 'Suspicious Uniform Allocation',
    severity: 'MEDIUM',
    status: 'ACTIVE_IN_PRODUCTION',
    shortDescription: 'Flags repetitive, identical rounded sums (e.g. exactly ₹5,00,000 or ₹10,00,000) sanctioned across unrelated projects.',
    fullLogic: 'Identifies clusters of works sanctioned at identical threshold amounts without site-specific estimation or tender-based BOQ variation.',
    whyItMatters: 'Suggests lack of engineering scrutiny, arbitrary block allocations, or contractor ceiling splitting to bypass detailed technical sanctions.',
    liveCountApprox: '1,700+ flags in national dataset',
  },
  {
    code: 'PROJECT_CHRONIC_DELAY',
    name: 'Project Chronic Delay',
    severity: 'MEDIUM',
    status: 'ACTIVE_IN_PRODUCTION',
    shortDescription: 'Flags projects that remain in "recommended" or "sanctioned" status for over 730 days without completion.',
    fullLogic: 'Calculates the difference between current date and sanction/recommendation date where status is not "completed" and age exceeds 24 months.',
    whyItMatters: 'Highlights stuck public works, unspent public capital, delayed citizen utility benefits, and administrative paralysis.',
    liveCountApprox: '50+ flags in national dataset',
  },
  {
    code: 'COST_OVERRUN_EXCEEDED',
    name: 'Cost Overrun Exceeded',
    severity: 'HIGH',
    status: 'DATA_LIMITED',
    shortDescription: 'Designed to flag expenditure amounts that significantly exceed initial technical sanction.',
    fullLogic: 'Compares expenditureAmount against sanctionedAmount where expenditure exceeds 110% of sanctioned limit.',
    whyItMatters: 'Prevents unauthorized escalations and unapproved vendor revisions.',
    dataNote: 'Currently inactive / returning 0 results because the national source dataset does not separately publish interim variation certificates prior to project closure.',
  },
  {
    code: 'ZERO_EXPENDITURE_COMPLETED',
    name: 'Zero Expenditure Completed',
    severity: 'CRITICAL',
    status: 'DATA_LIMITED',
    shortDescription: 'Designed to detect projects marked "completed" with ₹0 expenditure logged.',
    fullLogic: 'Identifies records with status="completed" and expenditureAmount=0 after 180 days from completion date.',
    whyItMatters: 'Detects phantom completion certificates or severe accounting reporting backlog.',
    dataNote: 'Currently inactive / returning 0 results due to reporting lag in portal accounting uploads.',
  },
];
