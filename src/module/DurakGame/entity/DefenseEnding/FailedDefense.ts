import { GameRound } from "../index.js";
import { RoundEnd } from "./RoundEnd.js";

class FailedDefense extends RoundEnd {
  get newGameRound() {
    this.game.desk.provideCards(this.game.players.defender);
    this.game.info.namespace.emit("round::becameEnded", {
      round: {
        number: this.game.round.number,
        defender: {
          id: this.game.players.defender.id,
          isSuccessfullyDefended: false,
        },
      },
    });
    try {
      this.prepareBeforeNewGameRound();
    } catch {
      return;
    }
    this.game.players = this.game.players
      .with(this.game.players.allowedPlayer.asDisallowed())
      .with(this.game.players.attacker.asPlayer())
      .with(this.game.players.defender.left.left.asDefender())
      .with(this.game.players.defender.right.asAttacker().asDefender());
    return new GameRound(this.game);
  }
}

export { FailedDefense as default };
