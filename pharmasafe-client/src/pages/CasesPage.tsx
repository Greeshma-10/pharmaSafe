import { useAuth } from "../features/auth/AuthContext";
import AppShell from "../components/AppShell";
import CaseList from "../features/cases/CaseList";
import CreateCaseForm from "../features/cases/CreateCaseForm";

function CasesPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "IntakeCoordinator";

  return (
    <AppShell title="Cases" subtitle="Track adverse event reports and their reporting deadlines">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {canCreate && (
          <div className="mb-8">
            <CreateCaseForm />
          </div>
        )}
        <CaseList />
      </div>
    </AppShell>
  );
}

export default CasesPage;