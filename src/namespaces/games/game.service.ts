import { GamesIO } from "./games.types";
import NotificationAlert from "../../module/notification-alert";
import DurakGameStateDto from "../../module/durak-game/DTO/DurakGameState.dto";
import DurakGame from "../../module/durak-game/DurakGame";

export type GameSocket = { socket: GamesIO.SocketIO };

export class GameService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  lostRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__lostRound", defender.id, round.number);
  }

  wonRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__wonRound", defender.id, round.number);
  }

  handleError({ playerId, error }: { error: unknown, playerId: string }) {
    if (!(error instanceof Error)) {
      return console.log("!ERROR: ", error);
    }
    console.dir(error);
    this.namespace.to(playerId).emit(
      "notification__send",
      new NotificationAlert().fromError(error),
    );
  }

  restoreState({ socket, game, playerId }: { game: DurakGame, playerId: string } & GameSocket) {
    socket.emit("state__restore", new DurakGameStateDto(game, playerId));
  }

  end(game: DurakGame) {
    this.namespace.emit("game__over");
  }
}
