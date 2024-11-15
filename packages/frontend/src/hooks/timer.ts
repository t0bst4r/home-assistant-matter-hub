import { useCallback, useEffect, useState } from "react";

const resolutionMs = 1000;

export interface Timer {
  reset: () => void;
  refreshNow: () => void;
}

export interface TimerProps {
  sleepSeconds: number;
  startImmediate?: boolean;
  callback: () => void;
  onTick?: (msLeft: number) => void;
}

export function useTimer({
  sleepSeconds,
  startImmediate,
  callback,
  onTick,
}: TimerProps): Timer {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    let leftMs = startImmediate ? 0 : sleepSeconds * 1000;
    const interval = setInterval(() => {
      leftMs -= resolutionMs;
      if (leftMs < 0) {
        callback();
        leftMs = sleepSeconds * 1000;
      }
      onTick?.(leftMs);
    }, resolutionMs);
    return () => clearInterval(interval);
  }, [sleepSeconds, callback, onTick, seed, startImmediate]);

  const reset = useCallback(() => {
    setSeed((value) => value + 1);
  }, [setSeed]);

  const refreshNow = useCallback(() => {
    callback();
    reset();
  }, [callback, reset]);

  return { refreshNow, reset };
}
