type Listener = (data: string) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcast(event: string, payload: unknown = {}) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const l of listeners) {
    try {
      l(data);
    } catch {
      /* ignore */
    }
  }
}
