"use client";
import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { createFood, updateFood } from "@/app/_api/api"; // <-- шинэ импорт

export default function DishModal({
  isOpen,
  onClose,
  onSave,
  selectedCategory,
  editingFood,
}) {
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishIngredients, setDishIngredients] = useState("");
  const [dishImage, setDishImage] = useState(null); // Энэ нь File object хадгална
  const [imagePreview, setImagePreview] = useState(null); // Энэ нь Preview харуулах URL хадгална

  // Зураг хуулагдаж/хадгалагдаж дуусахыг хүлээх төлөв
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingFood) {
      setDishName(editingFood.name || "");
      setDishPrice(editingFood.price || "");
      setDishIngredients(editingFood.ingredients || "");
      setImagePreview(editingFood.image || null);
    } else {
      setDishName("");
      setDishPrice("");
      setDishIngredients("");
      setImagePreview(null);
      setDishImage(null);
    }
  }, [editingFood, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDishImage(file);
      // Сонгосон зургийг түр дэлгэцэнд харуулах URL үүсгэх
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!dishName || !dishPrice) {
      alert("Хоолны нэр болон үнийг оруулна уу!");
      return;
    }

    let uploadedImageUrl = imagePreview;

    setIsUploading(true);

    try {
      // 1. Хэрэв шинэ зураг сонгосон бол эхлээд Cloudinary руу хуулна
      if (dishImage) {
        const formData = new FormData();
        formData.append("file", dishImage);

        // Таны өгсөн Cloudinary мэдээллүүд
        const upload_preset =
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "foods_upload";
        const cloudName =
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "t8wqks8q";

        formData.append("upload_preset", upload_preset);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const cloudData = await cloudRes.json();

        // Хэрэв амжилттай хуулагдвал secure_url-ийг авна
        if (cloudData.secure_url) {
          uploadedImageUrl = cloudData.secure_url;
        } else {
          throw new Error("Cloudinary-аас линк ирсэнгүй");
        }
      }

      // 2. Backend (MongoDB) руу бодитоор хадгалах
      const payload = {
        foodName: dishName,
        price: Number(dishPrice),
        description: dishIngredients,
        categoryId: selectedCategory?._id,
        imageUrl: uploadedImageUrl,
      };

      let savedFood;
      if (editingFood) {
        savedFood = await updateFood({ id: editingFood._id, ...payload });
      } else {
        savedFood = await createFood(payload);
      }

      // 3. Parent component-т MongoDB-ээс буцаж ирсэн ЖИНХЭНЭ document-ийг дамжуулна
      const dishData = {
        _id: savedFood._id,
        name: savedFood.foodName,
        price: savedFood.price,
        ingredients: savedFood.description,
        categoryId: savedFood.categoryId,
        image: savedFood.imageUrl,
      };

      onSave(dishData, !!editingFood);
      onClose();
    } catch (error) {
      console.error("Хоол хадгалахад алдаа гарлаа:", error);
      alert("Хоол хадгалахад алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[450px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {editingFood
              ? "Edit Dish"
              : `Add new Dish to ${selectedCategory?.FoodCategoryName || "Category"}`}
          </h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Food name
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                disabled={isUploading}
                placeholder="Type food name"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-red-400 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Food price
              </label>
              <input
                type="text"
                value={dishPrice}
                onChange={(e) => setDishPrice(e.target.value)}
                disabled={isUploading}
                placeholder="Enter price..."
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-red-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Ingredients
            </label>
            <textarea
              value={dishIngredients}
              onChange={(e) => setDishIngredients(e.target.value)}
              disabled={isUploading}
              placeholder="List ingredients..."
              rows={3}
              className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-red-400 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Food image
            </label>
            {imagePreview ? (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setDishImage(null);
                  }}
                  disabled={isUploading}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Choose a file or drag & drop
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="flex items-center justify-center rounded-lg bg-[#18181b] px-6 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:bg-slate-400"
          >
            {isUploading
              ? "Uploading..."
              : editingFood
                ? "Save Changes"
                : "Add Dish"}
          </button>
        </div>
      </div>
    </div>
  );
}