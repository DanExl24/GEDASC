<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="CONTROL ADMINISTRATIVO DE REGISTROS"
      eyebrow="SENA | Eliminacion segura"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[1.2fr_0.8fr_auto_auto] lg:items-end lg:px-8">
        <SearchBar
          v-model="search"
          label="Buscar aprendiz"
        />

        <article class="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lapso visible</p>
          <BaseSelect
            v-model:model-value="dateFilter"
            :options="optionsDates"
            placeholder="Fecha"
            select-class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <BaseButtonOpen
          text="Actualizar"
          variant="green"
          class-button="w-full lg:w-auto"
          @click="loadRecords"
        />

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="border-b border-emerald-100 bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-5 py-5 text-white lg:px-6">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Operacion sensible</p>
          <h1 class="mt-2 font-robotoSlab text-[1.8rem] font-bold leading-tight">
            Eliminacion controlada de ingresos y salidas
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/90">
            La tabla carga los movimientos del dia por defecto. Para borrar un registro debes seleccionar la accion,
            confirmar el aprendiz mediante documento o nombre completo y registrar la fecha del movimiento.
          </p>
        </div>

        <div class="grid gap-3 p-4 md:grid-cols-3 lg:px-6 lg:py-4">
          <article class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Registros visibles</p>
              <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ records.length }}</p>
            </div>
            <p class="mt-1 text-sm text-slate-600">Resultados obtenidos con el lapso actual.</p>
          </article>

          <article class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Con salida</p>
              <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ recordsWithExit }}</p>
            </div>
            <p class="mt-1 text-sm text-slate-600">Movimientos que ya registraron salida.</p>
          </article>

          <article class="rounded-[20px] border border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Pendientes</p>
              <p class="font-robotoSlab text-2xl font-bold text-white">{{ recordsWithoutExit }}</p>
            </div>
            <p class="mt-1 text-sm text-slate-300">Ingresos que aun no tienen salida.</p>
          </article>
        </div>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Tabla operativa</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">Ingresos y salidas</h2>
          </div>
          <p class="text-sm text-slate-500">Filtro por defecto: registros de hoy.</p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div v-if="loading" class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
            Cargando registros administrativos...
          </div>

          <div v-else-if="errorMessage" class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {{ errorMessage }}
          </div>

          <div v-else class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <table class="w-full border-separate border-spacing-0 font-quicksand">
              <thead>
                <tr class="bg-slate-900 text-center">
                  <th class="rounded-l-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Aprendiz</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Documento</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Fecha</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Ingreso</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Salida</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Estado</th>
                  <th class="rounded-r-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="record in records"
                  :key="record.id_ingreso"
                  class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td class="font-semibold text-slate-900">{{ record.nombre }} {{ record.apellido }}</td>
                  <td>{{ record.documento }}</td>
                  <td>{{ getRecordDate(record.hora_ingreso) }}</td>
                  <td>{{ formatDateTime(record.hora_ingreso) }}</td>
                  <td>{{ formatDateTime(record.hora_salida) }}</td>
                  <td>
                    <span
                      :class="record.hora_salida ? 'border-emerald-200 bg-emerald-50 text-senaColor' : 'border-amber-200 bg-amber-50 text-amber-700'"
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                    >
                      {{ record.hora_salida ? 'Completo' : 'Pendiente' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex flex-wrap items-center justify-center gap-2">
                      <BaseButtonOpen
                        text="Eliminar ingreso"
                        variant="danger"
                        class-button="min-h-0 px-3 py-2 text-xs"
                        @click="openDeleteModal(record, 'ingreso')"
                      />
                      <BaseButtonOpen
                        text="Eliminar salida"
                        variant="dark"
                        :disabled="!record.hora_salida"
                        class-button="min-h-0 px-3 py-2 text-xs"
                        @click="openDeleteModal(record, 'salida')"
                      />
                    </div>
                  </td>
                </tr>

                <tr v-if="records.length === 0">
                  <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-500">
                    No hay registros para el filtro actual.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <BaseModal
      ref="deleteModal"
      title="Confirmar eliminacion"
      modal-class="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      body-class="relative max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-6 py-6"
    >
      <template v-if="selectedRecord">
        <section class="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Validacion obligatoria</p>
          <h3 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
            Vas a eliminar {{ selectedAction === 'ingreso' ? 'el ingreso' : 'la salida' }} de {{ selectedRecord.nombre }} {{ selectedRecord.apellido }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Escribe el documento o el nombre completo del aprendiz y confirma la fecha del registro.
            Tambien debes dejar una observacion del motivo. Esta accion esta pensada para correcciones por lapso de tiempo y no se debe usar sin validacion.
          </p>
        </section>

        <section class="grid gap-4 md:grid-cols-2">
          <article class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Aprendiz</p>
            <p class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
              {{ selectedRecord.nombre }} {{ selectedRecord.apellido }}
            </p>
            <p class="mt-1 text-sm text-slate-600">Documento: {{ selectedRecord.documento }}</p>
          </article>

          <article class="rounded-[20px] border border-slate-200 bg-slate-900 px-4 py-4 text-white">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Registro objetivo</p>
            <p class="mt-2 text-sm text-slate-300">Fecha: {{ getRecordDate(selectedRecord.hora_ingreso) }}</p>
            <p class="mt-1 text-sm text-slate-300">Ingreso: {{ formatDateTime(selectedRecord.hora_ingreso) }}</p>
            <p class="mt-1 text-sm text-slate-300">Salida: {{ formatDateTime(selectedRecord.hora_salida) }}</p>
          </article>
        </section>

        <section class="grid gap-4 md:grid-cols-2">
          <BaseField
            v-model="deleteForm.verification"
            label="Documento o nombre completo"
            place-holder="Ej: 12345678 o Juan Perez"
          />

          <article class="flex flex-col gap-2">
            <label class="mt-2 font-robotoSlab text-sm font-semibold text-slate-700">
              Fecha del registro
            </label>
            <div class="rounded-2xl border border-slate-200 bg-slate-100 p-3 font-quicksand text-slate-700">
              {{ getRecordDate(selectedRecord.hora_ingreso) }}
            </div>
          </article>
        </section>

        <article class="flex flex-col gap-2">
          <label class="mt-2 font-robotoSlab text-sm font-semibold text-slate-700">
            Fecha de eliminacion
          </label>
          <div class="rounded-2xl border border-slate-200 bg-slate-100 p-3 font-quicksand text-slate-700">
            {{ currentActionDateLabel }}
          </div>
        </article>

        <BaseField
          v-model="deleteForm.observation"
          label="Observacion o motivo"
          place-holder="Describe el motivo de la eliminacion"
        />

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <BaseButtonOpen
            text="Cancelar"
            variant="white"
            class-button="w-full sm:w-auto"
            @click="closeDeleteModal"
          />
          <BaseButtonOpen
            :text="deleteLoading ? 'Eliminando...' : 'Confirmar eliminacion'"
            variant="danger"
            :disabled="deleteLoading"
            class-button="w-full sm:w-auto"
            @click="handleDelete"
          />
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import { optionsDates } from '@/constants/optionsDates'
import HeaderView from '@/layouts/HeaderView.vue'
import { formatDateTime } from '@/utils/formatDate'
import { useNotifications } from '@/composables/useNotifications'
import { useAuthStore } from '@/stores/auth'
import {
  deleteAdminIngreso,
  deleteAdminSalida,
  getAdminIngressEgress,
  type AdminDateFilter,
  type AdminIngressEgressRecord,
} from '@/Services/adminRecordControl'

type DeleteAction = 'ingreso' | 'salida'

const auth = useAuthStore()
const { addNotification } = useNotifications()
const deleteModal = ref<{
  openModal: () => void
  closeModal: () => void
} | null>(null)

const search = ref('')
const dateFilter = ref<AdminDateFilter>('TODAY')
const records = ref<AdminIngressEgressRecord[]>([])
const selectedRecord = ref<AdminIngressEgressRecord | null>(null)
const selectedAction = ref<DeleteAction>('ingreso')
const loading = ref(false)
const deleteLoading = ref(false)
const errorMessage = ref('')

const deleteForm = reactive({
  verification: '',
  date: '',
  observation: ''
})

const recordsWithExit = computed(() =>
  records.value.filter((record) => !!record.hora_salida).length
)

const recordsWithoutExit = computed(() =>
  records.value.filter((record) => !record.hora_salida).length
)

const currentActionDateLabel = computed(() =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full'
  }).format(new Date())
)


const getRecordDate = (value: string | null) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium'
  }).format(new Date(value))
}

