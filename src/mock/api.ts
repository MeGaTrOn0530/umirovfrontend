import { getDB, updateDB } from "@/mock/store";
import type { DB } from "@/types";

let errorMode = false;

export function setApiErrorMode(value: boolean) {
  errorMode = value;
}

function shouldFail() {
  return errorMode && Math.random() < 0.2;
}

function delay() {
  const ms = Math.floor(250 + Math.random() * 350);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fakeRequest<T>(fn: (db: DB) => T): Promise<T> {
  await delay();
  if (shouldFail()) {
    throw new Error("Mock service error. Please retry.");
  }
  const db = getDB();
  const result = fn(db);
  return result;
}

export async function fakeMutation<T>(fn: (db: DB) => { result: T; update: Partial<DB> }): Promise<T> {
  await delay();
  if (shouldFail()) {
    throw new Error("Mock service error. Please retry.");
  }
  const db = getDB();
  const { result, update } = fn(db);
  updateDB(update);
  return result;
}
