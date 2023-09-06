import { GameRound } from "..";
import { RoundEnd } from "./RoundEnd";

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
    this.game.players.attacker = this.game.players.defender.left;
    this.game.players.defender = this.game.players.attacker.left;
    return new GameRound(this.game);
  }
}

export { FailedDefense as default };
