"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchFoodCategories,
  deleteFoodCategory,
  createFoodCategory,
} from "@/app/_api/api";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET
  const getCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchFoodCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deleteCategory = async (id) => {
    try {
      await deleteFoodCategory(id);
      // Server-ээс дахин татахгүйгээр state-ээс шууд хасна
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err);
    }
  };

  // CREATE
  const addCategory = async (name) => {
    try {
      const newCategory = await createFoodCategory(name);
      setCategories((prev) => [...prev, newCategory]);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        getCategories,
        deleteCategory,
        addCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

// Custom hook: component бүрт useContext бичих шаардлагагүй болно
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory-г CategoryProvider дотор ашиглана уу");
  }
  return context;
};