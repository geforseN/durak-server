import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import GameRound from ".";

export default class GameRoundService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  letMoveToPlayer(round: GameRound) {
    this.namespace.emit(
      "player__allowedToMove",
      round.currentMove.player.id,
      round.currentMove.defaultBehaviourCallTimeInUTC,
      round.game.settings.moveTime,
    );
  }

  emitDefenderGaveUp(round: GameRound) {
    this.namespace.emit("defender__gaveUp", round.game.players.defender.id);
  }
}
