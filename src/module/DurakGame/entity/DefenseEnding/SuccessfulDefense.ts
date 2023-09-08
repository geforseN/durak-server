import { GameRound } from "../index.js";
import { RoundEnd } from "./RoundEnd.js";

class SuccessfulDefense extends RoundEnd {
  get newGameRound() {
    this.game.desk.provideCards(this.game.discard);
    this.game.info.namespace.emit("round::becameEnded", {
      round: {
        number: this.game.round.number,
        defender: {
          id: this.game.players.defender.id,
          isSuccessfullyDefended: true,
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
      .with(this.game.players.defender.left.asDefender())
      .with(this.game.players.defender.asAttacker().asAllowed(this.game));
    return new GameRound(this.game);
  }
}

export { SuccessfulDefense as default };
