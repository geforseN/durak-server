import type DurakGame from "@/module/DurakGame/DurakGame.js";

import BasePlayer from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import Moves, { EmptyMoves, type Move } from "@/module/DurakGame/entity/GameRound/Moves.js";
import GameDesk from "@/module/DurakGame/entity/Desk/index.js";

export default class GameRound {
  constructor(
    public readonly number: number,
    public desk: GameDesk,
    public moves: Moves,
    private readonly game: DurakGame,
  ) {}

  asNext() {
    return new GameRound(
      this.number + 1,
      this.desk.withSameSettings(),
      new EmptyMoves(),
      this.game,
    );
  }

  toJSON() {
    return {
      number: this.number,
      desk: this.desk.toJSON(),
    };
  }
}

class SettledGameRound {
  constructor(
    public readonly number: number,
    public desk: GameDesk,
    public moves: Moves,
    private readonly game: DurakGame,
    readonly primalMove: Move,
  ) {}

  asNext() {
    return new GameRound(
      this.number + 1,
      this.desk.withSameSettings(),
      new EmptyMoves(),
      this.game,
    );
  }

  toJSON() {
    return {
      number: this.number,
      desk: this.desk.toJSON(),
    };
  }

  get allowedPlayer() {
    return SOME_PLAYER;
  }

  get isAllowsTransferMove() {
    return false;
  }

  get nextAttacker(): BasePlayer {
    return TODO;
  }

  get primalAttacker(): BasePlayer {
    return TODO;
  }

  get primalAttackerAsLatest(): BasePlayer {
    return TODO;
  }
}

class UnsettledGameRound {
  constructor(
    public readonly number: number,
    public desk: GameDesk,
    public moves: Moves,
    private readonly game: DurakGame,
  ) {}

  asNext() {
    return new GameRound(
      this.number + 1,
      this.desk.withSameSettings(),
      new EmptyMoves(),
      this.game,
    );
  }

  toJSON() {
    return {
      number: this.number,
      desk: this.desk.toJSON(),
    };
  }

  get allowedPlayer() {
    return SOME_PLAYER;
  }

  get isAllowsTransferMove() {
    return false;
  }

  get nextAttacker(): BasePlayer {
    return TODO;
  }

  get primalAttacker() {
    return undefined;
  }

  get primalAttackerAsLatest() {
    return undefined;
  }
}
