<template>
  <router-link :to="ViewLink">
    <div
      class="group relative min-h-[220px] overflow-hidden rounded-[26px] border border-emerald-200
             bg-[linear-gradient(145deg,#ffffff_0%,#f6fbf7_45%,#e9f5ed_100%)]
             p-5 shadow-[0_12px_30px_rgba(15,107,63,0.09)] transition duration-300 hover:-translate-y-1
             hover:border-senaColor hover:shadow-[0_20px_44px_rgba(15,107,63,0.16)]"
    >
      <div class="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.95)_50%,rgba(255,255,255,0)_100%)]"></div>
      <div class="flex h-full flex-col justify-between">

        <!-- TOP -->
        <div>
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/40 shadow-[0_14px_24px_rgba(15,23,42,0.12)]"
                 :class="accentClass">
              <img v-if="CardImg" :src="CardImg" class="h-9 w-9 object-contain" />
            </div>

            <span class="rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-senaColor shadow-sm">
              {{ eyebrow }}
            </span>
          </div>

          <h3 class="mt-6 font-robotoSlab text-[1.4rem] font-bold text-slate-900">
            {{ title }}
          </h3>

          <p class="mt-3 text-sm text-slate-600">
            {{ description }}
          </p>
        </div>

        <!-- BOTTOM -->
        <div class="mt-6 flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-500">Abrir modulo</p>
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.16)] transition-colors duration-300 group-hover:bg-senaColor">
            →
          </div>
        </div>

      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  eyebrow: string
  CardImg?: string
  ViewLink: string
  accentClass?: string
}>()
</script>
