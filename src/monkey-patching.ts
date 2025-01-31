// NOTE: must add import of this module for
// - test environment (in setup section)
// - server (main.ts)

declare global {
  interface PromiseConstructor {
    try<T, Args extends []>(
      callback: (...args: Args) => T,
      ...args: Args
    ): Promise<T>;
  }
}

Promise.try = function <T, Args extends []>(
  callback: (...args: Args) => T,
  ...args: Args
): Promise<T> {
  return new this((resolve, reject) => {
    try {
      resolve(callback(...args));
    } catch (error) {
      reject(error);
    }
  });
};
