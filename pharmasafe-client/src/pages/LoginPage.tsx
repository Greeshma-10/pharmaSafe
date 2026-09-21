import LoginForm from "../features/auth/LoginForm";

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
            PS
          </div>
          <span className="text-2xl font-bold text-slate-900">PharmaSafe</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;