<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="GESTIÓN DE FORMACIONES"
      eyebrow="SENA | Vista administrativa"
    />

    <!-- NAVEGACIÓN Y TABS -->
    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        
        <!-- Tabs de navegación -->
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            :class="[
              activeTab === tab.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
            ]"
          >
            {{ tab.label }}
            <span 
              class="rounded-full px-2 py-0.5 text-[10px] font-bold"
              :class="[activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700']"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <ExitButton
            to="/dashboard"
            button-class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-white hover:bg-slate-50 transition"
          />
        </div>
      </div>
    </section>

    <!-- CUERPO PRINCIPAL -->
    <main class="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      
      <!-- TAB 1: FORMACIONES (FICHAS) -->
      <section v-if="activeTab === 'formaciones'" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
          <div>
            <h2 class="font-robotoSlab text-lg font-bold text-slate-800">Fichas de Formación</h2>
            <p class="text-xs text-slate-500 mt-1">Gestione las fichas de formación, asocie su programa curricular y asigne su horario vigente.</p>
          </div>
          <button 
            @click="openFichaModal()"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            + Crear Ficha
          </button>
        </div>

        <div class="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100">
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ficha (Código)</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Programa de Formación</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nivel</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Horario Asignado</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Días</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="f in formaciones" :key="f.id_formacion" class="hover:bg-slate-50/50 transition">
                <td class="p-4 font-bold text-slate-800 text-sm">
                  # {{ f.id_formacion }}
                </td>
                <td class="p-4 text-xs text-slate-700 font-semibold">{{ f.nombre }}</td>
                <td class="p-4 text-xs text-slate-600 font-medium">{{ f.nivel }}</td>
                <td class="p-4">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                    {{ f.hora_inicio }} - {{ f.hora_fin }} ({{ f.jornada }})
                  </span>
                </td>
                <td class="p-4 text-xs text-slate-500 font-medium">{{ f.dias_semana }}</td>
                <td class="p-4">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    :class="f.estado === 'activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ f.estado }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      @click="openAprendicesModal(f)"
                      class="px-2 py-1 rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      Ver Aprendices
                    </button>
                    <button 
                      @click="openFichaModal(f)"
                      class="px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-[11px] font-bold text-slate-600 transition cursor-pointer"
                    >
                      Editar
                    </button>
                    <button 
                      @click="handleDeleteFicha(f.id_formacion)"
                      class="px-2 py-1 rounded-lg border border-red-100 hover:border-red-500 hover:bg-red-50 hover:text-red-700 text-[11px] font-bold text-red-500 transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="formaciones.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400 text-sm">No hay fichas de formación registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 2: HORARIOS -->
      <section v-if="activeTab === 'horarios'" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
          <div>
            <h2 class="font-robotoSlab text-lg font-bold text-slate-800">Horarios Disponibles</h2>
            <p class="text-xs text-slate-500 mt-1">Cree horarios reutilizables definiendo las horas, jornada y días de semana autorizados.</p>
          </div>
          <button 
            @click="openHorarioModal()"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            + Crear Horario
          </button>
        </div>

        <div class="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100">
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rango de Horas</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Jornada</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Días Asignados</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="h in horarios" :key="h.id_horario" class="hover:bg-slate-50/50 transition">
                <td class="p-4 text-xs text-slate-400 font-bold"># {{ h.id_horario }}</td>
                <td class="p-4">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                    {{ h.hora_inicio }} - {{ h.hora_fin }}
                  </span>
                </td>
                <td class="p-4 text-xs text-slate-600 font-bold uppercase tracking-wider">{{ h.jornada }}</td>
                <td class="p-4 text-xs text-slate-700 font-medium">{{ h.dias_semana }}</td>
              </tr>
              <tr v-if="horarios.length === 0">
                <td colspan="4" class="p-8 text-center text-slate-400 text-sm">No hay horarios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 3: PROGRAMAS -->
      <section v-if="activeTab === 'programas'" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
          <div>
            <h2 class="font-robotoSlab text-lg font-bold text-slate-800">Programas de Formación</h2>
            <p class="text-xs text-slate-500 mt-1">Cree los programas curriculares que luego se asociarán a las distintas fichas.</p>
          </div>
          <button 
            @click="openProgramaModal()"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            + Crear Programa
          </button>
        </div>

        <div class="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100">
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Programa</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Versión</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nivel</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
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
              </tr>
              <tr v-if="programas.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400 text-sm">No hay programas académicos registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>

    <!-- MODAL 1: FICHA (CREAR O EDITAR) -->
    <BaseModal
      ref="fichaModalRef"
      :title="editingFichaId ? 'Editar Ficha de Formación' : 'Crear Ficha de Formación'"
      body-class="relative max-h-[70vh] overflow-y-auto space-y-4 px-6 py-6"
    >
      <form @submit.prevent="submitFicha" class="space-y-4">
        
        <!-- Código de Ficha (7 dígitos) -->
        <BaseField
          v-model="fichaForm.id_formacion"
          label="Código de Ficha (7 dígitos)"
          place-holder="Ej: 2721415"
          type="number"
        />

        <!-- Programa curricular -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Programa Académico</label>
          <BaseSelect
            v-model="fichaForm.id_programa"
            :options="programaSelectOptions"
            placeholder="Seleccione el programa..."
          />
        </div>

        <!-- Horario vigente -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Horario Vigente</label>
          <BaseSelect
            v-model="fichaForm.id_horario"
            :options="horarioSelectOptions"
            placeholder="Seleccione el horario..."
          />
        </div>

        <!-- Rango de fechas de formación -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-robotoSlab text-sm font-semibold text-slate-700">Fecha de Inicio</label>
            <input 
              v-model="fichaForm.fecha_inicio"
              type="date"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-robotoSlab text-sm font-semibold text-slate-700">Fecha de Fin</label>
            <input 
              v-model="fichaForm.fecha_fin"
              type="date"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        <!-- Estado de la ficha -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Estado</label>
          <BaseSelect
            v-model="fichaForm.estado"
            :options="[
              { label: 'Activa', value: 'activa' },
              { label: 'Finalizada', value: 'finalizada' }
            ]"
            placeholder="Seleccione el estado..."
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="fichaModalRef?.closeModal()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 2: HORARIO (CREAR) -->
    <BaseModal
      ref="horarioModalRef"
      title="Crear Nuevo Horario"
      body-class="relative max-h-[70vh] overflow-y-auto space-y-4 px-6 py-6"
    >
      <form @submit.prevent="submitHorario" class="space-y-4">
        
        <!-- Horas de Inicio y Fin -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-robotoSlab text-sm font-semibold text-slate-700">Hora de Inicio</label>
            <input 
              v-model="horarioForm.hora_inicio"
              type="time"
              required
              class="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-robotoSlab text-sm font-semibold text-slate-700">Hora de Fin</label>
            <input 
              v-model="horarioForm.hora_fin"
              type="time"
              required
              class="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>



        <!-- Días de la semana -->
        <div class="space-y-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700 block">Días de Clase</label>
          <div class="grid grid-cols-3 gap-2">
            <label 
              v-for="day in weekDays" 
              :key="day"
              class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition text-xs font-bold text-slate-700 cursor-pointer"
            >
              <input 
                type="checkbox" 
                :value="day" 
                v-model="horarioForm.dias_semana"
                class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              {{ day }}
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="horarioModalRef?.closeModal()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Crear Horario
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 3: PROGRAMA (CREAR) -->
    <BaseModal
      ref="programaModalRef"
      title="Crear Programa Curricular"
      body-class="relative max-h-[70vh] overflow-y-auto space-y-4 px-6 py-6"
    >
      <form @submit.prevent="submitPrograma" class="space-y-4">
        
        <BaseField
          v-model="programaForm.nombre_programa"
          label="Nombre del Programa Curricular"
          place-holder="Ej: Análisis y Desarrollo de Software"
          :max-length="150"
        />

        <BaseField
          v-model="programaForm.version"
          label="Versión curricular"
          place-holder="Ej: 1 o 2"
          :max-length="20"
        />

        <!-- Nivel de formación -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Nivel</label>
          <BaseSelect
            v-model="programaForm.nivel"
            :options="nivelOptions"
            placeholder="Seleccione el nivel..."
          />
        </div>

        <!-- Estado -->
        <div class="flex flex-col gap-2">
          <label class="font-robotoSlab text-sm font-semibold text-slate-700">Estado</label>
          <BaseSelect
            v-model="programaForm.estado"
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
            @click="programaModalRef?.closeModal()"
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

    <!-- MODAL 4: VER/ASIGNAR APRENDICES A FICHA (Con scroll vertical) -->
    <BaseModal
      ref="aprendicesFichaModalRef"
      :title="`Aprendices de la Ficha #${selectedFicha?.id_formacion || ''}`"
      body-class="relative max-h-[70vh] overflow-y-auto space-y-6 px-6 py-6"
    >
      <div class="space-y-6">
        <!-- Info del Programa -->
        <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">Programa Curricular</p>
          <p class="font-robotoSlab font-bold text-slate-800 text-sm mt-1">{{ selectedFicha?.nombre }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Nivel: {{ selectedFicha?.nivel }} | Ficha: {{ selectedFicha?.id_formacion }}</p>
        </div>

        <!-- Asignar nuevo aprendiz -->
        <div class="space-y-2.5">
          <h3 class="font-robotoSlab text-xs font-bold uppercase tracking-wider text-slate-500">Asignar Nuevo Aprendiz</h3>
          <div class="flex gap-2">
            <div class="flex-1">
              <BaseSelect
                v-model="nuevoAprendizId"
                :options="aprendicesNoVinculadosOptions"
                placeholder="Buscar aprendiz a vincular..."
              />
            </div>
            <button
              @click="handleAsignarAprendiz"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap self-start"
            >
              + Vincular
            </button>
          </div>
        </div>

        <!-- Tabla/Listado de aprendices vinculados -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="font-robotoSlab text-xs font-bold uppercase tracking-wider text-slate-500">
              Aprendices Vinculados ({{ aprendicesVinculados.length }})
            </h3>
            <button
              v-if="aprendicesVinculados.length > 0"
              type="button"
              @click="handleDesvincularTodos"
              :disabled="loadingDesvincularTodos"
              class="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-xs font-bold text-red-600 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ loadingDesvincularTodos ? 'Desvinculando...' : 'Desvincular Todos' }}</span>
            </button>
          </div>
          <div class="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="p-3 font-bold text-slate-500">Documento</th>
                  <th class="p-3 font-bold text-slate-500">Nombre Completo</th>
                  <th class="p-3 font-bold text-slate-500 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="ap in aprendicesVinculados" :key="ap.id_aprendiz" class="hover:bg-slate-50/50 transition">
                  <td class="p-3 font-bold text-slate-700">{{ ap.documento }}</td>
                  <td class="p-3 font-medium text-slate-600">{{ ap.nombre }} {{ ap.apellido }}</td>
                  <td class="p-3 text-right">
                    <button
                      @click="handleDesvincularAprendiz(ap.id_aprendiz)"
                      class="px-2.5 py-1 rounded-lg border border-red-100 hover:border-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-red-500 transition cursor-pointer text-[10px]"
                    >
                      Desvincular
                    </button>
                  </td>
                </tr>
                <tr v-if="aprendicesVinculados.length === 0">
                  <td colspan="3" class="p-6 text-center text-slate-400">No hay aprendices vinculados a esta ficha.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

const auth = useAuthStore()
const { addNotification } = useNotifications()
import {
  getProgramas,
  createPrograma,
  getHorarios,
  createHorario,
  getAllFormaciones,
  createFormacion,
  updateFormacion,
  deleteFormacion,
  getFormacionAprendices,
  desvincularTodosAprendicesFormacion,
  type Programa,
  type Horario,
  type FormacionCompleta
} from '@/Services/adminAcademic'
import {
  asignarFormacionAdmin,
  desvincularFormacionAdmin
} from '@/Services/adminAprendices'

// State
const activeTab = ref<'formaciones' | 'horarios' | 'programas'>('formaciones')
const formaciones = ref<FormacionCompleta[]>([])
const horarios = ref<Horario[]>([])
const programas = ref<Programa[]>([])

// Modals refs
const fichaModalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const horarioModalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const programaModalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const aprendicesFichaModalRef = ref<InstanceType<typeof BaseModal> | null>(null)

// Selected ficha details for viewing/associating apprentices
interface SimpleAprendiz {
  id_aprendiz: number
  documento: string
  nombre: string
  apellido: string
}
const selectedFicha = ref<FormacionCompleta | null>(null)
const aprendicesVinculados = ref<SimpleAprendiz[]>([])
const aprendicesNoVinculados = ref<SimpleAprendiz[]>([])
const nuevoAprendizId = ref<string | number>('')

const aprendicesNoVinculadosOptions = computed(() => {
  return aprendicesNoVinculados.value.map(a => ({
    label: `${a.nombre} ${a.apellido} (${a.documento})`,
    value: a.id_aprendiz
  }))
})

// Forms state
const editingFichaId = ref<number | null>(null)
const fichaForm = ref({
  id_formacion: '',
  id_programa: '' as string | number,
  id_horario: '' as string | number,
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'activa'
})

const horarioForm = ref({
  hora_inicio: '',
  hora_fin: '',
  dias_semana: [] as string[]
})

const programaForm = ref({
  nombre_programa: '',
  version: '',
  nivel: '',
  estado: 'activo'
})

// Options constants
const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const nivelOptions = [
  { label: 'Tecnólogo', value: 'Tecnólogo' },
  { label: 'Técnico', value: 'Técnico' },
  { label: 'Auxiliar', value: 'Auxiliar' },
  { label: 'Operario', value: 'Operario' },
  { label: 'Especialización Tecnológica', value: 'Especialización Tecnológica' }
]

const tabs = computed<{ label: string; value: 'formaciones' | 'horarios' | 'programas'; count: number }[]>(() => [
  { label: 'Fichas de Formación', value: 'formaciones', count: formaciones.value.length },
  { label: 'Horarios Académicos', value: 'horarios', count: horarios.value.length },
  { label: 'Programas Curriculares', value: 'programas', count: programas.value.length }
])

const programaSelectOptions = computed(() => {
  return programas.value.map(p => ({
    label: `${p.nombre_programa} (V.${p.version})`,
    value: p.id_programa
  }))
})

const horarioSelectOptions = computed(() => {
  return horarios.value.map(h => ({
    label: `${h.hora_inicio} - ${h.hora_fin} (${h.jornada}) - ${h.dias_semana}`,
    value: h.id_horario
  }))
})

// Methods
const loadAllData = async () => {
  if (!auth.token) return
  try {
    const [fList, hList, pList] = await Promise.all([
      getAllFormaciones(auth.token),
      getHorarios(auth.token),
      getProgramas(auth.token)
    ])
    formaciones.value = fList
    horarios.value = hList
    programas.value = pList
  } catch (error) {
    console.error(error)
    addNotification('Error al cargar datos académicos', 'error')
  }
}

// Fichas (Formaciones) Modals & Actions
const openFichaModal = (ficha?: FormacionCompleta) => {
  if (ficha) {
    editingFichaId.value = ficha.id_formacion
    fichaForm.value = {
      id_formacion: String(ficha.id_formacion),
      id_programa: ficha.id_programa,
      id_horario: ficha.id_horario,
      fecha_inicio: ficha.fecha_inicio,
      fecha_fin: ficha.fecha_fin,
      estado: ficha.estado
    }
  } else {
    editingFichaId.value = null
    fichaForm.value = {
      id_formacion: '',
      id_programa: '',
      id_horario: '',
      fecha_inicio: new Date().toISOString().substring(0, 10),
      fecha_fin: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      estado: 'activa'
    }
  }
  fichaModalRef.value?.openModal()
}

const submitFicha = async () => {
  if (!auth.token) return
  if (!fichaForm.value.id_formacion || !fichaForm.value.id_programa || !fichaForm.value.id_horario) {
    addNotification('Por favor complete todos los campos requeridos', 'warning')
    return
  }
  try {
    const payload = {
      id_formacion: Number(fichaForm.value.id_formacion),
      id_programa: Number(fichaForm.value.id_programa),
      id_horario: Number(fichaForm.value.id_horario),
      fecha_inicio: fichaForm.value.fecha_inicio,
      fecha_fin: fichaForm.value.fecha_fin,
      estado: fichaForm.value.estado
    }

    if (editingFichaId.value) {
      await updateFormacion(auth.token, editingFichaId.value, payload)
      addNotification('Ficha de formación actualizada con éxito', 'success')
    } else {
      await createFormacion(auth.token, payload)
      addNotification('Ficha de formación creada con éxito', 'success')
    }
    fichaModalRef.value?.closeModal()
    await loadAllData()
  } catch (error) {
    console.error(error)
    addNotification('Error al guardar la ficha de formación', 'error')
  }
}

const handleDeleteFicha = async (id: number) => {
  if (!auth.token) return
  if (!confirm('¿Está seguro de que desea eliminar esta ficha de formación? Se desvincularán todos los aprendices asociados.')) {
    return
  }
  try {
    await deleteFormacion(auth.token, id)
    addNotification('Ficha de formación eliminada con éxito', 'success')
    await loadAllData()
  } catch (error) {
    console.error(error)
    addNotification('Error al eliminar la ficha de formación', 'error')
  }
}

const loadFichaAprendicesData = async (fichaId: number) => {
  if (!auth.token) return
  try {
    const res = await getFormacionAprendices(auth.token, fichaId)
    aprendicesVinculados.value = res.vinculados
    aprendicesNoVinculados.value = res.noVinculados
    nuevoAprendizId.value = ''
  } catch (error) {
    console.error(error)
    addNotification('Error al cargar la vinculación de aprendices', 'error')
  }
}

const openAprendicesModal = async (ficha: FormacionCompleta) => {
  selectedFicha.value = ficha
  await loadFichaAprendicesData(ficha.id_formacion)
  aprendicesFichaModalRef.value?.openModal()
}

const handleAsignarAprendiz = async () => {
  if (!auth.token || !selectedFicha.value) return
  if (!nuevoAprendizId.value) {
    addNotification('Por favor seleccione un aprendiz a vincular', 'warning')
    return
  }
  try {
    await asignarFormacionAdmin(auth.token, String(nuevoAprendizId.value), selectedFicha.value.id_formacion)
    addNotification('Aprendiz vinculado exitosamente', 'success')
    await loadFichaAprendicesData(selectedFicha.value.id_formacion)
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al vincular aprendiz'
    addNotification(msg, 'error')
  }
}

const loadingDesvincularTodos = ref(false)

const handleDesvincularAprendiz = async (idAprendiz: number) => {
  if (!auth.token || !selectedFicha.value) return
  if (!confirm('¿Está seguro de que desea desvincular a este aprendiz de esta ficha?')) {
    return
  }
  try {
    await desvincularFormacionAdmin(auth.token, String(idAprendiz), selectedFicha.value.id_formacion)
    addNotification('Aprendiz desvinculado exitosamente', 'success')
    await loadFichaAprendicesData(selectedFicha.value.id_formacion)
  } catch (error) {
    console.error(error)
    addNotification('Error al desvincular aprendiz', 'error')
  }
}

const handleDesvincularTodos = async () => {
  if (!auth.token || !selectedFicha.value) return
  const total = aprendicesVinculados.value.length
  if (!confirm(`¿Está seguro de que desea desvincular a TODOS los ${total} aprendices de la ficha #${selectedFicha.value.id_formacion}? Esta acción no se puede deshacer.`)) {
    return
  }
  loadingDesvincularTodos.value = true
  try {
    const res = await desvincularTodosAprendicesFormacion(auth.token, selectedFicha.value.id_formacion)
    addNotification(res.message || 'Todos los aprendices han sido desvinculados', 'success')
    await loadFichaAprendicesData(selectedFicha.value.id_formacion)
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al desvincular los aprendices'
    addNotification(msg, 'error')
  } finally {
    loadingDesvincularTodos.value = false
  }
}

// Horario Modals & Actions
const openHorarioModal = () => {
  horarioForm.value = {
    hora_inicio: '',
    hora_fin: '',
    dias_semana: []
  }
  horarioModalRef.value?.openModal()
}

const submitHorario = async () => {
  if (!auth.token) return
  const { hora_inicio, hora_fin, dias_semana } = horarioForm.value
  if (!hora_inicio || !hora_fin || dias_semana.length === 0) {
    addNotification('Por favor complete todas las horas y al menos un día', 'warning')
    return
  }
  try {
    await createHorario(auth.token, {
      hora_inicio,
      hora_fin,
      dias_semana
    })
    addNotification('Horario académico creado con éxito', 'success')
    horarioModalRef.value?.closeModal()
    await loadAllData()
  } catch (error) {
    console.error(error)
    addNotification('Error al crear el horario', 'error')
  }
}

// Programa Modals & Actions
const openProgramaModal = () => {
  programaForm.value = {
    nombre_programa: '',
    version: '',
    nivel: '',
    estado: 'activo'
  }
  programaModalRef.value?.openModal()
}

const submitPrograma = async () => {
  if (!auth.token) return
  const { nombre_programa, version, nivel, estado } = programaForm.value
  if (!nombre_programa || !version || !nivel) {
    addNotification('Por favor complete todos los campos del programa', 'warning')
    return
  }
  try {
    await createPrograma(auth.token, {
      nombre_programa,
      version,
      nivel,
      estado
    })
    addNotification('Programa curricular creado con éxito', 'success')
    programaModalRef.value?.closeModal()
    await loadAllData()
  } catch (error) {
    console.error(error)
    addNotification('Error al crear el programa', 'error')
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
</style>
