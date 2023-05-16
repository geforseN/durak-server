import DurakGame from "../../DurakGame";
import { AttackerMove, DefenderMove, InsertAttackCardMove, StopAttackMove } from "../GameMove";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  override stopMove({ game }: { game: DurakGame }) {
    //  handle game.desk.allowsMove && game.desk.isDefended
    //  NOTE maybe game.desk.should be only in after put card handlers
    game.round.updateCurrentMoveTo(StopAttackMove);
    if (game.round.isDefenderGaveUp) {
      return this.handleInPursuit({ game });
    }
    if (this.hasPutLastCard({ round: game.round })) {
      return this.letDefenderMove({ game });
    }
    if (this.defenderCanWin({ game })) {
      return game.handleWonDefence(game.players.defender);
    }
    return this.letNextAttackerMove({ game });
  }

  private handleInPursuit({ game }: { game: DurakGame }) {
    if (this.left.isPrimalAttacker({ round: game.round })
      || game.players.defender.left.isPrimalAttacker({ round: game.round })
    ) {
      return game.handleLostDefence(game.players.defender);
    }
    // let other player try insert cards in pursuit (vdogonku)
    return this.letNextAttackerMove({ game });
  }

  private hasPutLastCard({ round }: { round: DurakGame["round"] }): boolean {
    return (
      round.previousMove instanceof InsertAttackCardMove
      && round.previousMove.player.id === this.id
    );
  }

  private defenderCanWin({ game }: { game: DurakGame }) {
    return (
      game.desk.isDefended
      && game.round.hasPrimalAttacker
      && (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        game.players.defender.left.isPrimalAttacker({ round: game.round })
        // below statement is for more than 2 players game
        || this.left.isPrimalAttacker({ round: game.round })
      )
    );
  }

  private letNextAttackerMove({ game }: { game: DurakGame }) {
    const nextAttacker = this.isPrimalAttacker({ round: game.round })
      ? game.players.defender.left
      : this.left;
    const newAttacker = game.players.manager.makeNewAttacker(nextAttacker);
    game.round.pushNextMove(AttackerMove, { player: newAttacker });
  }

  private letDefenderMove({ game }: { game: DurakGame }) {
    game.round.pushNextMove(DefenderMove, { player: game.players.defender });
  }
}
