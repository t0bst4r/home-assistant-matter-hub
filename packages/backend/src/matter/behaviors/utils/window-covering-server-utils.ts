export function convertCoverValue(
  percentage: number | undefined | null,
  invert: boolean,
  swap: boolean,
): number | null {
  if (percentage == null) {
    return null;
  }
  let percentValue = percentage;
  if (invert) {
    percentValue = 100 - percentValue;
  }
  if (swap) {
    if (percentValue === 0) {
      percentValue = 100;
    } else if (percentValue === 100) {
      percentValue = 0;
    }
  }
  return percentValue;
}
