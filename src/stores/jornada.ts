import { defineStore } from 'pinia'
import type {
  JornadaDefinition,
  JornadaInfo,
  JornadaKey,
} from '@/types/jornada.types'

const JORNADAS: JornadaDefinition[] = [
  {
    key: 'DIURNA',
    label: 'Diurna',
    startMinutes: 6 * 60,
    endMinutes: 9 * 60,
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    key: 'TARDE',
    label: 'Tarde',
    startMinutes: 12 * 60,
    endMinutes: 15 * 60,
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'NOCHE',
    label: 'Noche',
    startMinutes: 18 * 60,
    endMinutes: 22 * 60,
    badgeClass: 'bg-slate-200 text-slate-900',
  },
]

const FALLBACK_JORNADA: JornadaInfo = {
  key: 'SIN_JORNADA',
  label: 'Sin jornada',
  badgeClass: 'bg-slate-100 text-slate-500',
}

const extractMinutesFromHour = (value: string | null | undefined): number | null => {
  if (!value) return null

  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)

  if (!match) return null

  const rawHour = match[1]
  const rawMinute = match[2]
  const meridiem = match[3]

  if (!rawHour || !rawMinute || !meridiem) {
    return null
  }
  let hour = Number(rawHour)
  const minute = Number(rawMinute)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  if (meridiem.toUpperCase() === 'AM') {
    if (hour === 12) hour = 0
  } else if (hour !== 12) {
    hour += 12
  }

  return hour * 60 + minute
}

const resolveJornada = (minutes: number | null): JornadaInfo => {
  if (minutes == null) return FALLBACK_JORNADA

  const matched = JORNADAS.find(
    (jornada) =>
      minutes >= jornada.startMinutes && minutes <= jornada.endMinutes,
  )

  if (!matched) return FALLBACK_JORNADA

  return {
    key: matched.key,
    label: matched.label,
    badgeClass: matched.badgeClass,
  }
}

export const useJornadaStore = defineStore('jornada', {
  state: () => ({
    definitions: JORNADAS,
    fallback: FALLBACK_JORNADA,
    byAprendizId: {} as Record<number, JornadaInfo>,
  }),
  actions: {
    registerAprendizJornada(
      idAprendiz: number | null | undefined,
      horaIngreso: string | null | undefined,
    ) {
      if (!idAprendiz) return

      const jornada = resolveJornada(extractMinutesFromHour(horaIngreso))

      if (jornada.key === 'SIN_JORNADA') return

      this.byAprendizId[idAprendiz] = jornada
    },
    registerAprendices(
      aprendices: Array<{
        id_aprendiz: number
        hora_ingreso?: string | null
      }>,
    ) {
      for (const aprendiz of aprendices) {
        this.registerAprendizJornada(
          aprendiz.id_aprendiz,
          aprendiz.hora_ingreso,
        )
      }
    },
    getJornadaByHour(horaIngreso: string | null | undefined): JornadaInfo {
      return resolveJornada(extractMinutesFromHour(horaIngreso))
    },
    getJornadaForAprendiz(
      idAprendiz: number | null | undefined,
      horaIngreso: string | null | undefined,
    ): JornadaInfo {
      const byHour = this.getJornadaByHour(horaIngreso)

      if (byHour.key !== 'SIN_JORNADA') {
        return byHour
      }

      if (idAprendiz && this.byAprendizId[idAprendiz]) {
        return this.byAprendizId[idAprendiz]
      }

      return this.fallback
    },
    isJornada(horaIngreso: string | null | undefined, key: JornadaKey): boolean {
      return this.getJornadaByHour(horaIngreso).key === key
    },
  },
})
