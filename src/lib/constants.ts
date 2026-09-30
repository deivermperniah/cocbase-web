export const BASE_TYPES = ["Guerra", "Liga", "Mejora", "Recursos"] as const

export type BaseType = (typeof BASE_TYPES)[number]

export const BASE_LEVELS = Array.from({ length: 16 }, (_, i) => i + 3)

export const BASE_STATUSES = ["pending", "approved", "rejected"] as const

export type BaseStatus = (typeof BASE_STATUSES)[number]
