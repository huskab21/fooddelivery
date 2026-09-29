"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function CategoryFilter({
  categories,
  activeCategory,
  setActiveCategory,
  totalCount,
  getCategoryCount,
  onDeleteCategory,
  onAddClick,
  onEditCategory, // Шинээр нэмэгдсэн: Засах функц
}) {
  // Засаж буй ангиллын ID болон бичиж буй нэрийг хадгалах State-үүд
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // 1. Хоёр дарах үед засах горимд шилжүүлэх
  const handleDoubleClick = (category) => {
    setEditingId(category._id);
    setEditName(category.FoodCategoryName);
  };

  // 2. Хадгалах үйлдэл
  const handleSave = (id) => {
    // Анхны нэрээс өөрчлөгдсөн эсэхийг шалгах (Дэмий API дуудахгүй байхын тулд)
    const originalCategory = categories.find((c) => c._id === id);

    if (
      editName.trim() !== "" &&
      editName !== originalCategory?.FoodCategoryName
    ) {
      onEditCategory(id, editName);
    }
    setEditingId(null); // Засах горимоос гарах
  };

  // 3. Гараас товч дарах үеийн үйлдэл
  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Хуудас refresh хийгдэхээс сэргийлнэ
      e.target.blur(); // Enter дарвал input-ээс курсорыг гаргаж, onBlur эвентийг автоматаар дуудна (Ингэснээр handleSave ажиллана)
    }
    if (e.key === "Escape") {
      setEditingId(null); // Escape дарвал болино
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Dishes category</h2>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* All Dishes товч */}
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "border-red-500 bg-white text-black"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All Dishes
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
            {totalCount}
          </span>
        </button>

        {/* Бусад ангиллууд */}
        {categories.map((category) => {
          const isActive = category._id === activeCategory;
          const isEditing = editingId === category._id;

          // Хэрвээ тухайн ангиллыг засаж байгаа бол Input харуулна
          if (isEditing) {
            return (
              <input
                key={category._id}
                type="text"
                autoFocus // Гарч ирэнгүүт шууд бичихэд бэлэн болгоно
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleSave(category._id)} // Хулганаар өөр газар дарвал хадгална
                onKeyDown={(e) => handleKeyDown(e, category._id)} // Enter, Esc хянах
                className="flex w-32 items-center gap-2 rounded-full border-2 border-red-400 bg-white px-3 py-1.5 text-sm font-medium outline-none"
              />
            );
          }

          // Хэрвээ засах горимд биш бол энгийн товч харуулна
          return (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
              onDoubleClick={() => handleDoubleClick(category)} // ХОЁР ДАРАХ ҮЙЛДЭЛ
              title="Хоёр дараад нэрийг солино уу"
              className={`group flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-3 text-sm font-medium transition cursor-text ${
                isActive
                  ? "border-red-500 bg-white text-black"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {category.FoodCategoryName}
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                {getCategoryCount(category._id)}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(category._id);
                }}
                className="ml-1 rounded-full p-1 text-slate-400 transition hover:bg-red-100 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}

        <button
          onClick={onAddClick}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f84c4c] text-white transition hover:bg-red-500"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
