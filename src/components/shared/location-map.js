"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet-ийн default pin зураг Next.js дээр эвдэрдэг тул өөрсдөө SVG pin хийнэ
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="40" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 30 12 30s12-9.6 12-18.3C24 5.2 18.6 0 12 0z" fill="#ef4444"/>
    <circle cx="12" cy="11.5" r="4.5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40], // pin-ийн үзүүр яг сонгосон цэг дээр буух
});

// Газрын зураг дээр дарахыг сонсоно
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// flyTo өөрчлөгдөхөд (жишээ нь "Use my location") тэр цэг рүү шилжинэ
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 0.8 });
  }, [map, target]);
  return null;
}

export default function LocationMap({ center, zoom, position, flyTo, onSelect }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <ClickHandler onSelect={onSelect} />
      <FlyTo target={flyTo} />

      {position && (
        <Marker
          position={position}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onSelect({ lat, lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}