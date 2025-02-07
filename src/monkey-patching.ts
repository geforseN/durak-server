// NOTE: must add import of this module for
// - test environment (in setup section)
// - server (main.ts)

declare global {
  interface PromiseConstructor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try<C extends (...args: any[]) => any>(
      callback: C,
      ...args: Parameters<C>
    ): Promise<ReturnType<C>>;
  }
}

Promise.try = function (callback, ...args) {
  return new this((resolve, reject) => {
    try {
      resolve(callback(...args));
    } catch (error) {
      reject(error);
    }
  });
};
