import type { PrescriptionFormData } from "../types";

type PrescriptionPreviewProps = {
  data: PrescriptionFormData;
  letterheadPreview: string | null;
};

export default function PrescriptionPreview({
  data,
  letterheadPreview,
}: PrescriptionPreviewProps) {
  const doctorLine = [data.doctorName, data.degree].filter(Boolean).join(" ");

  return (
    <section className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-800">Preview Snapshot</h2>
      {letterheadPreview ? (
        <img
          src={letterheadPreview}
          alt="Logo preview"
          className="max-h-20 w-auto object-contain"
        />
      ) : (
        <p className="text-xs text-slate-500">No logo uploaded.</p>
      )}
      <div className="text-sm text-slate-700">
        <p className="font-semibold">{data.clinicName || "Clinic Name"}</p>
        <p className="text-xs text-slate-500">{data.clinicAddress || "Address"}</p>
        <p className="text-xs text-slate-500">{data.clinicContact || "Contact"}</p>
        <p className="mt-2 font-semibold">{doctorLine || "Doctor Name"}</p>
        <p className="text-xs text-slate-500">{data.regNo || "Registration No"}</p>
      </div>
      <div className="text-sm text-slate-700">
        <p className="font-semibold">{data.patientName || "Patient Name"}</p>
        <p className="text-xs text-slate-500">
          {data.gender || "Gender"} {data.dob ? `• ${data.dob}` : ""}
        </p>
        <p className="text-xs text-slate-500">
          Medications: {data.medications?.length || 0}
        </p>
      </div>
    </section>
  );
}
