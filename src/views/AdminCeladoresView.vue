<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="GESTIÓN DE CELADORES"
      eyebrow="SENA | Vista administrativa"
    />

    <!-- BARRA SUPERIOR Y NAVEGACIÓN -->
    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
            <span>Operadores de Portería</span>
            <span class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
              {{ filteredCeladores.length }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <ExitButton
            to="/dashboard"
            button-class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-white hover:bg-slate-50 transition cursor-pointer"
          />
        </div>
      </div>
    </section>

    <!-- CUERPO PRINCIPAL -->
    <main class="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 space-y-4">
      
      <!-- ENCABEZADO DE TARJETA -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
        <div>
          <h2 class="font-robotoSlab text-lg font-bold text-slate-800">Operadores de Acceso</h2>
          <p class="text-xs text-slate-500 mt-1">Administración exclusiva de operadores de portería y control de acceso institucional.</p>
        </div>
        <button 
          @click="openCreateModal"
          class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          + Nuevo Celador
        </button>
      </div>

      <!-- FILTRO Y BÚSQUEDA -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm">
        <div class="relative w-full sm:w-80">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o correo..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-quicksand"
          />
        </div>
        <div class="text-xs font-semibold text-slate-500 font-quicksand">
          Total celadores: <span class="font-bold text-slate-800">{{ filteredCeladores.length }}</span>
        </div>
      </div>

      <!-- TABLA DE CELADORES -->
      <div class="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm font-quicksand">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100">
                <th scope="col" class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Celador</th>
                <th scope="col" class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</th>
                <th scope="col" class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                <th scope="col" class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Creación</th>
                <th scope="col" class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading" class="text-center">
                <td colspan="5" class="p-8 text-slate-400 text-sm">
                  <div class="flex items-center justify-center space-x-2">
                    <div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Cargando celadores...</span>
                  </div>
                </td>
              </tr>

              <tr v-else-if="filteredCeladores.length === 0" class="text-center">
                <td colspan="5" class="p-8 text-center text-slate-400 text-sm">
                  No se encontraron cuentas de celador registradas.
                </td>
              </tr>

              <tr
                v-for="celador in filteredCeladores"
                :key="celador.id_usuario"
                class="hover:bg-slate-50/50 transition"
              >
                <td class="p-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-sm">
                      {{ getInitials(celador.nombre) }}
                    </div>
                    <div>
                      <div class="font-bold text-xs sm:text-sm text-slate-800">{{ celador.nombre }}</div>
                      <div class="text-[11px] text-slate-400">Rol: {{ celador.rol }}</div>
                    </div>
                  </div>
                </td>

                <td class="p-4 text-xs text-slate-600 font-mono">
                  {{ celador.email }}
                </td>

                <td class="p-4 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="celador.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="celador.activo ? 'bg-emerald-600' : 'bg-rose-600'"></span>
                    {{ celador.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <td class="p-4 text-xs text-slate-500 font-medium">
                  {{ formatDate(celador.creado_en) }}
                </td>

                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openEditModal(celador)"
                      class="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-bold text-slate-600 transition cursor-pointer"
                      title="Editar datos / contraseña"
                    >
                      Editar
                    </button>

                    <button
                      @click="toggleStatus(celador)"
                      class="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer"
                      :class="celador.activo
                        ? 'border-red-100 hover:border-red-500 hover:bg-red-50 hover:text-red-700 text-red-500'
                        : 'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600'"
                      :title="celador.activo ? 'Desactivar cuenta' : 'Activar cuenta'"
                    >
                      {{ celador.activo ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

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
import { useNotifications } from '@/composables/useNotifications'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
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
const { addNotification } = useNotifications()
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
    addNotification('Error al cargar celadores', 'error')
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
      addNotification(`Cuenta ${celador.activo ? 'activada' : 'desactivada'} correctamente`, 'success')
    } else {
      addNotification(data.message || 'Error al cambiar estado', 'error')
    }
  } catch (error) {
    console.error('Error modificando estado:', error)
    addNotification('Error de conexión', 'error')
  }
}

onMounted(() => {
  fetchCeladores()
})
</script>
