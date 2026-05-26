const INTENT_KEY = "minibigc.hash-scroll-intent";
const INTENT_TTL_MS = 8000;

/** Call before router.push with a #section hash (Facts tiles). */
export function markHashScrollIntent(): void {
  sessionStorage.setItem(INTENT_KEY, String(Date.now()));
}

/** True once per deep-link navigation; ignores stale hashes on sidebar nav. */
export function consumeHashScrollIntent(): boolean {
  const raw = sessionStorage.getItem(INTENT_KEY);
  if (!raw) return false;

  sessionStorage.removeItem(INTENT_KEY);
  const ts = Number(raw);
  if (!Number.isFinite(ts) || Date.now() - ts > INTENT_TTL_MS) {
    return false;
  }

  return true;
}
