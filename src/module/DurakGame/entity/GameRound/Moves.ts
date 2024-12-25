interface AllowedPlayer {
  makeMove(): void;
}

export interface Move {
  performer: AllowedPlayer;
}

export default class /* EmptyMoves */Moves<T extends Move = Move> {
  #value: T[];

  constructor(value: T[]) {
    this.#value = value;
  }

  static empty() {
    return new Moves([]);
  }

  withAdded(move: T) {
    return new Moves([...this.#value, move]);
  }
}

class MovesWithOneMove<T extends Move = Move> extends Moves<T> {
  #value: T[];

  constructor(value: T[]) {
    super(value);
    this.#value = value;
  }

  get latest() {
    if (this.#value.length === 0) {
      throw new Error("No one yet done a single move in current round");
    }
    return this.#value[this.#value.length - 1];
  }
}

class MovesWithTwoMoves<T extends Move = Move> extends MovesWithOneMove<T> {
  #value: T[];

  constructor(value: T[]) {
    super(value);
    this.#value = value;
  }

  get previous() {
    if (this.#value.length === 0 || this.#value.length === 1) {
      throw new Error("No one yet done a single move");
    }
    return this.#value[this.#value.length - 2];
  }
}

class MovesWithPrimalMove<T extends Move = Move> extends Moves<T> {
  // TODO
}
