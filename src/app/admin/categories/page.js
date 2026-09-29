"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { server } from "@/app/_api/api";
import CategoryFilter from "./components/CategoryFilter";
import AddCategoryModal from "./components/AddCategoryModal";
import DishModal from "./components/DishModal";
import FoodCard from "./components/FoodCard";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [showDishModal, setShowDishModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingFood, setEditingFood] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await server.get("/food-category/get");
      setCategories(response.data.foodCategories || []);
    } catch (err) {
      console.error("Error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await server.get("/food/get");
      setFoods(response.data.foods || []);
    } catch (err) {
      console.error("Error:", err);
      setFoods([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  // Туслах функц: food.categoryId нь populate хийгдсэн object эсвэл
  // populate хийгдээгүй string байж болно тул аль алиных нь ID-г буцаана.
  const getCategoryIdValue = (food) =>
    typeof food.categoryId === "object" && food.categoryId !== null
      ? food.categoryId._id
      : food.categoryId;

  const handleEditCategoryName = async (categoryId, newName) => {
    // 1. Optimistic Update (Дэлгэцээ шууд солих)
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === categoryId ? { ...cat, FoodCategoryName: newName } : cat
      )
    );

    try {
      // 2. Бааз руу шинэчлэх хүсэлт явуулах (Нэршлийг зассан)
      await server.put("/food-category/update", {
        id: categoryId, // _id биш id гэж явуулна
        name: newName, // FoodCategoryName биш name гэж явуулна
      });
    } catch (err) {
      console.error("Ангиллын нэр солиход алдаа гарлаа:", err);
      alert("Ангиллын нэр хадгалагдсангүй, алдаа гарлаа.");
      fetchCategories();
    }
  };

  const handleAddCategory = async (categoryName) => {
    setIsCreatingCategory(true);
    try {
      await server.post("/food-category/create", { FoodCategoryName: categoryName });
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      alert("Ангилал нэмэхэд алдаа гарлаа");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Та энэ ангиллыг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await server.delete("/food-category/delete", { data: { id: categoryId } });
      fetchCategories();
      if (activeCategory === categoryId) setActiveCategory("all");
    } catch (err) {
      alert("Ангилал устгахад алдаа гарлаа");
    }
  };

  const handleSaveDish = (dishData, isEdit) => {
    if (isEdit) {
      setFoods(foods.map((f) => (f._id === dishData._id ? dishData : f)));
    } else {
      setFoods([...foods, dishData]);
    }
  };

  const openAddDish = (category) => {
    setSelectedCategory(category);
    setEditingFood(null);
    setShowDishModal(true);
  };

  const openEditDish = (food) => {
    const cat = categories.find((c) => c._id === getCategoryIdValue(food));
    setSelectedCategory(cat);
    setEditingFood(food);
    setShowDishModal(true);
  };

  if (loading) return <p className="mt-5 ml-5 text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6 bg-[#f8f9fa] mt-21 ml-5 p-6 rounded-2xl">
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        totalCount={foods.length}
        getCategoryCount={(id) =>
          foods.filter((f) => getCategoryIdValue(f) === id).length
        }
        onDeleteCategory={handleDeleteCategory}
        onAddClick={() => setShowCategoryModal(true)}
        onEditCategory={handleEditCategoryName}
      />

      {categories
        .filter((cat) => activeCategory === "all" || cat._id === activeCategory)
        .map((category) => (
          <div key={category._id} className="relative mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {category.FoodCategoryName} (
              {foods.filter((f) => getCategoryIdValue(f) === category._id).length}
              )
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <button
                onClick={() => openAddDish(category)}
                className="flex min-h-65 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#f84c4c]/40 bg-white text-center transition hover:bg-red-50/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f84c4c] text-white">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  Add new Dish to
                  <br />
                  {category.FoodCategoryName}
                </span>
              </button>

              {foods
                .filter((food) => getCategoryIdValue(food) === category._id)
                .map((food) => (
                  <FoodCard key={food._id} food={food} onEdit={openEditDish} />
                ))}
            </div>
          </div>
        ))}

      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onAdd={handleAddCategory}
        isCreating={isCreatingCategory}
      />

      <DishModal
        isOpen={showDishModal}
        onClose={() => setShowDishModal(false)}
        onSave={handleSaveDish}
        selectedCategory={selectedCategory}
        editingFood={editingFood}
      />
    </div>
  );
}