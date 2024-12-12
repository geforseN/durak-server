export function stringToArray(str: string) {
  return str.split(",").map((value) => value.trim());
}
