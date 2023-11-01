import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import GameRound from ".";

export default class GameRoundService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  letMoveToPlayer({ currentMove, game }: GameRound) {
    this.namespace.emit(
      "player__allowedToMove",
      currentMove.player.id,
      currentMove.defaultBehaviourCallTimeInUTC,
      game.settings.moveTime,
    );
  }

  emitDefenderGaveUp({ game }: GameRound) {
    this.namespace.emit("defender__gaveUp", game.players.defender.id);
  }
}
