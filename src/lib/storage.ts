import { supabase } from "@/lib/supabase";

const BUCKET = "bases-fotos";
const STORAGE_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export function getPublicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function getStoragePath(url: string | null | undefined) {
  if (!url) return null;
  const index = url.indexOf(STORAGE_MARKER);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + STORAGE_MARKER.length).split("?")[0] ?? "");
}

export async function uploadImage(path: string, file: File) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return getPublicUrl(path);
}

export async function removeImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
