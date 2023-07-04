import DurakGame, { CanReceiveCards } from "../../DurakGame.implimetntation";
import SuperPlayer from "./SuperPlayer";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  canDefend(cardCount: number) {
    return this.canTakeMore(cardCount);
  }

  canWinDefense(game: DurakGame) {
    try {
      const { primalAttacker } = game.round;
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        this.left === primalAttacker ||
        // below statement is for more than 2 players game
        game.players.attacker.left === primalAttacker
      );
    } catch {
      return false;
    }
  }

  override get isDefender() {
    return true;
  }
}
