/**
 * Home page — the route you see at "/".
 *
 * This is a thin server component: it only imports and renders Dashboard.
 * All interactive UI lives in components/dashboard.tsx ("use client").
 */
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return <Dashboard />;
}
