import { useCallback } from "react";

export function useOpenInNewTab() {
  return useCallback((url: string): void => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);
}
