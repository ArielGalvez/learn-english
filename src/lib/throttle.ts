export type ThrottledFn<A extends unknown[]> = ((...args: A) => void) & {
  reset: () => void;
};

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): ThrottledFn<A> {
  let last = 0;
  const throttled = (...args: A) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
  throttled.reset = () => {
    last = 0;
  };
  return throttled;
}