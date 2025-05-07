import { setTimeout } from "node:timers/promises";

export default async function findInstantlyAndAfterTimeout<T>(
  timeout: number,
  findThing: () => T,
  options?: {
    isFound?(thing: T): boolean;
    onInstantFound?(): void;
    onAfterTimeoutFound?(): void;
    onNotFound?(): void;
  },
): Promise<T | undefined> {
  let thing = findThing();
  const isFound = options?.isFound ?? (() => !!thing);
  if (isFound(thing)) {
    options?.onInstantFound?.();
    return thing;
  }
  await setTimeout(timeout);
  thing = findThing();
  if (isFound(thing)) {
    options?.onAfterTimeoutFound?.();
    return thing;
  }
  options?.onNotFound?.();
}
