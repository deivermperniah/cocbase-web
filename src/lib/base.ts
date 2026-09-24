import type { Component } from "vue";
import IconSword from "~icons/ph/sword";
import IconTrophy from "~icons/ph/trophy";
import IconHammer from "~icons/ph/hammer";
import IconShield from "~icons/ph/shield";

export function formatRelativeDate(value: string | null | undefined) {
  if (!value) return "";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

export function getBaseTypeIcon(type: string): Component {
  if (type === "Guerra") return IconSword;
  if (type === "Liga") return IconTrophy;
  if (type === "Mejora") return IconHammer;
  return IconShield;
}
