interface AllowedPlayer {
  makeMove(): void;
}

export interface Move {
  performer: AllowedPlayer;
}

export default class Moves<T extends Move = Move> {
  #value: T[];

  constructor(value: T[]) {
    this.#value = value;
  }

  with(move: T) {
    return new Moves([...this.#value, move]);
  }
}

export class EmptyMoves extends Moves {
  constructor() {
    super([]);
  }
}

