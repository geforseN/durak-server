import { setInterval, clearInterval } from "node:timers";

export class RetryInterval<T> {
  constructor(
    readonly tryResolve: (
      resolve: (value: T) => void,
      context: RetryInterval<T>,
    ) => void,
    readonly makeError: () => Error,
    readonly options: { attempts: number; period: number },
  ) {}

  attemptCounter = {
    value: 0,
    increment() {
      this.value++;
    },
  };

  #hasToManyAttempts() {
    return this.attemptCounter.value >= this.options.attempts;
  }

  async execute() {
    let timeout: NodeJS.Timeout | undefined;
    try {
      return await new Promise<T>((resolve, reject) => {
        timeout = setInterval(() => {
          this.attemptCounter.increment();
          this.tryResolve(resolve, this);
          if (this.#hasToManyAttempts()) {
            reject(this.makeError());
          }
        }, this.options.period);
      });
    } finally {
      clearInterval(timeout);
    }
  }
}
