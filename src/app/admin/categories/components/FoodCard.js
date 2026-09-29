"use client";
import { Pen, Image as ImageIcon } from "lucide-react";

export default function FoodCard({ food, onEdit }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt={food.foodName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <button
          onClick={() => onEdit(food)}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#f84c4c] shadow-md transition hover:bg-slate-50"
        >
          <Pen className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold leading-tight text-[#f84c4c]">{food.foodName}</h4>
        <span className="text-sm font-bold text-slate-900">${food.price}</span>
      </div>
      <p className="line-clamp-3 text-xs text-slate-500">{food.description}</p>
    </div>
  );
}