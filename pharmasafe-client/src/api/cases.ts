import { apiClient } from "./client";
import type { Case, CreateCaseInput, HistoryEntry, CaseStatus , CaseSummary} from "../types";

export const getCases = async (): Promise<Case[]> => {
  const response = await apiClient.get<Case[]>("/cases");
  return response.data;
};

export const getCaseById = async (id: number): Promise<Case> => {
  const response = await apiClient.get<Case>(`/cases/${id}`);
  return response.data;
};

export const getCaseHistory = async (id: number): Promise<HistoryEntry[]> => {
  const response = await apiClient.get<HistoryEntry[]>(`/cases/${id}/history`);
  return response.data;
};

export const createCase = async (input: CreateCaseInput): Promise<Case> => {
  const response = await apiClient.post<Case>("/cases", input);
  return response.data;
};

const statusToNumber: Record<CaseStatus, number> = {
  New: 0,
  UnderReview: 1,
  PendingApproval: 2,
  Reported: 3,
  Closed: 4,
};

export const updateCaseStatus = async (id: number, status: CaseStatus): Promise<void> => {
  await apiClient.put(`/cases/${id}/status`, { status: statusToNumber[status] });
};

export const assignReviewer = async (id: number, reviewerId: number): Promise<void> => {
  await apiClient.put(`/cases/${id}/assign`, { reviewerId });
};

export const getCaseSummary = async (): Promise<CaseSummary> => {
  const response = await apiClient.get<CaseSummary>("/cases/summary");
  return response.data;
};