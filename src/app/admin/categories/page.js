export default function AdminCategoriesPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Categories</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Menu categories</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Pizza', 'Burgers', 'Bowls', 'Drinks', 'Desserts'].map((category) => (
          <div key={category} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-800">{category}</span>
              <button type="button" className="text-sm font-medium text-orange-500">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
