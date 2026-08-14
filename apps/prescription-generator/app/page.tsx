"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import DoctorDetails from "./components/DoctorDetails";
import LetterheadUpload from "./components/LetterheadUpload";
import LifestyleSection from "./components/LifestyleSection";
import MedicationForm from "./components/MedicationForm";
import PatientForm from "./components/PatientForm";
import PrescriptionPreview from "./components/PrescriptionPreview";
import SignatureUpload from "./components/SignatureUpload";
import type { PrescriptionFormData } from "./types";
import { generatePDF } from "./utils/generatePDF";
import { useAuth } from "../lib/AuthContext";
import { fetchClinicProfile, saveClinicProfile } from "../lib/clinic-profile-api";

function dataUrlToImageBytes(dataUrl: string): { bytes: Uint8Array; mime: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mime };
}

const emptyForm: PrescriptionFormData = {
  clinicName: "",
  doctorName: "",
  degree: "",
  regNo: "",
  clinicContact: "",
  clinicAddress: "",
  patientName: "",
  dob: "",
  gender: "",
  briefHistory: "",
  medications: [{ name: "", dosage: "", frequency: "", instructions: "" }],
  lifestyleAdvice: "",
};

export default function Home() {
  const { user, authReady, authConfigured, logout } = useAuth();
  const router = useRouter();
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    getValues,
    formState: { errors },
    watch,
  } = useForm<PrescriptionFormData>({
    defaultValues: emptyForm,
  });

  const previewData = watch();

  useEffect(() => {
    if (!authReady) return;
    if (!authConfigured || !user) {
      router.replace("/login");
    }
  }, [authReady, authConfigured, user, router]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const profile = await fetchClinicProfile();
      reset({
        ...emptyForm,
        clinicName: profile.clinicName,
        doctorName: profile.doctorName,
        degree: profile.degree,
        regNo: profile.regNo,
        clinicContact: profile.clinicContact,
        clinicAddress: profile.clinicAddress,
      });
      setLogoDataUrl(profile.logoDataUrl);
      setSignatureDataUrl(profile.signatureDataUrl);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not load clinic profile");
    } finally {
      setProfileLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    if (authReady && user) void loadProfile();
  }, [authReady, user, loadProfile]);

  const onSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);
    try {
      const values = getValues();
      const profile = await saveClinicProfile({
        clinicName: values.clinicName,
        doctorName: values.doctorName,
        degree: values.degree,
        regNo: values.regNo,
        clinicContact: values.clinicContact,
        clinicAddress: values.clinicAddress,
        logoDataUrl,
        signatureDataUrl,
        clearLogo: !logoDataUrl,
        clearSignature: !signatureDataUrl,
      });
      setLogoDataUrl(profile.logoDataUrl);
      setSignatureDataUrl(profile.signatureDataUrl);
      setProfileMessage("Clinic profile saved. It will load automatically next time you sign in.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save clinic profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    setPdfError(null);
    if (!data.medications || data.medications.length === 0) {
      setError("medications", {
        type: "manual",
        message: "At least one medication is required.",
      });
      return;
    }

    try {
      const letterheadImage = logoDataUrl ? dataUrlToImageBytes(logoDataUrl) : null;
      const signatureImage = signatureDataUrl ? dataUrlToImageBytes(signatureDataUrl) : null;

      const pdfBytes = await generatePDF({
        ...data,
        letterheadImage,
        signatureImage,
      });
      const safeBytes = Uint8Array.from(pdfBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prescription-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      setPdfError("PDF generation failed. Please retry or remove special characters.");
    }
  };

  if (!authReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        {authReady ? "Redirecting to sign in…" : "Loading…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold text-slate-900">Prescription Generator</h1>
            <p className="text-sm text-slate-500">
              Signed in as {user.name || user.email}. Clinic letterhead is saved to your staff account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Sign out
          </button>
        </header>

        {profileLoading ? (
          <p className="text-center text-sm text-slate-500">Loading your clinic profile…</p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 rounded-xl bg-white p-6 shadow-md"
          >
            <LetterheadUpload
              letterheadPreview={logoDataUrl}
              onUpload={(dataUrl) => setLogoDataUrl(dataUrl)}
            />

            <DoctorDetails register={register} errors={errors} />

            <SignatureUpload
              signaturePreview={signatureDataUrl}
              onUpload={(dataUrl) => setSignatureDataUrl(dataUrl)}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => void onSaveProfile()}
                disabled={savingProfile}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Save clinic profile"}
              </button>
              {profileMessage ? (
                <p className="text-xs text-emerald-700">{profileMessage}</p>
              ) : null}
              {profileError ? <p className="text-xs text-red-700">{profileError}</p> : null}
            </div>

            <div className="h-0.5 w-full rounded-full bg-slate-900/80" />

            <PatientForm register={register} errors={errors} />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-800">Brief History</h2>
              <textarea
                rows={4}
                {...register("briefHistory")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Presenting complaints, past history..."
              />
            </section>

            <MedicationForm control={control} register={register} errors={errors} />

            <LifestyleSection register={register} />

            {pdfError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {pdfError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Generate PDF
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <PrescriptionPreview data={previewData} letterheadPreview={logoDataUrl} />
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
              PDF uses your saved clinic name, address, contact, doctor details, logo, and signature —
              not shared Amcare defaults. Prescription medications stay on this page only (not saved).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
