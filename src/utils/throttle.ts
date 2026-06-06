export function throttle<Args extends unknown[]>(fn: (...args: Args) => void, waitMs: number) {
  let lastRun = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    const now = Date.now();
    const remaining = waitMs - (now - lastRun);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastRun = now;
      fn(...args);
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        lastRun = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
}
