import { useEffect } from "react";

export function useLogObject(object: object) {
  useEffect(() => {
    console.debug(object);
  }, [object]);
}
