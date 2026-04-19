<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="field in fields"
      :key="field.key"
      class="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
    >
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {{ field.label }}
      </p>

      <BaseSelect
        v-if="field.type === 'select'"
        :model-value="model[field.key] ?? ''"
        :options="field.options ?? []"
        :placeholder="field.placeholder"
        select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        @update:model-value="updateField(field.key, $event ?? '')"
      />

      <SearchBar
        v-else
        :model-value="model[field.key] ?? ''"
        :placeholder="field.placeholder"
        :with-container="false"
        :show-label="false"
        input-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        @update:model-value="updateField(field.key, $event ?? '')"
      />
    </article>
  </div>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import type {
  RecordReportFilters,
  ReportFieldConfig,
  ReportFieldKey,
} from '@/types/recordReport.types'

const model = defineModel<RecordReportFilters>({ required: true })

defineProps<{
  fields: ReportFieldConfig[]
}>()

const updateField = (key: ReportFieldKey, value: string) => {
  model.value[key] = value
}
</script>
