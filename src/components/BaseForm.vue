<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { user, isAdmin } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { BASE_TYPES, BASE_LEVELS } from "@/lib/constants";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconAddCircle from "~icons/ph/plus-circle";
import IconImage from "~icons/ph/image";
import IconSync from "~icons/ph/arrows-clockwise";
import IconAdd from "~icons/ph/plus";

const emit = defineEmits(["success"]);

const baseLink = ref("");
const baseType = ref("");
const baseLevel = ref("");
const baseImage = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const loading = ref(false);

const isFormValid = computed(() => {
  const isLevel3 = baseLevel.value === "3";
  const linkValid = isLevel3 ? true : baseLink.value.trim() && !hasSpacesInLink.value && isValidLink.value;

  return linkValid && baseType.value && baseLevel.value && baseImage.value;
});

const hasSpacesInLink = computed(() => /\s/.test(baseLink.value));

const isValidLink = computed(() => {
  try {
    const url = new URL(baseLink.value);
    return url.hostname.includes("link.clashofclans.com") && url.searchParams.has("id");
  } catch {
    return false;
  }
});

function validateImage(): string | null {
  if (!baseImage.value) {
    return "La imagen es requerida";
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(baseImage.value.type)) {
    return "Solo se permiten imágenes JPG, PNG o WebP";
  }

  const maxSize = 5 * 1024 * 1024;
  if (baseImage.value.size > maxSize) {
    return "La imagen no puede superar los 5MB";
  }

  return null;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => "\\" + c);
}

async function checkExistingLink(): Promise<string | null> {
  if (baseLevel.value === "3" && !baseLink.value.trim()) return null;

  try {
    const url = new URL(baseLink.value);
    const baseId = url.searchParams.get("id");

    if (!baseId) {
      return "No se pudo extraer el ID del enlace";
    }

    const normalizedLink = baseLink.value.trim();

    const { data: exactMatches } = await supabase.from("bases").select("id").eq("link", normalizedLink).limit(1);

    if (exactMatches && exactMatches.length > 0) {
      return "Esta base ya fue guardada anteriormente";
    }

    const idToken = baseId.split(":").pop() || baseId;
    const { data: fuzzyMatches, error: fuzzyError } = await supabase
      .from("bases")
      .select("link")
      .ilike("link", `%${escapeLike(idToken)}%`)
      .limit(50);

    if (fuzzyError) {
      console.error("Error verificando link existente:", fuzzyError);
      return "Error al verificar el enlace";
    }

    const hasDuplicate = (fuzzyMatches || []).some((b) => {
      if (!b?.link) return false;
      try {
        const existingUrl = new URL(b.link);
        const existingId = existingUrl.searchParams.get("id");
        return existingId === baseId;
      } catch {
        return false;
      }
    });

    if (hasDuplicate) {
      return "Esta base ya fue guardada anteriormente";
    }

    return null;
  } catch (error) {
    console.error("Error en checkExistingLink:", error);
    return "Error al validar el enlace";
  }
}

async function checkDuplicateImage(fileName: string): Promise<string | null> {
  try {
    const { data: existingImages, error: imageError } = await supabase.storage
      .from("bases-fotos")
      .list("", { search: fileName, limit: 1 });

    if (imageError) {
      console.error("Error verificando imagen duplicada:", imageError);
      return null;
    }

    if (existingImages && existingImages.length > 0) {
      return "Esta imagen ya fue subida anteriormente";
    }

    return null;
  } catch (error) {
    console.error("Error en checkDuplicateImage:", error);
    return null;
  }
}

async function optimizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const maxDimension = 1920;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.85);
    });

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch (error) {
    console.error("Error optimizando imagen:", error);
    return file;
  }
}

async function generateFileName(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", fileBuffer);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const fileExt = file.name.split(".").pop();
  return `${hash.slice(0, 8)}.${fileExt}`;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    baseImage.value = file;

    const imageError = validateImage();
    if (imageError) {
      toast.error(imageError);
      baseImage.value = null;
      return;
    }

    previewUrl.value = URL.createObjectURL(file);
  }
}

function removeImage() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  baseImage.value = null;
  previewUrl.value = null;
}

function resetForm() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  baseLink.value = "";
  baseType.value = "";
  baseLevel.value = "";
  baseImage.value = null;
  previewUrl.value = null;
}

watch(
  () => baseLevel.value,
  (newLevel) => {
    if (newLevel === "3") {
      baseLink.value = "";
    }
  },
);

