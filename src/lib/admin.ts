import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { BASE_TYPES, type BaseStatus, type BaseType } from "@/lib/constants";

export const pendingCount = ref(0);

async function countBases(filters: { status: BaseStatus; type?: BaseType }) {
  let query = supabase.from("bases").select("id", { count: "exact", head: true }).eq("status", filters.status);
  if (filters.type) query = query.eq("type", filters.type);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function refreshPendingCount() {
  pendingCount.value = await countBases({ status: "pending" });
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
