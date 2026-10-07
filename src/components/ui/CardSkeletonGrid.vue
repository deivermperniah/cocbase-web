<template>
  <div class="card-grid">
    <div
      v-for="i in 3"
      :key="i"
      class="overflow-hidden rounded-xl border border-border bg-card"
      :class="{ 'hidden md:block': i === 2, 'hidden lg:block': i === 3 }"
    >
      <div class="skeleton aspect-video"></div>
      <div class="flex gap-2 p-page">
        <div class="skeleton h-[38px] flex-1 rounded-lg"></div>
        <div class="skeleton h-[38px] w-[38px] rounded-lg"></div>
      </div>
    </div>
  </div>
</template>
