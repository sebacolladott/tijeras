import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
