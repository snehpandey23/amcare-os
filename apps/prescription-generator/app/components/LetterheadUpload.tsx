import type { ChangeEvent } from "react";

type LetterheadUploadProps = {
  letterheadPreview: string | null;
  onUpload: (dataUrl: string | null) => void;
};

export default function LetterheadUpload({
  letterheadPreview,
  onUpload,
}: LetterheadUploadProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onUpload(null);
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
      <h2 className="text-lg font-semibold text-slate-800">
        1. Upload Letterhead
      </h2>
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
        />
        {letterheadPreview ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <img
              src={letterheadPreview}
              alt="Letterhead preview"
              className="max-h-32 w-auto object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Upload a clinic letterhead image (logo, name, address).
          </p>
        )}
      </div>
    </section>
  );
}
