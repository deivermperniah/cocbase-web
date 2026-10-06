import { supabase } from "@/lib/supabase";
import { BASE_COLUMNS, type Base } from "@/lib/bases";

export async function fetchFavoriteIds(userId: string) {
  const { data, error } = await supabase.from("favorites").select("base_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.base_id as string));
}

export async function fetchFavoriteBases(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select(`bases(${BASE_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.bases as unknown as Base | null).filter((base): base is Base => base !== null);
}

export async function addFavorite(userId: string, baseId: string) {
  const { error } = await supabase.from("favorites").insert({ user_id: userId, base_id: baseId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, baseId: string) {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("base_id", baseId);
  if (error) throw error;
}
