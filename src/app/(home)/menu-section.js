"use client";

import { useState } from "react";
import Image from "next/image";
import { useCategory } from "@/app/(provider)/categoryprovider";
import { useFood } from "@/app/(provider)/foodprovider";
import { Plus, Check, X, Minus } from "lucide-react";
import { dispatchCartUpdated } from "./header";
import { LocationPickerModal } from "@/components/shared/location-picker-modal";
import {
  useDeliveryLocation,
  saveDeliveryLocation,
} from "@/lib/delivery-location";

export default function MenuSection() {
  // Category-г provider-оос авна
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategory();

  // Foods-ийг provider-оос авна
  const { foods, loading: foodsLoading, error: foodsError } = useFood();

  // Toast мэдэгдэл (дээд буланд гарах "Food is being added...")
  const [showToast, setShowToast] = useState(false);

  // Сонгосон хаяг (header, cart-тай ижил эх сурвалжаас)
  const deliveryLocation = useDeliveryLocation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingFood, setPendingFood] = useState(null); // Хаяг сонгохоос өмнө дарсан хоолыг түр хадгалах

  // Аль хоолыг сая нэмснийг харуулах (товч дээрх ✓ icon-д зориулав)
  const [addedFoodIds, setAddedFoodIds] = useState([]);

  // Food Detail modal (зурган дээр дарахад гарч ирэх popup)
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  // Cart-д хоол нэмэх (localStorage-д хадгална), тоо ширхэг сонгож болно
  const addToCart = (food, quantity = 1) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingItemIndex = existingCart.findIndex(
        (item) => item._id === food._id,
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        // Хэрэв аль хэдийн cart-д байгаа бол тоог нэмэгдүүлнэ
        updatedCart = [...existingCart];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Шинээр нэмэх
        updatedCart = [...existingCart, { ...food, quantity }];
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      dispatchCartUpdated();
    } catch (err) {
      console.error("Cart-д хадгалахад алдаа гарлаа:", err);
    }
  };

  const showAddedToast = (foodId) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    setAddedFoodIds((prev) => [...prev, foodId]);
    setTimeout(() => {
      setAddedFoodIds((prev) => prev.filter((id) => id !== foodId));
    }, 1500);
  };

  // Зурган дээрх бяцхан ➕ товч дарахад (popup нээхгүйгээр, шууд 1-ээр нэмэх)
  const handleAdd = (food) => {
    if (!deliveryLocation) {
      // Хаяг байхгүй бол — хоолыг түр хадгалаад, map нээнэ
      setPendingFood({ food, quantity: 1 });
      setShowLocationPicker(true);
      return;
    }

    addToCart(food, 1);
    showAddedToast(food._id);
  };

  // ---- Food Detail popup ----

  const openFoodDetail = (food) => {
    setSelectedFood(food);
    setDetailQuantity(1);
    setShowFoodDetail(true);
  };

  const closeFoodDetail = () => {
    setShowFoodDetail(false);
    setSelectedFood(null);
    setDetailQuantity(1);
  };

  const increaseQuantity = () => {
    setDetailQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setDetailQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCartFromDetail = () => {
    if (!deliveryLocation) {
      setPendingFood({ food: selectedFood, quantity: detailQuantity });
      setShowFoodDetail(false);
      setShowLocationPicker(true);
      return;
    }

    addToCart(selectedFood, detailQuantity);
    showAddedToast(selectedFood._id);
    closeFoodDetail();
  };

  // ---- Delivery address modal ----
  const handleLocationConfirm = (location) => {
    saveDeliveryLocation(location);
    setShowLocationPicker(false);

    // Хаяг сонгомогц түр хадгалсан хоол байвал сагсанд нэмнэ
    if (pendingFood) {
      addToCart(pendingFood.food, pendingFood.quantity);
      showAddedToast(pendingFood.food._id);
      setPendingFood(null);
    }
  };

  const handleCancelLocation = () => {
    setShowLocationPicker(false);
    setPendingFood(null);
  };

  // Category эсвэл food аль нэг нь татагдаж дуусаагүй бол
  if (foodsLoading || categoriesLoading) {
    return <div className="w-full py-10 text-center">Уншиж байна...</div>;
  }

  // Category эсвэл food аль нэгэнд алдаа гарсан бол
  if (foodsError || categoriesError) {
    return (
      <div className="w-full py-10 text-center text-red-500">
        Мэдээлэл татахад алдаа гарлаа
      </div>
    );
  }

  return (
    <div className="w-full px-6 flex flex-col gap-10 relative">
      {/* Toast мэдэгдэл */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          Food is being added to the cart!
        </div>
      )}

      {/* Delivery Address Modal */}
      <LocationPickerModal
        open={showLocationPicker}
        initialLocation={deliveryLocation}
        onClose={handleCancelLocation}
        onConfirm={handleLocationConfirm}
      />

      {/* Food Detail Modal (зурган дээр дарахад гарч ирэх popup) */}
      {showFoodDetail && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[520px] max-w-[90vw] rounded-2xl bg-white p-6 shadow-lg flex gap-5">
            {/* Зураг */}
            <div className="relative w-56 h-56 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={selectedFood.imageUrl || "/pictures/placeholder.png"}
                alt={selectedFood.foodName}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>

            {/* Мэдээлэл */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-red-500">
                  {selectedFood.foodName}
                </h3>
                <button
                  onClick={closeFoodDetail}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                {selectedFood.description}
              </p>

              <div className="mt-auto">
                <p className="text-sm text-slate-500">Total price</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-semibold">
                    ${(selectedFood.price * detailQuantity).toFixed(2)}
                  </p>

                  {/* Тоо ширхэг сонгох */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-medium">
                      {detailQuantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCartFromDetail}
                  className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-red-500 transition"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {categories.map((category) => {
        const categoryFoods = foods.filter(
          (food) => food.categoryId?._id === category._id,
        );

        if (categoryFoods.length === 0) return null;

        return (
          <section key={category._id}>
            <h2 className="text-xl font-semibold mb-4 text-white">
              {category.FoodCategoryName}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryFoods.map((food) => (
                <div
                  key={food._id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  <div
                    className="relative w-full h-40 cursor-pointer"
                    onClick={() => openFoodDetail(food)}
                  >
                    <Image
                      src={food.imageUrl || "/pictures/placeholder.png"}
                      alt={food.foodName}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // popup нээгдэхээс сэргийлнэ
                        handleAdd(food);
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-gray-100 transition"
                      aria-label="Add"
                    >
                      {addedFoodIds.includes(food._id) ? (
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-orange-600 font-medium">
                        {food.foodName}
                      </h3>
                      <span className="font-semibold">
                        ${food.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {food.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
