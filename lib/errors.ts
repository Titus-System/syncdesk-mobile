function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (isRecord(error)) {
    const detail = error.detail;
    const message = error.message;
    const genericError = error.error;

    if (typeof detail === 'string' && detail) {
      return detail;
    }

    if (typeof message === 'string' && message) {
      return message;
    }

    if (typeof genericError === 'string' && genericError) {
      return genericError;
    }
  }

  return fallback;
}

export function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
