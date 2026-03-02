import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import type { PrescriptionFormData } from "../types";

type MedicationFormProps = {
  control: Control<PrescriptionFormData>;
  register: UseFormRegister<PrescriptionFormData>;
  errors: FieldErrors<PrescriptionFormData>;
};

export default function MedicationForm({
  control,
  register,
  errors,
}: MedicationFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          5. Medications
        </h2>
        <button
          type="button"
          onClick={() =>
            append({
              name: "",
              dosage: "",
              frequency: "",
              instructions: "",
            })
          }
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Medication
        </button>
      </div>
      {typeof (errors.medications as { message?: string } | undefined)
        ?.message === "string" && (
        <p className="text-xs text-red-600">
          {(errors.medications as { message?: string }).message}
        </p>
      )}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Medication #{index + 1}
              </p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Medication Name
                </label>
                <input
                  type="text"
                  {...register(`medications.${index}.name`, {
                    required: "Medication name is required.",
                  })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Medication name"
                />
                {errors.medications?.[index]?.name?.message && (
                  <p className="text-xs text-red-600">
                    {errors.medications[index]?.name?.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Dosage
                </label>
                <input
                  type="text"
                  {...register(`medications.${index}.dosage`)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 500 mg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Frequency
                </label>
                <input
                  type="text"
                  {...register(`medications.${index}.frequency`)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., twice daily"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Custom Instructions
                </label>
                <input
                  type="text"
                  {...register(`medications.${index}.instructions`)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Custom instructions"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
