import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { PrescriptionFormData } from "../types";

type DoctorDetailsProps = {
  register: UseFormRegister<PrescriptionFormData>;
  errors: FieldErrors<PrescriptionFormData>;
};

export default function DoctorDetails({ register, errors }: DoctorDetailsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Doctor Details</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Doctor Name *
          </label>
          <input
            type="text"
            {...register("doctorName", { required: "Doctor name is required." })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Dr. Asha Mehta"
          />
          {errors.doctorName?.message && (
            <p className="text-xs text-red-600">{errors.doctorName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Degree</label>
          <input
            type="text"
            {...register("degree")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="MBBS, MD"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Registration Number *
          </label>
          <input
            type="text"
            {...register("regNo", {
              required: "Registration number is required.",
            })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="MCI/12345/2020"
          />
          {errors.regNo?.message && (
            <p className="text-xs text-red-600">{errors.regNo.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Clinic Contact
          </label>
          <input
            type="text"
            {...register("clinicContact")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">
          Clinic Address
        </label>
        <textarea
          rows={2}
          {...register("clinicAddress")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="12, MG Road, Mumbai, Maharashtra"
        />
      </div>
    </section>
  );
}
