"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchFoods, createFood, updateFood } from "@/app/_api/api";

const FoodContext = createContext(null);

export function FoodProvider({ children }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET
  const getFoods = async (categoryId) => {
    try {
      setLoading(true);
      const data = await fetchFoods(categoryId);
      setFoods(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const addFood = async (payload) => {
    try {
      const newFood = await createFood(payload);
      setFoods((prev) => [...prev, newFood]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // UPDATE
  const editFood = async (payload) => {
    try {
      const updated = await updateFood(payload);
      setFoods((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f)),
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    getFoods();
  }, []);

  return (
    <FoodContext.Provider
      value={{ foods, loading, error, getFoods, addFood, editFood }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFood-г FoodProvider дотор ашиглана уу");
  }
  return context;
};