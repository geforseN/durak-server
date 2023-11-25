import raise from "./raise.js";

export function stringToBoolean(str: string) {
  return str === "true"
    ? true
    : str === "false"
      ? false
      : raise('value must be "true" or "false"');
}

export function stringToArray(str: string) {
  return str.split(",").map((value) => value.trim());
}
