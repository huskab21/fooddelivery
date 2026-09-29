// Cart болон Order таб хоосон үед харуулах блок
export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-50 px-6 py-8 text-center">
      {/* NomNom-ийн тагтай таваг icon */}
      <svg
        viewBox="0 0 48 48"
        fill="currentColor"
        className="mb-3 h-12 w-12 text-red-500"
        aria-hidden="true"
      >
        <circle cx="24" cy="11" r="3" />
        <path d="M6 34a18 18 0 0 1 36 0z" />
        <rect x="3" y="36" width="42" height="4" rx="2" />
      </svg>
      <p className="text-base font-bold text-black">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}