type TemperatureUnit = "°F" | "F" | "°C" | "C" | "°K" | "K" | string;

function convertTemperatureToCelsius(
  value: number | null | undefined,
  sourceUnit: TemperatureUnit,
): number | null {
  if (value == null || isNaN(value)) {
    return null;
  }
  switch (sourceUnit) {
    case "°F":
    case "F":
      return (value - 32) * (5 / 9);
    case "°K":
    case "K":
      return value - 273.15;
    case "°C":
    case "C":
    case "":
      return value;
    default:
      return null;
  }
}

function convertTemperatureFromCelsius(
  celsius: number | null,
  targetUnit: TemperatureUnit,
) {
  if (celsius == null || isNaN(celsius)) {
    return null;
  }
  switch (targetUnit) {
    case "°F":
    case "F":
      return celsius * (9 / 5) + 32;
    case "K":
    case "°K":
      return celsius + 273.15;
    case "°C":
    case "C":
    case "":
      return celsius;
    default:
      return null;
  }
}

/**
 * Convert any temperature (C, F, K) to any temperature (C, F, K).
 * @param value the temperature
 * @param sourceUnit the source unit of measurement (°C, °F, K).
 * @param targetUnit the target unit of measurement (°C, °F, K).
 */
export function convertTemperature(
  value: number | null | undefined,
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit,
): number | null {
  const celsius = convertTemperatureToCelsius(value, sourceUnit);
  return convertTemperatureFromCelsius(celsius, targetUnit);
}
