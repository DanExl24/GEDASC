<template>
  <span
    class="inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
    :class="jornada.badgeClass"
  >
    {{ jornada.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJornadaStore } from '@/stores/jornada'

const props = defineProps<{
  aprendizId?: number | null
  hour: string | null | undefined
}>()

const jornadaStore = useJornadaStore()
const jornada = computed(() =>
  jornadaStore.getJornadaForAprendiz(props.aprendizId, props.hour),
)
</script>
