<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="APRENDICES Y ACTIVIDAD CTA"
      eyebrow="SENA | Vista administrativa"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex flex-col gap-3 px-4 py-3 max-w-7xl lg:px-8">
        <!-- FILA 1: BÚSQUEDA, SELECTOR DE FICHA Y SALIDA -->
        <div class="grid w-full gap-3 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end">
          <SearchBar
            v-model="search"
            label="Buscar por nombre, documento o programa"
          />

          <div class="space-y-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Filtrar por Ficha / Formación
            </label>
            <div class="relative">
              <select
                v-model="filterFicha"
                class="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-quicksand font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 cursor-pointer pr-10"
              >
                <option value="todas">Todas las fichas formativas</option>
                <option value="sin_ficha">Aprendices sin ficha asignada</option>
                <option
                  v-for="f in formacionesList"
                  :key="f.id_formacion"
                  :value="f.id_formacion"
                >
                  Ficha #{{ f.id_formacion }} - {{ f.nombre }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <ExitButton
            to="/"
            button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
          />
        </div>

        <!-- FILA 2: CHIPS INTERACTIVOS DE FILTROS RÁPIDOS -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Filtro Estado -->
            <div class="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                @click="filterEstado = 'todos'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterEstado === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              >
                Todos
              </button>
              <button
                type="button"
                @click="filterEstado = 'activos'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterEstado === 'activos' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-700'"
              >
                Activos
              </button>
              <button
                type="button"
                @click="filterEstado = 'inactivos'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterEstado === 'inactivos' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-rose-700'"
              >
                Inactivos
              </button>
            </div>

            <!-- Filtro Rol Monitor -->
            <div class="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                @click="filterRol = 'todos'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterRol === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              >
                Roles: Todos
              </button>
              <button
                type="button"
                @click="filterRol = 'monitores'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterRol === 'monitores' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-purple-700'"
              >
                ★ Monitores
              </button>
            </div>

            <!-- Filtro Asistencia / Actividad -->
            <div class="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                @click="filterAsistencia = 'todos'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterAsistencia === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              >
                Actividad: Toda
              </button>
              <button
                type="button"
                @click="filterAsistencia = 'inactivos_7d'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterAsistencia === 'inactivos_7d' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-amber-700'"
                title="Aprendices con más de 7 días sin asistir al CTA"
              >
                Ausencia ≥ 7d
              </button>
              <button
                type="button"
                @click="filterAsistencia = 'nunca'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterAsistencia === 'nunca' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                title="Aprendices que nunca han registrado accesos"
              >
                Sin asistencia
              </button>
              <button
                type="button"
                @click="filterAsistencia = 'hoy'"
                class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                :class="filterAsistencia === 'hoy' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-teal-700'"
                title="Aprendices que asistieron hoy"
              >
                Asistieron hoy
              </button>
            </div>

            <!-- Filtro Doble Formación -->
            <button
              type="button"
              @click="filterDobleFormacion = !filterDobleFormacion"
              class="px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer flex items-center gap-1.5"
              :class="filterDobleFormacion ? 'border-pink-300 bg-pink-100 text-pink-800 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'"
            >
              <span>🎓</span>
              <span>Doble Formación (≥2)</span>
            </button>
          </div>

          <!-- Limpiar Filtros -->
          <div class="flex items-center gap-2">
            <button
              v-if="hasActiveFilters"
              type="button"
              @click="resetFilters"
              class="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>↺</span>
              <span>Limpiar Filtros</span>
            </button>
            <span class="text-xs text-slate-500 font-medium">
              Mostrando <strong>{{ filteredAprendices.length }}</strong> de {{ aprendices.length }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div class="bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-5 py-5 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Aprendices registrados</p>
            <h1 class="mt-2 font-robotoSlab text-[1.8rem] font-bold leading-tight">
              Seguimiento de actividad y maquinas por aprendiz
            </h1>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/90">
              Consulta todos los aprendices registrados, su actividad acumulada en el CTA, el tiempo sin asistir
              y el detalle completo de sus maquinas registradas.
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-5">
            <div class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Aprendices visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ filteredAprendices.length }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Registros que cumplen con la busqueda y el filtro de inactividad.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Sin asistencia reciente</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ inactiveCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Aprendices con ausencia mayor al filtro actual.</p>
            </div>
          </div>
        </article>

        <section class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            :class="card.cardClass"
            class="rounded-[24px] border px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p :class="card.eyebrowClass" class="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {{ card.eyebrow }}
                </p>
                <h2 :class="card.titleClass" class="mt-2 font-robotoSlab text-lg font-bold">{{ card.label }}</h2>
              </div>

              <div :class="card.badgeClass" class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]">
                {{ card.badge }}
              </div>
            </div>

            <p :class="card.valueClass" class="mt-5 font-robotoSlab text-4xl font-bold">{{ card.value }}</p>
            <p :class="card.descriptionClass" class="mt-2 text-sm leading-5">{{ card.description }}</p>
          </article>
        </section>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-3 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Gestión de Aprendices</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">Directorio Maestro CTA</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              @click="openCreateAprendiz"
              class="h-10 px-4 rounded-xl bg-senaColor hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>+</span>
              <span>Registrar Aprendiz</span>
            </button>
            <button
              type="button"
              @click="openImportGeneral"
              class="h-10 px-4 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>📥</span>
              <span>Importar Masivo (.xlsx / .json)</span>
            </button>
            <button
              type="button"
              @click="openAsociacionesModal()"
              class="h-10 px-4 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>🎓</span>
              <span>Gestionar Asociaciones</span>
            </button>
          </div>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div v-if="isLoading" class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
            Cargando aprendices administrativos...
          </div>

          <div v-else-if="loadError" class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {{ loadError }}
          </div>

          <div v-else class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <table class="w-full border-separate border-spacing-0 font-quicksand">
              <thead>
                <tr class="bg-slate-900 text-center">
                  <th class="rounded-l-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100 text-left">Aprendiz</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Documento</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100 text-left">Formación / Ficha</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Actividad</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Monitor</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Estado</th>
                  <th class="rounded-r-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="aprendiz in filteredAprendices"
                  :key="aprendiz.id_aprendiz"
                  class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td class="text-left font-semibold text-slate-900">
                    <div>
                      <p class="font-bold text-slate-900 text-sm">{{ aprendiz.nombre }} {{ aprendiz.apellido }}</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-if="aprendiz.es_monitor"
                          class="inline-flex rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700 ring-1 ring-inset ring-purple-700/10"
                        >
                          Monitor
                        </span>
                        <span
                          v-if="Number(aprendiz.total_formaciones) > 1"
                          class="inline-flex rounded-md bg-pink-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-pink-700 ring-1 ring-inset ring-pink-700/10"
                        >
                          Doble Formación
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono font-semibold text-slate-800">{{ aprendiz.documento }}</td>
                  <td class="text-left max-w-[200px]">
                    <p class="text-xs font-bold text-slate-800 truncate" :title="String(aprendiz.programa || '')">{{ aprendiz.programa || 'Sin programa' }}</p>
                    <p v-if="aprendiz.formacion && aprendiz.formacion !== 'Sin ficha'" class="text-[11px] font-bold text-purple-700">
                      Ficha: {{ aprendiz.formacion }}
                    </p>
                  </td>
                  <td>
                    <div class="space-y-1 text-left">
                      <p class="font-semibold text-slate-900">{{ formatActivity(aprendiz.horas_reales, aprendiz.total_sesiones) }}</p>
                      <p class="text-xs text-slate-500">{{ formatDaysActive(aprendiz.inactiveDays, aprendiz.ultima_visita) }}</p>
                    </div>
                  </td>
                  <td>
                    <span
                      class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider select-none"
                      :class="aprendiz.es_monitor ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 text-slate-400'"
                    >
                      <span>{{ aprendiz.es_monitor ? '★ Monitor' : '☆ No' }}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      @click="handleToggleStatus(aprendiz)"
                      class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      :class="aprendiz.estado !== false ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'"
                      title="Haz clic para alternar estado activo/inactivo"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="aprendiz.estado !== false ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                      <span>{{ aprendiz.estado !== false ? 'Activo' : 'Inactivo' }}</span>
                    </button>
                  </td>
                  <td>
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        @click="handleEditAprendiz(aprendiz)"
                        class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-sm"
                        title="Editar datos del aprendiz"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        @click="openMachinesModal(aprendiz)"
                        class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-sm"
                        title="Ver máquinas del aprendiz"
                      >
                        💻
                      </button>
                      <button
                        type="button"
                        @click="openAsociacionesModal(aprendiz)"
                        class="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer shadow-sm"
                        title="Administrar fichas académicas"
                      >
                        🎓
                      </button>
                      <button
                        type="button"
                        @click="handleDeleteAprendiz(aprendiz)"
                        class="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer shadow-sm"
                        title="Eliminar aprendiz"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredAprendices.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
                    No hay aprendices que coincidan con los filtros actuales.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <BaseModal
      ref="machinesModal"
      title="Detalle de maquinas del aprendiz"
      modal-class="my-6 w-full max-w-5xl overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
      body-class="relative max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto px-4 py-4 lg:px-5"
    >
      <template v-if="selectedAprendiz">
        <section class="rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Aprendiz seleccionado</p>
          <h3 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
            {{ selectedAprendiz.nombre }} {{ selectedAprendiz.apellido }}
          </h3>
          <p class="mt-1 text-sm text-slate-600">Documento: {{ selectedAprendiz.documento }}</p>
        </section>

        <div v-if="machinesLoading" class="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
          Cargando maquinas del aprendiz...
        </div>

        <div v-else-if="machinesError" class="rounded-[18px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
          {{ machinesError }}
        </div>

        <div v-else-if="selectedMachines.length === 0" class="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          Este aprendiz no tiene maquinas registradas.
        </div>

        <div v-else class="grid gap-3">
          <article
            v-for="(machine, index) in selectedMachines"
            :key="`${selectedAprendiz.id_aprendiz}-${index}`"
            class="rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p
                  :class="machineBadgeClass(machine)"
                  class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  {{ getMachineRole(machine) }}
                </p>
                <h4 class="mt-3 font-robotoSlab text-lg font-bold text-slate-900">
                  {{ machine.pc ? 'Computador registrado' : 'Vehiculo registrado' }}
                </h4>
              </div>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <template v-if="machine.pc">
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.pc.marca || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Serial</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.pc.serial || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Estado</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ getMachineRole(machine) }}</p>
                </div>
              </template>

              <template v-else-if="machine.vh">
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tipo</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.tipo_vehiculo || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.marca || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Placa</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.placa || '-' }}</p>
                </div>
              </template>
            </div>
          </article>
        </div>
      </template>
    </BaseModal>

    <ModalAsociaciones
      ref="asociacionesModal"
      :aprendices="aprendices"
      :token="auth.token || ''"
      @update="loadAprendices"
    />

    <!-- MODAL DE CREACIÓN / EDICIÓN INDIVIDUAL -->
    <ModalAprendizForm
      ref="aprendizFormModalRef"
      :formaciones-options="formacionesOptions"
      @saved="loadAprendices"
    />

    <!-- MODAL DE IMPORTACIÓN MASIVA GENERAL -->
    <ModalImportAprendicesGeneral
      ref="importGeneralModalRef"
      @imported="loadAprendices"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseModal from '@/components/Modals/BaseModal.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ModalAsociaciones from '@/components/AprendizUI/Modals/ModalAsociaciones.vue'
