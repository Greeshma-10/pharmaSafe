import { useQuery } from "@tanstack/react-query";
import { getCaseSummary } from "../api/cases";
import AppShell from "../components/AppShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const severityColors: Record<string, string> = {
  NonSerious: "#64748b",
  Serious: "#d97706",
  LifeThreatening: "#ea580c",
  Fatal: "#dc2626",
};

function DashboardPage() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ["cases", "summary"],
    queryFn: getCaseSummary,
  });

  if (isLoading) {
    return (
      <AppShell title="Dashboard" subtitle="Overview of case activity and regulatory risk">
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !summary) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600 text-sm">Failed to load dashboard.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Cases</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {summary.totalCases}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Open Cases</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {summary.totalOpen}
            </p>
          </div>
          <div
            className={`p-5 rounded-lg border shadow-sm ${
              summary.atRiskCount > 0
                ? "bg-red-50 border-red-200"
                : "bg-white border-slate-200"
            }`}
          >
            <p
              className={`text-sm ${
                summary.atRiskCount > 0 ? "text-red-700" : "text-slate-500"
              }`}
            >
              At Risk of Deadline
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${
                summary.atRiskCount > 0 ? "text-red-700" : "text-slate-900"
              }`}
            >
              {summary.atRiskCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Cases by Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Cases by Severity
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summary.bySeverity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {summary.bySeverity.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={severityColors[entry.severity] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default DashboardPage;