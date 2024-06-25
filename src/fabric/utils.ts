export function isActiveSelection(object?: fabric.Object | null): object is fabric.ActiveSelection {
  return object?.type === "activeSelection";
}
