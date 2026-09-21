import { apiClient } from "./client";
import type { ReviewerOption } from "../types";

export const getReviewers = async (): Promise<ReviewerOption[]> => {
  const response = await apiClient.get<ReviewerOption[]>("/users");
  return response.data;
};