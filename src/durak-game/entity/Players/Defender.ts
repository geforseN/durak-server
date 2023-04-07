import DurakGame from "../../DurakGame";
import { Player, SuperPlayer } from "./index";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  InsertDefendCardMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";
import Card from "../Card";

export default class Defender extends SuperPlayer {
  constructor(player: Player) {
    super(player);
  }

  async putCardOnDesk({ game, index, card }: { game: DurakGame, card: Card, index: number }): Promise<void | never> {
    const slot = game.desk.getSlot({ index });
    await slot.assertDefense({ card });
    this.putDefendCard({ game, card, slotIndex: index });
    this.handleAfterCardPut({ game });
  }

  makeTransferMove({ game, index, card }: { game: DurakGame, card: Card, index: number }): void {
    this.putTransferCard({ game, card, slotIndex: index });
    game.players.manager.makeNewDefender(this.right);
    const player = game.players.manager.makeNewAttacker(this);
    game.round.pushNextMove(AttackerMove, { player });
  }

  stopMove({ game }: { game: DurakGame }): void {
    if (!game.desk.isDefended) {
      game.round.updateCurrentMoveTo(DefenderGaveUpMove, { player: this });
      return this.letPrimalAttackerMove({ game }); // PUT MORE CARDS IN PURSUIT (VDOGONKU)
    }
    game.round.updateCurrentMoveTo(StopDefenseMove, { player: this });
    if (game.desk.allowsMoves) {
      return this.letPrimalAttackerMove({ game });
    }
    return game.handleWonDefence(this);
  }

  private putDefendCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.remove({ card });
    const moveContext = { player: this, slotIndex, card };
    game.round.updateCurrentMoveTo(InsertDefendCardMove, moveContext);
    game.desk.insertCard({ card, index: slotIndex });
  }

  private handleAfterCardPut({ game }: { game: DurakGame }): void {
    if (!game.desk.isDefended) {
      return game.round.pushNextMove(DefenderMove, { player: this });
    }
    if (game.desk.allowsMoves && this.hand.count) {
      this.letPrimalAttackerMove({ game });
    }
    return game.handleWonDefence(this);
  }

  private putTransferCard({ game, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number }) {
    this.remove({ card });
    const moveContext = { player: this, card, slotIndex };
    game.round.updateCurrentMoveTo(TransferMove, moveContext);
    game.desk.insertCard({ card, index: slotIndex });
  }

  canDefend(cardCount: number) {
    return this.canTakeMore({ cardCount });
  }

  private letPrimalAttackerMove({ game }: { game: DurakGame }) {
    const primalAttacker = game.players.manager.makeNewAttacker(game.round.primalAttacker);
    return game.round.pushNextMove(AttackerMove, { player: primalAttacker });
  }
}
