import { GameRound } from "../index.js";
import { RoundEnd } from "./RoundEnd.js";

class SuccessfulDefense extends RoundEnd {
  get newGameRound() {
    this.game.desk.provideCards(this.game.discard);
    try {
      this.prepareBeforeNewGameRound();
      this.game.players
        .mutateWith(this.game.players.allowedPlayer.asDisallowed())
        .mutateWith(this.game.players.attacker.asPlayer())
        .mutateWith(this.game.players.defender.left.asDefender())
        .mutateWith(
          this.game.players.defender.asAttacker().asAllowed(this.game),
        );
      return new GameRound(this.game);
    } catch {
      return undefined; // FIXME should return GameEnd instance;
    }
  }
}

export { SuccessfulDefense as default };
