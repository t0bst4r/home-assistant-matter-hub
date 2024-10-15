export function detach(cb: () => Promise<void> | void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve();
      await cb();
    }, 10);
  });
}
