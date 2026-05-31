export type PendingFirstAccessSession = {
  accessToken: string;
  refreshToken: string;
  currentPassword?: string;
  mustAcceptTerms: boolean;
  mustChangePassword: boolean;
};

let pendingFirstAccessSession: PendingFirstAccessSession | null = null;

export function setPendingFirstAccessSession(session: PendingFirstAccessSession) {
  pendingFirstAccessSession = session;
}

export function getPendingFirstAccessSession() {
  return pendingFirstAccessSession;
}

export function clearPendingFirstAccessSession() {
  pendingFirstAccessSession = null;
}
