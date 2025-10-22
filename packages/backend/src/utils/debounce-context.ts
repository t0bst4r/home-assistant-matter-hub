import type { DebouncedFunction as Debounce } from "debounce";
import debounce from "debounce";

type DebounceFunction<TPayload> = Debounce<(payload: TPayload) => void> & {
  unregister: () => void;
};
type CollectingFunction<TPayload> = (key: string, buffer: TPayload[]) => void;

export class DebounceContext<TPayload> {
  private readonly buffers = new Map<string, TPayload[]>();
  private readonly debouncers = new Map<string, DebounceFunction<TPayload>>();

  constructor(private readonly fn: CollectingFunction<TPayload>) {}

  public get(key: string, wait: number) {
    if (!this.debouncers.has(key)) {
      this.debouncers.set(key, this.createDebouncer(key, wait));
    }
    return this.debouncers.get(key)!;
  }

  private getBuffer(key: string) {
    if (!this.buffers.has(key)) {
      this.buffers.set(key, []);
    }
    return this.buffers.get(key)!;
  }

  private createDebounceCallback(key: string, wait: number) {
    return debounce(() => {
      const buffer = this.getBuffer(key);
      if (buffer.length) {
        this.buffers.delete(key);
        this.fn(key, buffer);
      }
    }, wait);
  }

  private createDebouncer(
    key: string,
    wait: number,
  ): DebounceFunction<TPayload> {
    const bufferedFn = this.createDebounceCallback(key, wait);
    const debouncer = (payload: TPayload) => {
      this.getBuffer(key).push(payload);
      bufferedFn();
    };
    return Object.assign(debouncer, {
      get isPending() {
        return bufferedFn.isPending;
      },
      clear: () => bufferedFn.clear(),
      flush: () => bufferedFn.flush(),
      trigger: () => bufferedFn.trigger(),
      unregister: () => {
        this.unregister(key);
      },
    });
  }

  unregisterAll() {
    const keys = Object.keys(this.fn);
    for (const key of keys) {
      this.unregister(key);
    }
  }

  private unregister(key: string) {
    const debouncer = this.debouncers.get(key);
    if (!debouncer) {
      return;
    }
    debouncer.clear();
    this.buffers.delete(key);
    this.debouncers.delete(key);
  }
}
