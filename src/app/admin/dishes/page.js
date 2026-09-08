import { adminDishes } from "@/lib/types";

export default function AdminDishesPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Dishes</p>
          <h1 className="text-3xl font-bold text-slate-900">Menu catalog</h1>
        </div>
        <button type="button" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          Add dish
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminDishes.map((dish) => (
          <article key={dish.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-center text-2xl leading-[3rem]">
                🍽️
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {dish.stock} in stock
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{dish.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{dish.category}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">${dish.price.toFixed(2)}</span>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
