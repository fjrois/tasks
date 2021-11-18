export function objectToList(obj) {
  if (!obj) return [];
  return Object.values(obj);
}
