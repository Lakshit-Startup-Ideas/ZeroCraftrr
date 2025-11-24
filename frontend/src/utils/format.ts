export const formatNumber = (value: number, fractionDigits = 1): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)

export const formatEnergy = (kwh: number): string => `${formatNumber(kwh, 2)} kWh`
export const formatCo2 = (kg: number): string => `${formatNumber(kg, 2)} kg CO2e`
export const formatWaste = (kg: number): string => `${formatNumber(kg, 2)} kg`