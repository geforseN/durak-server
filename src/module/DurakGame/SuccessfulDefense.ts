import { GameRound } from "./entity";
import { RoundEnd } from "./RoundEnd";
import { GameEnd } from "./GameEnd";

class SuccessfulDefense extends RoundEnd {
  get newGameRound() {
    this.game.desk.provideCards(this.game.discard);
    this.game.info.namespace.emit(
      "defender__wonRound",
      this.game.players.defender.id,
      this.game.round.number,
    );
    try {
      this.prepareBeforeNewGameRound();
    } catch {
      return void new GameEnd(this.game).handle();
    }
    this.game.players.attacker = this.game.players.defender;
    this.game.players.defender = this.game.players.attacker.left;
    return new GameRound(this.game);
  }
}

export { SuccessfulDefense as default };
