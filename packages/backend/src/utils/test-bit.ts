export function testBit(value: number, bitValue: number): boolean {
  return !!(value & bitValue);
}
