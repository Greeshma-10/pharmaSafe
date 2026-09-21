import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { getCases } from "../../api/cases";
import { AlertTriangle, Search } from "lucide-react";

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

function CaseList() {
  const { data: cases, isLoading, isError, error } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    return cases.filter((c) => {
      const matchesSearch = c.drugName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" || c.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [cases, search, statusFilter, severityFilter]);

  if (isLoading)
    return <p className="text-slate-500 text-sm">Loading cases...</p>;
  if (isError)
    return (
      <p className="text-red-600 text-sm">
        Error: {(error as Error).message}
      </p>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by drug name..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="UnderReview">Under Review</option>
          <option value="PendingApproval">Pending Approval</option>
          <option value="Reported">Reported</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Severities</option>
          <option value="NonSerious">Non-Serious</option>
          <option value="Serious">Serious</option>
          <option value="LifeThreatening">Life-Threatening</option>
          <option value="Fatal">Fatal</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-medium text-slate-500">Drug</th>
              <th className="px-4 py-3 font-medium text-slate-500">
                Description
              </th>
              <th className="px-4 py-3 font-medium text-slate-500">
                Severity
              </th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition ${
                  c.escalated ? "bg-red-50/40" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/cases/${c.id}`}
                    className="font-medium text-slate-900 hover:text-teal-700 flex items-center gap-1.5"
                  >
                    {c.escalated && (
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    )}
                    {c.drugName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                  {c.eventDescription}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      severityStyles[c.severity] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {c.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      statusStyles[c.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {c.daysUntilDeadline >= 0
                    ? `${c.daysUntilDeadline}d remaining`
                    : `${Math.abs(c.daysUntilDeadline)}d overdue`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCases.length === 0 && (
          <p className="text-sm text-slate-500 px-4 py-6 text-center">
            No cases match your filters.
          </p>
        )}
      </div>
    </div>
  );
}

export default CaseList;