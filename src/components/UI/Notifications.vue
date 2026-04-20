<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed top-4 right-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:top-6 sm:right-6">
      <transition-group name="fade-slide">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="pointer-events-auto w-full rounded-2xl border p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-md"
          :class="styles[n.type]"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.12em] opacity-80">
                {{ titles[n.type] }}
              </p>
              <p class="mt-1 text-sm font-medium">
                {{ n.message }}
              </p>
            </div>

            <button
              class="text-xs opacity-60 transition hover:opacity-100"
              @click="removeNotification(n.id)"
            >
              x
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications';

const { notifications, removeNotification } = useNotifications()

const titles = {
  success: 'Exito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Info'
}

const styles = {
  success: 'bg-[linear-gradient(135deg,#0f7b3d,#1c9a55)] text-white border-emerald-300',
  error: 'bg-[linear-gradient(135deg,#7b0f0f,#c0392b)] text-white border-red-300',
  warning: 'bg-[linear-gradient(135deg,#7b5f0f,#f39c12)] text-white border-yellow-300',
  info: 'bg-[linear-gradient(135deg,#f1f5f9,#e2e8f0)] text-slate-700 border-slate-300'
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