import ModalAprendizForm from '@/components/Modals/ModalAprendizForm.vue'
import ModalImportAprendicesGeneral from '@/components/Modals/ModalImportAprendicesGeneral.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import {
  getAdminAprendices,
  getAdminMachinesByAprendiz,
  getAdminTrack,
  toggleAdminAprendizStatus,
  deleteAdminAprendiz,
  type AdminAprendizRow,
  type AdminMachineRecord,
  type AdminTrackRow,
} from '@/Services/adminAprendices'
import { getAllFormaciones, type FormacionCompleta } from '@/Services/adminAcademic'

type SummaryCard = {
  label: string
  eyebrow: string
  value: number | string
  description: string
  badge: string
  cardClass: string
  eyebrowClass: string
  badgeClass: string
  titleClass: string
  valueClass: string
  descriptionClass: string
}

type AprendizWithActivity = AdminAprendizRow & {
  total_sesiones: number
  dias_activos: number
  horas_reales: number
  ultima_visita: string | null
  inactiveDays: number
}

const auth = useAuthStore()
const { addNotification } = useNotifications()

const search = ref('')
const filterEstado = ref<'todos' | 'activos' | 'inactivos'>('todos')
const filterRol = ref<'todos' | 'monitores'>('todos')
const filterFicha = ref<string | number>('todas')
const filterAsistencia = ref<'todos' | 'inactivos_7d' | 'nunca' | 'hoy'>('todos')
const filterDobleFormacion = ref(false)

