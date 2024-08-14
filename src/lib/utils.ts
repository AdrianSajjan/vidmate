import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createInstance<T, R extends any[]>(_class: new (...args: R) => T, ...args: R): T {
  return new _class(...args);
}

export function createMap<K, V>(iterable?: Iterable<readonly [K, V]> | null | undefined) {
  return new Map<K, V>(iterable);
}

export function createPromise<T>(callback: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
  return new Promise<T>(callback);
}

export function createUint8Array(buffer: ArrayBufferLike) {
  return new Uint8Array(buffer);
}

export function waitUntilEvent<K extends HTMLElement>(element: K, success: keyof HTMLElementEventMap, failure?: keyof HTMLElementEventMap) {
  return createPromise((resolve, reject) => {
    element.addEventListener(success, resolve, { once: true });
    if (failure) element.addEventListener(failure, reject, { once: true });
  });
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

export function createFileDownload(file: File | Blob, name: string) {
  const anchor = document.createElement("a");
  const href = URL.createObjectURL(file);
  anchor.download = name;
  anchor.href = href;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function createBase64Download(data: any, type: string, name: string) {
  const href = `data:${type};charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  const anchor = document.createElement("a");
  anchor.download = name;
  anchor.href = href;
  anchor.click();
}

export function createFormData(data: Record<string, any>, names?: Record<string, any>) {
  const formData = createInstance(FormData);
  for (const key in data) {
    const name = names?.[key];
    if (name) formData.append(key, data[key], name);
    else formData.append(key, data[key]);
  }
  return formData;
}
