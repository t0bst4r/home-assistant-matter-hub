/**
 * Convert any temperature (C, F, K) to Celsius.
 * If unit is null or undefined, it is considered to be "°C"
 * @param value the temperature
 * @param unit the unit of measurement (°C, °F, K).
 */
export function convertTemperatureToCelsius(
  value: number | null | undefined,
  unit: string | null | undefined,
): number | null {
  if (value == null || isNaN(value)) {
    return null;
  }
  switch (unit) {
    case "°F":
      return (value - 32) * (5 / 9);
    case "K":
      return value - 273.15;
    case "°C":
    case "":
    case null:
    case undefined:
      return value;
    default:
      return null;
  }
}