async function handleSubmit() {
  loading.value = true;

  try {
    const duplicateLinkError = await checkExistingLink();
    if (duplicateLinkError) {
      toast.error(duplicateLinkError);
      return;
    }

    const optimizedFile = await optimizeImage(baseImage.value!);
    const fileName = await generateFileName(optimizedFile);

    const duplicateImageError = await checkDuplicateImage(fileName);
    if (duplicateImageError) {
      toast.error(duplicateImageError);
      return;
    }

    const { error: uploadError } = await supabase.storage.from("bases-fotos").upload(fileName, optimizedFile, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError);
      toast.error("Error al subir la imagen. Intenta con otra.");
      return;
    }

    const { data: urlData } = supabase.storage.from("bases-fotos").getPublicUrl(fileName);

    const insertPayload: Record<string, unknown> = {
      link: baseLink.value.trim() || null,
      type: baseType.value,
      level_th: Number(baseLevel.value),
      url_foto: urlData.publicUrl,
      status: isAdmin.value ? "approved" : "pending",
    };

    if (user.value) {
      insertPayload.author_id = user.value.id;
    }

    const { error: insertError } = await supabase.from("bases").insert(insertPayload);

    if (insertError) {
      console.error("Error guardando en BD:", insertError);
      toast.error("Error al guardar la base. Intenta nuevamente.");

      try {
        await supabase.storage.from("bases-fotos").remove([fileName]);
      } catch (cleanupError) {
        console.error("Error limpiando imagen:", cleanupError);
      }
      return;
    }

    toast.success("¡Base registrada!", isAdmin.value ? "La base quedó publicada" : "Tu base quedó en revisión");
    emit("success");
    resetForm();
  } catch (error) {
    console.error("Error general en handleSubmit:", error);
    toast.error(error instanceof Error && error.message ? error.message : "Error inesperado. Intenta nuevamente.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-page">
    <div class="grid grid-cols-2 gap-page">
      <div class="flex flex-col">
        <label for="base-level" class="text-xs text-muted-foreground mb-2">Nivel *</label>
        <Select v-model="baseLevel">
          <SelectTrigger id="base-level" class="h-[44px] rounded-lg bg-secondary border border-border text-white">
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent
            side="bottom"
            :side-offset="4"
            :avoid-collisions="false"
            class="z-[9999] bg-card border border-border text-white mt-1"
          >
            <SelectItem v-for="n in BASE_LEVELS" :key="n" :value="String(n)"> Nivel {{ n }} </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col">
        <label for="base-type" class="text-xs text-muted-foreground mb-2">Categoría *</label>
        <Select v-model="baseType">
          <SelectTrigger id="base-type" class="h-[44px] rounded-lg bg-secondary border border-border text-white">
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent
            side="bottom"
            :side-offset="4"
            :avoid-collisions="false"
            class="z-[9999] bg-card border border-border text-white mt-1"
          >
            <SelectItem v-for="t in BASE_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div v-if="baseLevel !== '3'" class="flex flex-col">
      <label for="link" class="text-xs text-muted-foreground mb-2"> Link * </label>
      <div class="relative">
        <Input
          id="link"
          v-model="baseLink"
          placeholder="https://link.clashofclans.com/..."
          :aria-invalid="hasSpacesInLink || undefined"
          :class="[
            'h-[44px] rounded-lg bg-secondary border-border text-white placeholder:text-muted-foreground focus-visible:ring-yellow-400/40 pr-10',
            hasSpacesInLink ? 'border-red-500 focus-visible:ring-red-500/30' : '',
          ]"
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pr-1">
          <button
            v-if="baseLink"
            type="button"
            aria-label="Borrar link"
            class="cursor-pointer p-1 rounded-full text-muted-foreground hover:text-white transition-colors"
            @click="baseLink = ''"
          >
            <IconAdd class="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <span class="text-xs text-muted-foreground mb-2">Fotografía *</span>
      <div class="relative">
        <input
          id="fileInModal"
          type="file"
          accept="image/*"
          class="peer sr-only"
          :disabled="loading"
          @change="handleFileChange"
        />

        <label
          v-if="!previewUrl"
          for="fileInModal"
          class="flex flex-col items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-400 border-2 border-dashed border-border rounded-xl p-page text-center cursor-pointer bg-secondary/40 hover:bg-secondary/60 hover:border-yellow-400/40 transition-all"
          :class="loading ? 'opacity-50 cursor-not-allowed' : ''"
        >
          <IconImage class="w-6 h-6 text-muted-foreground mb-2" />
          <p class="text-xs text-white">Subir Captura</p>
          <p class="text-xs text-muted-foreground mt-1">JPG, PNG, WebP • Max 5MB</p>
        </label>

        <div v-else class="relative rounded-xl peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-400">
          <div class="relative w-full overflow-hidden rounded-xl border border-border bg-secondary">
            <img :src="previewUrl" class="w-full h-40 object-cover" alt="Preview de la captura" />
            <label
              for="fileInModal"
              class="absolute inset-0 bg-card/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              :class="loading ? 'pointer-events-none' : ''"
            >
              <div class="text-center text-white">
                <p class="text-xs">Cambiar Fotografía</p>
              </div>
            </label>
          </div>

          <button
            v-if="!loading"
            type="button"
            aria-label="Quitar fotografía"
            class="absolute -top-2 -right-2 h-8 w-8 cursor-pointer rounded-full bg-card text-muted-foreground flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-border"
            @click.stop="removeImage"
          >
            <IconAddCircle class="w-3 h-3 rotate-45" />
          </button>

          <div class="mt-3 text-xs text-muted-foreground">
            {{ baseImage?.name }}
          </div>
        </div>
      </div>
    </div>

    <button
      class="w-full h-[44px] cursor-pointer rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xl shadow-yellow-400/10"
      :disabled="loading || !isFormValid"
      @click="handleSubmit"
    >
      <div v-if="!loading" class="flex items-center justify-center gap-2">
        <IconAddCircle class="w-4 h-4" />
        <span>{{ isAdmin ? "Guardar" : "Enviar a revisión" }}</span>
      </div>
      <div v-else class="flex items-center justify-center gap-2">
        <IconSync class="w-4 h-4 animate-spin" />
        <span>Procesando...</span>
      </div>
    </button>
  </div>
</template>
