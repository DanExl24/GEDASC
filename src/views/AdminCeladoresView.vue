<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span class="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          Gestión de Celadores
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Administración exclusiva de operadores de portería y control de acceso.
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-600/20"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuevo Celador</span>
      </button>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full pl-9 pr-4 py-2 bg-gray-800/80 border border-gray-700/80 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div class="text-xs text-gray-400">
        Total celadores: <span class="font-bold text-white">{{ filteredCeladores.length }}</span>
      </div>
    </div>

    <!-- Tabla de Celadores -->
    <div class="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-300">
          <thead class="bg-gray-800/80 text-xs uppercase font-semibold text-gray-400 border-b border-gray-700/50">
            <tr>
              <th scope="col" class="px-6 py-4">Celador</th>
              <th scope="col" class="px-6 py-4">Correo Electrónico</th>
              <th scope="col" class="px-6 py-4 text-center">Estado</th>
              <th scope="col" class="px-6 py-4">Fecha Creación</th>
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-if="loading" class="text-center py-8">
              <td colspan="5" class="py-8 text-gray-400">
                <div class="flex items-center justify-center space-x-2">
                  <div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando celadores...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="filteredCeladores.length === 0" class="text-center py-8">
              <td colspan="5" class="py-8 text-gray-500">
                No se encontraron cuentas de celador registradas.
              </td>
            </tr>

            <tr
              v-for="celador in filteredCeladores"
              :key="celador.id_usuario"
              class="hover:bg-gray-800/40 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    {{ getInitials(celador.nombre) }}
                  </div>
                  <div>
                    <div class="font-semibold text-white">{{ celador.nombre }}</div>
                    <div class="text-xs text-gray-400">Rol: {{ celador.rol }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-gray-300 font-mono text-xs">
                {{ celador.email }}
              </td>

              <td class="px-6 py-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                    celador.activo
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', celador.activo ? 'bg-emerald-400' : 'bg-rose-400']"></span>
                  {{ celador.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <td class="px-6 py-4 text-xs text-gray-400">
                {{ formatDate(celador.creado_en) }}
              </td>

              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(celador)"
                  class="p-1.5 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors inline-flex items-center"
                  title="Editar datos / contraseña"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  @click="toggleStatus(celador)"
                  :class="[
                    'p-1.5 rounded-lg transition-colors inline-flex items-center',
                    celador.activo
                      ? 'bg-gray-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                      : 'bg-gray-800 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300'
                  ]"
                  :title="celador.activo ? 'Desactivar cuenta' : 'Activar cuenta'"
                >
                  <svg v-if="celador.activo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales -->
    <ModalAddCelador
      :is-open="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @created="fetchCeladores"
    />

    <ModalEditCelador
      :is-open="isEditModalOpen"
      :celador="selectedCelador"
      @close="isEditModalOpen = false"
      @updated="fetchCeladores"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'
import ModalAddCelador from '@/components/Modals/ModalAddCelador.vue'
import ModalEditCelador from '@/components/Modals/ModalEditCelador.vue'

interface Celador {
  id_usuario: number
  nombre: string
  email: string
  id_rol: number
  rol: string
  activo: boolean
  creado_en: string
  ultimo_login: string | null
}

const auth = useAuthStore()
const celadores = ref<Celador[]>([])
const loading = ref(false)
const searchQuery = ref('')

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedCelador = ref<Celador | null>(null)

const fetchCeladores = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/api/admin/celadores`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    const data = await response.json()
    if (response.ok && data.success) {
      celadores.value = data.data
    }
  } catch (error) {
    console.error('Error cargando celadores:', error)
  } finally {
    loading.value = false
  }
}

const filteredCeladores = computed(() => {
  if (!searchQuery.value.trim()) return celadores.value
  const query = searchQuery.value.toLowerCase().trim()
  return celadores.value.filter(c =>
    c.nombre.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query)
  )
})

const getInitials = (name: string) => {
  if (!name) return 'CE'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const openEditModal = (celador: Celador) => {
  selectedCelador.value = celador
  isEditModalOpen.value = true
}

const toggleStatus = async (celador: Celador) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/celadores/${celador.id_usuario}/toggle`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    const data = await response.json()
    if (response.ok && data.success) {
      celador.activo = !celador.activo
    }
  } catch (error) {
    console.error('Error modificando estado:', error)
  }
}

onMounted(() => {
  fetchCeladores()
})
</script>
