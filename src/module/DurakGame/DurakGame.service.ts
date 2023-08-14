import DurakGameStateDto from "./DTO/DurakGameState.dto";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";
import type DurakGame from "./DurakGame";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  // TODO add usage
  wonRound(game: DurakGame) {
    this.namespace.emit(
      "defender__wonRound",
      game.players.defender.id,
      game.round.number,
    );
  }

  // TODO add usage
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
    socket.emit("game__restoreState", new DurakGameStateDto(game, playerId));
  }
}
