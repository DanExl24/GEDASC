<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        @click.self="handleBackdropClick"
      >
        <div
          :class="[
            'bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden w-full flex flex-col transform transition-all',
            sizeClass
          ]"
        >
          <!-- Header -->
          <div
            v-if="$slots.header || title"
            class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60"
          >
            <slot name="header">
              <div class="flex items-center space-x-3">
                <div v-if="icon" class="p-2.5 rounded-2xl text-emerald-700 bg-emerald-100/60 border border-emerald-200/50">
                  <component :is="icon" class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold font-robotoSlab text-slate-800 tracking-tight">{{ title }}</h3>
                  <p v-if="subtitle" class="text-xs font-quicksand text-slate-500 mt-0.5">{{ subtitle }}</p>
                </div>
              </div>
            </slot>
            <button
              v-if="showClose"
              type="button"
              @click="close"
              class="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Cerrar modal"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[75vh] font-quicksand text-slate-700">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    subtitle?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    showClose?: boolean
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
    icon?: Component | object  | string
  }>(),
  {
    title: '',
    subtitle: '',
    size: 'md',
    showClose: true,
    closeOnBackdrop: true,
    closeOnEsc: true
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl'
  }
  return map[props.size] || 'max-w-md'
})

const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.isOpen && props.closeOnEsc && e.key === 'Escape') {
    close()
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>
