/**
 * One rAF loop for everything that wants to display a depth token as text.
 *
 * The engine writes custom properties and re-renders nothing, so anything showing
 * a live value has to read them itself. Doing that per component would mean a loop
 * each; this is one loop, shared, that stops entirely when nobody is listening.
 *
 * It reads `documentElement.style` — the inline value the engine set — not
 * getComputedStyle, so it costs nothing and never forces layout.
 */
type Listener = (value: string) => void;

const listeners = new Map<string, Set<Listener>>();
const last = new Map<string, string>();
let frame = 0;

function tick() {
  const style = document.documentElement.style;
  for (const [name, set] of listeners) {
    const value = style.getPropertyValue(name);
    if (value !== last.get(name)) {
      last.set(name, value);
      for (const fn of set) fn(value);
    }
  }
  frame = listeners.size ? requestAnimationFrame(tick) : 0;
}

export function subscribeToVar(name: string, fn: Listener) {
  const set = listeners.get(name) ?? new Set<Listener>();
  set.add(fn);
  listeners.set(name, set);
  // Deliver the current value immediately, so the first paint after mount is not
  // a frame behind.
  fn(document.documentElement.style.getPropertyValue(name));
  if (!frame) frame = requestAnimationFrame(tick);

  return () => {
    set.delete(fn);
    if (!set.size) {
      listeners.delete(name);
      last.delete(name);
    }
    if (!listeners.size && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
