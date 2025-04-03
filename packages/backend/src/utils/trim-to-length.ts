export function trimToLength(
  value: string | number | null | undefined,
  maxLength: number,
  suffix: string,
): string | undefined {
  const stringValue = value?.toString();
  if (!stringValue?.trim().length) {
    return undefined;
  }
  if (stringValue.length <= maxLength) {
    return stringValue;
  }
  return stringValue.substring(0, maxLength - suffix.length) + suffix;
}
