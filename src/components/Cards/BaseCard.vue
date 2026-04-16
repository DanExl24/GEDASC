<template>
  <router-link :to="ViewLink">
    <div
      class="group min-h-[220px] rounded-[26px] border border-emerald-100
             bg-[linear-gradient(145deg,#ffffff_0%,#f5fbf6_55%,#edf7ef_100%)]
             p-5 transition duration-300 hover:-translate-y-1
             hover:border-senaColor hover:shadow-[0_18px_40px_rgba(15,107,63,0.14)]"
    >
      <div class="flex h-full flex-col justify-between">

        <!-- TOP -->
        <div>
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-[20px] shadow-sm"
                 :class="accentClass">
              <img v-if="CardImg" :src="CardImg" class="h-9 w-9 object-contain" />
            </div>

            <span class="rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-senaColor">
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
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white group-hover:bg-senaColor">
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