const isLoading = ref(false)
const loadError = ref('')
const aprendices = ref<AprendizWithActivity[]>([])
const formacionesList = ref<FormacionCompleta[]>([])

const machinesModal = ref<{
  openModal: () => void
  closeModal: () => void
} | null>(null)
const asociacionesModal = ref<InstanceType<typeof ModalAsociaciones> | null>(null)
const aprendizFormModalRef = ref<InstanceType<typeof ModalAprendizForm> | null>(null)
const importGeneralModalRef = ref<InstanceType<typeof ModalImportAprendicesGeneral> | null>(null)

const selectedAprendiz = ref<AprendizWithActivity | null>(null)
const selectedMachines = ref<AdminMachineRecord[]>([])
const machinesLoading = ref(false)
const machinesError = ref('')

const formacionesOptions = computed(() => {
  return formacionesList.value.map((f) => ({
    value: f.id_formacion,
    label: `Ficha #${f.id_formacion} - ${f.nombre} (${f.jornada || ''})`
  }))
})

const hasActiveFilters = computed(() => {
  return (
    search.value.trim() !== '' ||
    filterEstado.value !== 'todos' ||
    filterRol.value !== 'todos' ||
    filterFicha.value !== 'todas' ||
    filterAsistencia.value !== 'todos' ||
    filterDobleFormacion.value === true
  )
})

