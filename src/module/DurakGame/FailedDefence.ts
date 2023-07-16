import { GameRound } from "./entity";
import { RoundEnd } from "./RoundEnd";
import { GameEnd } from "./GameEnd";


export class FailedDefence extends RoundEnd {
  pushNewRound() {
    this.game.desk.provideCards(this.game.players.defender);
    this.game.info.namespace.emit(
      "defender__lostRound",
      this.game.players.defender.id,
      this.game.round.number
    );
    try {
      this.prepareBeforeNewGameRound();
    } catch {
      return new GameEnd(this.game).handle();
    }
    this.game.players.attacker = this.game.players.defender.left;
    this.game.players.defender = this.game.players.attacker.left;
    this.game.round = new GameRound(this.game);
  }
}
