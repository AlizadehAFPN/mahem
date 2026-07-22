import {useEffect, useState} from 'react';

// Delays reflecting a fast-changing value (typically search text typed
// character by character) so callers feeding it into a network query aren't
// hit on every keystroke — every search screen needed this same timer
// independently, so it's centralized here instead of re-implemented per file.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