const resetFilters = () => {
  search.value = ''
  filterEstado.value = 'todos'
  filterRol.value = 'todos'
  filterFicha.value = 'todas'
  filterAsistencia.value = 'todos'
  filterDobleFormacion.value = false
}

const calculateInactiveDays = (lastVisit: string | null) => {
  if (!lastVisit) return Number.POSITIVE_INFINITY

  const now = new Date()
  const last = new Date(lastVisit)

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  const diff = todayDate.getTime() - lastDate.getTime()

  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0)
}

const searchTerm = computed(() => search.value.trim().toLowerCase())

const filteredAprendices = computed(() => {
  return aprendices.value.filter((aprendiz) => {
    // 1. Filtro por búsqueda textual
    const term = searchTerm.value
    const matchesSearch =
      !term ||
      [
        aprendiz.nombre,
        aprendiz.apellido,
        aprendiz.documento,
        aprendiz.programa,
        aprendiz.formacion
      ].some((value) => String(value || '').toLowerCase().includes(term))

    // 2. Filtro por estado activo / inactivo
    const matchesEstado =
      filterEstado.value === 'todos' ||
      (filterEstado.value === 'activos' && aprendiz.estado !== false) ||
      (filterEstado.value === 'inactivos' && aprendiz.estado === false)

    // 3. Filtro por rol monitor
    const matchesRol =
      filterRol.value === 'todos' ||
      (filterRol.value === 'monitores' && Boolean(aprendiz.es_monitor))

    // 4. Filtro por ficha formativa
    let matchesFicha = true
    if (filterFicha.value !== 'todas') {
      if (filterFicha.value === 'sin_ficha') {
        matchesFicha = !aprendiz.formacion || aprendiz.formacion === 'Sin ficha'
      } else {
        matchesFicha = String(aprendiz.formacion || '').includes(String(filterFicha.value))
      }
    }

    // 5. Filtro por actividad / asistencia
    let matchesAsistencia = true
    if (filterAsistencia.value === 'inactivos_7d') {
      matchesAsistencia = !Number.isFinite(aprendiz.inactiveDays) || aprendiz.inactiveDays >= 7
    } else if (filterAsistencia.value === 'nunca') {
      matchesAsistencia = !aprendiz.ultima_visita
    } else if (filterAsistencia.value === 'hoy') {
      matchesAsistencia = aprendiz.inactiveDays === 0
    }

    // 6. Filtro por doble formación
    const matchesDoble =
      !filterDobleFormacion.value || Number(aprendiz.total_formaciones || 0) > 1

    return matchesSearch && matchesEstado && matchesRol && matchesFicha && matchesAsistencia && matchesDoble
  })
})

