export type ClassType<T> =
  | (new (
      // biome-ignore lint/suspicious/noExplicitAny: Needed for class types
      ...args: any[]
    ) => T)
  | (abstract new (
      // biome-ignore lint/suspicious/noExplicitAny: Needed for class types
      ...args: any[]
    ) => T);
