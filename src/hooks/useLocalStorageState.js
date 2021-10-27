import { useEffect, useRef, useState } from 'react';

export default function useLocalStorageState({
  debounce,
  defaultValue = '',
  key,
  parsers: { serialize = JSON.stringify, deserialize = JSON.parse } = {},
}) {
  const [state, setState] = useState(() => {
    console.log(`Restoring ${key} value from localStorage`);
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      try {
        return deserialize(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(key);
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });
  const prevKeyRef = useRef(key);

  useEffect(() => {
    function updateLocalStorage() {
      console.log(`Saving new ${key} value in localStorage`);
      const prevKey = prevKeyRef.current;
      if (prevKey !== key) {
        window.localStorage.removeItem(prevKey);
      }
      prevKeyRef.current = key;
      window.localStorage.setItem(key, serialize(state));
    }
    if (debounce) {
      const debounceMs = typeof debounce === 'number' ? debounce : 1000;
      const timeoutId = setTimeout(() => {
        updateLocalStorage();
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    } else {
      updateLocalStorage();
    }
  }, [debounce, key, serialize, state]);

  return [state, setState];
}
