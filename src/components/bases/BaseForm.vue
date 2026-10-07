<script setup lang="ts">
import { computed, ref, watch } from "vue";
import IconPlusCircle from "~icons/ph/plus-circle";
import IconImage from "~icons/ph/image";
import IconX from "~icons/ph/x";
import AppButton from "@/components/ui/AppButton.vue";
import FormField from "@/components/ui/FormField.vue";
import FormSelect from "@/components/ui/FormSelect.vue";
import { isAdmin, user } from "@/lib/auth";
import { createBase, isLinkTaken, isValidBaseLink } from "@/lib/bases";
import { BASE_LEVELS, BASE_TYPES } from "@/lib/constants";
import { hashFileName, optimizeImage, validateImage } from "@/lib/image";
import { removeImage, uploadImage } from "@/lib/storage";
import { toast } from "@/lib/toast";

const emit = defineEmits<{ success: [] }>();

const levelOptions = BASE_LEVELS.map((n) => ({ value: String(n), label: `Nivel ${n}` }));
const typeOptions = BASE_TYPES.map((t) => ({ value: t, label: t }));

const level = ref("");
const type = ref("");
const link = ref("");
const image = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const loading = ref(false);

const needsLink = computed(() => level.value !== "3");
const isLinkValid = computed(() => isValidBaseLink(link.value.trim()));
const isFormValid = computed(() => level.value && type.value && image.value && (!needsLink.value || isLinkValid.value));

watch(needsLink, (needed) => {
  if (!needed) link.value = "";
});

function setImage(file: File | null) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  image.value = file;
  previewUrl.value = file ? URL.createObjectURL(file) : null;
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  const error = validateImage(file);
  if (error) toast.error(error);
  else setImage(file);
}

function resetForm() {
  level.value = "";
  type.value = "";
  link.value = "";
  setImage(null);
}

async function uploadAndCreate(file: File, baseLink: string | null) {
  const fileName = await hashFileName(file);
  const url = await uploadImage(fileName, file).catch(() => {
    throw new Error("La imagen ya fue subida o no se pudo subir");
  });

  try {
    await createBase({
      link: baseLink,
      type: type.value,
      level_th: Number(level.value),
      url_foto: url,
      status: isAdmin.value ? "approved" : "pending",
      author_id: user.value?.id,
    });
  } catch (error) {
    await removeImage(fileName).catch(() => {});
    throw error;
  }
}

async function handleSubmit() {
  if (!image.value) return;
  loading.value = true;
  const baseLink = link.value.trim() || null;

  try {
    if (baseLink && (await isLinkTaken(baseLink))) throw new Error("Esta base ya fue guardada anteriormente");
    await uploadAndCreate(await optimizeImage(image.value), baseLink);
    toast.success("¡Base registrada!", isAdmin.value ? "La base quedó publicada" : "Tu base quedó en revisión");
    resetForm();
    emit("success");
  } catch (error) {
    console.error("Error guardando la base:", error);
    toast.error(error instanceof Error && error.message ? error.message : "Error al guardar la base");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-page">
    <div class="grid grid-cols-2 gap-page">
      <FormSelect v-model="level" label="Nivel *" :options="levelOptions" placeholder="Selecciona" />
      <FormSelect v-model="type" label="Categoría *" :options="typeOptions" placeholder="Selecciona" />
    </div>

    <FormField
      v-if="needsLink"
      v-model="link"
      label="Link *"
      placeholder="https://link.clashofclans.com/..."
      clearable
      :invalid="link !== '' && !isLinkValid"
    />

    <div class="flex flex-col gap-2">
      <span class="text-xs text-muted-foreground">Fotografía *</span>
      <div class="relative">
        <label
          class="relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/40 text-center transition-all hover:border-primary/40"
          :class="previewUrl && 'border-solid'"
        >
          <input type="file" accept="image/*" class="hidden" :disabled="loading" @change="handleFileChange" />
          <template v-if="previewUrl">
            <img :src="previewUrl" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <span
              class="absolute inset-0 flex items-center justify-center bg-card/70 text-xs text-white opacity-0 transition-opacity hover:opacity-100"
            >
              Cambiar fotografía
            </span>
          </template>
          <template v-else>
            <IconImage class="mb-2 h-6 w-6 text-muted-foreground" />
            <p class="text-xs text-white">Subir captura</p>
            <p class="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP • Máx 5MB</p>
          </template>
        </label>
        <button
          v-if="previewUrl && !loading"
          type="button"
          class="absolute -right-2 -top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-red-600 hover:text-white"
          @click="setImage(null)"
        >
          <IconX class="h-3 w-3" />
        </button>
      </div>
      <p v-if="image" class="text-xs text-muted-foreground">{{ image.name }}</p>
    </div>

    <AppButton :icon="IconPlusCircle" :loading="loading" :disabled="!isFormValid" class="w-full" @click="handleSubmit">
      {{ loading ? "Procesando..." : isAdmin ? "Guardar" : "Enviar a revisión" }}
    </AppButton>
  </div>
</template>
