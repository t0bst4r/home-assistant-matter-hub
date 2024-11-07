export interface AsyncError {
  code?: string;
  name?: string;
  message?: string;
}
export interface AsyncState<T> {
  isInitialized: boolean;
  isLoading: boolean;
  content?: T;
  error?: AsyncError;
}
