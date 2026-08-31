import { RuleCode, SeverityLevel } from '../types';

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2)} L`;
  }
  if (abs >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(1)} K`;
  }
  return formatINR(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return 'N/A';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeStr;
  }
}

export function getSeverityStyles(severity: SeverityLevel | string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hex: string;
} {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-[#EF4444]',
        hex: '#EF4444',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-[#F97316]',
        hex: '#F97316',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-[#F59E0B]',
        hex: '#F59E0B',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-[#3B82F6]',
        hex: '#3B82F6',
      };
  }
}

export function getRuleName(ruleCode: RuleCode | string): string {
  switch (ruleCode) {
    case 'DUPLICATE_WORK_PROPOSAL':
      return 'Duplicate Work Proposal';
    case 'PROJECT_CHRONIC_DELAY':
      return 'Project Chronic Delay';
    case 'SUSPICIOUS_UNIFORM_ALLOCATION':
      return 'Suspicious Uniform Allocation';
    case 'COST_OVERRUN_EXCEEDED':
      return 'Cost Overrun Exceeded';
    case 'ZERO_EXPENDITURE_COMPLETED':
      return 'Zero Expenditure Completed';
    default:
      return ruleCode?.replace(/_/g, ' ') || 'Unknown Anomaly';
  }
}
