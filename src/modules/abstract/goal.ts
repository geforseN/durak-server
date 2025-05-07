type PromiseWithResolver<T> = {
  resolve(): void;
  promise: Promise<T>;
};

export default class Goal<T> {
  #value: T;
  #promiseWithResolvers: PromiseWithResolver<void> =
    Promise.withResolvers<void>();

  constructor(
    value: T,
    promiseWithResolvers: PromiseWithResolver<void> = Promise.withResolvers<void>(),
  ) {
    this.#value = value;
    this.#promiseWithResolvers = promiseWithResolvers;
  }

  tryComplete(value: number) {
    if (this.#value === value) {
      this.#promiseWithResolvers.resolve();
    }
  }

  sleepUntilComplete() {
    return this.#promiseWithResolvers.promise;
  }
}
