import { supabase } from "@/lib/supabase";

const BUCKET = "bases-fotos";
const STORAGE_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export interface StoredImage {
  name: string;
  url: string;
  size: number;
}

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

export async function listImages(offset: number, limit: number) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit, offset, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;

  const images: StoredImage[] = data
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file.name))
    .map((file) => ({ name: file.name, url: getPublicUrl(file.name), size: file.metadata?.size ?? 0 }));

  return { images, fetched: data.length };
}
