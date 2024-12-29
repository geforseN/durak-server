import type { GameSettings } from "@durak-game/durak-dts";
import type Players from "@/module/DurakGame/entity/Players/Players.js";
import type GameRound from "@/module/DurakGame/entity/GameRound/index.js";
import type GameHistory from "@/module/DurakGame/entity/History.js";
import type Discard from "@/module/DurakGame/entity/Deck/Discard/index.js";
import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";

export default class DurakGame {
  constructor(
    public id: string,
    public round: GameRound,
    public players: Players,
    public readonly settings: GameSettings,
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

  get desk() {
    return this.round.desk;
  }

  get talon() {
    return this.decks.talon;
  }

  get discard() {
    return this.decks.discard;
  }

  handleNewMove() {
    if (move.isInsertMove()) {
      move.makeCardInsert();
    }
    this.round.moves.push(move);
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
}
