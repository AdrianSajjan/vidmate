import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export function isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
  return object?.type === "activeSelection";
}

export function elementID(prefix: string) {
  return prefix.toLowerCase() + "_" + nanoid(4);
}
