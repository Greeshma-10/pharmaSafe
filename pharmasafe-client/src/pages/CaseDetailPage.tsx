import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCaseById, getCaseHistory, updateCaseStatus, assignReviewer } from "../api/cases";
import { getReviewers } from "../api/users";
import { useAuth } from "../features/auth/AuthContext";
import type { CaseStatus } from "../types";
import { toLocalString } from "../lib/formatDate";
import AppShell from "../components/AppShell";
import { ArrowLeft, AlertTriangle, Clock, User, Pill } from "lucide-react";

const statusOptions: CaseStatus[] = [
  "New",
  "UnderReview",
  "PendingApproval",
  "Reported",
  "Closed",
];

const severityStyles: Record<string, string> = {
  NonSerious: "bg-slate-100 text-slate-700",
  Serious: "bg-amber-100 text-amber-700",
  LifeThreatening: "bg-orange-100 text-orange-700",
  Fatal: "bg-red-100 text-red-700",
};

const statusStyles: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  UnderReview: "bg-amber-100 text-amber-700",
  PendingApproval: "bg-purple-100 text-purple-700",
  Reported: "bg-green-100 text-green-700",
  Closed: "bg-slate-100 text-slate-500",
};

function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canReview = user?.role === "SafetyReviewer" || user?.role === "QAApprover";

  const { data: caseItem, isLoading, isError } = useQuery({
    queryKey: ["cases", caseId],
    queryFn: () => getCaseById(caseId),
  });

  const { data: history } = useQuery({
    queryKey: ["cases", caseId, "history"],
    queryFn: () => getCaseHistory(caseId),
  });

  const { data: reviewers } = useQuery({
    queryKey: ["reviewers"],
    queryFn: getReviewers,
    enabled: canReview,
  });

  const statusMutation = useMutation({
    mutationFn: (status: CaseStatus) => updateCaseStatus(caseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "history"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (reviewerId: number) => assignReviewer(caseId, reviewerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "history"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  if (isLoading) {
    return (
      <AppShell title="Case Detail">
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500 text-sm">Loading case...</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !caseItem) {
    return (
      <AppShell title="Case Detail">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600 text-sm">Case not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={caseItem.drugName}
      subtitle={`Case #${caseItem.id} · Reported ${toLocalString(caseItem.reportedAt)}`}
    >
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Link
          to="/cases"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5"
        >
          <ArrowLeft size={14} />
          Back to Cases
        </Link>

        {caseItem.escalated && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertTriangle size={16} className="shrink-0" />
            This case is at risk of missing its regulatory reporting deadline.
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={16} className="text-teal-700" />
                <h2 className="text-base font-semibold text-slate-900">
                  Event Details
                </h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {caseItem.eventDescription}
              </p>

              <div className="flex gap-2 mt-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    severityStyles[caseItem.severity]
                  }`}
                >
                  {caseItem.severity}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    statusStyles[caseItem.status]
                  }`}
                >
                  {caseItem.status}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Audit Trail
              </h2>
              <div className="space-y-4">
                {history?.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                      {index < history.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-slate-900">{entry.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {entry.performedByEmail} ·{" "}
                        {toLocalString(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {history?.length === 0 && (
                  <p className="text-sm text-slate-500">No history yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Case Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Deadline</p>
                    <p className="text-sm font-medium text-slate-900">
                      {toLocalString(caseItem.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Assigned Reviewer</p>
                    <p className="text-sm font-medium text-slate-900">
                      {caseItem.assignedReviewerName ?? "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {canReview && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Actions
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Change Status
                    </label>
                    <select
                      value={caseItem.status}
                      onChange={(e) =>
                        statusMutation.mutate(e.target.value as CaseStatus)
                      }
                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Assign Reviewer
                    </label>
                    <select
                      value=""
                      onChange={(e) =>
                        e.target.value &&
                        assignMutation.mutate(Number(e.target.value))
                      }
                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select reviewer...</option>
                      {reviewers?.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default CaseDetailPage;