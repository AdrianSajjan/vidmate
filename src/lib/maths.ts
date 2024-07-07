export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function trunc(value: number, places: number) {
  return +value.toFixed(places);
}
