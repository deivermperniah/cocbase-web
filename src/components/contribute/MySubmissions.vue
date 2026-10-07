<script setup lang="ts">
import IconClock from "~icons/ph/clock";
import IconCheckCircle from "~icons/ph/check-circle";
import IconXCircle from "~icons/ph/x-circle";
import IconBuildings from "~icons/ph/buildings";
import Badge from "@/components/ui/Badge.vue";
import { formatRelativeDate, getBaseTypeIcon, type MyBase } from "@/lib/bases";

const props = defineProps<{ bases: MyBase[] }>();

const STATUS_GROUPS = [
  { status: "pending", title: "En revisión", icon: IconClock, colorClass: "text-muted-foreground" },
  { status: "approved", title: "Aprobadas", icon: IconCheckCircle, colorClass: "text-primary" },
  { status: "rejected", title: "Rechazadas", icon: IconXCircle, colorClass: "text-red-400" },
] as const;

function basesWithStatus(status: MyBase["status"]) {
  return props.bases.filter((base) => base.status === status);
}
</script>

<template>
  <div class="space-y-5">
    <template v-for="group in STATUS_GROUPS" :key="group.status">
      <div v-if="basesWithStatus(group.status).length" class="space-y-2.5">
        <div class="flex items-center gap-1.5" :class="group.colorClass">
          <component :is="group.icon" class="h-4 w-4" />
          <h3 class="text-xs uppercase tracking-wide">{{ group.title }}</h3>
        </div>

        <div
          v-for="base in basesWithStatus(group.status)"
          :key="base.id"
          class="overflow-hidden rounded-xl bg-secondary"
          :class="base.status === 'rejected' && 'border border-red-500/30'"
        >
          <div class="flex items-center gap-2 p-2.5">
            <Badge :icon="IconBuildings">{{ base.level_th }}</Badge>
            <Badge :icon="getBaseTypeIcon(base.type)">{{ base.type }}</Badge>
            <span class="min-w-0 flex-1 truncate text-right text-xs text-muted-foreground">
              {{ formatRelativeDate(base.created_at) }}
            </span>
          </div>

          <div v-if="base.status === 'rejected'" class="flex items-center gap-3 border-t border-red-500/30 bg-red-500/10 p-2.5">
            <p class="min-w-0 flex-1 whitespace-pre-line break-words text-xs text-red-300">
              {{ base.review_note ? `Motivo: ${base.review_note}` : "Rechazada sin motivo" }}
            </p>
            <slot name="rejected-actions" :base="base" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
