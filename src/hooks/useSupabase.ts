import { useContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseContext } from "../../context/supabase-context";

export function useSupabase(): {
  isLoaded: boolean;
  supabase: SupabaseClient;
} {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return { isLoaded: true, supabase };
}
