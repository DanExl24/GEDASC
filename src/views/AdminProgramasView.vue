<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="PROGRAMAS DE FORMACIÓN CURRICULAR"
      eyebrow="SENA | Vista administrativa"
    />

    <!-- CONTROLES SUPERIORES -->
    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div>
          <h2 class="font-robotoSlab text-base font-bold text-slate-800">Programas Académicos</h2>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="openCreateModal"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer"
          >
            + Registrar Programa
          </button>
          <ExitButton
            to="/dashboard"
            button-class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-white hover:bg-slate-50 transition"
          />
        </div>
      </div>
    </section>

    <!-- CUERPO -->
    <main class="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <div class="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100">
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Programa</th>
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Versión</th>
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nivel de Formación</th>
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
              <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in programas" :key="p.id_programa" class="hover:bg-slate-50/50 transition">
              <td class="p-4 text-xs text-slate-400 font-bold"># {{ p.id_programa }}</td>
              <td class="p-4 text-xs text-slate-800 font-bold">{{ p.nombre_programa }}</td>
              <td class="p-4 text-xs text-slate-600 font-medium">V. {{ p.version }}</td>
              <td class="p-4 text-xs text-slate-600 font-medium">{{ p.nivel }}</td>
              <td class="p-4">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  :class="p.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                >
                  {{ p.estado }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button 
                  @click="openEditModal(p)"
                  class="px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-[11px] font-bold text-slate-600 transition cursor-pointer"
                >
                  Editar
                </button>
              </td>
            </tr>
            <tr v-if="programas.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-400 text-sm">No hay programas académicos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- MODAL DE CREACIÓN (Con scroll vertical corregido) -->
    <BaseModal
      ref="createModalRef"
      :title="editingProgramaId ? 'Editar Programa de Formación' : 'Registrar Programa de Formación'"
      body-class="relative max-h-[70vh] overflow-y-auto space-y-4 px-6 py-6"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <BaseField
          v-model="form.nombre_programa"
          label="Nombre del Programa Curricular"
          place-holder="Ej: Gestión Tecnológica del Deporte"
          :max-length="150"
        />

        <BaseField
          v-model="form.version"
          label="Versión Curricular"
          place-holder="Ej: 1 o 2"
          :max-length="20"
        />

        <!-- Nivel de formación -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Nivel</label>
          <BaseSelect
            v-model="form.nivel"
            :options="nivelOptions"
            placeholder="Seleccione el nivel..."
          />
        </div>

        <!-- Estado -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Estado</label>
          <BaseSelect
            v-model="form.estado"
            :options="[
              { label: 'Activo', value: 'activo' },
              { label: 'Inactivo', value: 'inactivo' }
            ]"
            placeholder="Seleccione el estado..."
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="createModalRef?.closeModal()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Crear Programa
          </button>
        </div>
      </form>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'

import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { getProgramas, createPrograma, updatePrograma, type Programa } from '@/Services/adminAcademic'

const auth = useAuthStore()
const { addNotification } = useNotifications()

const programas = ref<Programa[]>([])
const createModalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const editingProgramaId = ref<number | null>(null)

const form = ref({
  nombre_programa: '',
  version: '',
  nivel: '',
  estado: 'activo'
})

const nivelOptions = [
  { label: 'Tecnólogo', value: 'Tecnólogo' },
  { label: 'Técnico', value: 'Técnico' },
  { label: 'Auxiliar', value: 'Auxiliar' },
  { label: 'Operario', value: 'Operario' },
  { label: 'Especialización Tecnológica', value: 'Especialización Tecnológica' }
]

const loadProgramas = async () => {
  if (!auth.token) return
  try {
    programas.value = await getProgramas(auth.token)
  } catch (error) {
    console.error(error)
    addNotification('Error al obtener programas', 'error')
  }
}

const openCreateModal = () => {
  editingProgramaId.value = null
  form.value = {
    nombre_programa: '',
    version: '',
    nivel: '',
    estado: 'activo'
  }
  createModalRef.value?.openModal()
}

const openEditModal = (p: Programa) => {
  editingProgramaId.value = p.id_programa
  form.value = {
    nombre_programa: p.nombre_programa,
    version: p.version,
    nivel: p.nivel,
    estado: p.estado
  }
  createModalRef.value?.openModal()
}

const submitForm = async () => {
  if (!auth.token) return
  const { nombre_programa, version, nivel, estado } = form.value
  if (!nombre_programa || !version || !nivel) {
    addNotification('Por favor complete todos los campos obligatorios', 'warning')
    return
  }
  try {
    const payload = {
      nombre_programa,
      version,
      nivel,
      estado
    }
    if (editingProgramaId.value) {
      await updatePrograma(auth.token, editingProgramaId.value, payload)
      addNotification('Programa actualizado exitosamente', 'success')
    } else {
      await createPrograma(auth.token, payload)
      addNotification('Programa creado exitosamente', 'success')
    }
    createModalRef.value?.closeModal()
    await loadProgramas()
  } catch (error) {
    console.error(error)
    addNotification('Error al guardar el programa', 'error')
  }
}

onMounted(() => {
  loadProgramas()
})
</script>

<style scoped>
</style>
