export interface Constructor<T> {
  new (...args: any[]): T;
}
export function isObjectShallowModified(prev: {
  [key: string]: any
}, next: {
  [key: string]: any
}) {
  if (
    null == prev ||
    null == next ||
    typeof prev !== "object" ||
    typeof next !== "object"
  ) {
    return prev !== next;
  }
  const keys = Object.keys(prev);
  if (keys.length !== Object.keys(next).length) {
    return true;
  }
  for (let key of keys) {
    if (next[key] !== prev[key]) {
      return true;
    }
  }
  return false;
}
