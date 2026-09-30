import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IconHammer from "~icons/ph/hammer";
import IconShield from "~icons/ph/shield";
import IconSword from "~icons/ph/sword";
import IconTrophy from "~icons/ph/trophy";
import { formatRelativeDate, getBaseTypeIcon } from "./base";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve cadena vacía sin fecha o con fecha inválida", () => {
    expect(formatRelativeDate(null)).toBe("");
    expect(formatRelativeDate(undefined)).toBe("");
    expect(formatRelativeDate("no-es-fecha")).toBe("");
  });

  it("formatea hoy, ayer y días anteriores", () => {
    expect(formatRelativeDate("2026-09-29T08:00:00Z")).toBe("hoy");
    expect(formatRelativeDate("2026-09-28T08:00:00Z")).toBe("ayer");
    expect(formatRelativeDate("2026-09-24T08:00:00Z")).toBe("hace 5 días");
  });
});

describe("getBaseTypeIcon", () => {
  it("asigna un icono a cada categoría", () => {
    expect(getBaseTypeIcon("Guerra")).toBe(IconSword);
    expect(getBaseTypeIcon("Liga")).toBe(IconTrophy);
    expect(getBaseTypeIcon("Mejora")).toBe(IconHammer);
    expect(getBaseTypeIcon("Recursos")).toBe(IconShield);
  });
});
