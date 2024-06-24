import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createInstance<T, R extends any[]>(_class: new (...args: R) => T, ...args: R): T {
  return new _class(...args);
}

export function elementID(prefix: string) {
  return prefix + "_" + nanoid(4);
}
