export type UserRole = 'citizen' | 'district' | 'state' | 'ministry';

export interface UserSession {
  role: UserRole;
  username: string;
  assignedState?: string;
  assignedDistrict?: string;
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RuleCode =
  | 'DUPLICATE_WORK_PROPOSAL'
  | 'PROJECT_CHRONIC_DELAY'
  | 'SUSPICIOUS_UNIFORM_ALLOCATION'
  | 'COST_OVERRUN_EXCEEDED'
  | 'ZERO_EXPENDITURE_COMPLETED';

export interface AnomalyItem {
  id: number;
  ruleCode: RuleCode | string;
  severity: SeverityLevel;
  description: string;
  relatedProjectId: number;
  relatedMpId: number;
  detectedAt?: string;
  mpName?: string;
  projectTitle?: string;
}

export interface MPListItem {
  id: number;
  name: string;
  constituency: string;
  state: string;
  party: string; // Parliamentary House: "Lok Sabha" / "Rajya Sabha"
  allocatedAmount?: number;
  totalExpenditure?: number;
  utilizationPercentage?: number;
  completedWorksCount?: number;
  recommendedWorksCount?: number;
  completionRate?: number;
  unspentAmount?: number;
  totalAnomalies?: number;
  [key: string]: unknown;
}

export interface MPDashboardData {
  id: number;
  name: string;
  constituency: string;
  state: string;
  party: string; // Parliamentary House: "Lok Sabha" | "Rajya Sabha"
  totalWorksCount: number;
  totalAnomalies: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  allocatedAmount: number;
  totalExpenditure: number;
  unspentAmount: number;
  completionRate: number;
  utilizationPercentage: number;
  calculatedRiskScore?: number;
  [key: string]: unknown;
}

export interface ProjectData {
  id: number;
  projectCode: string;
  title: string;
  category: string;
  agencyName: string;
  recommendedAmount: number;
  sanctionedAmount: number;
  expenditureAmount: number;
  recommendationDate?: string | null;
  sanctionDate?: string | null;
  completionDate?: string | null;
  status: string;
  mp?: MPListItem;
  [key: string]: unknown;
}

export interface FlaggedProjectItem {
  project: ProjectData;
  flagged: boolean;
  anomalies: AnomalyItem[];
  [key: string]: unknown;
}

export interface DebugStats {
  totalProjectsInDB?: number;
  totalMpsInDB?: number;
  totalAnomaliesInDB?: number;
  anomalyTypeBreakdown?: {
    DUPLICATE_WORK_PROPOSAL?: number;
    PROJECT_CHRONIC_DELAY?: number;
    SUSPICIOUS_UNIFORM_ALLOCATION?: number;
    COST_OVERRUN_EXCEEDED?: number;
    ZERO_EXPENDITURE_COMPLETED?: number;
    [key: string]: number | undefined;
  };
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  content?: T[];
  items?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  last?: boolean;
}

export type ReviewStatus = 'pending' | 'escalated' | 'resolved';

export interface ProjectReviewAction {
  projectId: number;
  status: ReviewStatus;
  actionByRole: UserRole;
  actionByUsername: string;
  timestamp: string;
  note?: string;
}

export interface StateSummary {
  stateName: string;
  totalMps: number;
  totalProjects: number;
  totalAnomalies: number;
  totalAllocated: number;
  totalExpenditure: number;
  avgUtilization: number;
  avgRiskScore: number;
  mps: MPListItem[];
}
