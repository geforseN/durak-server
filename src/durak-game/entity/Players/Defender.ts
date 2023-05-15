import DurakGame, { CanReceiveCards } from "../../DurakGame";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  InsertDefendCardMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";
import Card from "../Card";
import SuperPlayer from "./SuperPlayer";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  canDefend(cardCount: number) {
    return this.canTakeMore({ cardCount });
  }

  override async putCardOnDesk({ game, index, card }: { game: DurakGame, card: Card, index: number }): Promise<void> {
    const slot = game.desk.getSlot({ index });
    await slot.assertCanBeDefended({ card });
    this.putDefendCard({ game, card, slotIndex: index });
    this.handleAfterCardPut({ game });
  }

  makeTransferMove({ game, index, card }: { game: DurakGame, card: Card, index: number }): void {
    this.putTransferCard({ game, card, slotIndex: index });
    game.players.manager.makeNewAttacker(this);
    const newDefender = game.players.manager.makeDefender(this.left);
    return game.round.pushNextMove(DefenderMove, { player: newDefender });
  }

  stopMove({ game }: { game: DurakGame }): void {
    if (!game.desk.isDefended) {
      // here defender can not defend more
      // if desk is full THAN go to next round
      // OR THAN let put more cards in pursuit (vdogonku)
      game.round.updateCurrentMoveTo(DefenderGaveUpMove);
      return game.desk.allowsMoves
        ? this.letPrimalAttackerMove({ game })
        : game.handleLostDefence(this);
    }
    // desk is defended
    // let primal attacker try make defender loser
    game.round.updateCurrentMoveTo(StopDefenseMove);
    return this.letPrimalAttackerMove({ game });
  }

  private putDefendCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.putCard({ game, card, slotIndex }, InsertDefendCardMove);
  }

  private handleAfterCardPut({ game }: { game: DurakGame }): void {
    if (game.desk.isDefended
      && (!this.hand.count || !game.desk.allowsMoves)
    ) {
      return game.handleWonDefence(this);
    }
    if (game.desk.isDefended && game.desk.allowsAttackerMove) {
      return this.letPrimalAttackerMove({ game });
    }
    return this.makeAnotherDefenseMove({ game });
  }

  private putTransferCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.putCard({ game, card, slotIndex }, TransferMove);
  }

  private letPrimalAttackerMove({ game }: { game: DurakGame }) {
    const primalAttacker = game.players.manager.makeNewAttacker(game.round.primalAttacker);
    return game.round.pushNextMove(AttackerMove, { player: primalAttacker });
  }

  private putCard<M extends TransferMove | InsertDefendCardMove>(
    { game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number },
    Move: { new(arg: any): M },
  ) {
    this.remove({ card });
    game.round.updateCurrentMoveTo(Move);
    game.desk.receiveCard({ card, index: slotIndex, who: this });
  }

  private makeAnotherDefenseMove({ game }: { game: DurakGame }) {
    game.round.pushNextMove(DefenderMove, { player: this });
  }
}
