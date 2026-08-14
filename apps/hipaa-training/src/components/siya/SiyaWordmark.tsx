/** Shared Siya wordmark — same Si/ya split as the brand intro splash. */

type Size = "header" | "login" | "compact";

const sizeClass: Record<Size, string> = {
  header: "text-[1.65rem] md:text-[1.85rem]",
  login: "text-[2.75rem] sm:text-[3.25rem]",
  compact: "text-xl",
};

export function SiyaWordmark({
  size = "header",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={`siya-wordmark inline-block font-[family-name:var(--font-poppins)] font-bold tracking-[-0.04em] leading-none ${sizeClass[size]} ${className}`}
      aria-label="Siya"
    >
      <span className="siya-wordmark__si">Si</span>
      <span className="siya-wordmark__ya">ya</span>
    </span>
  );
}
