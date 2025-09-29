type TemperatureUnit = "°F" | "F" | "°C" | "C" | "°K" | "K" | string;

function convertTemperatureToCelsius(
  value: number,
  sourceUnit: TemperatureUnit,
): number {
  switch (sourceUnit) {
    case "°F":
    case "F":
      return (value - 32) * (5 / 9);
    case "°K":
    case "K":
      return value - 273.15;
    default:
      return value;
  }
}

function convertTemperatureFromCelsius(
  celsius: number,
  targetUnit: TemperatureUnit,
) {
  switch (targetUnit) {
    case "°F":
    case "F":
      return celsius * (9 / 5) + 32;
    case "K":
    case "°K":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

/**
 * Convert any temperature (C, F, K) to any temperature (C, F, K).
 * @param value the temperature
 * @param sourceUnit the source unit of measurement (°C, °F, K).
 * @param targetUnit the target unit of measurement (°C, °F, K).
 */
function convertTemperature(
  value: number,
  sourceUnit: TemperatureUnit,
  targetUnit: TemperatureUnit,
): number {
  let result: number;
  if (sourceUnit.replace("°", "") === targetUnit.replace("°", "")) {
    result = value;
  } else {
    const celsius = convertTemperatureToCelsius(value, sourceUnit);
    result = convertTemperatureFromCelsius(celsius, targetUnit);
  }
  return result;
}

export class Temperature {
  public static withUnit(value: number, unit: TemperatureUnit) {
    if (Number.isNaN(value)) {
      return undefined;
    }
    return new Temperature(value, unit);
  }

  private constructor(
    readonly value: number,
    readonly unit: TemperatureUnit,
  ) {}

  public static celsius(value: number) {
    return Temperature.withUnit(value, "°C");
  }
  celsius(matter?: boolean) {
    const celsius = convertTemperature(this.value, this.unit, "°C");
    if (matter) {
      return Math.round(celsius * 100);
    }
    return celsius;
  }

  public static kelvin(value: number) {
    return Temperature.withUnit(value, "K");
  }
  kelvin() {
    return convertTemperature(this.value, this.unit, "K");
  }

  public static fahrenheit(value: number) {
    return Temperature.withUnit(value, "°F");
  }
  fahrenheit() {
    return convertTemperature(this.value, this.unit, "°F");
  }

  toUnit(unit: TemperatureUnit) {
    return convertTemperature(this.value, this.unit, unit);
  }

  plus(amount: number, unit: TemperatureUnit) {
    const convertedAmount = convertTemperature(amount, unit, this.unit);
    return new Temperature(this.value + convertedAmount, this.unit);
  }

  equals(other: Temperature | undefined) {
    if (!other) {
      return false;
    }
    const otherValue = convertTemperature(other.value, other.unit, this.unit);
    return this.value === otherValue;
  }
}
