import GameRound from "../GameRound";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  hasPutLastCard(round: GameRound): boolean {
    return (
      round.previousMove.isInsertMove && round.previousMove.player === this
    );
  }

  override get isAttacker() {
    return true;
  }
}
