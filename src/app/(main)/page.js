"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { demoMenu, demoCategories } from "@/lib/types";
import { useCart } from "@/providers/cart-provider";

export default function HomePage() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleItems = useMemo(() => {
    if (activeCategory === "All") return demoMenu;
    return demoMenu.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-orange-100">Fast delivery</p>
        <h1 className="mt-3 text-4xl font-black">Craving something delicious?</h1>
        <p className="mt-3 max-w-lg text-orange-50">
          Explore chef-picked favorites, custom bowls, and perfect comfort food for your next meal.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {demoCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 text-6xl">
              {item.image}
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.category}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  ★ {item.rating}
                </span>
              </div>

              <p className="text-sm text-slate-600">{item.description}</p>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{item.prepTime}</span>
                <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
              </div>

              <Button
                type="button"
                onClick={() => addItem(item)}
                className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-700"
              >
                Add to cart
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
