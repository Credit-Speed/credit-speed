"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Shop as MapShop } from "./StoreMap";

const StoreMap = dynamic(() => import("./StoreMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-2xl border border-white/10 flex items-center justify-center text-white/35 text-sm">
      Loading map…
    </div>
  ),
});

export type MappableShop = {
  id: string;
  name: string;
  locality: string | null;
  pin: string | null;
  lat: number | null;
  lng: number | null;
};

/**
 * Partner shops on a map.
 *
 * The coordinates are real: each is where a Credit Speed field officer stood
 * when they logged a visit to that shop. Shops without a recorded visit are
 * deliberately left off rather than guessed at from their address — sending
 * someone to the wrong shop is worse than showing no pin, and the written
 * list below the map covers every shop anyway.
 *
 * Client-only and loaded after the page, so it never blocks the shop list,
 * which is the part search engines read.
 */
export default function PartnerMap({
  shops,
  city,
}: {
  shops: MappableShop[];
  city: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const mapped = useMemo<MapShop[]>(
    () =>
      shops
        .filter((s) => s.lat != null && s.lng != null)
        .map((s) => ({
          id: s.id,
          name: s.name,
          lat: s.lat as number,
          lng: s.lng as number,
          address: [s.locality, s.pin].filter(Boolean).join(" · ") || city,
        })),
    [shops, city]
  );

  // Centre on the shops themselves rather than a hardcoded city point, so
  // this stays correct for whatever city it renders for.
  const center = useMemo(() => {
    if (!mapped.length) return { lat: 26.4499, lng: 80.3319 };
    const lat = mapped.reduce((a, s) => a + s.lat, 0) / mapped.length;
    const lng = mapped.reduce((a, s) => a + s.lng, 0) / mapped.length;
    return { lat, lng };
  }, [mapped]);

  if (!mapped.length) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-5">
        <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter">
          Partner shops on the map
        </h2>
        <p className="text-white/40 text-sm">
          {mapped.length} of {shops.length} shops located
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <StoreMap
          shops={mapped}
          center={center}
          zoom={12}
          selectedShopId={selected}
          onSelectShop={setSelected}
        />
      </div>

      <p className="text-white/40 text-xs mt-3">
        Tap a pin to see the shop. Shops without a pin are listed below — call
        us and we will point you to the nearest one.
      </p>
    </div>
  );
}
