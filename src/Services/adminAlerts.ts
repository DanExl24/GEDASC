import { getAdminBorrowedAssets } from '@/Services/adminBorrowedAssets'
import { getAdminAprendices, getAdminTrack, getAdminExits } from '@/Services/adminAprendices'
import type { AdminAlertItem, InconsistentExit } from '@/types/adminAlerts.types'
import { API_URL } from '@/config/network'
const formatDateLabel = (value: Date) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value)

const formatTimestampLabel = (value: string | null) =>
  value ? formatDateLabel(new Date(value)) : formatDateLabel(new Date())

const calculateInactiveDays = (lastVisit: string | null) => {
  if (!lastVisit) return Number.POSITIVE_INFINITY

  const now = new Date()
  const last = new Date(lastVisit)
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate())

  return Math.max(
    Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)),
    0
  )
}

export const getAdminAlerts = async (token: string) => {
  const [borrowedAssets, aprendicesData, trackData, exitsData] = await Promise.all([
    getAdminBorrowedAssets(token),
    getAdminAprendices(token),
    getAdminTrack(token),
    getAdminExits(token)
  ])
  console.log(exitsData)
  const nowLabel = formatDateLabel(new Date())

  const borrowedAlerts: AdminAlertItem[] = [
    ...borrowedAssets.computers.map((item, index) => ({
      id: `borrow-pc-${item.borrowerId}-${item.serial}-${index}`,
      type: 'BORROWED_MACHINE' as const,
      assetType: 'COMPUTER' as const,
      title: 'Prestamo de computador detectado',
      summary: `${item.borrowerName} registra un computador que pertenece a ${item.ownerName}.`,
      level: 'info' as const,
      timestampLabel: formatTimestampLabel(item.horaIngreso),
      subjectName: item.borrowerName,
      subjectDocument: item.borrowerDocument,
      details: [
        { label: 'Prestador', value: item.ownerName },
        { label: 'Documento prestador', value: item.ownerDocument },
        { label: 'Receptor', value: item.borrowerName },
        { label: 'Documento receptor', value: item.borrowerDocument },
        { label: 'Computador', value: `${item.marca} | ${item.serial}` },
      ]
    })),
    ...borrowedAssets.vehicles.map((item, index) => ({
      id: `borrow-vh-${item.borrowerId}-${item.placa}-${index}`,
      type: 'BORROWED_MACHINE' as const,
      assetType: 'VEHICLE' as const,
      title: 'Prestamo de vehiculo detectado',
      summary: `${item.borrowerName} registra un vehiculo que pertenece a ${item.ownerName}.`,
      level: 'info' as const,
      timestampLabel: formatTimestampLabel(item.horaIngreso),
      subjectName: item.borrowerName,
      subjectDocument: item.borrowerDocument,
      details: [
        { label: 'Prestador', value: item.ownerName },
        { label: 'Documento prestador', value: item.ownerDocument },
        { label: 'Receptor', value: item.borrowerName },
        { label: 'Documento receptor', value: item.borrowerDocument },
        { label: 'Vehiculo', value: `${item.tipo} | ${item.modelo} | ${item.placa}` },
      ]
    })),
  ]

  const trackMap = new Map(
    trackData.map((item) => [
      String(item.id_aprendiz),
      {
        ultima_visita: item.ultima_visita ?? null
      }
    ])
  )

  const inactivityAlerts: AdminAlertItem[] = aprendicesData
    .map((aprendiz) => {
      const track = trackMap.get(String(aprendiz.id_aprendiz))
      const inactiveDays = calculateInactiveDays(track?.ultima_visita ?? null)

      return {
        aprendiz,
        inactiveDays,
        lastVisit: track?.ultima_visita ?? null
      }
    })
    .filter((item) => item.inactiveDays >= 3 || !Number.isFinite(item.inactiveDays))
    .map(({ aprendiz, inactiveDays, lastVisit }) => ({
      id: `inactive-${aprendiz.id_aprendiz}`,
      type: 'INACTIVITY' as const,
      title: 'Aprendiz con inasistencia prolongada',
      summary: Number.isFinite(inactiveDays)
        ? `${aprendiz.nombre} ${aprendiz.apellido} acumula ${inactiveDays} dias sin asistir al CTA.`
        : `${aprendiz.nombre} ${aprendiz.apellido} no tiene actividad registrada en el CTA.`,
      level: 'warning' as const,
      timestampLabel: nowLabel,
      subjectName: `${aprendiz.nombre} ${aprendiz.apellido}`.trim(),
      subjectDocument: String(aprendiz.documento),
      inactiveDays: Number.isFinite(inactiveDays) ? inactiveDays : null,
      lastVisitLabel: lastVisit ? formatDateLabel(new Date(lastVisit)) : 'Sin registros',
      details: [
        { label: 'Documento', value: String(aprendiz.documento) },
        {
          label: 'Inasistencia actual',
          value: Number.isFinite(inactiveDays)
            ? `${inactiveDays} dias`
            : 'Sin registros de ingreso'
        },
        {
          label: 'Ultima visita',
          value: lastVisit ? formatDateLabel(new Date(lastVisit)) : 'Sin registros'
        },
      ]
    }))


    const exitAlerts: AdminAlertItem[] = exitsData.filter((item: InconsistentExit) => item.aprendiz.salida === 'NO_EXISTE').map((item: InconsistentExit, index: number) => {
        const aprendiz = item.aprendiz

        return {
          id: `exit-${aprendiz.id}-${index}`,
          type: 'EXIT' as const,
          title: 'Salida inconsistente detectada',
          summary: `${aprendiz.nombreCompleto} no tiene salida registrada.`,
          level: 'warning',
          timestampLabel: nowLabel,
          subjectName: aprendiz.nombreCompleto,
          subjectDocument: aprendiz.documento,
          details: [
            { label: 'Documento', value: aprendiz.documento },
            { label: 'Formación', value: aprendiz.formacion },
            { label: 'Estado de salida', value: aprendiz.salida }
          ]
        }
      })

  return [...inactivityAlerts, ...borrowedAlerts, ...exitAlerts]
}
