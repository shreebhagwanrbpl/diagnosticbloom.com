export default function SectionTitle({
  badge,
  title,
  description,
  center = false,
  className = "",
}) {
  return (
    <div
      className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`}
    >
      {badge && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-[#eef2ff] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#3652BA] shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#3652BA] animate-pulse" />
          {badge}
        </div>
      )}

      {title && (
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl md:text-5xl leading-tight">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#64748b]">
          {description}
        </p>
      )}
    </div>
  );
}