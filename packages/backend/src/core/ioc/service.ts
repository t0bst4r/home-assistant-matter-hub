export abstract class Service {
  readonly construction: Promise<void> = new Promise((resolve) => {
    setImmediate(() => {
      const init = this.initialize?.bind(this) ?? (async () => {});
      init().then(resolve);
    });
  });

  constructor(readonly serviceName: string) {}

  protected initialize?(): Promise<void>;
  dispose?(): Promise<void>;
}
