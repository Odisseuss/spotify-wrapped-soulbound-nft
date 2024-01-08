import { useState, useEffect } from "react";

function useSessionStorage(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const storedValue = sessionStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return { value: value, setValue: setValue };
}

export default useSessionStorage;
