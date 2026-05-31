type UnauthorizedListener = () => void | Promise<void>;

const listeners = new Set<UnauthorizedListener>();

let isHandlingUnauthorized = false;

export function subscribeUnauthorized(listener: UnauthorizedListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function notifyUnauthorized() {
  if (isHandlingUnauthorized) return;

  isHandlingUnauthorized = true;

  try {
    await Promise.all(Array.from(listeners).map((listener) => listener()));
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false;
    }, 800);
  }
}
