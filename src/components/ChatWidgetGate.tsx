"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";

/**
 * The assistant floats in the bottom-right corner of every page. On /start
 * that corner belongs to the two buttons the whole page exists for, so the
 * assistant stays off it.
 */
export default function ChatWidgetGate() {
  const pathname = usePathname();
  if (pathname === "/start" || pathname?.startsWith("/start/")) return null;
  return <ChatWidget />;
}
