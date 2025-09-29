// biome-ignore lint/suspicious/noExplicitAny: Constructor Type
export type Type<T> = { new (...args: any[]): T };
