import DurakGame from "../../DurakGame";
import { Player } from "./index";
import { AttackerMove, DefenderMove, InsertAttackCardMove, StopAttackMove } from "../GameMove";
import Card from "../Card";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  constructor(player: Player) {
    super(player);
  }

  async putCardOnDesk({ game, card, index }: { game: DurakGame, card: Card, index: number }): Promise<void | never> {
    await game.desk.ensureCanAttack({ card, index });
    this.putAttackCard({ game, card, slotIndex: index });
    this.handleAfterCardPut({ game });
  }

  private handleAfterCardPut({ game }: { game: DurakGame }) {
    const { desk, players: { defender } } = game;
    if (this.hand.isEmpty
      || !defender.canDefend(desk.unbeatenCardCount)
      || !game.desk.allowsMoves
    ) {
      // NOTE: IF moved into this block
      // THAN defender will have last chance to win round
      return game.round.pushNextMove(DefenderMove, { player: defender });
    }
    return game.round.pushNextMove(AttackerMove, { player: this });
  }

  stopMove({ game }: { game: DurakGame }) {
    game.round.updateCurrentMoveTo(StopAttackMove, { player: this });

    if (game.round.isDefenderGaveUp) {
      return this.handleInPursuit({ game });
    }
    if (this.hasPutLastCard({ round: game.round })) {
      return game.round.pushNextMove(DefenderMove, { player: game.players.defender });
    }
    if (this.defenderCanWin({ game })) {
      return game.handleWonDefence(game.players.defender);
    }
    return this.letMoveToNextAttacker({ game });
  }

  private handleInPursuit({ game }: { game: DurakGame }) {
    if (this.left.isPrimalAttacker({ round: game.round })
      || game.players.defender.left.isPrimalAttacker({ round: game.round })
    ) {
      return game.handleLostDefence(game.players.defender);
    }
    // let other try insert cards in pursuit (vdogonku)
    return this.letMoveToNextAttacker({ game });
  }

  hasPutLastCard({ round }: { round: DurakGame["round"] }): boolean {
    return (
      round.previousMove instanceof InsertAttackCardMove
      && round.previousMove.player.id === this.id
    );
  }

  private putAttackCard({ game, card, slotIndex: index }: { game: DurakGame; card: Card; slotIndex: number }) {
    this.remove({ card });
    game.service?.removeCard({ player: this, card });
    const moveContext = { player: this, card, slotIndex: index };
    game.round.updateCurrentMoveTo(InsertAttackCardMove, moveContext);
    game.desk.receiveCard({ card, index, who: this });
  }

  defenderCanWin({ game }: { game: DurakGame }) {
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

  private letMoveToNextAttacker({ game }: { game: DurakGame }) {
    const nextAttacker = this.isPrimalAttacker({ round: game.round })
      ? game.players.defender.left
      : this.left;
    const newAttacker = game.players.manager.makeNewAttacker(nextAttacker);
    game.round.pushNextMove(AttackerMove, { player: newAttacker });
  }
}
