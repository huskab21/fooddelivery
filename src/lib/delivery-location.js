"use client";

import { useEffect, useState } from "react";

// Сонгосон хаягийг localStorage-д хадгалж, бүх component-д мэдэгдэнэ
const STORAGE_KEY = "deliveryLocation";
const LOCATION_UPDATED_EVENT = "delivery-location-updated";

// { lat, lng, address, detail } хэлбэртэй объект буцаана, байхгүй бол null
export function getDeliveryLocation() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveDeliveryLocation(location) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  window.dispatchEvent(new Event(LOCATION_UPDATED_EVENT));
}

// Хаяг + нэмэлт мэдээллийг (байр, орц, тоот) нэг мөр болгоно
export function formatLocation(location) {
  if (!location) return "";
  return location.detail
    ? `${location.address}, ${location.detail}`
    : location.address;
}

// Аль ч component-с ашиглахад хаяг өөрчлөгдөх бүрд автоматаар шинэчлэгдэнэ
export function useDeliveryLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const load = () => setLocation(getDeliveryLocation());
    load();

    window.addEventListener(LOCATION_UPDATED_EVENT, load);
    window.addEventListener("storage", load); // өөр tab-д өөрчлөгдвөл

    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return location;
}