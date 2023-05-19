import { DurakGameSocket } from "./socket/DurakGameSocket.types";
import NotificationAlert from "../notification-alert";
import DurakGameStateDto from "./DTO/DurakGameState.dto";
import DurakGame from "./DurakGame.implimetntation";
import { durakGames } from "../../index";

export default class DurakGameService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  wonRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__wonRound", defender.id, round.number);
  }

  lostRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__lostRound", defender.id, round.number);
  }

  handleError({ playerId, error }: { error: unknown, playerId: string }) {
    if (!(error instanceof Error)) {
      return console.log("!!!ERROR: ", error);
    }
    console.log(error);
    this.namespace.to(playerId).emit(
      "notification__send",
      new NotificationAlert().fromError(error),
    );
  }

  restoreState({ socket, game, playerId }: { game: DurakGame, playerId: string, socket: DurakGameSocket.Socket }) {
    socket.emit("game__restoreState", new DurakGameStateDto(game, playerId));
  }

  end(game: DurakGame) {
    this.namespace.emit("game__over");
    durakGames.delete(game.info.id);
  }
}
