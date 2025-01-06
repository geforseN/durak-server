import type { GameSettings } from "@durak-game/durak-dts";
import Players from "@/module/DurakGame/entity/Players/Players.js";
import GameRound from "@/module/DurakGame/entity/GameRound/index.js";
import GameHistory from "@/module/DurakGame/entity/History.js";
import Discard from "@/module/DurakGame/entity/Deck/Discard/index.js";
import Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import { Desk } from "@/module/DurakGame/entity/index.js";
import DeskSlots from "@/module/DurakGame/entity/DeskSlots/index.js";
import { EmptyMoves } from "@/module/DurakGame/entity/GameRound/Moves.js";

export default class DurakGame {
  constructor(
    public readonly id: string,
    public readonly settings: GameSettings,
    public players: Players,
    public round: GameRound,
    private decks: {
      talon: Talon;
      discard: Discard;
      toJSON(): object;
    },
    private history: GameHistory,
    private readonly ending: {
      execute: (game: DurakGame) => void;
    },
  ) {}

  static create(id: string, settings: GameSettings) {
    // prettier-ignore
    return new DurakGame(
      id,
      settings,
      new Players([]),
      new GameRound(1, new Desk(new DeskSlots([])), new EmptyMoves()),
      {
        discard: new Discard([]),
        talon: new Talon([]),
        toJSON() {
          return {
            discard: this.discard.toJSON(),
            talon: this.talon.toJSON(),
          };
        },
      },
      new GameHistory([]),
      {
        execute() {},
      },
    );
  }

  get desk() {
    return this.round.desk;
  }

  get talon() {
    return this.decks.talon;
  }

  get discard() {
    return this.decks.discard;
  }

  withMove(move) {
    if (move.isInsertMove()) {
      move.makeCardInsert();
    }
    this.round = this.round.withMove(move);
    const nextThing = move.gameMutationStrategy();
    if (nextThing?.kind === "RoundEnd") {
      nextThing.makeMutation();
      const { newGameRound } = nextThing;
      if (!newGameRound) {
        this.ending.execute(this);
      } else {
        this.history.rounds.add(this.round);
        this.round = newGameRound;
      }
    }
  }

  toJSON() {
    return {
      round: this.round.toJSON(),
      settings: this.settings,
      decks: this.decks.toJSON(),
    };
  }
}
