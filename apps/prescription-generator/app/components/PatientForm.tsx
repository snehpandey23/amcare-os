import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { PrescriptionFormData } from "../types";

type PatientFormProps = {
  register: UseFormRegister<PrescriptionFormData>;
  errors: FieldErrors<PrescriptionFormData>;
};

export default function PatientForm({ register, errors }: PatientFormProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Patient Details</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-slate-700">
            Patient Name *
          </label>
          <input
            type="text"
            {...register("patientName", {
              required: "Patient name is required.",
            })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Anita Sharma"
          />
          {errors.patientName?.message && (
            <p className="text-xs text-red-600">{errors.patientName.message}</p>
          )}
        </div>
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-slate-700">DOB</label>
          <input
            type="date"
            {...register("dob")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-slate-700">Gender</label>
          <input
            type="text"
            {...register("gender")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Female"
          />
        </div>
      </div>
    </section>
  );
}
