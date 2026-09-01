import type { ChangeEvent } from "react";

type SignatureUploadProps = {
  signaturePreview: string | null;
  onUpload: (dataUrl: string | null) => void;
};

export default function SignatureUpload({
  signaturePreview,
  onUpload,
}: SignatureUploadProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onUpload(null);
      return;
    }
    if (file.size > 1_500_000) {
      alert("Signature image must be under ~1.5MB. Compress and try again.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      onUpload(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">Signature Image</h2>
      <div className="space-y-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
        />
        {signaturePreview ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <img
              src={signaturePreview}
              alt="Signature preview"
              className="max-h-24 w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => onUpload(null)}
              className="mt-2 text-xs font-medium text-slate-600 underline hover:text-slate-900"
            >
              Remove signature
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Upload a transparent PNG of your signature (optional). Saved with your profile.
          </p>
        )}
      </div>
    </section>
  );
}
