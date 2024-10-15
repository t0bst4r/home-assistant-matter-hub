export class PortAlreadyInUseError extends Error {
  constructor(port: number) {
    super(`Port ${port} is already in use`);
  }
}
