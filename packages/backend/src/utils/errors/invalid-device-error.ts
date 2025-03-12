export class InvalidDeviceError extends Error {
  constructor(reason: string) {
    super(`Invalid device detected. Reason: ${reason}`);
  }
}