const inactiveCount = computed(() =>
  filteredAprendices.value.filter((aprendiz) =>
    !Number.isFinite(aprendiz.inactiveDays) || aprendiz.inactiveDays >= 7
  ).length
)

const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: 'Aprendices totales',
    eyebrow: 'Base administrativa',
    value: aprendices.value.length,
    description: 'Todos los aprendices registrados en la base de datos.',
    badge: 'ALL',
    cardClass: 'border-emerald-200 bg-white',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-senaColor text-white',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Visibles',
    eyebrow: 'Filtro actual',
    value: filteredAprendices.value.length,
    description: 'Aprendices que cumplen con la busqueda y el filtro activo.',
    badge: 'ON',
    cardClass: 'border-slate-200 bg-white',
    eyebrowClass: 'text-slate-500',
    badgeClass: 'bg-slate-900 text-white',
    titleClass: 'text-slate-900',
    valueClass: 'text-slate-900',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Nunca han asistido',
    eyebrow: 'Seguimiento',
    value: aprendices.value.filter((aprendiz) => !aprendiz.ultima_visita).length,
    description: 'Aprendices sin una ultima visita registrada en el CTA.',
    badge: 'NEW',
    cardClass: 'border-emerald-100 bg-emerald-50',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-white text-senaColor',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Mayor ausencia',
    eyebrow: 'Inactividad',
    value: getMaxInactiveDays(aprendices.value),
    description: 'Mayor cantidad de dias sin asistir detectada en la lista.',
    badge: 'DAY',
    cardClass: 'border-slate-900 bg-slate-900 text-white',
    eyebrowClass: 'text-emerald-200',
    badgeClass: 'bg-white text-slate-900',
    titleClass: 'text-white',
    valueClass: 'text-white',
    descriptionClass: 'text-slate-300',
  },
])

function getMaxInactiveDays(rows: AprendizWithActivity[]) {
  const finiteDays = rows
    .map((row) => row.inactiveDays)
    .filter((value) => Number.isFinite(value))

  return finiteDays.length ? Math.max(...finiteDays) : 'N/A'
}

const formatActivity = (hours: number, sessions: number) => {
  const totalMinutes = Number.isFinite(hours) ? Math.max(Math.round(hours * 60), 0) : 0
  const timeLabel = totalMinutes === 0
    ? 'Sin actividad'
    : totalMinutes < 60
      ? `${totalMinutes} min activos`
      : `${(totalMinutes / 60).toFixed(1)} h activas`

  return `${timeLabel} | ${sessions} sesiones`
}

const formatDaysActive = (inactiveDaysValue: number, lastVisit: string | null) => {
  if (!lastVisit || !Number.isFinite(inactiveDaysValue)) {
    return 'Sin asistencia registrada'
  }

  if (inactiveDaysValue === 0) {
    return 'Asistencia hoy'
  }

  if (inactiveDaysValue === 1) {
    return '1 dia de inasistencia'
  }

  return `${inactiveDaysValue} dias de inasistencia`
}

