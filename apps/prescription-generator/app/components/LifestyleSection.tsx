import type { UseFormRegister } from "react-hook-form";

import type { PrescriptionFormData } from "../types";

type LifestyleSectionProps = {
  register: UseFormRegister<PrescriptionFormData>;
};

export default function LifestyleSection({ register }: LifestyleSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">
        6. Lifestyle & Follow-up Advice
      </h2>
      <textarea
        rows={4}
        {...register("lifestyleAdvice")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Diet, exercise, follow-up schedule..."
      />
    </section>
  );
}
