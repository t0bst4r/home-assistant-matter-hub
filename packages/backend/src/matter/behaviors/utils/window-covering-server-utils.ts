export function convertCoverValue(
  percentage: number | undefined | null,
  invert: boolean,
  swap: boolean,
): number | null {
  if (percentage == null) {
    return null;
  }
  if (invert) {
    percentage = 100 - percentage;
  }
  if (swap) {
    if (percentage == 0) {
      percentage = 100;
    } else if (percentage == 100) {
      percentage = 0;
    }
  }
  return percentage;
}