const machineBadgeClass = (machine: AdminMachineRecord) =>
  getMachineRole(machine) === 'PRINCIPAL'
    ? 'border-emerald-200 bg-emerald-50 text-senaColor'
    : 'border-slate-200 bg-slate-100 text-slate-700'

const getMachineRole = (machine: AdminMachineRecord) =>
  machine.pc?.estado || machine.vh?.estado || 'SECUNDARIO'

const loadAprendices = async () => {
  if (!auth.token) {
    loadError.value = 'No hay sesion activa para consultar aprendices administrativos.'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const [aprendicesData, trackData, formacionesData] = await Promise.all([
      getAdminAprendices(auth.token),
      getAdminTrack(auth.token),
      getAllFormaciones(auth.token).catch(() => [])
    ])

    formacionesList.value = formacionesData || []

    const trackMap = new Map(
      trackData.map((item: AdminTrackRow) => [
        item.id_aprendiz,
        {
          total_sesiones: Number(item.total_sesiones ?? 0),
          dias_activos: Number(item.dias_activos ?? 0),
          horas_reales: Number(item.horas_reales ?? 0),
          ultima_visita: item.ultima_visita ?? null
        }
      ])
    )

    aprendices.value = aprendicesData.map((aprendiz) => {
      const track = trackMap.get(aprendiz.id_aprendiz)
      const lastVisit = track?.ultima_visita ?? null

      return {
        ...aprendiz,
        total_sesiones: track?.total_sesiones ?? 0,
        dias_activos: track?.dias_activos ?? 0,
        horas_reales: track?.horas_reales ?? 0,
        ultima_visita: lastVisit,
        inactiveDays: calculateInactiveDays(lastVisit)
      }
    })
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar los aprendices administrativos.'
  } finally {
    isLoading.value = false
  }
}

const openCreateAprendiz = () => {
  aprendizFormModalRef.value?.openCreate()
}

const openImportGeneral = () => {
  importGeneralModalRef.value?.open()
}

const handleEditAprendiz = (aprendiz: AprendizWithActivity) => {
  aprendizFormModalRef.value?.openEdit(aprendiz)
}

const handleToggleStatus = async (aprendiz: AprendizWithActivity) => {
  if (!auth.token) return
  try {
    const res = await toggleAdminAprendizStatus(auth.token, aprendiz.id_aprendiz)
    aprendiz.estado = res?.data?.estado !== undefined ? res.data.estado : !aprendiz.estado
    addNotification(res?.message || 'Estado actualizado', 'success')
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al cambiar estado'
    addNotification(msg, 'error')
  }
}

const handleDeleteAprendiz = async (aprendiz: AprendizWithActivity) => {
  if (!auth.token) return
  if (!confirm(`¿Está seguro de que desea eliminar al aprendiz ${aprendiz.nombre} ${aprendiz.apellido} (Doc: ${aprendiz.documento})?`)) {
    return
  }

  try {
    const res = await deleteAdminAprendiz(auth.token, aprendiz.id_aprendiz)
    addNotification(res?.message || 'Aprendiz procesado con éxito', 'success')
    await loadAprendices()
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al eliminar el aprendiz'
    addNotification(msg, 'error')
  }
}

const openMachinesModal = async (aprendiz: AprendizWithActivity) => {
  if (!auth.token) return

  selectedAprendiz.value = aprendiz
  selectedMachines.value = []
  machinesError.value = ''
  machinesLoading.value = true
  machinesModal.value?.openModal()

  try {
    selectedMachines.value = await getAdminMachinesByAprendiz(auth.token, String(aprendiz.id_aprendiz))
  } catch (error) {
    console.error(error)
    machinesError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar las maquinas del aprendiz.'
  } finally {
    machinesLoading.value = false
  }
}

const openAsociacionesModal = (aprendiz?: AprendizWithActivity) => {
  asociacionesModal.value?.open(aprendiz)
}

onMounted(loadAprendices)
</script>
