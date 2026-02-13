type Listener = (count: number) => void;

let activeCount = 0;
const listeners = new Set<Listener>();

export function subscribeRequestProgress(listener: Listener) {
  listeners.add(listener);
  listener(activeCount);
  return () => {
    listeners.delete(listener);
  };
}

export function incrementRequest() {
  activeCount += 1;
  listeners.forEach((listener) => listener(activeCount));
}

export function decrementRequest() {
  activeCount = Math.max(0, activeCount - 1);
  listeners.forEach((listener) => listener(activeCount));
}
