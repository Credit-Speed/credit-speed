"use client";
import { useEffect, useRef } from "react";

export type Shop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  distanceKm?: number;
};

interface StoreMapProps {
  shops: Shop[];
  center: { lat: number; lng: number };
  zoom?: number;
  selectedShopId: string | null;
  onSelectShop: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function StoreMap({
  shops,
  center,
  zoom = 13,
  selectedShopId,
  onSelectShop,
  userLocation,
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);
  const prevCenterRef = useRef<string>("");

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    let isMounted = true;

    (async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error CSS side-effect import
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapRef.current) return;

      // Init once
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Pan when center prop changes
      const centerKey = `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`;
      if (prevCenterRef.current && prevCenterRef.current !== centerKey) {
        map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
      }
      prevCenterRef.current = centerKey;

      // Clear old shop markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      const goldIcon = L.divIcon({
        html: `<div style="background:#D4A853;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);color:#0A1628;font-weight:bold;font-size:14px;">₹</div>
        </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const selectedIcon = L.divIcon({
        html: `<div style="background:#0A1628;width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #D4A853;box-shadow:0 4px 12px rgba(212,168,83,0.5);display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);color:#D4A853;font-weight:bold;font-size:16px;">₹</div>
        </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      shops.forEach((shop) => {
        const isSelected = shop.id === selectedShopId;
        const marker = L.marker([shop.lat, shop.lng], {
          icon: isSelected ? selectedIcon : goldIcon,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:160px;">
            <div style="font-weight:bold;color:#0A1628;font-size:13px;">${escapeHtml(shop.name)}</div>
            ${shop.address ? `<div style="font-size:11px;color:#6B7280;margin-top:4px;line-height:1.4;">${escapeHtml(shop.address)}</div>` : ""}
            ${shop.distanceKm !== undefined ? `<div style="font-size:11px;color:#D4A853;margin-top:4px;font-weight:600;">${shop.distanceKm.toFixed(1)} km away</div>` : ""}
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.lat},${shop.lng}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:6px;font-size:11px;font-weight:600;color:#0A1628;background:#D4A853;padding:4px 10px;border-radius:999px;text-decoration:none;">Directions &#8599;</a>
          </div>`
        );

        marker.on("click", () => onSelectShop(shop.id));
        markersRef.current[shop.id] = marker;
      });

      // User location pulse marker
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userLocation) {
        const pulseIcon = L.divIcon({
          html: `<div class="cs-user-pulse" style="position:relative;width:20px;height:20px;">
            <div style="position:absolute;inset:0;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>
          </div>`,
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: pulseIcon,
          interactive: false,
        }).addTo(map);
      }

      // Pan to selected shop
      if (selectedShopId) {
        const selected = shops.find((s) => s.id === selectedShopId);
        if (selected) {
          map.setView([selected.lat, selected.lng], Math.max(zoom, 15), {
            animate: true,
          });
          markersRef.current[selectedShopId]?.openPopup();
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [shops, selectedShopId, onSelectShop, center.lat, center.lng, zoom, userLocation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: "500px", background: "#0A1628" }}
    />
  );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
