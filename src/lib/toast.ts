import { ref } from "vue";

export type ToastVariant = "success" | "error";

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export const toasts = ref<Toast[]>([]);

let nextId = 0;

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function push(variant: ToastVariant, title: string, description?: string) {
  const id = ++nextId;
  toasts.value.push({ id, variant, title, description });
  setTimeout(() => dismissToast(id), 4000);
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
};
