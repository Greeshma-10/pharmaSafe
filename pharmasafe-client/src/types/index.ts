export type Severity = "NonSerious" | "Serious" | "LifeThreatening" | "Fatal";
export type CaseStatus = "New" | "UnderReview" | "PendingApproval" | "Reported" | "Closed";

export interface Case {
  id: number;
  drugName: string;
  eventDescription: string;
  severity: Severity;
  status: CaseStatus;
  reportedAt: string;
  deadline: string;
  assignedReviewerName: string | null;
  daysUntilDeadline: number;
  escalated: boolean;
}

export interface CreateCaseInput {
  drugName: string;
  eventDescription: string;
  severity: number; // enum index: NonSerious=0, Serious=1, LifeThreatening=2, Fatal=3
}

export interface HistoryEntry {
  action: string;
  performedByEmail: string;
  timestamp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface ReviewerOption {
  id: number;
  name: string;
  role: string;
}

export interface CaseSummary {
  totalCases: number;
  totalOpen: number;
  atRiskCount: number;
  byStatus: { status: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}