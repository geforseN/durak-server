import { GameRound } from "../index.js";
import { RoundEnd } from "./RoundEnd.js";

class FailedDefense extends RoundEnd {
  get newGameRound() {
    this.game.desk.provideCards(this.game.players.defender);
    try {
      this.prepareBeforeNewGameRound();
      this.game.players
        .mutateWith(this.game.players.allowedPlayer.asDisallowed())
        .mutateWith(this.game.players.attacker.asPlayer())
        .mutateWith(this.game.players.defender.left.left.asDefender())
        .mutateWith(this.game.players.defender.right.asAttacker().asDefender());
      return new GameRound(this.game);
    } catch {
      return undefined; // FIXME should return GameEnd instance;
    }
  }
}

export { FailedDefense as default };
