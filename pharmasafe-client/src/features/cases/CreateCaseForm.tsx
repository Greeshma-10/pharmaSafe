import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCase } from "../../api/cases";

const severityOptions = [
  { label: "Non-Serious", value: 0 },
  { label: "Serious", value: 1 },
  { label: "Life-Threatening", value: 2 },
  { label: "Fatal", value: 3 },
];

const createCaseSchema = z.object({
  drugName: z.string().min(2, "Drug name is required"),
  eventDescription: z.string().min(10, "Please provide more detail (min 10 characters)"),
  severity: z.number().min(0).max(3),
});

type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

function CreateCaseForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseFormValues>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: { severity: 1 },
  });

  const mutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      reset();
    },
  });

  const onSubmit = (data: CreateCaseFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-5 rounded-lg border border-slate-200"
    >
      <h3 className="font-semibold text-slate-900 mb-3">Report New Case</h3>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Drug Name
        </label>
        <input
          {...register("drugName")}
          placeholder="e.g. Amoxicillin"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.drugName && (
          <p className="text-sm text-red-600 mt-1">{errors.drugName.message}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Event Description
        </label>
        <textarea
          {...register("eventDescription")}
          placeholder="Describe what happened..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {errors.eventDescription && (
          <p className="text-sm text-red-600 mt-1">
            {errors.eventDescription.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Severity
        </label>
        <select
  {...register("severity", { valueAsNumber: true })}
  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
>
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
      >
        {mutation.isPending ? "Submitting..." : "Report Case"}
      </button>

      {mutation.isError && (
        <p className="text-sm text-red-600 mt-2">Failed to create case.</p>
      )}
    </form>
  );
}

export default CreateCaseForm;