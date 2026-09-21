import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../../api/auth";
import { useAuth } from "./AuthContext";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["IntakeCoordinator", "SafetyReviewer", "QAApprover"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "IntakeCoordinator" },
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      login(data);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Register</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name
        </label>
        <input
          {...registerField("name")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          {...registerField("email")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          type="password"
          {...registerField("password")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Role
        </label>
        <select
          {...registerField("role")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="IntakeCoordinator">Intake Coordinator</option>
          <option value="SafetyReviewer">Safety Reviewer</option>
          <option value="QAApprover">QA Approver</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-teal-600 text-white py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
      >
        {mutation.isPending ? "Registering..." : "Register"}
      </button>

      {mutation.isError && (
        <p className="text-sm text-red-600 mt-3 text-center">
          Registration failed. Email may already be taken.
        </p>
      )}

      <p className="text-sm text-slate-600 text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;