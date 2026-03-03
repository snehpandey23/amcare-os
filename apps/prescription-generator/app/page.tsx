"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import LifestyleSection from "./components/LifestyleSection";
import MedicationForm from "./components/MedicationForm";
import PatientForm from "./components/PatientForm";
import PrescriptionPreview from "./components/PrescriptionPreview";
import type { PrescriptionFormData } from "./types";
import { generatePDF } from "./utils/generatePDF";

export default function Home() {
  const [letterheadImage, setLetterheadImage] = useState<{
    bytes: Uint8Array;
    mime: string;
  } | null>(null);
  const [signatureImage, setSignatureImage] = useState<{
    bytes: Uint8Array;
    mime: string;
  } | null>(null);
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(
    "/letterhead-logo.png"
  );
  const [pdfError, setPdfError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<PrescriptionFormData>({
    defaultValues: {
      doctorName: "Dr. SP Pandey MBBS MD Dipl. ABOM",
      degree: "",
      regNo: "UPMC RegNo 91493",
      clinicContact: "9621550481",
      clinicAddress: "39 Mukta Vihar, Naini, Prayagraj 211009",
      patientName: "",
      dob: "",
      gender: "",
      briefHistory: "",
      medications: [
        {
          name: "",
          dosage: "",
          frequency: "",
          instructions: "",
        },
      ],
      lifestyleAdvice: "",
    },
  });

  const previewData = watch();

  const fetchImageBytes = async (path: string) => {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }
    const blob = await response.blob();
    let mime = blob.type || "image/png";
    let bytes: Uint8Array | null = null;
    try {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((output) => resolve(output), "image/png");
        });
        if (pngBlob) {
          const buffer = await pngBlob.arrayBuffer();
          bytes = new Uint8Array(buffer);
          mime = "image/png";
        }
      }
    } catch {
      bytes = null;
    }
    if (!bytes) {
      const buffer = await blob.arrayBuffer();
      bytes = new Uint8Array(buffer);
    }
    return { bytes, mime };
  };

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const letterhead = await fetchImageBytes("/letterhead-logo.png");
        setLetterheadImage(letterhead);
      } catch {
        setLetterheadImage(null);
        setLetterheadPreview(null);
      }
      try {
        const signature = await fetchImageBytes("/signature-sneh-pandey.png");
        setSignatureImage(signature);
      } catch {
        setSignatureImage(null);
      }
    };
    loadAssets();
  }, []);

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
    const resolvedLetterhead =
      letterheadImage ?? (await fetchImageBytes("/letterhead-logo.png").catch(() => null));
    const resolvedSignature =
      signatureImage ?? (await fetchImageBytes("/signature-sneh-pandey.png").catch(() => null));

    const pdfBytes = await generatePDF({
        ...data,
      letterheadImage: resolvedLetterhead,
      signatureImage: resolvedSignature,
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
      setPdfError(
        "PDF generation failed. Please retry or remove special characters."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Prescription Generator
          </h1>
          <p className="text-sm text-slate-500">
            Create professional, printable prescriptions for Indian patients.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 rounded-xl bg-white p-6 shadow-md"
          >
            <section className="space-y-4">
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_3fr] sm:items-center">
                <div className="flex justify-center sm:justify-start">
                  <img
                    src="/letterhead-logo.png"
                    alt="Amcare India logo"
                    className="h-auto w-full max-w-[140px] object-contain"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                    Amcare India
                  </p>
                  <p className="text-sm text-slate-600">
                    39 Mukta Vihar, Naini, Prayagraj 211009
                  </p>
                  <p className="text-sm text-slate-600">📞 9621550481</p>
                  <p className="text-lg font-semibold text-slate-800">
                    Dr. SP Pandey MBBS MD Dipl. ABOM
                  </p>
                  <p className="text-xs text-slate-500">UPMC RegNo 91493</p>
                </div>
              </div>
              <div className="h-0.5 w-full rounded-full bg-slate-900/80" />
            </section>
            <PatientForm register={register} errors={errors} />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-800">
                4. Brief History
              </h2>
              <textarea
                rows={4}
                {...register("briefHistory")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Presenting complaints, past history..."
              />
            </section>

            <MedicationForm
              control={control}
              register={register}
              errors={errors}
            />

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
            <PrescriptionPreview
              data={previewData}
              letterheadPreview={letterheadPreview}
            />
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
              PDF output uses clean serif typography with Rx symbol, date, and
              signature line.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
