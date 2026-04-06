// src/hooks/useScrollLock.js
import { useEffect } from "react";

export function useScrollLock() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
}
