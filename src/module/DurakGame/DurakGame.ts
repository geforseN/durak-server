import type { GameSettings } from "@durak-game/durak-dts";
import type Players from "@/module/DurakGame/entity/Players/Players.js";
import type GameRound from "@/module/DurakGame/entity/GameRound/index.js";
import type GameHistory from "@/module/DurakGame/entity/History.js";
import type Discard from "@/module/DurakGame/entity/Deck/Discard/index.js";
import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import type PlayerWebSocketConnection from "@/module/DurakGame/player-websocket-connection.js";

export default class DurakGame {
  constructor(
    public readonly id: string,
    private readonly settings: GameSettings,
    private readonly players: Players,
    private readonly round: GameRound,
    private readonly decks: {
      talon: Talon;
      discard: Discard;
      toJSON(): object;
    },
    private readonly history: GameHistory,
    private readonly transit: {
      toEnded: (game: DurakGame) => void;
      toNextRound: (game: DurakGame, round: GameRound) => void;
    },
  ) {}

  static from(_: unknown): DurakGame {
    throw new Error("Method not implemented");
  }

  connect(connection: PlayerWebSocketConnection) {
    const player = this.players.find((player) => connection.belongsTo(player));
    connection.send(JSON.stringify(this.#toGameState(player)));
    connection.applyTo(player, this.players);
  }

  withMove(move) {
    if (move.isInsertMove()) {
      move.makeCardInsert();
    }
    // this.round = this.round.withMove(move);
    const nextThing = move.gameMutationStrategy();
    if (nextThing?.kind === "RoundEnd") {
      nextThing.makeMutation();
      const { newGameRound } = nextThing;
      if (!newGameRound) {
        this.transit.toEnded(this);
      } else {
        this.history.rounds.add(this.round);
        this.transit.toNextRound(this, newGameRound);
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
