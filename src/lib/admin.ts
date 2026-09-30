import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { BASE_TYPES, type BaseStatus, type BaseType } from "@/lib/constants";

const BUCKET = "bases-fotos";
const STORAGE_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export const REVIEW_COLUMNS =
  "id, level_th, type, url_foto, link, created_at, profiles!bases_author_id_fkey(full_name)";

export const pendingCount = ref(0);

export function getStoragePath(url: string | null | undefined) {
  if (!url) return null;
  const index = url.indexOf(STORAGE_MARKER);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + STORAGE_MARKER.length).split("?")[0] ?? "");
}

async function countBases(filters: { status?: BaseStatus; type?: BaseType } = {}) {
  let query = supabase.from("bases").select("id", { count: "exact", head: true });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.type) query = query.eq("type", filters.type);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function refreshPendingCount() {
  pendingCount.value = await countBases({ status: "pending" });
  return pendingCount.value;
}

export async function fetchDashboardStats() {
  const [approved, pending, ...byType] = await Promise.all([
    countBases({ status: "approved" }),
    countBases({ status: "pending" }),
    ...BASE_TYPES.map((type) => countBases({ status: "approved", type })),
  ]);
  pendingCount.value = pending;
  return {
    approved,
    pending,
    byType: Object.fromEntries(BASE_TYPES.map((type, i) => [type, byType[i] ?? 0])) as Record<BaseType, number>,
  };
}

export async function reviewBase(baseId: string, status: "approved" | "rejected", note: string | null = null) {
  const { data, error } = await supabase
    .from("bases")
    .update({ status, reviewed_at: new Date().toISOString(), review_note: note })
    .eq("id", baseId)
    .select("id");
  if (error || !data?.length) throw error ?? new Error("Base no actualizada");
  pendingCount.value = Math.max(0, pendingCount.value - 1);
}

export async function deleteBase(base: { id: string; url_foto?: string | null }) {
  const { data, error } = await supabase.from("bases").delete().eq("id", base.id).select("id");
  if (error || !data?.length) throw error ?? new Error("Base no eliminada");

  const path = getStoragePath(base.url_foto);
  if (path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([path]);
    if (storageError) console.error("Error eliminando imagen:", storageError);
  }
}