const getIsoDate = (value: string | null) => {
  if (!value) return ''

  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const loadRecords = async () => {
  if (!auth.token) {
    errorMessage.value = 'No hay sesion activa para consultar registros administrativos.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    records.value = await getAdminIngressEgress(auth.token, {
      search: search.value,
      date: dateFilter.value
    })
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar los registros administrativos.'
  } finally {
    loading.value = false
  }
}

const openDeleteModal = (record: AdminIngressEgressRecord, action: DeleteAction) => {
  selectedRecord.value = record
  selectedAction.value = action
  deleteForm.verification = ''
  deleteForm.date = getIsoDate(record.hora_ingreso)
  deleteForm.observation = ''
  deleteModal.value?.openModal()
}

const closeDeleteModal = () => {
  deleteModal.value?.closeModal()
  selectedRecord.value = null
  deleteForm.verification = ''
  deleteForm.date = ''
  deleteForm.observation = ''
}

const handleDelete = async () => {
  if (!auth.token || !selectedRecord.value) return

  deleteForm.date = getIsoDate(selectedRecord.value.hora_ingreso)

  if (!deleteForm.verification.trim() || !deleteForm.date || !deleteForm.observation.trim()) {
    addNotification('Debes confirmar el aprendiz, la fecha y el motivo de eliminacion.', 'warning')
    return
  }

  deleteLoading.value = true

  try {
    if (selectedAction.value === 'ingreso') {
      await deleteAdminIngreso(auth.token, selectedRecord.value.id_aprendiz, {
        verification: deleteForm.verification.trim(),
        date: deleteForm.date,
        observation: deleteForm.observation.trim()
      })
    } else {
      await deleteAdminSalida(auth.token, selectedRecord.value.id_aprendiz, {
        verification: deleteForm.verification.trim(),
        date: deleteForm.date,
        observation: deleteForm.observation.trim()
      })
    }

    addNotification('Registro eliminado correctamente.', 'success')
    closeDeleteModal()
    await loadRecords()
  } catch (error) {
    console.error(error)
    addNotification(
      error instanceof Error ? error.message : 'No fue posible eliminar el registro.',
      'error'
    )
  } finally {
    deleteLoading.value = false
  }
}

onMounted(loadRecords)
</script>
