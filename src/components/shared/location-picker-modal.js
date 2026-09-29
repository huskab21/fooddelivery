"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X, LocateFixed, MapPin, Loader2 } from "lucide-react";

// Leaflet нь window шаарддаг тул зөвхөн browser дээр ачаална (SSR-гүй)
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-100" />,
});

// Анх нээхэд Улаанбаатарын төвийг харуулна
const DEFAULT_CENTER = { lat: 47.9185, lng: 106.9177 };

// Координатыг хаяг болгоно (OpenStreetMap Nominatim — үнэгүй, key шаардахгүй)
async function reverseGeocode({ lat, lng }) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=mn`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Nominatim алдаа");
  const data = await res.json();

  // display_name хэт урт тул хэрэгтэй хэсгүүдийг нь л авна
  const a = data.address || {};
  const street = a.road
    ? [a.road, a.house_number].filter(Boolean).join(" ")
    : a.building || a.amenity;
  const parts = [
    street,
    a.neighbourhood || a.quarter || a.suburb,
    a.city_district,
    a.city || a.town,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : data.display_name;
}

/**
 * Газрын зураг дээр хаяг сонгох popup.
 * open            – харуулах эсэх
 * onClose         – хаах үед
 * onConfirm       – сонгосон { lat, lng, address, detail }-ийг буцаана
 * initialLocation – өмнө сонгосон хаяг байвал түүгээр нээгдэнэ
 */
export function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  initialLocation,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PickerContent
          onClose={onClose}
          onConfirm={onConfirm}
          initialLocation={initialLocation}
        />
      </div>
    </div>
  );
}

function PickerContent({ onClose, onConfirm, initialLocation }) {
  const initialPosition = initialLocation
    ? { lat: initialLocation.lat, lng: initialLocation.lng }
    : null;

  const [position, setPosition] = useState(initialPosition);
  const [flyTo, setFlyTo] = useState(null);
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [detail, setDetail] = useState(initialLocation?.detail || "");
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Хурдан дараалан дарахад хуучин хариу шинийг дарж бичихээс сэргийлнэ
  const requestIdRef = useRef(0);

  const selectPosition = async (latLng) => {
    setPosition(latLng);
    const requestId = ++requestIdRef.current;
    const fallback = `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`;

    setResolving(true);
    try {
      const result = await reverseGeocode(latLng);
      if (requestId === requestIdRef.current) setAddress(result || fallback);
    } catch (err) {
      console.error("Хаяг тодорхойлоход алдаа гарлаа:", err);
      if (requestId === requestIdRef.current) setAddress(fallback);
    } finally {
      if (requestId === requestIdRef.current) setResolving(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support location. Pick a spot on the map.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latLng = { lat: coords.latitude, lng: coords.longitude };
        setFlyTo(latLng);
        selectPosition(latLng);
        setLocating(false);
      },
      () => {
        alert("Couldn't get your location. Pick a spot on the map instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleConfirm = () => {
    if (!position) return;
    onConfirm({ ...position, address, detail: detail.trim() });
  };

  return (
    <>
      {/* Гарчиг */}
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">Delivery location</h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-sm text-slate-400">
        Tap the map or drag the pin to your door.
      </p>

      {/* Газрын зураг — isolate нь Leaflet-ийн z-index-ийг энэ хайрцаг дотор барина */}
      <div className="relative isolate h-80 overflow-hidden rounded-2xl bg-slate-100">
        <LocationMap
          center={initialPosition || DEFAULT_CENTER}
          zoom={initialPosition ? 16 : 13}
          position={position}
          flyTo={flyTo}
          onSelect={selectPosition}
        />

        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          className="absolute bottom-3 left-3 z-[1000] flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-black shadow-md hover:bg-slate-50 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4 text-red-500" />
          )}
          Use my location
        </button>
      </div>

      {/* Сонгосон хаяг */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        {resolving ? (
          <span className="text-slate-400">Finding address…</span>
        ) : position ? (
          <span className="text-black">{address}</span>
        ) : (
          <span className="text-slate-400">No location selected yet</span>
        )}
      </div>

      {/* Байр, орц, давхар, тоот */}
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Building, entrance, floor, door number (optional)"
        className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
      />

      {/* Товчнууд */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-full bg-slate-100 py-3 text-sm font-semibold text-black hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!position || resolving}
          className="flex-1 cursor-pointer rounded-full bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Deliver here
        </button>
      </div>
    </>
  );
}