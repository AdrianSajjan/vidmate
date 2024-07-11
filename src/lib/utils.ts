import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createInstance<T, R extends any[]>(_class: new (...args: R) => T, ...args: R): T {
  return new _class(...args);
}

export function createUint8Array(buffer: ArrayBufferLike) {
  return new Uint8Array(buffer);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isVideoElement(element: HTMLElement): element is HTMLVideoElement {
  return element.tagName === "VIDEO";
}

export function isImageLoaded(element: HTMLImageElement) {
  return element.complete && !!element.naturalWidth;
}
