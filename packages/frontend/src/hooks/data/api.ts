import { useEffect, useState } from "react";

export type ApiResponse<T> = [
  data: T | undefined,
  isLoading: boolean,
  error: Error | null,
];

export function useApi<T>(fetch: () => Promise<T>): ApiResponse<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    setIsLoading(true);
    fetch()
      .then((data) => {
        setData(data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [fetch]);
  return [data, isLoading, error];
}
