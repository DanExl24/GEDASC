import { optionsVehicle } from '@/constants/optionsVehicle'

const legacyVehicleTypeLabels: Record<string, string> = {
  MT: 'MOTO',
  CR: 'CARRO',
  BC: 'BICICLETA',
}

const normalizedVehicleTypeLabels = Object.fromEntries(
  optionsVehicle.map((option) => [option.value.toUpperCase(), option.label]),
)

export const normalizeVehicleType = (value?: string | null) => {
  const normalizedValue = value?.trim().toUpperCase() || ''

  if (!normalizedValue) {
    return 'No definido'
  }

  return normalizedVehicleTypeLabels[normalizedValue] || legacyVehicleTypeLabels[normalizedValue] || value!.trim()
}
