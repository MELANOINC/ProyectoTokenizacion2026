import { GUIDE_STORAGE_KEY } from "@/lib/guide";

const GUIDE_EVENT = "notorius-guide";

export function readGuideCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeGuideCompleted(ids: string[]) {
  window.localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(GUIDE_EVENT));
}

export function subscribeGuideCompleted(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(GUIDE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(GUIDE_EVENT, handler);
  };
}

export function getGuideCompletedSnapshot() {
  return JSON.stringify(readGuideCompleted());
}

export function getGuideCompletedServerSnapshot() {
  return "[]";
}
