import { useCallback, useEffect, useState } from "react";

const resolutionMs = 100;

export interface Timer {
  reset: () => void;
  refreshNow: () => void;
}

export function useTimer(
  sleepSeconds: number,
  callback: () => void,
  onTick?: (msLeft: number) => void,
): Timer {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    let leftMs = sleepSeconds * 1000;
    const interval = setInterval(() => {
      leftMs -= resolutionMs;
      if (leftMs < 0) {
        callback();
        leftMs = sleepSeconds * 1000;
      }
      onTick?.(leftMs);
    }, resolutionMs);
    return () => clearInterval(interval);
  }, [sleepSeconds, callback, onTick, seed]);

  const reset = useCallback(() => {
    setSeed((value) => value + 1);
  }, [setSeed]);

  const refreshNow = useCallback(() => {
    callback();
    reset();
  }, [callback, reset]);

  return { refreshNow, reset };
}
