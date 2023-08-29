import type DurakGame from "../../DurakGame";
import type GameRound from "../GameRound";
import type Player from "./Player";
import SuperPlayer from "./SuperPlayer";
import AllowedToMoveAttacker from "./AllowedToMoveAttacker";

export default class Attacker extends SuperPlayer {
  constructor(player: Player) {
    super(player);
  }

  override isAttacker() {
    return true;
  }

  asAllowedToMakeMove(game: DurakGame) {
    return new AllowedToMoveAttacker(this, game);
  }

  hasPutLastCard(round: GameRound): boolean {
    return (
      round.moves.previousMove.isInsertMove() &&
      round.moves.previousMove.player.id === this.id
    );
  }
}
