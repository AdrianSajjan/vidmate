import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createInstance<T, R extends any[]>(_class: new (...args: R) => T, ...args: R): T {
  return new _class(...args);
}
