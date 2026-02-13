import type { DB } from "@/types";
import { createSeed } from "@/mock/seed";

const STORAGE_KEY = "ts-platform-db";

let memoryDB: DB | null = null;

export function loadFromLocalStorage(): DB | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DB;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function getDB(): DB {
  if (memoryDB) return memoryDB;
  const fromStorage = loadFromLocalStorage();
  if (fromStorage) {
    memoryDB = fromStorage;
    return memoryDB;
  }
  memoryDB = createSeed();
  saveToLocalStorage(memoryDB);
  return memoryDB;
}

export function updateDB(partial: Partial<DB>): DB {
  const current = getDB();
  const next: DB = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  memoryDB = next;
  saveToLocalStorage(next);
  return next;
}
