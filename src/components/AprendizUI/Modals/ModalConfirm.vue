<template>
  <BaseModal ref="modalRef" :title="title">
    <div class="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-5 text-center">
      <BaseText
        :text="subTitle"
        type="success"
        text-class="text-center font-semibold"
      />

      <div class="flex flex-wrap justify-center gap-3">
        <BaseButtonOpen
          :text="ifYes"
          variant="green"
          class-button="rounded-2xl px-4 py-3"
          @click="handleConfirm"
        />

        <BaseButtonOpen
          :text="ifNo"
          variant="danger"
          class-button="rounded-2xl px-4 py-3"
          @click="handleCancel"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'

defineProps<{
  title: string
  subTitle: string
  ifYes: string
  ifNo: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const modalRef = ref()

const open = () => {
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

defineExpose({
  open,
  close
})
</script>
