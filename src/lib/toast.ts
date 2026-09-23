import { ref } from "vue"

export type ToastVariant = "success" | "error" | "info"

export interface Toast {
  id: number
  variant: ToastVariant
  title: string
  description?: string
}

const toasts = ref<Toast[]>([])

let nextId = 0

function push(variant: ToastVariant, title: string, description?: string) {
  const id = ++nextId
  toasts.value.push({ id, variant, title, description })
  setTimeout(() => dismiss(id), 4000)
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToast() {
  return { toasts, dismiss }
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
}
