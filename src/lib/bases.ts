import type { Component } from "vue";
import IconSword from "~icons/ph/sword";
import IconTrophy from "~icons/ph/trophy";
import IconHammer from "~icons/ph/hammer";
import IconShield from "~icons/ph/shield";
import { supabase } from "@/lib/supabase";

export interface Base {
  id: string;
  level_th: number;
  type: string;
  url_foto: string | null;
  link: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export const BASE_COLUMNS = "id, level_th, type, url_foto, link, created_at, profiles!bases_author_id_fkey(full_name)";

export function baseLabel(base: { type: string; level_th: number }) {
  return `${base.type} · Nivel ${base.level_th}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getBaseTypeIcon(type: string): Component {
  if (type === "Guerra") return IconSword;
  if (type === "Liga") return IconTrophy;
  if (type === "Mejora") return IconHammer;
  return IconShield;
}

export async function fetchApprovedBases(filters: { level: number | null; type: string | null }, from: number, size: number) {
  let query = supabase
    .from("bases")
    .select(BASE_COLUMNS, { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, from + size - 1);

  if (filters.level) query = query.eq("level_th", filters.level);
  if (filters.type) query = query.eq("type", filters.type);

  const { data, count, error } = await query;
  if (error) throw error;
  return { bases: (data ?? []) as unknown as Base[], total: count ?? 0 };
}
