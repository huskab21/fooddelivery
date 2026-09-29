"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function AddCategoryModal({ isOpen, onClose, onAdd, isCreating }) {
  const [categoryName, setCategoryName] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!categoryName.trim()) {
      alert("Ангилалын нэрийг оруулна уу");
      return;
    }
    onAdd(categoryName);
    setCategoryName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
      <div className="h-60 w-96 rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Add new category</h3>
          <button
            onClick={() => {
              onClose();
              setCategoryName("");
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-2 text-sm font-semibold">Category name</p>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Ангилалын нэрээ оруулна уу..."
          className="mb-4 mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleAdd}
            disabled={isCreating || !categoryName.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "Add category"}
          </button>
        </div>
      </div>
    </div>
  );
}