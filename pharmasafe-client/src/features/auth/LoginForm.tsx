import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../../api/auth";
import { useAuth } from "./AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Login</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          {...register("email")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-teal-600 text-white py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
      >
        {mutation.isPending ? "Logging in..." : "Login"}
      </button>

      {mutation.isError && (
        <p className="text-sm text-red-600 mt-3 text-center">
          Invalid credentials.
        </p>
      )}

      <p className="text-sm text-slate-600 text-center mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-teal-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;