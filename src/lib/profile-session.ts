import type { Role } from "@/types";

export type ProfileOverrides = {
  name?: string;
  email?: string;
  phone?: string;
  initials?: string;
};

const STORAGE_KEY = "minibigc.profile.overrides";
const PROFILE_CHANGED_EVENT = "minibigc.profile.changed";

/** Stable empty snapshot for useSyncExternalStore (must not allocate per read). */
export const EMPTY_PROFILE_OVERRIDES: ProfileOverrides = Object.freeze({});

type ProfileStore = Partial<Record<Role, ProfileOverrides>>;

const profileSnapshotCache: Partial<Record<Role, ProfileOverrides>> = {};

function profileOverridesEqual(
  a: ProfileOverrides,
  b: ProfileOverrides,
): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.initials === b.initials
  );
}

function readStore(): ProfileStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProfileStore): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
}

export function readProfileOverrides(role: Role): ProfileOverrides {
  const fromStore = readStore()[role];
  if (!fromStore) {
    return EMPTY_PROFILE_OVERRIDES;
  }
  const cached = profileSnapshotCache[role];
  if (cached && profileOverridesEqual(cached, fromStore)) {
    return cached;
  }
  profileSnapshotCache[role] = fromStore;
  return fromStore;
}

export function getServerProfileOverrides(): ProfileOverrides {
  return EMPTY_PROFILE_OVERRIDES;
}

export function writeProfileOverrides(
  role: Role,
  overrides: ProfileOverrides,
): void {
  const store = readStore();
  const next = { ...store[role], ...overrides };
  store[role] = next;
  profileSnapshotCache[role] = next;
  writeStore(store);
}

export function clearProfileOverrides(role: Role): void {
  const store = readStore();
  delete store[role];
  profileSnapshotCache[role] = EMPTY_PROFILE_OVERRIDES;
  writeStore(store);
}

export function subscribeProfile(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(PROFILE_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(PROFILE_CHANGED_EVENT, listener);
  };
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}
