import assert from "node:assert";
import DurakGame, { CanReceiveCards } from "../../DurakGame";
import { Player } from "./index";
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
import GameDefenderService from "../Services/Defender.service";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  service?: GameDefenderService;

  constructor(player: Player) {
    super(player);
  }

  override receiveCards(...cards: Card[]) {
    super.receiveCards(...cards);
    this.service?.receiveCards({ defender: this, cards });
  }

  canDefend(cardCount: number) {
    return this.canTakeMore({ cardCount });
  }

  async putCardOnDesk({ game, index, card }: { game: DurakGame, card: Card, index: number }): Promise<void | never> {
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
      game.round.updateCurrentMoveTo(DefenderGaveUpMove, { player: this });
      // here defender can not defend more
      // if desk is full THAN go to next round
      // OR THAN let put more cards in pursuit (vdogonku)
      return game.desk.allowsMoves
        ? this.letPrimalAttackerMove({ game })
        : game.handleLostDefence(this);
    }
    // desk is defended
    // let primal attacker try make defender loser
    game.round.updateCurrentMoveTo(StopDefenseMove, { player: this });
    return this.letPrimalAttackerMove({ game });
  }

  private putDefendCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.putCard({ game, card, slotIndex }, InsertDefendCardMove);
  }

  private handleAfterCardPut({ game }: { game: DurakGame }): void {
    if (game.desk.isDefended
      && (!this.hand.count || !game.desk.allowsMoves)
    ) {
      assert.ok(game.desk.isDefended, "У защитника нет карт, а стол незащищён. Так нельзя.");
      return game.handleWonDefence(this);
    }
    if (game.desk.isDefended && game.desk.allowsMoves) {
      this.letPrimalAttackerMove({ game });
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
    const moveContext = { player: this, card, slotIndex };
    // @ts-ignore
    game.round.updateCurrentMoveTo(Move, moveContext);
    game.desk.receiveCard({ card, index: slotIndex, who: this });
  }

  private makeAnotherDefenseMove({ game }: { game: DurakGame }) {
    game.round.pushNextMove(DefenderMove, { player: this });
  }

  injectService(defenderService: GameDefenderService) {
    this.service = defenderService;
  }
}
