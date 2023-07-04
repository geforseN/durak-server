import { DurakGameSocket } from "./socket/DurakGameSocket.types";
import DurakGameStateDto from "./DTO/DurakGameState.dto";
import DurakGame from "./DurakGame.implimetntation";
import { durakGames } from "../../index";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  wonRound(game: DurakGame) {
    this.namespace.emit(
      "defender__wonRound",
      game.players.defender.id,
      game.round.number,
    );
  }

  lostRound(game: DurakGame) {
    this.namespace.emit(
      "defender__lostRound",
      game.players.defender.id,
      game.round.number,
    );
  }

  restoreState({
    socket,
    game,
    playerId,
  }: {
    game: DurakGame;
    socket: DurakGameSocket.Socket;
    playerId: string;
  }) {
    socket.emit(
      "game__restoreState",
      new DurakGameStateDto(game, playerId),
    );
  }

  end(game: DurakGame) {
    this.namespace.emit("game__over");
    durakGames.delete(game.info.id);
  }
}
