export function StatusBadge({ status }) {
  const tones = {
    Preparing: "bg-amber-100 text-amber-700",
    "On the way": "bg-sky-100 text-sky-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Pending: "bg-slate-200 text-slate-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] || "bg-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
}
