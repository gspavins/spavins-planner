import { useEffect, useState } from "react";

/** useState that remembers its value on this device. */
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — fine, it just won't be remembered */
    }
  }, [key, value]);
  return [value, setValue];
}
