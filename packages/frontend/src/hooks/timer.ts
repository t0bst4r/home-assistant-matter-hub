import { useEffect, useState } from "react";

export function useTimer(
  intervalSeconds: number,
  callback: () => void,
): number {
  const [result, setResult] = useState<number>(intervalSeconds);
  useEffect(() => {
    let timer = intervalSeconds;
    callback();
    const interval = setInterval(() => {
      timer--;
      if (timer === 0) {
        callback();
        timer = intervalSeconds;
      }
      setResult(timer);
    }, 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds, callback]);
  return result;
}
