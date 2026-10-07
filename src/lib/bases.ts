import type { Component } from "vue";
import IconSword from "~icons/ph/sword";
import IconTrophy from "~icons/ph/trophy";
import IconHammer from "~icons/ph/hammer";
import IconShield from "~icons/ph/shield";
import { supabase } from "@/lib/supabase";
import type { BaseStatus } from "@/lib/constants";

export interface Base {
  id: string;
  level_th: number;
  type: string;
  url_foto: string | null;
  link: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export interface NewBase {
  link: string | null;
  type: string;
  level_th: number;
  url_foto: string;
  status: BaseStatus;
  author_id: string | undefined;
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

function parseUrl(link: string) {
  try {
    return new URL(link);
  } catch {
    return null;
  }
}

function getLinkId(link: string) {
  return parseUrl(link)?.searchParams.get("id") ?? null;
}

export function isValidBaseLink(link: string) {
  const url = parseUrl(link);
  return Boolean(url?.hostname.includes("link.clashofclans.com") && url.searchParams.has("id"));
}

export async function isLinkTaken(link: string) {
  const id = getLinkId(link);
  if (!id) return false;
  const token = (id.split(":").pop() ?? id).replace(/[\\%_]/g, (c) => "\\" + c);

  const { data, error } = await supabase.from("bases").select("link").ilike("link", `%${token}%`).limit(50);
  if (error) throw error;
  return (data ?? []).some((row) => row.link && getLinkId(row.link) === id);
}

export async function createBase(base: NewBase) {
  const { error } = await supabase.from("bases").insert(base);
  if (error) throw error;
}
