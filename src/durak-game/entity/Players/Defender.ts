import DurakGame, { CanReceiveCards } from "../../DurakGame";
import SuperPlayer from "./SuperPlayer";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  canDefend(cardCount: number) {
    return this.canTakeMore({ cardCount });
  }

  canWinDefense({ game }: { game: DurakGame }) {
    return (
      game.desk.isDefended
      && game.round.hasPrimalAttacker
      && (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        this.left.isPrimalAttacker({ round: game.round })
        // below statement is for more than 2 players game
        || game.players.attacker.left.isPrimalAttacker({ round: game.round })
      )
    );
  }
}
