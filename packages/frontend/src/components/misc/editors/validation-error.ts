export interface ValidationError {
  instancePath: string;
  params?: object;
  message?: string;
  keyword?: string;
}
