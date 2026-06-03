import type { Metadata } from "next";
import FavoritesPage from "@/components/FavoritesPage";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "My Saved Properties",
  robots: { index: false, follow: false },
};

export default function Favorites() {
  return <RequireAuth><FavoritesPage /></RequireAuth>;
}
